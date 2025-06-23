import { Redirect } from 'expo-router';

export default function Index() {
  // This route will be automatically redirected by the root layout
  // based on whether it's the first launch or not
  return <Redirect href="/(tabs)/home" />;
}
