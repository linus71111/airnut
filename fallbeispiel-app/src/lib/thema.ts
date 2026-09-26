import type { Thema } from './types';

export const THEMEN: Thema[] = ['wasser', 'alltag', 'rettungsdienst', 'witzig'];

export const THEMA_INFO: Record<Thema, { label: string; icon: string }> = {
  wasser: { label: 'Wasser', icon: '🌊' },
  alltag: { label: 'Alltag', icon: '🏠' },
  rettungsdienst: { label: 'Rettungsdienst', icon: '🚑' },
  witzig: { label: 'Witzig', icon: '😄' },
};
