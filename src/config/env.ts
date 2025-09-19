import Constants from 'expo-constants';

// Environment configuration
export const config = {
  // Spotify API configuration
  spotify: {
    clientId: Constants.expoConfig?.extra?.spotifyClientId || process.env.SPOTIFY_CLIENT_ID,
    redirectUri: 'mixfinder://callback',
    vercelRedirectUri: Constants.expoConfig?.extra?.vercelRedirectUri || process.env.VERCEL_REDIRECT_URI,
    scheme: 'mixfinder',
  },
  
  // API configuration
  api: {
    baseUrl: 'https://api.spotify.com/v1',
    authUrl: 'https://accounts.spotify.com',
  },
  
  // App configuration
  app: {
    name: 'MixFinder Mobile',
    version: '1.0.0',
    build: '2024.1',
  },
  
  // Default values
  defaults: {
    searchLimit: 20,
    recommendationsLimit: 20,
    bpmTolerance: 4,
    maxTracksPerPlaylist: 50,
  },
};

// Validation
export function validateConfig() {
  const errors: string[] = [];
  
  if (!config.spotify.clientId) {
    errors.push('SPOTIFY_CLIENT_ID is required');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration errors: ${errors.join(', ')}`);
  }
}

// Export individual config sections for convenience
export const { spotify, api, app, defaults } = config;
