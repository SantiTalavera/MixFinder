import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanGestureHandler,
  State,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { theme } from '../theme/theme';

interface SliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  label?: string;
  unit?: string;
  showValue?: boolean;
  disabled?: boolean;
  style?: any;
}

export function Slider({
  value,
  minimumValue,
  maximumValue,
  step = 1,
  onValueChange,
  onSlidingComplete,
  label,
  unit = '',
  showValue = true,
  disabled = false,
  style,
}: SliderProps) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const translateX = useSharedValue(0);

  // Calculate the position based on the value
  const getPosition = (val: number) => {
    const range = maximumValue - minimumValue;
    const percentage = (val - minimumValue) / range;
    return percentage * sliderWidth;
  };

  // Calculate the value based on the position
  const getValue = (position: number) => {
    const percentage = position / sliderWidth;
    const range = maximumValue - minimumValue;
    const rawValue = minimumValue + (percentage * range);
    
    // Round to the nearest step
    const steppedValue = Math.round(rawValue / step) * step;
    
    // Clamp to bounds
    return Math.max(minimumValue, Math.min(maximumValue, steppedValue));
  };

  // Initialize position
  React.useEffect(() => {
    translateX.value = getPosition(value);
  }, [value, sliderWidth]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      if (disabled) return;
      
      const newPosition = context.startX + event.translationX;
      const clampedPosition = Math.max(0, Math.min(sliderWidth, newPosition));
      translateX.value = clampedPosition;
      
      const newValue = getValue(clampedPosition);
      runOnJS(onValueChange)(newValue);
    },
    onEnd: () => {
      if (disabled) return;
      
      const finalValue = getValue(translateX.value);
      runOnJS(onValueChange)(finalValue);
      if (onSlidingComplete) {
        runOnJS(onSlidingComplete)(finalValue);
      }
    },
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    const progress = translateX.value / sliderWidth;
    return {
      width: `${progress * 100}%`,
    };
  });

  const formatValue = (val: number) => {
    if (unit === 'BPM') {
      return `${Math.round(val)} BPM`;
    }
    if (unit === '%') {
      return `${Math.round(val)}%`;
    }
    return `${val}${unit}`;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showValue && (
            <Text style={styles.value}>
              {formatValue(value)}
            </Text>
          )}
        </View>
      )}
      
      <View
        style={styles.sliderContainer}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setSliderWidth(width);
        }}
      >
        <View style={styles.track} />
        <Animated.View style={[styles.progress, progressStyle]} />
        
        <PanGestureHandler
          onGestureEvent={gestureHandler}
          onHandlerStateChange={gestureHandler}
        >
          <Animated.View style={[styles.thumb, thumbStyle]}>
            <View style={[
              styles.thumbInner,
              disabled && styles.thumbDisabled,
            ]} />
          </Animated.View>
        </PanGestureHandler>
      </View>
      
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>
          {formatValue(minimumValue)}
        </Text>
        <Text style={styles.rangeLabel}>
          {formatValue(maximumValue)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    ...theme.typography.textStyles.label,
    color: theme.colors.text.primary,
  },
  value: {
    ...theme.typography.textStyles.label,
    color: theme.colors.primary[500],
    fontWeight: '600',
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 4,
    backgroundColor: theme.colors.border.primary,
    borderRadius: 2,
  },
  progress: {
    position: 'absolute',
    height: 4,
    backgroundColor: theme.colors.primary[500],
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
  },
  thumbInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary[500],
    borderWidth: 2,
    borderColor: theme.colors.white,
    ...theme.shadows.md,
  },
  thumbDisabled: {
    backgroundColor: theme.colors.gray[400],
    borderColor: theme.colors.gray[300],
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  rangeLabel: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.tertiary,
  },
});
