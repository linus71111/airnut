import type { Bewusstsein, Vitalwerte } from './types';

type NumKey = 'puls' | 'atemfrequenz' | 'rrSys' | 'rrDia' | 'spo2' | 'blutzucker' | 'temperatur';

export type VitalDef = {
  key: NumKey;
  label: string;
  kurz: string;
  einheit: string;
  /** Normbereich für Erwachsene (grobe Orientierung für Übungen) */
  min: number;
  max: number;
  schritt: number;
  farbe: string;
};

export const VITAL_DEFS: VitalDef[] = [
  { key: 'puls', label: 'Puls', kurz: 'HF', einheit: '/min', min: 60, max: 100, schritt: 5, farbe: '#3DDC84' },
  { key: 'spo2', label: 'Sauerstoffsättigung', kurz: 'SpO₂', einheit: '%', min: 95, max: 100, schritt: 1, farbe: '#4FC3F7' },
  { key: 'atemfrequenz', label: 'Atemfrequenz', kurz: 'AF', einheit: '/min', min: 12, max: 20, schritt: 2, farbe: '#FFD54F' },
  { key: 'rrSys', label: 'Blutdruck systolisch', kurz: 'RR sys', einheit: 'mmHg', min: 100, max: 140, schritt: 5, farbe: '#FF8A80' },
  { key: 'rrDia', label: 'Blutdruck diastolisch', kurz: 'RR dia', einheit: 'mmHg', min: 60, max: 90, schritt: 5, farbe: '#FF8A80' },
  { key: 'blutzucker', label: 'Blutzucker', kurz: 'BZ', einheit: 'mg/dl', min: 70, max: 140, schritt: 5, farbe: '#CE93D8' },
  { key: 'temperatur', label: 'Körpertemperatur', kurz: 'Temp', einheit: '°C', min: 36.0, max: 37.5, schritt: 0.1, farbe: '#FFAB91' },
];

export const BEWUSSTSEIN_STUFEN: Bewusstsein[] = [
  'wach',
  'verwirrt',
  'reagiert auf Ansprache',
  'reagiert auf Schmerz',
  'bewusstlos',
];

export const NORMALWERTE: Vitalwerte = {
  puls: 80,
  atemfrequenz: 14,
  rrSys: 125,
  rrDia: 80,
  spo2: 98,
  blutzucker: 100,
  temperatur: 36.8,
  bewusstsein: 'wach',
  haut: 'rosig, warm, trocken',
  pupillen: 'mittelweit, gleich groß, reagieren auf Licht',
};

export function istAuffaellig(def: VitalDef, wert: number): boolean {
  return wert < def.min || wert > def.max;
}

export function formatWert(def: VitalDef, wert: number): string {
  return def.key === 'temperatur' ? wert.toFixed(1).replace('.', ',') : String(Math.round(wert));
}

export function aendern(werte: Vitalwerte, key: NumKey, delta: number): Vitalwerte {
  let neu = Math.round((werte[key] + delta) * 10) / 10;
  if (key === 'spo2') neu = Math.min(100, neu);
  neu = Math.max(0, neu);
  return { ...werte, [key]: neu };
}
