// Erzeugt die WAV-Dateien in assets/sounds aus src/lib/tonDaten.ts
// Aufruf: node --experimental-strip-types scripts/erzeuge-toene.ts
import { writeFileSync } from 'node:fs';

import { TOENE } from '../src/lib/tonDaten.ts';

const RATE = 22050;
const LAUTSTAERKE = 0.5;
const RAMPE = 0.005; // weiches Ein-/Ausblenden gegen Knacken

for (const [name, noten] of Object.entries(TOENE)) {
  const samples: number[] = [];
  for (const [freq, dauerMs, pauseMs] of noten) {
    const n = Math.round((dauerMs / 1000) * RATE);
    for (let i = 0; i < n; i++) {
      const t = i / RATE;
      const huelle = Math.min(1, t / RAMPE, (n - i) / RATE / RAMPE);
      samples.push(Math.sin(2 * Math.PI * freq * t) * huelle * LAUTSTAERKE);
    }
    for (let i = 0; i < Math.round((pauseMs / 1000) * RATE); i++) samples.push(0);
  }
  const daten = Buffer.alloc(44 + samples.length * 2);
  daten.write('RIFF', 0);
  daten.writeUInt32LE(36 + samples.length * 2, 4);
  daten.write('WAVEfmt ', 8);
  daten.writeUInt32LE(16, 16);
  daten.writeUInt16LE(1, 20); // PCM
  daten.writeUInt16LE(1, 22); // Mono
  daten.writeUInt32LE(RATE, 24);
  daten.writeUInt32LE(RATE * 2, 28);
  daten.writeUInt16LE(2, 32);
  daten.writeUInt16LE(16, 34);
  daten.write('data', 36);
  daten.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => daten.writeInt16LE(Math.round(s * 32767), 44 + i * 2));
  writeFileSync(`assets/sounds/${name}.wav`, daten);
  console.log(`assets/sounds/${name}.wav`);
}
