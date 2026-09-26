import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ALLE_STANDARD_FAELLE } from '../data/alleFaelle';
import type { Sicherung } from './sicherung';
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
  /** Eigene Fälle für eine Sicherung (ohne Standardfälle) */
  eigeneFaelle: Fallbeispiel[];
  /**
   * Spielt eine Sicherung ein. `zusammenfuehren`: Vorhandenes bleibt, Neues kommt dazu,
   * gleiche Einträge werden aktualisiert (Bewertungen werden zusammengelegt). `ersetzen`: alles wird überschrieben.
   */
  importiere: (s: Sicherung, modus: 'zusammenfuehren' | 'ersetzen') => ImportErgebnis;
};

export type ImportErgebnis = { faelle: number; einsaetze: number; personen: number };

/** Fügt Einträge nach ID zusammen; neue Einträge kommen vorne dazu */
function zusammen<T extends { id: string }>(alt: T[], neu: T[], vereine: (a: T, b: T) => T = (_a, b) => b): T[] {
  const neuNachId = new Map(neu.map((x) => [x.id, x]));
  const ergebnis = alt.map((a) => (neuNachId.has(a.id) ? vereine(a, neuNachId.get(a.id)!) : a));
  const vorhanden = new Set(alt.map((a) => a.id));
  return [...neu.filter((x) => !vorhanden.has(x.id)), ...ergebnis];
}

function vereineDurchgang(a: Durchgang, b: Durchgang): Durchgang {
  const ids = new Set(b.bewertungen.map((x) => x.id));
  return { ...a, ...b, bewertungen: [...b.bewertungen, ...a.bewertungen.filter((x) => !ids.has(x.id))].sort((x, y) => x.zeit - y.zeit) };
}

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

  const faelle = useMemo(() => [...eigene, ...ALLE_STANDARD_FAELLE], [eigene]);

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

  const importiere = useCallback((s: Sicherung, modus: 'zusammenfuehren' | 'ersetzen'): ImportErgebnis => {
    const faelleNeu = s.eigeneFaelle.map((f) => ({ ...f, eigenes: true, schwierigkeit: f.schwierigkeit ?? 'mittel' }));
    const sortiert = (p: Person[]) => [...p].sort((a, b) => a.name.localeCompare(b.name, 'de'));
    if (modus === 'ersetzen') {
      setEigene(faelleNeu);
      setDurchgaenge([...s.durchgaenge].sort((a, b) => b.start - a.start));
      setPersonen(sortiert(s.personen));
    } else {
      setEigene((alt) => zusammen(alt, faelleNeu));
      setDurchgaenge((alt) => zusammen(alt, s.durchgaenge, vereineDurchgang).sort((a, b) => b.start - a.start));
      setPersonen((alt) => sortiert(zusammen(alt, s.personen)));
    }
    return { faelle: faelleNeu.length, einsaetze: s.durchgaenge.length, personen: s.personen.length };
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
      eigeneFaelle: eigene,
      importiere,
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
      eigene,
      importiere,
    ],
  );

  return <StoreContext.Provider value={wert}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore außerhalb von StoreProvider');
  return s;
}
