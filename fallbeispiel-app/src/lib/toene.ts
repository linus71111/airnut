import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Platform } from 'react-native';

import { useEinstellungen } from './einstellungen';
import { spieleTon } from './ton';

/** Töne und Vibration – berücksichtigt die Einstellungen */
export function useToene() {
  const { einstellungen: e } = useEinstellungen();
  return useMemo(
    () => ({
      herztonAn: e.toene && e.herzton,
      herzschlag: () => e.toene && e.herzton && spieleTon('piep'),
      alarm: () => e.toene && e.alarm && spieleTon('alarm'),
      fertig: () => e.toene && spieleTon('fertig'),
      abhaken: () => {
        if (e.toene && e.klickton) spieleTon('klick');
        if (e.vibration && Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
      },
    }),
    [e],
  );
}
