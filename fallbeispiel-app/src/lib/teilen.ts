import Constants from 'expo-constants';
import LZString from 'lz-string';
import { Platform } from 'react-native';

import { bereinigeFall, istFall } from './sicherung';
import { neueId } from './score';
import type { Fallbeispiel } from './types';

/** Adresse der Web-App, über die geteilte Links geöffnet werden */
function webAppUrl(): string {
  if (Platform.OS === 'web' && typeof location !== 'undefined') {
    // Alles vor der aktuellen Unterseite ist die Basis (z.B. …/airnut/app)
    const pfad = location.pathname.replace(/\/(fall|import|editor|daten)(\/.*)?$/, '').replace(/\/$/, '');
    return `${location.origin}${pfad}`;
  }
  return (Constants.expoConfig?.extra?.webAppUrl as string | undefined) ?? 'https://linus71111.github.io/airnut/app';
}

/** Macht aus einem Fall einen kurzen Text-Code (komprimiert, URL-tauglich) */
export function fallZuCode(f: Fallbeispiel): string {
  const { eigenes: _e, ...rest } = f;
  return LZString.compressToEncodedURIComponent(JSON.stringify(rest));
}

export function fallZuLink(f: Fallbeispiel): string {
  return `${webAppUrl()}/import?fall=${fallZuCode(f)}`;
}

/** Liest einen geteilten Link oder den reinen Code. Ergebnis bekommt eine neue ID. */
export function codeZuFall(eingabe: string): Fallbeispiel {
  let code = eingabe.trim();
  const treffer = code.match(/[?&]fall=([^&#\s]+)/);
  if (treffer) code = treffer[1];
  try {
    code = decodeURIComponent(code);
  } catch {
    // war nicht kodiert
  }
  // „+“ gehört zum Code, wird in Links aber oft als Leerzeichen gelesen; Zeilenumbrüche vom Kopieren entfernen
  code = code.replace(/[\r\n\t]/g, '').replace(/ /g, '+');
  if (!code) throw new Error('Bitte einen Link oder Code einfügen.');
  let text: string | null = null;
  try {
    text = LZString.decompressFromEncodedURIComponent(code);
  } catch {
    text = null;
  }
  if (!text) throw new Error('Der Code ist unvollständig oder beschädigt.');
  let f: Fallbeispiel;
  try {
    f = JSON.parse(text);
  } catch {
    throw new Error('Der Code ist unvollständig oder beschädigt.');
  }
  if (!f || !istFall(f)) throw new Error('Der Code enthält kein gültiges Fallbeispiel.');
  return { ...bereinigeFall(f), id: neueId(), eigenes: true };
}
