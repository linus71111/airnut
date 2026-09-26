import type { Bewertung, CheckItem, Durchgang } from './types';

export type Ergebnis = {
  punkte: number;
  maxPunkte: number;
  prozent: number;
  kritischVergessen: CheckItem[];
};

export function bewerte(checkliste: CheckItem[], bewertung: Bewertung): Ergebnis {
  const maxPunkte = checkliste.reduce((s, i) => s + i.punkte, 0);
  const punkte = checkliste.reduce((s, i) => s + (bewertung.erledigt[i.id] ? i.punkte : 0), 0);
  return {
    punkte,
    maxPunkte,
    prozent: maxPunkte ? Math.round((punkte / maxPunkte) * 100) : 0,
    kritischVergessen: checkliste.filter((i) => i.kritisch && !bewertung.erledigt[i.id]),
  };
}

export type Gesamt = {
  anzahl: number;
  durchschnittProzent: number;
  durchschnittPunkte: number;
  maxPunkte: number;
  /** Anteil der Zuschauer:innen (0–1), die den Punkt als erledigt markiert haben */
  proPunkt: Record<string, number>;
};

export function gesamt(d: Durchgang): Gesamt {
  const maxPunkte = d.checkliste.reduce((s, i) => s + i.punkte, 0);
  const n = d.bewertungen.length;
  const proPunkt: Record<string, number> = {};
  for (const item of d.checkliste) {
    const ja = d.bewertungen.filter((b) => b.erledigt[item.id]).length;
    proPunkt[item.id] = n ? ja / n : 0;
  }
  const ergebnisse = d.bewertungen.map((b) => bewerte(d.checkliste, b));
  const summe = (f: (e: Ergebnis) => number) => ergebnisse.reduce((s, e) => s + f(e), 0);
  return {
    anzahl: n,
    durchschnittProzent: n ? Math.round(summe((e) => e.prozent) / n) : 0,
    durchschnittPunkte: n ? Math.round((summe((e) => e.punkte) / n) * 10) / 10 : 0,
    maxPunkte,
    proPunkt,
  };
}

export function note(prozent: number): { text: string; farbe: string } {
  if (prozent >= 90) return { text: 'Hervorragend', farbe: '#1B8E3E' };
  if (prozent >= 75) return { text: 'Gut gemacht', farbe: '#5A9E1B' };
  if (prozent >= 50) return { text: 'Solide – da geht noch was', farbe: '#D18B00' };
  return { text: 'Nochmal üben', farbe: '#C62828' };
}

export function dauer(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function neueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
