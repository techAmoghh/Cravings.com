import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function FavoritesScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Stack.Screen options={{ title: 'Favorites' }} />
      <Text>Favorites Screen</Text>
    </View>
  );
}