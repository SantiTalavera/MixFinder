import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import { getScoreDescription } from '../lib/scoring';

interface ScoreBadgeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  style?: any;
}

export function ScoreBadge({
  score,
  size = 'medium',
  showLabel = false,
  style,
}: ScoreBadgeProps) {
  const scoreInfo = getScoreDescription(score);
  const percentage = Math.round(score * 100);

  const sizeStyles = {
    small: {
      container: styles.smallContainer,
      text: styles.smallText,
      label: styles.smallLabel,
    },
    medium: {
      container: styles.mediumContainer,
      text: styles.mediumText,
      label: styles.mediumLabel,
    },
    large: {
      container: styles.largeContainer,
      text: styles.largeText,
      label: styles.largeLabel,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[
        currentSize.container,
        { backgroundColor: scoreInfo.color }
      ]}>
        <Text style={[currentSize.text, { color: theme.colors.white }]}>
          {percentage}%
        </Text>
      </View>
      {showLabel && (
        <Text style={[currentSize.label, { color: theme.colors.text.secondary }]}>
          {scoreInfo.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  smallContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediumContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.white,
  },
  mediumText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.white,
  },
  largeText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.white,
  },
  smallLabel: {
    fontSize: 8,
    color: theme.colors.text.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
  mediumLabel: {
    fontSize: 10,
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  largeLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
