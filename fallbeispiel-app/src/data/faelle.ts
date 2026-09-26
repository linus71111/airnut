import type { CheckItem, Fallbeispiel, Kategorie, Vitalwerte } from '../lib/types';
import { NORMALWERTE } from '../lib/vitals';

// Hinweis: Die Inhalte sind Übungs-Fallbeispiele für die Erste-Hilfe-/Sanitätsausbildung
// und ersetzen keine Ausbildung. Bitte vor dem Einsatz mit euren Ausbilder:innen abstimmen.

type Punkt = [text: string, kategorie: Kategorie, punkte?: number, kritisch?: boolean];

function liste(prefix: string, punkte: Punkt[]): CheckItem[] {
  return punkte.map(([text, kategorie, p = 1, kritisch], i) => ({
    id: `${prefix}-${i + 1}`,
    text,
    kategorie,
    punkte: p,
    kritisch: kritisch || undefined,
  }));
}

function werte(w: Partial<Vitalwerte>): Vitalwerte {
  return { ...NORMALWERTE, ...w };
}

const START: Punkt[] = [
  ['Eigenschutz beachtet (Handschuhe, Gefahren erkannt)', 'Eigenschutz', 2, true],
  ['Person angesprochen und sich vorgestellt', 'Erstkontakt'],
];

const NOTRUF: Punkt[] = [['Notruf 112 abgesetzt (Wo? Was? Wie viele? Welche Verletzungen? Warten auf Rückfragen)', 'Notruf', 2, true]];

const ENDE: Punkt[] = [
  ['Betroffene Person betreut, beruhigt und nicht allein gelassen', 'Betreuung'],
  ['Vitalwerte regelmäßig kontrolliert', 'Betreuung'],
  ['Übergabe an den Rettungsdienst (Was ist passiert? Was wurde gemacht?)', 'Übergabe'],
];

