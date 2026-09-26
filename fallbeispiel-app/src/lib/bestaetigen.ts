import { Alert, Platform } from 'react-native';

/** Sicherheitsabfrage, funktioniert auf Handy und im Browser */
export function bestaetigen(titel: string, text: string, janein: string, onJa: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${titel}\n\n${text}`)) onJa();
    return;
  }
  Alert.alert(titel, text, [
    { text: 'Abbrechen', style: 'cancel' },
    { text: janein, style: 'destructive', onPress: onJa },
  ]);
}
