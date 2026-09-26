export type TonArt = 'piep' | 'klick' | 'alarm' | 'fertig';

/** Jeder Ton ist eine Folge von [Frequenz in Hz, Dauer in ms, Pause danach in ms] */
export const TOENE: Record<TonArt, [number, number, number][]> = {
  // Monitor-Piepton pro Herzschlag
  piep: [[1000, 70, 0]],
  // Kurzer Klick beim Abhaken
  klick: [[1800, 25, 0]],
  // Alarm: Wert ist auffällig geworden
  alarm: [
    [880, 160, 60],
    [660, 160, 60],
    [880, 160, 60],
    [660, 160, 0],
  ],
  // Zeitlimit erreicht
  fertig: [
    [660, 140, 40],
    [880, 140, 40],
    [1100, 260, 0],
  ],
};
