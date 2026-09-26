import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import type { Durchgang, Fallbeispiel, Person, Vitalwerte } from './types';
import { NORMALWERTE } from './vitals';

export const SICHERUNG_APP = 'dlrg-fallbeispiel';

/** Inhalt einer Sicherungsdatei */
export type Sicherung = {
  app: typeof SICHERUNG_APP;
  version: 1;
  erstellt: number;
  eigeneFaelle: Fallbeispiel[];
  durchgaenge: Durchgang[];
  personen: Person[];
};

export function erstelleSicherung(daten: Pick<Sicherung, 'eigeneFaelle' | 'durchgaenge' | 'personen'>): Sicherung {
  return { app: SICHERUNG_APP, version: 1, erstellt: Date.now(), ...daten };
}

function dateiName() {
  const d = new Date();
  const zwei = (n: number) => String(n).padStart(2, '0');
  return `fallbeispiel-sicherung-${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}.json`;
}

/** Speichert die Sicherung als Datei: Handy → Teilen-Dialog (Dateien, AirDrop, Messenger …), Browser → Teilen oder Download */
export async function exportiereSicherung(s: Sicherung): Promise<void> {
  const text = JSON.stringify(s);
  const name = dateiName();

  if (Platform.OS === 'web') {
    const datei = new globalThis.File([text], name, { type: 'application/json' });
    const nav = globalThis.navigator as Navigator | undefined;
    // Auf dem iPhone (Web-App) klappt der Teilen-Dialog besser als ein Download
    if (nav?.canShare?.({ files: [datei] })) {
      try {
        await nav.share({ files: [datei], title: 'Fallbeispiel-Sicherung' });
        return;
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return;
      }
    }
    const url = URL.createObjectURL(datei);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return;
  }

  const datei = new File(Paths.cache, name);
  if (datei.exists) datei.delete();
  datei.create();
  datei.write(text);
  if (!(await Sharing.isAvailableAsync())) throw new Error('Teilen ist auf diesem Gerät nicht verfügbar.');
  await Sharing.shareAsync(datei.uri, { mimeType: 'application/json', dialogTitle: 'Sicherung speichern', UTI: 'public.json' });
}

/** Lässt eine Sicherungsdatei auswählen und liest sie ein. `null`, wenn abgebrochen. */
export async function waehleSicherung(): Promise<Sicherung | null> {
  const ergebnis = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true });
  if (ergebnis.canceled || !ergebnis.assets?.length) return null;
  const asset = ergebnis.assets[0];
  const text = Platform.OS === 'web' && asset.file ? await asset.file.text() : await new File(asset.uri).text();
  return pruefeSicherung(text);
}

/** Prüft den Dateiinhalt und wirft eine verständliche Fehlermeldung */
export function pruefeSicherung(text: string): Sicherung {
  let daten: unknown;
  try {
    daten = JSON.parse(text);
  } catch {
    throw new Error('Die Datei ist keine gültige Sicherung (kein JSON).');
  }
  const d = daten as Partial<Sicherung>;
  if (!d || d.app !== SICHERUNG_APP) throw new Error('Das ist keine Sicherung aus der Fallbeispiel-App.');
  if (typeof d.version !== 'number' || d.version > 1) throw new Error('Diese Sicherung stammt aus einer neueren App-Version. Bitte App aktualisieren.');
  const liste = <T,>(x: unknown, ok: (e: T) => boolean): T[] => (Array.isArray(x) ? (x as T[]).filter((e) => e && ok(e)) : []);
  return {
    app: SICHERUNG_APP,
    version: 1,
    erstellt: typeof d.erstellt === 'number' ? d.erstellt : 0,
    eigeneFaelle: liste<Fallbeispiel>(d.eigeneFaelle, istFall).map(bereinigeFall),
    durchgaenge: liste<Durchgang>(d.durchgaenge, (x) => typeof x.id === 'string' && Array.isArray(x.checkliste) && Array.isArray(x.bewertungen)),
    personen: liste<Person>(d.personen, (x) => typeof x.id === 'string' && typeof x.name === 'string'),
  };
}

export function istFall(x: Partial<Fallbeispiel>): boolean {
  return (
    typeof x.id === 'string' &&
    typeof x.titel === 'string' &&
    Array.isArray(x.checkliste) &&
    x.checkliste.every((c) => c && typeof c.id === 'string' && typeof c.text === 'string') &&
    !!x.vitalStart &&
    typeof x.vitalStart === 'object'
  );
}

/** Ergänzt fehlende oder ungültige Vitalwerte, damit ein fremder Fall die App nicht zum Absturz bringt */
function bereinigeWerte(w: Partial<Vitalwerte>): Vitalwerte {
  const r = { ...NORMALWERTE, ...w } as Vitalwerte;
  for (const k of ['puls', 'atemfrequenz', 'rrSys', 'rrDia', 'spo2', 'blutzucker', 'temperatur'] as const) {
    if (typeof r[k] !== 'number' || !Number.isFinite(r[k])) r[k] = NORMALWERTE[k];
  }
  if (typeof r.haut !== 'string') r.haut = NORMALWERTE.haut;
  if (typeof r.pupillen !== 'string') r.pupillen = NORMALWERTE.pupillen;
  return r;
}

export function bereinigeFall(f: Fallbeispiel): Fallbeispiel {
  return {
    ...f,
    schwierigkeit: f.schwierigkeit ?? 'mittel',
    kurz: f.kurz ?? '',
    lage: f.lage ?? '',
    mimeAnleitung: f.mimeAnleitung ?? '',
    vitalStart: bereinigeWerte(f.vitalStart),
    vitalNachBehandlung: f.vitalNachBehandlung ? bereinigeWerte(f.vitalNachBehandlung) : undefined,
    checkliste: f.checkliste.map((c) => ({ ...c, punkte: typeof c.punkte === 'number' ? c.punkte : 1, kategorie: c.kategorie ?? 'Maßnahmen' })),
  };
}
