import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreProvider } from '../lib/store';
import { farben } from '../theme';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: farben.rot },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '800' },
            contentStyle: { backgroundColor: farben.hintergrund },
            headerBackTitle: 'Zurück',
          }}>
          <Stack.Screen name="index" options={{ title: 'Fallbeispiele' }} />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
