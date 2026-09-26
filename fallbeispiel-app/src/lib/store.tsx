import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { STANDARD_FAELLE } from '../data/faelle';
import type { Bewertung, Durchgang, Fallbeispiel } from './types';

const KEY_FAELLE = 'fallbeispiel.eigeneFaelle.v1';
const KEY_DURCHGAENGE = 'fallbeispiel.durchgaenge.v1';

type Store = {
  geladen: boolean;
  faelle: Fallbeispiel[];
  durchgaenge: Durchgang[];
  fall: (id: string) => Fallbeispiel | undefined;
  durchgang: (id: string) => Durchgang | undefined;
  speichereFall: (f: Fallbeispiel) => void;
  loescheFall: (id: string) => void;
  speichereDurchgang: (d: Durchgang) => void;
  loescheDurchgang: (id: string) => void;
  fuegeBewertungHinzu: (durchgangId: string, b: Bewertung) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [geladen, setGeladen] = useState(false);
  const [eigene, setEigene] = useState<Fallbeispiel[]>([]);
  const [durchgaenge, setDurchgaenge] = useState<Durchgang[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [f, d] = await Promise.all([AsyncStorage.getItem(KEY_FAELLE), AsyncStorage.getItem(KEY_DURCHGAENGE)]);
        if (f) setEigene(JSON.parse(f));
        if (d) setDurchgaenge(JSON.parse(d));
      } catch (e) {
        console.warn('Laden fehlgeschlagen', e);
      } finally {
        setGeladen(true);
      }
    })();
  }, []);

  // Nach dem ersten Laden jede Änderung speichern
  useEffect(() => {
    if (geladen) AsyncStorage.setItem(KEY_FAELLE, JSON.stringify(eigene)).catch(() => {});
  }, [eigene, geladen]);
  useEffect(() => {
    if (geladen) AsyncStorage.setItem(KEY_DURCHGAENGE, JSON.stringify(durchgaenge)).catch(() => {});
  }, [durchgaenge, geladen]);

  const faelle = useMemo(() => [...eigene, ...STANDARD_FAELLE], [eigene]);

  const fall = useCallback((id: string) => faelle.find((f) => f.id === id), [faelle]);
  const durchgang = useCallback((id: string) => durchgaenge.find((d) => d.id === id), [durchgaenge]);

  const speichereFall = useCallback((f: Fallbeispiel) => {
    const eigenerFall = { ...f, eigenes: true };
    setEigene((alt) => (alt.some((x) => x.id === f.id) ? alt.map((x) => (x.id === f.id ? eigenerFall : x)) : [eigenerFall, ...alt]));
  }, []);
  const loescheFall = useCallback((id: string) => setEigene((alt) => alt.filter((x) => x.id !== id)), []);

  const speichereDurchgang = useCallback((d: Durchgang) => {
    setDurchgaenge((alt) => (alt.some((x) => x.id === d.id) ? alt.map((x) => (x.id === d.id ? d : x)) : [d, ...alt]));
  }, []);
  const loescheDurchgang = useCallback((id: string) => setDurchgaenge((alt) => alt.filter((x) => x.id !== id)), []);

  const fuegeBewertungHinzu = useCallback((durchgangId: string, b: Bewertung) => {
    setDurchgaenge((alt) => alt.map((d) => (d.id === durchgangId ? { ...d, bewertungen: [...d.bewertungen, b] } : d)));
  }, []);

  const wert = useMemo(
    () => ({ geladen, faelle, durchgaenge, fall, durchgang, speichereFall, loescheFall, speichereDurchgang, loescheDurchgang, fuegeBewertungHinzu }),
    [geladen, faelle, durchgaenge, fall, durchgang, speichereFall, loescheFall, speichereDurchgang, loescheDurchgang, fuegeBewertungHinzu],
  );

  return <StoreContext.Provider value={wert}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore außerhalb von StoreProvider');
  return s;
}
