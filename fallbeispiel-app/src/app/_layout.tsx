import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MenueKnopf, ZurueckKnopf } from '../components/Kopfleiste';
import { EinstellungenProvider } from '../lib/einstellungen';
import { StoreProvider } from '../lib/store';
import { useFarben } from '../theme';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <EinstellungenProvider>
        <StoreProvider>
          <Navigation />
        </StoreProvider>
      </EinstellungenProvider>
    </SafeAreaProvider>
  );
}

function Navigation() {
  const farben = useFarben();

  // Hintergrund hinter der App (z.B. beim Wischen) passend zu hell/dunkel
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(farben.hintergrund).catch(() => {});
  }, [farben]);

  // Im Browser den schwarzen Standard-Fokusrahmen in Eingabefeldern entfernen;
  // die Felder zeigen den Fokus selbst mit einem roten Rand an.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const stil = document.createElement('style');
    stil.textContent = 'input:focus, textarea:focus { outline: none !important; }';
    document.head.appendChild(stil);
    return () => stil.remove();
  }, []);

  return (
    <>
      <StatusBar style={farben.dunkel ? 'light' : 'dark'} />
      <Stack
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: farben.hintergrund },
          headerTintColor: farben.text,
          headerTitleStyle: { fontWeight: '800', fontSize: 17, color: farben.text },
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          contentStyle: { backgroundColor: farben.hintergrund },
          headerBackVisible: false,
          headerLeft: route.name === 'index' ? undefined : () => <ZurueckKnopf />,
          headerRight: () => <MenueKnopf />,
        })}>
        <Stack.Screen name="index" options={{ title: 'Fallbeispiele', headerShown: false }} />
      </Stack>
    </>
  );
}
