import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { STANDARD_FAELLE } from '../data/faelle';
import type { Bewertung, Durchgang, Fallbeispiel, Person } from './types';

const KEY_FAELLE = 'fallbeispiel.eigeneFaelle.v1';
const KEY_DURCHGAENGE = 'fallbeispiel.durchgaenge.v1';
const KEY_PERSONEN = 'fallbeispiel.personen.v1';

type Store = {
  geladen: boolean;
  faelle: Fallbeispiel[];
  durchgaenge: Durchgang[];
  personen: Person[];
  fall: (id: string) => Fallbeispiel | undefined;
  durchgang: (id: string) => Durchgang | undefined;
  speichereFall: (f: Fallbeispiel) => void;
  loescheFall: (id: string) => void;
  speichereDurchgang: (d: Durchgang) => void;
  loescheDurchgang: (id: string) => void;
  fuegeBewertungHinzu: (durchgangId: string, b: Bewertung) => void;
  person: (id: string) => Person | undefined;
  speicherePerson: (p: Person) => void;
  loeschePerson: (id: string) => void;
  /** Löscht Einsätze, Personen und/oder eigene Fälle */
  loescheDaten: (was: { einsaetze?: boolean; personen?: boolean; faelle?: boolean }) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [geladen, setGeladen] = useState(false);
  const [eigene, setEigene] = useState<Fallbeispiel[]>([]);
  const [durchgaenge, setDurchgaenge] = useState<Durchgang[]>([]);
  const [personen, setPersonen] = useState<Person[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [f, d, p] = await Promise.all([
          AsyncStorage.getItem(KEY_FAELLE),
          AsyncStorage.getItem(KEY_DURCHGAENGE),
          AsyncStorage.getItem(KEY_PERSONEN),
        ]);
        // Ältere eigene Fälle haben noch keine Schwierigkeit
        if (f) setEigene(JSON.parse(f).map((x: Fallbeispiel) => ({ ...x, schwierigkeit: x.schwierigkeit ?? 'mittel' })));
        if (d) setDurchgaenge(JSON.parse(d));
        if (p) setPersonen(JSON.parse(p));
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
  useEffect(() => {
    if (geladen) AsyncStorage.setItem(KEY_PERSONEN, JSON.stringify(personen)).catch(() => {});
  }, [personen, geladen]);

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

  const person = useCallback((id: string) => personen.find((p) => p.id === id), [personen]);
  const speicherePerson = useCallback((p: Person) => {
    setPersonen((alt) =>
      (alt.some((x) => x.id === p.id) ? alt.map((x) => (x.id === p.id ? p : x)) : [...alt, p]).sort((a, b) => a.name.localeCompare(b.name, 'de')),
    );
  }, []);
  // Einsätze bleiben erhalten, der Name steht weiterhin im Team-Namen
  const loeschePerson = useCallback((id: string) => setPersonen((alt) => alt.filter((x) => x.id !== id)), []);

  const loescheDaten = useCallback((was: { einsaetze?: boolean; personen?: boolean; faelle?: boolean }) => {
    if (was.einsaetze) setDurchgaenge([]);
    if (was.personen) setPersonen([]);
    if (was.faelle) setEigene([]);
  }, []);

  const wert = useMemo(
    () => ({
      geladen,
      faelle,
      durchgaenge,
      personen,
      fall,
      durchgang,
      speichereFall,
      loescheFall,
      speichereDurchgang,
      loescheDurchgang,
      fuegeBewertungHinzu,
      person,
      speicherePerson,
      loeschePerson,
      loescheDaten,
    }),
    [
      geladen,
      faelle,
      durchgaenge,
      personen,
      fall,
      durchgang,
      speichereFall,
      loescheFall,
      speichereDurchgang,
      loescheDurchgang,
      fuegeBewertungHinzu,
      person,
      speicherePerson,
      loeschePerson,
      loescheDaten,
    ],
  );

  return <StoreContext.Provider value={wert}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore außerhalb von StoreProvider');
  return s;
}
