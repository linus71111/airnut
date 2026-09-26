import type { Schwierigkeit } from './types';

export const SCHWIERIGKEITEN: Schwierigkeit[] = ['leicht', 'mittel', 'schwer'];

export const SCHWIERIGKEIT_INFO: Record<Schwierigkeit, { label: string; farbe: string; text: string }> = {
  leicht: { label: 'Leicht', farbe: '#1B8E3E', text: 'Wache Person, klare Lage – gut für Einsteiger:innen.' },
  mittel: { label: 'Mittel', farbe: '#D18B00', text: 'Mehrere Maßnahmen, Zustand kann sich ändern.' },
  schwer: { label: 'Schwer', farbe: '#C62828', text: 'Lebensbedrohlich, Teamarbeit und schnelles Handeln nötig.' },
};
