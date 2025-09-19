import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '../theme/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: any;
}

export function LoadingSpinner({
  size = 'medium',
  color = theme.colors.primary[500],
  style,
}: LoadingSpinnerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const sizeStyles = {
    small: {
      width: 20,
      height: 20,
      borderWidth: 2,
    },
    medium: {
      width: 32,
      height: 32,
      borderWidth: 3,
    },
    large: {
      width: 48,
      height: 48,
      borderWidth: 4,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.spinner,
          currentSize,
          { borderColor: color },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderRadius: 50,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});
