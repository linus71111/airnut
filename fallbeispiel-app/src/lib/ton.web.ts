// Töne im Browser: werden mit der Web-Audio-API direkt erzeugt, es braucht keine Tondateien
import { TOENE, type TonArt } from './tonDaten';

let kontext: AudioContext | null = null;

export function spieleTon(art: TonArt) {
  try {
    const AC = globalThis.AudioContext ?? (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    kontext ??= new AC();
    if (kontext.state === 'suspended') kontext.resume().catch(() => {});
    let t = kontext.currentTime + 0.01;
    for (const [freq, dauerMs, pauseMs] of TOENE[art]) {
      const d = dauerMs / 1000;
      const osz = kontext.createOscillator();
      const laut = kontext.createGain();
      osz.type = 'sine';
      osz.frequency.value = freq;
      laut.gain.setValueAtTime(0, t);
      laut.gain.linearRampToValueAtTime(0.25, t + 0.005);
      laut.gain.setValueAtTime(0.25, t + Math.max(0.005, d - 0.01));
      laut.gain.linearRampToValueAtTime(0, t + d);
      osz.connect(laut).connect(kontext.destination);
      osz.start(t);
      osz.stop(t + d + 0.02);
      t += d + pauseMs / 1000;
    }
  } catch {
    // Ton ist nur ein Extra – Fehler ignorieren
  }
}
