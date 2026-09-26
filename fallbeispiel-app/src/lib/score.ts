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

export type AkteEintrag = { durchgang: Durchgang; prozent: number };

export type Akte = {
  eintraege: AkteEintrag[];
  /** Durchschnitt nur über bewertete Einsätze */
  durchschnitt: number | null;
  bestes: number | null;
  /** Durchschnitt je Schwierigkeit */
  proSchwierigkeit: Partial<Record<string, number>>;
  /** Prüfpunkte, die gefehlt haben (von weniger als 50% der Zuschauer:innen gesehen), häufigste zuerst */
  oftVergessen: { text: string; anzahl: number }[];
  /** Prüfpunkte, die mindestens zweimal geklappt haben */
  staerken: { text: string; anzahl: number }[];
};

export function akte(personId: string, durchgaenge: Durchgang[]): Akte {
  const eigene = durchgaenge.filter((d) => d.helferIds?.includes(personId)).sort((a, b) => b.start - a.start);
  const eintraege = eigene.map((d) => ({ durchgang: d, prozent: gesamt(d).durchschnittProzent }));
  const bewertet = eintraege.filter((e) => e.durchgang.bewertungen.length > 0);
  const schnitt = (liste: AkteEintrag[]) => (liste.length ? Math.round(liste.reduce((s, e) => s + e.prozent, 0) / liste.length) : null);

  const proSchwierigkeit: Partial<Record<string, number>> = {};
  for (const s of ['leicht', 'mittel', 'schwer']) {
    const w = schnitt(bewertet.filter((e) => e.durchgang.schwierigkeit === s));
    if (w !== null) proSchwierigkeit[s] = w;
  }

  const vergessen = new Map<string, number>();
  const geschafft = new Map<string, number>();
  for (const { durchgang: d } of bewertet) {
    const g = gesamt(d);
    for (const c of d.checkliste) {
      const ziel = g.proPunkt[c.id] < 0.5 ? vergessen : geschafft;
      ziel.set(c.text, (ziel.get(c.text) ?? 0) + 1);
    }
  }
  const top = (m: Map<string, number>, min: number) =>
    [...m.entries()]
      .filter(([, n]) => n >= min)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([text, anzahl]) => ({ text, anzahl }));

  return {
    eintraege,
    durchschnitt: schnitt(bewertet),
    bestes: bewertet.length ? Math.max(...bewertet.map((e) => e.prozent)) : null,
    proSchwierigkeit,
    oftVergessen: top(vergessen, 1),
    staerken: top(geschafft, 2),
  };
}
