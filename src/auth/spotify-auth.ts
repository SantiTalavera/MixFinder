import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { makeRedirectUri } from 'expo-auth-session';

// Spotify OAuth configuration
const SPOTIFY_CLIENT_ID = Constants.expoConfig?.extra?.spotifyClientId || process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = makeRedirectUri({
  scheme: 'mixfinder',
  path: 'callback',
});
const VERCEL_REDIRECT_URI = Constants.expoConfig?.extra?.vercelRedirectUri || process.env.VERCEL_REDIRECT_URI;

// Spotify API endpoints
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Scopes required for the app
const SCOPES = [
  'user-read-email',
  'user-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-playback-state',
  'user-modify-playback-state',
];

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  expires_at: number;
}

export interface SpotifyUser {
  id: string;
  display_name: string | null;
  email: string;
  country: string;
  product: string;
}

class SpotifyAuth {
  private tokens: SpotifyTokens | null = null;

  /**
   * Generate PKCE code verifier and challenge
   */
  private async generatePKCE(): Promise<{ codeVerifier: string; codeChallenge: string }> {
    const codeVerifier = AuthSession.AuthRequest.createRandomCodeChallenge();
    const codeChallenge = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier,
      { encoding: Crypto.CryptoEncoding.BASE64URL }
    );
    
    return { codeVerifier, codeChallenge };
  }

  /**
   * Get stored tokens from secure storage
   */
  async getStoredTokens(): Promise<SpotifyTokens | null> {
    try {
      const tokensJson = await SecureStore.getItemAsync('spotify_tokens');
      if (!tokensJson) return null;
      
      const tokens = JSON.parse(tokensJson) as SpotifyTokens;
      
      // Check if tokens are expired
      if (Date.now() >= tokens.expires_at) {
        // Try to refresh tokens
        const refreshedTokens = await this.refreshTokens(tokens.refresh_token);
        if (refreshedTokens) {
          await this.storeTokens(refreshedTokens);
          return refreshedTokens;
        }
        
        // If refresh failed, clear stored tokens
        await this.clearStoredTokens();
        return null;
      }
      
      this.tokens = tokens;
      return tokens;
    } catch (error) {
      console.error('Error getting stored tokens:', error);
      return null;
    }
  }

  /**
   * Store tokens in secure storage
   */
  private async storeTokens(tokens: SpotifyTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync('spotify_tokens', JSON.stringify(tokens));
      this.tokens = tokens;
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  /**
   * Clear stored tokens
   */
  async clearStoredTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('spotify_tokens');
      this.tokens = null;
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshTokens(refreshToken: string): Promise<SpotifyTokens | null> {
    try {
      const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: SPOTIFY_CLIENT_ID!,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken, // Keep existing refresh token if not provided
        expires_in: data.expires_in,
        token_type: data.token_type,
        scope: data.scope,
        expires_at: Date.now() + (data.expires_in * 1000),
      };
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      return null;
    }
  }

  /**
   * Start PKCE authentication flow
   */
  async authenticate(): Promise<{ success: boolean; tokens?: SpotifyTokens; error?: string }> {
    try {
      if (!SPOTIFY_CLIENT_ID) {
        throw new Error('Spotify Client ID not configured');
      }

      const { codeVerifier, codeChallenge } = await this.generatePKCE();

      const request = new AuthSession.AuthRequest({
        clientId: SPOTIFY_CLIENT_ID,
        scopes: SCOPES,
        redirectUri: REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
        codeChallenge,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        extraParams: {
          show_dialog: 'true',
        },
      });

      const result = await request.promptAsync({
        authorizationEndpoint: SPOTIFY_AUTH_URL,
      });

      if (result.type === 'success' && result.params.code) {
        const tokens = await this.exchangeCodeForTokens(result.params.code, codeVerifier);
        if (tokens) {
          await this.storeTokens(tokens);
          return { success: true, tokens };
        }
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<SpotifyTokens | null> {
    try {
      const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: SPOTIFY_CLIENT_ID!,
          code_verifier: codeVerifier,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Token exchange failed: ${errorData.error_description || response.status}`);
      }

      const data = await response.json();
      
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        token_type: data.token_type,
        scope: data.scope,
        expires_at: Date.now() + (data.expires_in * 1000),
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      return null;
    }
  }

  /**
   * Get current access token (with automatic refresh if needed)
   */
  async getAccessToken(): Promise<string | null> {
    let tokens = this.tokens || await this.getStoredTokens();
    
    if (!tokens) return null;
    
    // Check if token is expired and refresh if needed
    if (Date.now() >= tokens.expires_at) {
      const refreshedTokens = await this.refreshTokens(tokens.refresh_token);
      if (refreshedTokens) {
        await this.storeTokens(refreshedTokens);
        tokens = refreshedTokens;
      } else {
        return null;
      }
    }
    
    return tokens.access_token;
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<SpotifyUser | null> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) return null;

      const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getStoredTokens();
    return tokens !== null;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.clearStoredTokens();
  }

  /**
   * Get redirect URI for current platform
   */
  getRedirectUri(): string {
    return REDIRECT_URI;
  }

  /**
   * Get Vercel redirect URI for web
   */
  getVercelRedirectUri(): string {
    return VERCEL_REDIRECT_URI || '';
  }
}

// Export singleton instance
export const spotifyAuth = new SpotifyAuth();
