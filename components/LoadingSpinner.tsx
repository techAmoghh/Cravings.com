import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
  strokeWidth?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 32,
  color = '#FF6B6B',
  strokeWidth = 3,
  style,
}) => {
  const rotation = useSharedValue(0);

  rotation.value = withRepeat(
    withTiming(360, {
      duration: 1000,
      easing: Easing.linear,
    }),
    -1, // Infinite repetitions
    false
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={[
        styles.spinnerContainer,
        { width: size, height: size },
      ]}>
        <Animated.View
          style={[
            styles.spinner,
            {
              borderTopColor: color,
              borderRightColor: `${color}33`, // 20% opacity
              borderBottomColor: `${color}33`,
              borderLeftColor: `${color}33`,
              borderWidth: strokeWidth,
              width: size,
              height: size,
              borderRadius: size / 2,
            },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    position: 'absolute',
    borderStyle: 'solid',
  },
});

export default React.memo(LoadingSpinner);
