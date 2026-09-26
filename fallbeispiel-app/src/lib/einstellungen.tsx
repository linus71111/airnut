import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { DUNKEL, FarbenProvider, HELL } from '../theme';

const KEY = 'fallbeispiel.einstellungen.v1';

export type Design = 'system' | 'hell' | 'dunkel';

export type Einstellungen = {
  design: Design;
  /** Hauptschalter für alle Töne */
  toene: boolean;
  /** Piepton im Takt des Pulses auf dem Monitor */
  herzton: boolean;
  /** Alarmton, wenn ein Vitalwert in einen auffälligen Bereich wechselt */
  alarm: boolean;
  /** Kurzer Ton beim Abhaken in der Checkliste */
  klickton: boolean;
  /** Vibration beim Abhaken (nur Handy) */
  vibration: boolean;
  /** Messen-Modus bei jedem neuen Durchgang automatisch einschalten */
  messenModus: boolean;
  /** Nach so vielen Minuten ertönt ein Signal (0 = aus) */
  zeitlimit: number;
};

export const STANDARD_EINSTELLUNGEN: Einstellungen = {
  design: 'system',
  toene: true,
  herzton: false,
  alarm: true,
  klickton: false,
  vibration: true,
  messenModus: false,
  zeitlimit: 0,
};

type Kontext = {
  einstellungen: Einstellungen;
  setze: (aenderung: Partial<Einstellungen>) => void;
};

const EinstellungenContext = createContext<Kontext | null>(null);

export function EinstellungenProvider({ children }: { children: ReactNode }) {
  const [einstellungen, setEinstellungen] = useState<Einstellungen>(STANDARD_EINSTELLUNGEN);
  const [geladen, setGeladen] = useState(false);
  const system = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((t) => t && setEinstellungen({ ...STANDARD_EINSTELLUNGEN, ...JSON.parse(t) }))
      .catch(() => {})
      .finally(() => setGeladen(true));
  }, []);

  useEffect(() => {
    if (geladen) AsyncStorage.setItem(KEY, JSON.stringify(einstellungen)).catch(() => {});
  }, [einstellungen, geladen]);

  const setze = useCallback((aenderung: Partial<Einstellungen>) => setEinstellungen((alt) => ({ ...alt, ...aenderung })), []);
  const wert = useMemo(() => ({ einstellungen, setze }), [einstellungen, setze]);

  const dunkel = einstellungen.design === 'dunkel' || (einstellungen.design === 'system' && system === 'dark');

  return (
    <EinstellungenContext.Provider value={wert}>
      <FarbenProvider value={dunkel ? DUNKEL : HELL}>{children}</FarbenProvider>
    </EinstellungenContext.Provider>
  );
}

export function useEinstellungen(): Kontext {
  const k = useContext(EinstellungenContext);
  if (!k) throw new Error('useEinstellungen außerhalb von EinstellungenProvider');
  return k;
}
