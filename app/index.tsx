import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useAnimatedStyle,
  runOnJS,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');
const LOGO_SIZE = width * 0.4;
const RING_COUNT = 3;
const RING_SIZE = LOGO_SIZE + 20;
const RING_COLORS = ['#FF6B6B', '#4ECDC4', '#FFD166'];

export default function WelcomeScreen() {
  const router = useRouter();
  const ringAnimation = useSharedValue(0);
  const contentAnimation = useSharedValue(0);

  // Animate rings
  useEffect(() => {
    ringAnimation.value = withDelay(300, withSpring(1, { damping: 20 }));
    
    // Animate content
    contentAnimation.value = withDelay(800, withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.exp),
    }));

    // Navigate to home after delay
    const timer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Ring animation style
  const ringStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const scale = interpolate(
        ringAnimation.value,
        [0, 1],
        [0, 1 - index * 0.1],
        Extrapolate.CLAMP
      );
      
      const opacity = interpolate(
        ringAnimation.value,
        [0, 1],
        [0, 0.5 - index * 0.1],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ scale }],
        opacity,
        width: RING_SIZE + index * 40,
        height: RING_SIZE + index * 40,
        borderRadius: (RING_SIZE + index * 40) / 2,
        borderWidth: 2,
        borderColor: RING_COLORS[index % RING_COLORS.length],
        position: 'absolute',
      };
    });
  };

  // Content animation style
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentAnimation.value,
    transform: [
      {
        translateY: interpolate(
          contentAnimation.value,
          [0, 1],
          [20, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Animated Rings */}
      <View style={styles.ringContainer}>
        {[...Array(RING_COUNT)].map((_, index) => (
          <Animated.View key={index} style={[ringStyle(index)]} />
        ))}
        
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🍳</Text>
        </View>
      </View>
      
      {/* App Title & Tagline */}
      <Animated.View style={[styles.content, contentStyle]}>
        <Text style={styles.title}>Cravings</Text>
        <Text style={styles.tagline}>Food is always right</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  logo: {
    fontSize: LOGO_SIZE * 0.5,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  tagline: {
    fontSize: 18,
    color: '#64748B',
    fontFamily: 'Inter_400Regular',
  },
});
