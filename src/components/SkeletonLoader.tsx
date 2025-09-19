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

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonLoaderProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

// Predefined skeleton components for common use cases
export function TrackCardSkeleton() {
  return (
    <View style={styles.trackCardSkeleton}>
      <SkeletonLoader width={60} height={60} borderRadius={8} />
      <View style={styles.trackInfoSkeleton}>
        <SkeletonLoader width="80%" height={16} borderRadius={4} />
        <SkeletonLoader width="60%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
        <SkeletonLoader width="40%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.listSkeleton}>
      {Array.from({ length: count }).map((_, index) => (
        <TrackCardSkeleton key={index} />
      ))}
    </View>
  );
}

export function SearchSkeleton() {
  return (
    <View style={styles.searchSkeleton}>
      <SkeletonLoader width="100%" height={48} borderRadius={8} />
      <ListSkeleton count={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.gray[700],
  },
  trackCardSkeleton: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  trackInfoSkeleton: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  listSkeleton: {
    padding: theme.spacing.md,
  },
  searchSkeleton: {
    padding: theme.spacing.md,
  },
});
