import type { Qualifikation } from './types';

export const QUALIFIKATIONEN: Qualifikation[] = ['eh', 'sanA', 'sanB', 'rs'];

export const QUALIFIKATION_INFO: Record<Qualifikation, { label: string; kurz: string; farbe: string }> = {
  eh: { label: 'Erste-Hilfe-Kurs', kurz: 'EH', farbe: '#5F6368' },
  sanA: { label: 'San A', kurz: 'San A', farbe: '#1565C0' },
  sanB: { label: 'San B', kurz: 'San B', farbe: '#6A1B9A' },
  rs: { label: 'Rettungssanitäter', kurz: 'RS', farbe: '#2E7D32' },
};
