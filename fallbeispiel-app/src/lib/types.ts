export type Bewusstsein = 'wach' | 'verwirrt' | 'reagiert auf Ansprache' | 'reagiert auf Schmerz' | 'bewusstlos';

export type Vitalwerte = {
  puls: number; // Schläge pro Minute
  atemfrequenz: number; // Atemzüge pro Minute
  rrSys: number; // Blutdruck systolisch (mmHg)
  rrDia: number; // Blutdruck diastolisch (mmHg)
  spo2: number; // Sauerstoffsättigung (%)
  blutzucker: number; // mg/dl
  temperatur: number; // °C
  bewusstsein: Bewusstsein;
  haut: string; // z.B. "blass, kaltschweißig"
  pupillen: string; // z.B. "isokor, lichtreagibel"
};

export type Kategorie = 'Eigenschutz' | 'Erstkontakt' | 'Notruf' | 'Maßnahmen' | 'Betreuung' | 'Übergabe';

export type CheckItem = {
  id: string;
  text: string;
  kategorie: Kategorie;
  punkte: number;
  /** Wird dieser Punkt vergessen, gilt der Durchgang als "kritisch" */
  kritisch?: boolean;
};

export type Fallbeispiel = {
  id: string;
  titel: string;
  kurz: string;
  /** Was die Helfer:innen beim Eintreffen vorfinden – wird vorgelesen */
  lage: string;
  /** Geheime Infos für die Mimin / den Mimen */
  mimeAnleitung: string;
  /** Tipps für Schminke / Requisiten */
  requisiten?: string;
  vitalStart: Vitalwerte;
  /** Werte nach richtiger Versorgung (optional) */
  vitalNachBehandlung?: Vitalwerte;
  checkliste: CheckItem[];
  eigenes?: boolean;
};

export type Bewertung = {
  id: string;
  name: string;
  erledigt: Record<string, boolean>;
  notiz: string;
  zeit: number;
};

export type Durchgang = {
  id: string;
  fallId: string;
  fallTitel: string;
  team: string;
  start: number;
  ende?: number;
  /** Kopie der Checkliste, damit alte Ergebnisse stimmen, auch wenn der Fall später geändert wird */
  checkliste: CheckItem[];
  bewertungen: Bewertung[];
};
