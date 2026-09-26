import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MenueKnopf, ZurueckKnopf } from '../components/Kopfleiste';
import { StoreProvider } from '../lib/store';
import { farben } from '../theme';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: farben.rot },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '800' },
            contentStyle: { backgroundColor: farben.hintergrund },
            headerBackVisible: false,
            headerLeft: route.name === 'index' ? undefined : () => <ZurueckKnopf />,
            headerRight: () => <MenueKnopf />,
          })}>
          <Stack.Screen name="index" options={{ title: 'Fallbeispiele' }} />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
