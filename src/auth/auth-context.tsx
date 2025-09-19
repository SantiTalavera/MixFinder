import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { spotifyAuth, SpotifyTokens, SpotifyUser } from './spotify-auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SpotifyUser | null;
  tokens: SpotifyTokens | null;
  login: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const storedTokens = await spotifyAuth.getStoredTokens();
      
      if (storedTokens) {
        setTokens(storedTokens);
        setIsAuthenticated(true);
        
        // Get user info
        const userInfo = await spotifyAuth.getCurrentUser();
        setUser(userInfo);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setTokens(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
      setTokens(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const result = await spotifyAuth.authenticate();
      
      if (result.success && result.tokens) {
        setTokens(result.tokens);
        setIsAuthenticated(true);
        
        // Get user info
        const userInfo = await spotifyAuth.getCurrentUser();
        setUser(userInfo);
        
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Authentication failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await spotifyAuth.logout();
      setIsAuthenticated(false);
      setUser(null);
      setTokens(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const userInfo = await spotifyAuth.getCurrentUser();
      setUser(userInfo);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    tokens,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
