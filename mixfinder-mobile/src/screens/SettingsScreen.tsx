import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/auth-context';
import { useAppStore } from '../state/app-store';
import { theme } from '../theme/theme';
import { Slider } from '../components/Slider';
import { Toggle } from '../components/Toggle';

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const { mixConfig, updateMixConfig, reset } = useAppStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            reset();
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            updateMixConfig({
              bpm_tolerance: 4,
              harmonic_matching: true,
              same_genre: true,
              maintain_energy: true,
              allow_half_double_time: true,
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.userInfo}>
            <View style={styles.userIcon}>
              <Ionicons name="person" size={24} color={theme.colors.primary[500]} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.display_name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'No email available'}</Text>
            </View>
          </View>
        </View>

        {/* Mix Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mix Configuration</Text>
          
          <View style={styles.configItem}>
            <Slider
              value={mixConfig.bpm_tolerance}
              minimumValue={1}
              maximumValue={20}
              step={1}
              onValueChange={(value) => updateMixConfig({ bpm_tolerance: value })}
              label="BPM Tolerance"
              unit="BPM"
            />
          </View>

          <View style={styles.configItem}>
            <Toggle
              value={mixConfig.harmonic_matching}
              onValueChange={(value) => updateMixConfig({ harmonic_matching: value })}
              label="Harmonic Matching"
              description="Match tracks with compatible musical keys using Camelot wheel"
            />
          </View>

          <View style={styles.configItem}>
            <Toggle
              value={mixConfig.same_genre}
              onValueChange={(value) => updateMixConfig({ same_genre: value })}
              label="Same Genre Preference"
              description="Prefer tracks from similar genres"
            />
          </View>

          <View style={styles.configItem}>
            <Toggle
              value={mixConfig.maintain_energy}
              onValueChange={(value) => updateMixConfig({ maintain_energy: value })}
              label="Maintain Energy Level"
              description="Keep similar energy levels between tracks"
            />
          </View>

          <View style={styles.configItem}>
            <Toggle
              value={mixConfig.allow_half_double_time}
              onValueChange={(value) => updateMixConfig({ allow_half_double_time: value })}
              label="Allow Half/Double Time"
              description="Include tracks with 2:1 BPM ratios for creative mixing"
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2024.1</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleResetSettings}
          >
            <Ionicons name="refresh" size={20} color={theme.colors.text.primary} />
            <Text style={styles.actionButtonText}>Reset Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color={theme.colors.error} />
            <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Logout</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            MixFinder Mobile v1.0.0
          </Text>
          <Text style={styles.footerText}>
            Built with React Native & Expo
          </Text>
        </View>
      </ScrollView>
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
  },
  section: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  sectionTitle: {
    ...theme.typography.textStyles.h5,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...theme.typography.textStyles.h6,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
  },
  configItem: {
    marginBottom: theme.spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  infoLabel: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.primary,
  },
  infoValue: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  actionButtonText: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  logoutButton: {
    backgroundColor: theme.colors.background.card,
  },
  logoutButtonText: {
    color: theme.colors.error,
  },
  footer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
});
