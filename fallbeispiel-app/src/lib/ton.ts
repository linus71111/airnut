// Töne auf Android und iPhone (für den Browser gibt es ton.web.ts)
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import type { TonArt } from './tonDaten';

const QUELLEN: Record<TonArt, number> = {
  piep: require('../../assets/sounds/piep.wav'),
  klick: require('../../assets/sounds/klick.wav'),
  alarm: require('../../assets/sounds/alarm.wav'),
  fertig: require('../../assets/sounds/fertig.wav'),
};

const spieler: Partial<Record<TonArt, AudioPlayer>> = {};
let vorbereitet = false;

export function spieleTon(art: TonArt) {
  try {
    if (!vorbereitet) {
      vorbereitet = true;
      // Auch im Lautlos-Modus hörbar, ohne Musik anderer Apps zu stoppen
      setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {});
    }
    const p = (spieler[art] ??= createAudioPlayer(QUELLEN[art]));
    p.seekTo(0)
      .then(() => p.play())
      .catch(() => {});
  } catch {
    // Ton ist nur ein Extra – Fehler ignorieren
  }
}
