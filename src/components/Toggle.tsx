import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { theme } from '../theme/theme';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export function Toggle({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  size = 'medium',
  style,
}: ToggleProps) {
  const animatedValue = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    animatedValue.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [value]);

  const handlePress = () => {
    if (disabled) return;
    onValueChange(!value);
  };

  const sizeStyles = {
    small: {
      container: styles.smallContainer,
      track: styles.smallTrack,
      thumb: styles.smallThumb,
      label: styles.smallLabel,
      description: styles.smallDescription,
    },
    medium: {
      container: styles.mediumContainer,
      track: styles.mediumTrack,
      thumb: styles.mediumThumb,
      label: styles.mediumLabel,
      description: styles.mediumDescription,
    },
    large: {
      container: styles.largeContainer,
      track: styles.largeTrack,
      thumb: styles.largeThumb,
      label: styles.largeLabel,
      description: styles.largeDescription,
    },
  };

  const currentSize = sizeStyles[size];

  const trackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animatedValue.value,
      [0, 1],
      [theme.colors.border.primary, theme.colors.primary[500]]
    );

    return {
      backgroundColor,
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    const translateX = animatedValue.value * (currentSize.track.width - currentSize.thumb.width - 4);
    
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <TouchableOpacity
      style={[currentSize.container, style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {(label || description) && (
          <View style={styles.textContainer}>
            {label && (
              <Text style={[
                currentSize.label,
                disabled && styles.disabledText,
              ]}>
                {label}
              </Text>
            )}
            {description && (
              <Text style={[
                currentSize.description,
                disabled && styles.disabledText,
              ]}>
                {description}
              </Text>
            )}
          </View>
        )}
        
        <Animated.View style={[currentSize.track, trackStyle]}>
          <Animated.View style={[currentSize.thumb, thumbStyle]} />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  disabledText: {
    opacity: 0.5,
  },
  
  // Small size
  smallContainer: {
    paddingVertical: theme.spacing.sm,
  },
  smallTrack: {
    width: 36,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  smallThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  smallLabel: {
    ...theme.typography.textStyles.labelSmall,
    color: theme.colors.text.primary,
  },
  smallDescription: {
    ...theme.typography.textStyles.captionSmall,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  
  // Medium size
  mediumContainer: {
    paddingVertical: theme.spacing.md,
  },
  mediumTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  mediumThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.white,
    ...theme.shadows.md,
  },
  mediumLabel: {
    ...theme.typography.textStyles.label,
    color: theme.colors.text.primary,
  },
  mediumDescription: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  
  // Large size
  largeContainer: {
    paddingVertical: theme.spacing.lg,
  },
  largeTrack: {
    width: 52,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  largeThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    ...theme.shadows.lg,
  },
  largeLabel: {
    ...theme.typography.textStyles.labelLarge,
    color: theme.colors.text.primary,
  },
  largeDescription: {
    ...theme.typography.textStyles.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
});
