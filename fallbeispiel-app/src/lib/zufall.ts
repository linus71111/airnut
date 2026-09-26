import { router } from 'expo-router';

import type { Fallbeispiel, Schwierigkeit } from './types';

let zuletzt: string | undefined;

/** Wählt einen zufälligen Fall (nicht zweimal hintereinander denselben) und öffnet ihn */
export function oeffneZufallsFall(faelle: Fallbeispiel[], stufe?: Schwierigkeit, ersetzen = false) {
  const passend = stufe ? faelle.filter((f) => f.schwierigkeit === stufe) : faelle;
  const auswahl = passend.length > 1 ? passend.filter((f) => f.id !== zuletzt) : passend;
  const fall = auswahl[Math.floor(Math.random() * auswahl.length)];
  if (!fall) return;
  zuletzt = fall.id;
  const ziel = { pathname: '/fall/[id]' as const, params: { id: fall.id, zufall: '1', ...(stufe ? { stufe } : {}) } };
  if (ersetzen) router.replace(ziel);
  else router.push(ziel);
}
