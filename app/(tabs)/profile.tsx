import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Stack.Screen options={{ title: 'Profile' }} />
      <Text>Profile Screen</Text>
    </View>
  );
}