export const STANDARD_FAELLE: Fallbeispiel[] = [
  {
    id: 'cpr-standard',
    schwierigkeit: 'mittel',
    titel: 'CPR – Reanimation Standardablauf',
    kurz: 'Person bricht zusammen und atmet nicht normal – Wiederbelebung Schritt für Schritt.',
    lage:
      'Auf dem Vereinsgelände bricht ein Mann plötzlich zusammen und bleibt reglos auf dem Boden liegen. Außer euch ist nur eine weitere Person in der Nähe.',
    mimeAnleitung:
      'Achtung: Herzdruckmassage und Beatmung nur an der Übungspuppe! Die Mimin/der Mime liegt nur bis zur Atemkontrolle da: keine Reaktion, keine normale Atmung (höchstens einzelne Schnappatmung). Danach wird an der Puppe weitergemacht. Eine zweite Person spielt den Passanten, der auf Anweisung den Notruf wählt oder den AED holt. Nach ca. 4–6 Minuten trifft der „Rettungsdienst“ ein und übernimmt.',
    requisiten: 'Reanimationspuppe, Trainings-AED, Beatmungstuch oder -maske, Handschuhe, Handy für den Notruf.',
    vitalStart: werte({
      puls: 0,
      atemfrequenz: 0,
      rrSys: 0,
      rrDia: 0,
      spo2: 0,
      bewusstsein: 'bewusstlos',
      haut: 'blass-grau, Lippen blau',
      pupillen: 'weit, reagieren nicht auf Licht',
    }),
    checkliste: liste('cpr', [
      ['Umgebung auf Gefahren geprüft (Eigenschutz)', 'Eigenschutz', 2, true],
      ['Bewusstsein geprüft: laut angesprochen, an den Schultern gerüttelt', 'Erstkontakt', 1, true],
      ['Laut um Hilfe gerufen', 'Notruf'],
      ['Atemwege frei gemacht: Kopf überstreckt, Kinn angehoben', 'Maßnahmen', 2, true],
      ['Atmung geprüft (Sehen – Hören – Fühlen, höchstens 10 Sekunden), Schnappatmung als „nicht normal“ erkannt', 'Maßnahmen', 2, true],
      ['Notruf 112 abgesetzt oder gezielt veranlasst (Handy auf Lautsprecher)', 'Notruf', 2, true],
      ['AED gezielt holen lassen', 'Notruf', 2, true],
      ['Oberkörper frei gemacht, Druckpunkt in der Mitte des Brustkorbs', 'Maßnahmen'],
      ['30 Herzdruckmassagen: 5–6 cm tief, 100–120 pro Minute', 'Maßnahmen', 3, true],
      ['Arme gestreckt, Brustkorb vollständig entlastet, Pausen unter 10 Sekunden', 'Maßnahmen', 2],
      ['2 Beatmungen, Brustkorb hebt sich sichtbar (oder durchgehende Herzdruckmassage)', 'Maßnahmen', 2],
      ['AED sofort eingeschaltet, Elektroden richtig aufgeklebt, Anweisungen befolgt', 'Maßnahmen', 3, true],
      ['Bei Analyse und Schock berührt niemand die Person („Alle weg!“)', 'Maßnahmen', 2, true],
      ['Nach dem Schock sofort mit der Herzdruckmassage weitergemacht', 'Maßnahmen', 2],
      ['Helferwechsel etwa alle 2 Minuten ohne lange Pause', 'Maßnahmen'],
      ['Übergabe an den Rettungsdienst (Was ist passiert? Was wurde gemacht? Wie viele Schocks?)', 'Übergabe'],
    ]),
  },
  {
    id: 'ertrinken-bewusstlos',
    schwierigkeit: 'mittel',
    titel: 'Ertrinkungsunfall – bewusstlos mit Atmung',
    kurz: 'Badegast wurde aus dem Wasser gezogen, atmet aber.',
    lage:
      'Am Badesee wurde ein Jugendlicher von Freunden aus dem Wasser gezogen. Er liegt am Ufer auf dem Rücken und reagiert nicht. Die Freunde stehen aufgeregt daneben.',
    mimeAnleitung:
      'Du liegst auf dem Rücken, Augen zu. Du reagierst weder auf Ansprache noch auf Schütteln. Atme ruhig, aber sichtbar (Brustkorb hebt sich). Wirst du in die stabile Seitenlage gebracht, hustest du nach ca. 2 Minuten etwas und wirst langsam wach, bist aber verwirrt und frierst.',
    requisiten: 'Nasse Kleidung/Badehose, Handtuch, evtl. blaue Lippen schminken.',
    vitalStart: werte({
      puls: 115,
      atemfrequenz: 24,
      rrSys: 105,
      rrDia: 65,
      spo2: 89,
      temperatur: 35.4,
      bewusstsein: 'bewusstlos',
      haut: 'blass, kalt, nass, Lippen bläulich',
    }),
    vitalNachBehandlung: werte({
      puls: 100,
      atemfrequenz: 18,
      rrSys: 115,
      rrDia: 70,
      spo2: 93,
      temperatur: 35.6,
      bewusstsein: 'verwirrt',
      haut: 'blass, kühl',
    }),
    checkliste: liste('ert', [
      ...START,
      ['Bewusstsein geprüft (laut ansprechen, an den Schultern rütteln)', 'Erstkontakt', 1, true],
      ['Um Hilfe gerufen / Umstehende eingebunden', 'Notruf'],
      ['Atemwege frei gemacht (Kopf überstreckt, Kinn angehoben)', 'Maßnahmen', 2, true],
      ['Atmung geprüft (Sehen – Hören – Fühlen, max. 10 Sekunden)', 'Maßnahmen', 2, true],
      ...NOTRUF,
      ['Stabile Seitenlage korrekt durchgeführt', 'Maßnahmen', 3, true],
      ['Nasse Kleidung entfernt bzw. Wärmeerhalt (Rettungsdecke/Handtücher)', 'Maßnahmen', 2],
      ['Atmung in der Seitenlage regelmäßig kontrolliert', 'Maßnahmen', 2],
      ...ENDE,
    ]),
  },
  {
    id: 'reanimation',
    schwierigkeit: 'schwer',
    titel: 'Herz-Kreislauf-Stillstand am Beckenrand',
    kurz: 'Älterer Badegast bricht zusammen – keine normale Atmung.',
    lage:
      'Im Freibad bricht ein älterer Mann am Beckenrand plötzlich zusammen. Er liegt auf dem Boden, seine Frau ruft laut um Hilfe.',
    mimeAnleitung:
      'Achtung: Für die Herzdruckmassage eine Übungspuppe verwenden! Die Mimin/der Mime legt sich daneben und spielt nur bis zur Atemkontrolle mit: keine Reaktion, keine Atmung. Dann wird an der Puppe weitergemacht. Eine zweite Person spielt die aufgeregte Ehefrau.',
    requisiten: 'Reanimationspuppe, Übungs-AED (Trainer), Handschuhe.',
    vitalStart: werte({
      puls: 0,
      atemfrequenz: 0,
      rrSys: 0,
      rrDia: 0,
      spo2: 0,
      bewusstsein: 'bewusstlos',
      haut: 'grau-blass, Lippen blau',
      pupillen: 'weit, reagieren nicht auf Licht',
    }),
    checkliste: liste('rea', [
      ...START,
      ['Bewusstsein geprüft (laut ansprechen, an den Schultern rütteln)', 'Erstkontakt', 1, true],
      ['Atemwege frei gemacht und Atmung geprüft (max. 10 Sekunden)', 'Maßnahmen', 2, true],
      ...NOTRUF,
      ['AED holen lassen (gezielt eine Person beauftragt)', 'Notruf', 2, true],
      ['Sofort mit Herzdruckmassage begonnen', 'Maßnahmen', 3, true],
      ['Druckpunkt korrekt (Mitte des Brustkorbs)', 'Maßnahmen', 2],
      ['Frequenz 100–120/min, Tiefe 5–6 cm, vollständige Entlastung', 'Maßnahmen', 2],
      ['Beatmung 30:2 (oder durchgehende Herzdruckmassage, falls keine Beatmung möglich)', 'Maßnahmen', 2],
      ['AED sofort eingesetzt, Anweisungen befolgt, beim Schock niemand berührt', 'Maßnahmen', 3, true],
      ['Möglichst wenige Unterbrechungen, Helferwechsel alle ca. 2 Minuten', 'Maßnahmen', 1],
      ['Angehörige betreut bzw. jemanden dafür eingeteilt', 'Betreuung'],
      ['Übergabe an den Rettungsdienst (Was ist passiert? Was wurde gemacht?)', 'Übergabe'],
    ]),
  },
  {
    id: 'unterzucker',
    schwierigkeit: 'leicht',
    titel: 'Unterzuckerung beim Training',
    kurz: 'Jugendliche mit Diabetes wird zittrig und verwirrt.',
    lage:
      'Nach dem Schwimmtraining sitzt eine Jugendliche auf der Bank in der Umkleide. Sie ist blass, schwitzt stark und zittert. Ihre Freundin sagt: „Die hat Diabetes, glaub ich.“',
    mimeAnleitung:
      'Du bist zittrig, unruhig und etwas gereizt, sprichst langsam und bist leicht verwirrt. Du kannst schlucken. Fragt man dich, sagst du, dass du Diabetes hast und heute wenig gegessen hast. Bekommst du Traubenzucker oder Saft, wirst du nach ca. 3–5 Minuten langsam klarer.',
    requisiten: 'Wasser-Sprühflasche für Schweiß, Blutzuckermessgerät als Requisite, Traubenzucker.',
    vitalStart: werte({
      puls: 110,
      atemfrequenz: 18,
      rrSys: 120,
      rrDia: 75,
      blutzucker: 45,
      bewusstsein: 'verwirrt',
      haut: 'blass, kaltschweißig',
    }),
    vitalNachBehandlung: werte({
      puls: 90,
      blutzucker: 95,
      bewusstsein: 'wach',
      haut: 'noch etwas blass, trocknet',
    }),
    checkliste: liste('bz', [
      ...START,
      ['Nach Vorerkrankungen / Diabetes gefragt (Notfallausweis gesucht)', 'Erstkontakt', 2],
      ['Geprüft, ob die Person wach ist und schlucken kann', 'Maßnahmen', 2, true],
      ['Traubenzucker oder zuckerhaltiges Getränk gegeben', 'Maßnahmen', 3, true],
      ['Blutzucker gemessen / messen lassen (falls Gerät vorhanden)', 'Maßnahmen'],
      ['Hingesetzt bzw. hingelegt, vor Stürzen geschützt', 'Maßnahmen'],
      ...NOTRUF,
      ['Verlauf beobachtet (wird die Person wieder klarer?)', 'Betreuung', 2],
      ...ENDE,
    ]),
  },
  {
    id: 'schnittwunde',
    schwierigkeit: 'leicht',
    titel: 'Starke Blutung am Unterarm',
    kurz: 'Schnitt an einer Glasscherbe, es blutet stark.',
    lage:
      'Am Strand hat sich ein Kind an einer Glasscherbe tief in den Unterarm geschnitten. Es blutet stark, das Kind weint und hält sich den Arm.',
    mimeAnleitung:
      'Du hast Angst und Schmerzen und weinst. Du drückst mit der anderen Hand auf die Wunde. Wird der Arm hochgehalten und ein Druckverband angelegt, wirst du ruhiger. Wirst du nicht beachtet, wird dir schwindelig und du willst dich hinlegen.',
    requisiten: 'Kunstblut, Wundschminke am Unterarm, Glasscherbe-Attrappe (kein echtes Glas!).',
    vitalStart: werte({
      puls: 125,
      atemfrequenz: 24,
      rrSys: 100,
      rrDia: 65,
      bewusstsein: 'wach',
      haut: 'blass, kühl',
    }),
    vitalNachBehandlung: werte({ puls: 105, atemfrequenz: 20, rrSys: 105, rrDia: 70, haut: 'etwas blass' }),
    checkliste: liste('blut', [
      ...START,
      ['Arm hochgehalten und direkt auf die Wunde gedrückt', 'Maßnahmen', 2, true],
      ['Druckverband korrekt angelegt (Wundauflage, Druckpolster, Fixierung)', 'Maßnahmen', 3, true],
      ['Kind hingesetzt/hingelegt (Schockvorbeugung)', 'Maßnahmen', 2],
      ['Durchbluten kontrolliert, ggf. zweiten Druckverband angelegt', 'Maßnahmen'],
      ['Wärmeerhalt (Rettungsdecke)', 'Maßnahmen'],
      ...NOTRUF,
      ['Eltern / Aufsichtsperson informiert', 'Betreuung'],
      ...ENDE,
    ]),
  },
  {
    id: 'allergie',
    schwierigkeit: 'mittel',
    titel: 'Wespenstich mit allergischer Reaktion',
    kurz: 'Stich beim Eisessen – Schwellung, Atemnot.',
    lage:
      'Ein Jugendlicher wurde beim Eisessen am Kiosk in die Lippe gestochen. Er kratzt sich überall, hat rote Flecken und sagt, er bekomme schlecht Luft.',
    mimeAnleitung:
      'Du kratzt dich ständig, hast Angst und atmest schnell. Du sprichst in kurzen Sätzen. Wenn man fragt: Du bist allergisch und hast einen Notfall-Pen im Rucksack. Wirst du hingesetzt und beruhigt, wird es kurz etwas besser. Ohne Hilfe wird dir schwindelig.',
    requisiten: 'Rote Flecken schminken, Übungs-Adrenalin-Pen (Trainer), Rucksack.',
    vitalStart: werte({
      puls: 125,
      atemfrequenz: 28,
      rrSys: 95,
      rrDia: 55,
      spo2: 91,
      bewusstsein: 'wach',
      haut: 'rote Quaddeln, Juckreiz, Lippe geschwollen',
    }),
    vitalNachBehandlung: werte({ puls: 105, atemfrequenz: 22, rrSys: 110, rrDia: 65, spo2: 95, haut: 'Rötung geht zurück' }),
    checkliste: liste('all', [
      ...START,
      ['Nach Allergie und Notfallset gefragt', 'Erstkontakt', 2, true],
      ...NOTRUF,
      ['Beim Anwenden des eigenen Notfall-Pens unterstützt', 'Maßnahmen', 3, true],
      ['Oberkörper hochgelagert bei Atemnot (bei Kreislaufproblemen flach lagern)', 'Maßnahmen', 2],
      ['Stich innen im Mund: kühlen (Eis lutschen, kalte Umschläge am Hals)', 'Maßnahmen', 2],
      ['Enge Kleidung geöffnet', 'Maßnahmen'],
      ['Atmung und Bewusstsein ständig überwacht', 'Betreuung', 2],
      ...ENDE,
    ]),
  },
  {
    id: 'wirbelsaeule',
    schwierigkeit: 'schwer',
    titel: 'Kopfsprung ins flache Wasser',
    kurz: 'Verdacht auf Wirbelsäulenverletzung.',
    lage:
      'Ein junger Mann ist vom Steg ins flache Wasser gesprungen. Freunde haben ihn ans Ufer gebracht. Er liegt auf dem Rücken, ist wach und sagt, er spüre seine Beine nicht richtig.',
    mimeAnleitung:
      'Du bist wach, hast Nackenschmerzen und Angst. Deine Beine kribbeln, du kannst sie kaum bewegen. Du willst dich immer wieder aufsetzen („Ich will nach Hause!“) – nur wenn dich jemand ruhig anspricht und deinen Kopf hält, bleibst du liegen.',
    requisiten: 'Nasse Kleidung, Schürfwunde an der Stirn schminken.',
    vitalStart: werte({
      puls: 95,
      atemfrequenz: 20,
      rrSys: 115,
      rrDia: 70,
      temperatur: 36.1,
      bewusstsein: 'wach',
      haut: 'blass, nass, Schürfwunde an der Stirn',
    }),
    checkliste: liste('ws', [
      ...START,
      ['Unfallhergang erfragt und Verdacht auf Wirbelsäulenverletzung erkannt', 'Erstkontakt', 2, true],
      ['Person aufgefordert, sich nicht zu bewegen', 'Maßnahmen', 2],
      ['Kopf und Hals mit den Händen stabilisiert (manuelle Fixierung)', 'Maßnahmen', 3, true],
      ...NOTRUF,
      ['Nach Gefühl und Bewegung in Armen und Beinen gefragt', 'Maßnahmen'],
      ['Wärmeerhalt ohne unnötige Bewegung (Rettungsdecke)', 'Maßnahmen', 2],
      ['Wunde an der Stirn versorgt', 'Maßnahmen'],
      ...ENDE,
    ]),
  },
  {
    id: 'hitze',
    schwierigkeit: 'leicht',
    titel: 'Sonnenstich am Wachturm',
    kurz: 'Kopfschmerzen, Übelkeit nach langem Aufenthalt in der Sonne.',
    lage:
      'Ein Kind hat den ganzen Nachmittag ohne Kappe in der prallen Sonne Beachvolleyball gespielt. Jetzt sitzt es mit hochrotem Kopf im Sand, klagt über Kopfschmerzen und Übelkeit.',
    mimeAnleitung:
      'Du hast starke Kopfschmerzen, dir ist übel und schwindelig. Du hältst dir den Kopf. Wirst du in den Schatten gebracht, der Kopf gekühlt und du bekommst zu trinken, geht es dir nach einigen Minuten etwas besser.',
    requisiten: 'Roter Kopf (Schminke), Volleyball.',
    vitalStart: werte({
      puls: 115,
      atemfrequenz: 22,
      rrSys: 110,
      rrDia: 70,
      temperatur: 37.9,
      bewusstsein: 'wach',
      haut: 'Kopf hochrot und heiß, Körper normal warm',
    }),
    vitalNachBehandlung: werte({ puls: 95, temperatur: 37.4, haut: 'Kopf noch gerötet' }),
    checkliste: liste('hitze', [
      ...START,
      ['In den Schatten gebracht', 'Maßnahmen', 3, true],
      ['Oberkörper leicht erhöht gelagert', 'Maßnahmen', 2],
      ['Kopf und Nacken gekühlt (feuchte Tücher)', 'Maßnahmen', 2],
      ['Zu trinken gegeben (nur wenn wach und nicht erbrechend)', 'Maßnahmen', 2],
      ['Bewusstsein und Atmung überwacht', 'Betreuung', 2],
      ['Notruf 112 bei Verschlechterung / Eltern informiert', 'Notruf', 2],
      ...ENDE,
    ]),
  },
  {
    id: 'unterkuehlung',
    schwierigkeit: 'mittel',
    titel: 'Unterkühlung nach langem Schwimmen',
    kurz: 'Schwimmer kommt zitternd aus dem kalten See.',
    lage:
      'Bei der Frühjahrs-Freiwasserübung kommt ein Teilnehmer nach langer Zeit aus dem kalten Wasser. Er zittert stark, spricht undeutlich und reagiert langsam.',
    mimeAnleitung:
      'Du zitterst am ganzen Körper, sprichst langsam und undeutlich und bist etwas verwirrt. Du willst dich eigentlich nur hinsetzen. Wenn dich jemand fest reibt oder schnell bewegt, sag „Mir wird schwindelig“ (Hinweis für die Zuschauer: das sollte man vermeiden).',
    requisiten: 'Nasser Neoprenanzug oder nasse Kleidung, Handtücher, Rettungsdecke.',
    vitalStart: werte({
      puls: 105,
      atemfrequenz: 22,
      rrSys: 120,
      rrDia: 80,
      spo2: 95,
      temperatur: 34.5,
      bewusstsein: 'verwirrt',
      haut: 'blass, eiskalt, Lippen bläulich, Muskelzittern',
    }),
    vitalNachBehandlung: werte({ puls: 95, temperatur: 35.2, bewusstsein: 'wach', haut: 'kühl, zittert weniger' }),
    checkliste: liste('kalt', [
      ...START,
      ['Person vorsichtig und ohne unnötige Bewegung behandelt (nicht reiben!)', 'Maßnahmen', 2, true],
      ['Vor Wind geschützt, in einen warmen Raum/Auto gebracht', 'Maßnahmen', 2],
      ['Nasse Kleidung vorsichtig entfernt und zugedeckt (Decken, Rettungsdecke)', 'Maßnahmen', 3, true],
      ['Warme, gezuckerte Getränke nur bei klarem Bewusstsein', 'Maßnahmen'],
      ...NOTRUF,
      ...ENDE,
    ]),
  },
  {
    id: 'krampfanfall',
    schwierigkeit: 'mittel',
    titel: 'Krampfanfall am Beckenrand',
    kurz: 'Person stürzt und krampft.',
    lage:
      'Auf den Fliesen am Beckenrand liegt eine Person, die am ganzen Körper zuckt. Umstehende wollen sie festhalten und ihr etwas zwischen die Zähne schieben.',
    mimeAnleitung:
      'Du zuckst ca. 1 Minute mit Armen und Beinen (vorsichtig, verletze dich nicht!). Danach bist du schlapp, sehr müde und verwirrt, weißt nicht, was passiert ist. Nach einigen Minuten wirst du langsam klarer. Umstehende (zweite Mimin) wollen dich festhalten.',
    requisiten: 'Weiche Unterlage/Matte zum Schutz, evtl. Speichel (Wasser) am Mund.',
    vitalStart: werte({
      puls: 130,
      atemfrequenz: 26,
      rrSys: 145,
      rrDia: 90,
      spo2: 92,
      bewusstsein: 'bewusstlos',
      haut: 'rot, schweißig, Speichel am Mund',
    }),
    vitalNachBehandlung: werte({
      puls: 100,
      atemfrequenz: 18,
      rrSys: 130,
      rrDia: 85,
      spo2: 96,
      bewusstsein: 'verwirrt',
      haut: 'blass, verschwitzt',
    }),
    checkliste: liste('krampf', [
      ...START,
      ['Gefährliche Gegenstände entfernt / Kopf geschützt (z.B. Handtuch unterlegt)', 'Maßnahmen', 3, true],
      ['Person NICHT festgehalten, nichts in den Mund geschoben', 'Maßnahmen', 2, true],
      ['Dauer des Anfalls beobachtet (Uhrzeit gemerkt)', 'Maßnahmen', 2],
      ['Nach dem Anfall Bewusstsein und Atmung geprüft', 'Maßnahmen', 2, true],
      ['Stabile Seitenlage bei Bewusstlosigkeit mit normaler Atmung', 'Maßnahmen', 2],
      ...NOTRUF,
      ['Schaulustige ferngehalten, Privatsphäre geschützt', 'Betreuung'],
      ...ENDE,
    ]),
  },
];
