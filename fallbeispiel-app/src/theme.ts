import { createContext, useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';

// Farben angelehnt an Rot und Gelb der DLRG – je einmal für hell und dunkel
export type Farben = {
  dunkel: boolean;
  rot: string;
  gelb: string;
  /** Text auf Gelb */
  aufGelb: string;
  /** Roter Text auf Gelb */
  rotAufGelb: string;
  kopf: string;
  hintergrund: string;
  karte: string;
  eingabe: string;
  text: string;
  textLeise: string;
  platzhalter: string;
  rand: string;
  balkenHg: string;
  /** Leicht hervorgehobene Fläche, z.B. "Durchgang starten" */
  hinweis: string;
  gedrueckt: string;
  gruen: string;
  orange: string;
  fehler: string;
  grau: string;
  /** Neutrale Füllfarbe für ausgewählte Chips (weiße Schrift) */
  neutral: string;
  gefahr: string;
  timerBeendet: string;
  monitor: string;
  monitorKarte: string;
};

export const HELL: Farben = {
  dunkel: false,
  rot: '#E2001A',
  gelb: '#FFED00',
  aufGelb: '#1A1A1A',
  rotAufGelb: '#C8001A',
  kopf: '#E2001A',
  hintergrund: '#F4F5F7',
  karte: '#FFFFFF',
  eingabe: '#FFFFFF',
  text: '#1A1A1A',
  textLeise: '#5F6368',
  platzhalter: '#999999',
  rand: '#E1E3E6',
  balkenHg: '#E8EAED',
  hinweis: '#FFF8D6',
  gedrueckt: '#FDECEE',
  gruen: '#1B8E3E',
  orange: '#D18B00',
  fehler: '#C62828',
  grau: '#9AA0A6',
  neutral: '#1A1A1A',
  gefahr: '#5F0A12',
  timerBeendet: '#37474F',
  monitor: '#0B0F14',
  monitorKarte: '#151B23',
};

export const DUNKEL: Farben = {
  dunkel: true,
  rot: '#F0283C',
  gelb: '#F5DF00',
  aufGelb: '#1A1A1A',
  rotAufGelb: '#C8001A',
  kopf: '#B80016',
  hintergrund: '#0F1216',
  karte: '#1A1F26',
  eingabe: '#12161B',
  text: '#EEF1F4',
  textLeise: '#9AA5B1',
  platzhalter: '#6B7785',
  rand: '#2B323B',
  balkenHg: '#2B323B',
  hinweis: '#2A2613',
  gedrueckt: '#3A1A1F',
  gruen: '#2FB35A',
  orange: '#E09A12',
  fehler: '#FF5A5A',
  grau: '#5F6B78',
  neutral: '#4A5563',
  gefahr: '#7A1420',
  timerBeendet: '#2B3640',
  monitor: '#07090C',
  monitorKarte: '#121820',
};

export const abstand = { s: 6, m: 12, l: 18, xl: 24 };

const FarbenContext = createContext<Farben>(HELL);
export const FarbenProvider = FarbenContext.Provider;

export function useFarben(): Farben {
  return useContext(FarbenContext);
}

/**
 * Erzeugt einen Hook für Styles, die sich an hell/dunkel anpassen:
 *   const useStyles = macheStile((farben) => ({ box: { backgroundColor: farben.karte } }));
 *   const styles = useStyles();
 */
export function macheStile<T extends StyleSheet.NamedStyles<T>>(fn: (farben: Farben) => T) {
  return function useStile(): T {
    const farben = useFarben();
    return useMemo(() => StyleSheet.create(fn(farben)), [farben]);
  };
}
