import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/auth-context';
import { theme } from '../theme/theme';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const result = await login();
      
      if (!result.success) {
        Alert.alert(
          'Login Failed',
          result.error || 'Unable to connect to Spotify. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="musical-notes" size={64} color={theme.colors.primary[500]} />
          </View>
          <Text style={styles.appName}>MixFinder</Text>
          <Text style={styles.tagline}>Find the perfect mix</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Ionicons name="search" size={24} color={theme.colors.primary[500]} />
            <Text style={styles.featureText}>Search tracks by name or artist</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="analytics" size={24} color={theme.colors.primary[500]} />
            <Text style={styles.featureText}>Analyze audio features and BPM</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="shuffle" size={24} color={theme.colors.primary[500]} />
            <Text style={styles.featureText}>Get compatible track suggestions</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="list" size={24} color={theme.colors.primary[500]} />
            <Text style={styles.featureText}>Create optimized playlists</Text>
          </View>
        </View>

        {/* Login Button */}
        <View style={styles.loginContainer}>
          <TouchableOpacity
            style={[styles.loginButton, isLoggingIn && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoggingIn}
            activeOpacity={0.8}
          >
            {isLoggingIn ? (
              <LoadingSpinner size="small" color={theme.colors.white} />
            ) : (
              <>
                <Ionicons name="logo-spotify" size={24} color={theme.colors.white} />
                <Text style={styles.loginButtonText}>Connect with Spotify</Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            By connecting, you agree to our terms of service and privacy policy.
            We only access your Spotify account to create playlists and analyze music.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: theme.spacing['4xl'],
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  appName: {
    ...theme.typography.textStyles.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    ...theme.typography.textStyles.bodyLarge,
    color: theme.colors.text.secondary,
  },
  featuresContainer: {
    marginVertical: theme.spacing['2xl'],
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  featureText: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  loginContainer: {
    marginBottom: theme.spacing.xl,
  },
  loginButton: {
    backgroundColor: theme.colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    ...theme.typography.textStyles.buttonLarge,
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
  disclaimer: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
