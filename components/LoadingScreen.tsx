import React from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

const { width, height } = Dimensions.get('window');

const LoadingScreen = () => {
  const spinValue = new Animated.Value(0);

  // Animation for the loading spinner
  React.useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => spin());
    };
    
    spin();
  }, []);

  const spinAnimation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            { transform: [{ rotate: spinAnimation }] },
          ]}
        >
          <View style={styles.logo}>
            <Text style={styles.logoText}>🍳</Text>
          </View>
        </Animated.View>
        <Text style={styles.title}>Cravings</Text>
        <Text style={styles.subtitle}>Delicious Recipes Await</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 50,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter_400Regular',
  },
});

export default LoadingScreen;
