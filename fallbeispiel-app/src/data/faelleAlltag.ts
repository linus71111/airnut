import type { Fallbeispiel } from '../lib/types';
import { ENDE, liste, START, werte } from './faelle';

// Notfälle aus dem Alltag – viele davon mit Kindern.

export const ALLTAGS_FAELLE: Fallbeispiel[] = [
  {
    id: 'verschlucken',
    thema: 'alltag',
    schwierigkeit: 'mittel',
    titel: 'Verschluckt beim Grillfest',
    kurz: 'Ein Stück Fleisch steckt im Hals – die Person kann nicht mehr sprechen.',
    lage:
      'Beim Grillfest springt ein Mann plötzlich auf, greift sich an den Hals und läuft rot an. Er gibt keinen Ton von sich. Seine Frau ruft: „Er hat sich verschluckt!“',
    mimeAnleitung:
      'Du fasst dir an den Hals, kannst nicht sprechen und nur schwach husten. Nach 5 Rückenschlägen oder spätestens nach den Oberbauchkompressionen „löst“ sich das Stück und du hustest es aus. ACHTUNG: Rückenschläge und Oberbauchkompressionen nur andeuten!',
    requisiten: 'Teller, Grillwürstchen, Stuhl.',
    vitalStart: werte({ puls: 130, atemfrequenz: 8, rrSys: 150, rrDia: 95, spo2: 85, bewusstsein: 'wach', haut: 'Gesicht rot, dann bläulich' }),
    vitalNachBehandlung: werte({ puls: 105, atemfrequenz: 22, spo2: 95, haut: 'gerötet' }),
    checkliste: liste('bolus', [
      ['Erkannt: Person kann nicht sprechen/atmen (schwere Verlegung)', 'Erstkontakt', 2, true],
      ['Zum kräftigen Husten aufgefordert (solange möglich)', 'Maßnahmen', 2],
      ['Bis zu 5 Schläge zwischen die Schulterblätter (Oberkörper vorgebeugt)', 'Maßnahmen', 3, true],
      ['Bis zu 5 Oberbauchkompressionen (Heimlich-Handgriff) – nur andeuten', 'Maßnahmen', 3, true],
      ['Im Wechsel wiederholt, bis sich der Fremdkörper löst', 'Maßnahmen', 2],
      ['Notruf 112 (bzw. gezielt veranlasst)', 'Notruf', 2, true],
      ['Nach Oberbauchkompressionen: ärztliche Kontrolle veranlasst', 'Notruf', 2],
      ['Bei Bewusstlosigkeit sofort Reanimation', 'Maßnahmen', 2],
      ['Betroffene Person betreut, beruhigt und nicht allein gelassen', 'Betreuung'],
    ]),
  },
  {
    id: 'fieberkrampf',
    thema: 'alltag',
    schwierigkeit: 'mittel',
    titel: 'Fieberkrampf beim Kleinkind',
    kurz: 'Ein fiebriges Kleinkind zuckt am ganzen Körper.',
    lage:
      'Bei einem Familientag im Verein ruft eine Mutter um Hilfe: Ihr zweijähriger Sohn, der seit dem Morgen Fieber hat, zuckt plötzlich mit Armen und Beinen und reagiert nicht.',
    mimeAnleitung:
      'Nur mit Babypuppe üben. Die Mutter (Mimin) ist panisch, will das Kind schütteln und festhalten. Nach ca. 2 Minuten hört der Krampf auf, das Kind ist danach müde und schläfrig, atmet aber normal.',
    requisiten: 'Kleinkindpuppe, Decke, Fieberthermometer.',
    vitalStart: werte({ puls: 160, atemfrequenz: 36, spo2: 93, temperatur: 39.8, bewusstsein: 'bewusstlos', haut: 'heiß, gerötet' }),
    vitalNachBehandlung: werte({ puls: 140, atemfrequenz: 30, spo2: 96, temperatur: 39.4, bewusstsein: 'reagiert auf Ansprache', haut: 'heiß' }),
    checkliste: liste('fieberkrampf', [
      ['Kind vor Verletzungen geschützt (weiche Unterlage, Gegenstände weg)', 'Maßnahmen', 3, true],
      ['Kind NICHT festgehalten, nichts in den Mund', 'Maßnahmen', 2, true],
      ['Dauer des Krampfes beobachtet (Uhrzeit)', 'Maßnahmen', 2],
      ['Mutter beruhigt und eingebunden', 'Betreuung', 2],
      ['Notruf 112 (erster Krampf, Dauer über 5 Minuten oder Unsicherheit)', 'Notruf', 3, true],
      ['Nach dem Krampf: Atmung geprüft, stabile Seitenlage', 'Maßnahmen', 3, true],
      ['Warme Kleidung gelockert, NICHT kalt abgeduscht', 'Maßnahmen'],
      ['Übergabe an den Rettungsdienst (Dauer, Fieber, Vorerkrankungen)', 'Übergabe'],
    ]),
  },
  {
    id: 'pseudokrupp',
    thema: 'alltag',
    schwierigkeit: 'mittel',
    titel: 'Pseudokrupp in der Nacht',
    kurz: 'Bellender Husten und pfeifende Einatmung beim Kind.',
    lage:
      'Im Zeltlager werdet ihr nachts geweckt: Ein 4-jähriges Kind hustet bellend „wie ein Seehund“, atmet pfeifend ein und weint. Die Betreuerin ist unsicher.',
    mimeAnleitung:
      'Du bist ein Kind (Puppe oder kleine Mimin), hast Angst, hustest bellend und atmest pfeifend ein. Wirst du aufrecht auf den Arm genommen und ans offene Fenster/an die kühle Nachtluft gebracht, wird es langsam besser.',
    requisiten: 'Puppe oder kleine Mimin, Decke, Taschenlampe, Notfall-Zäpfchen der Eltern (Attrappe).',
    vitalStart: werte({ puls: 150, atemfrequenz: 40, spo2: 93, temperatur: 38.2, bewusstsein: 'wach', haut: 'blass, ängstlich' }),
    vitalNachBehandlung: werte({ puls: 125, atemfrequenz: 30, spo2: 96, haut: 'rosig' }),
    checkliste: liste('krupp', [
      ...START,
      ['Kind beruhigt, aufrecht gehalten (auf den Arm genommen)', 'Maßnahmen', 3, true],
      ['Kühle, frische Luft (Fenster öffnen, ins Freie)', 'Maßnahmen', 2, true],
      ['Nach Vorerkrankung und Notfallmedikament gefragt (Eltern anrufen)', 'Erstkontakt', 2],
      ['Notruf 112 bei starker Atemnot, blauen Lippen oder Erschöpfung', 'Notruf', 3, true],
      ['Kind nicht allein gelassen, Atmung beobachtet', 'Betreuung', 2],
      ['Eltern informiert', 'Betreuung'],
    ]),
  },
  {
    id: 'putzmittel',
    thema: 'alltag',
    schwierigkeit: 'mittel',
    titel: 'Kind trinkt Reiniger',
    kurz: 'Die blaue Flasche sah aus wie Saft.',
    lage:
      'In der Vereinsküche findet ihr ein dreijähriges Kind mit einer offenen Flasche WC-Reiniger. Es weint und hält sich den Mund. Die Eltern sind nicht in Sichtweite.',
    mimeAnleitung:
      'Du bist ein Kleinkind (Puppe oder kleine Mimin), weinst, dir brennt der Mund, du speichelst. Du hast nur einen kleinen Schluck getrunken. Wenn man dich zum Erbrechen bringen will, schreit die Spielleitung „Stopp!“.',
    requisiten: 'Leere, gut gespülte Reinigerflasche, Becher Wasser, Handy (für den Giftnotruf).',
    vitalStart: werte({ puls: 140, atemfrequenz: 30, bewusstsein: 'wach', haut: 'Lippen gerötet, Speichelfluss' }),
    checkliste: liste('gift', [
      ['Flasche gesichert, kein weiteres Trinken möglich', 'Eigenschutz', 2],
      ['KEIN Erbrechen ausgelöst', 'Maßnahmen', 3, true],
      ['Mund ausgespült bzw. kleine Schlucke Wasser gegeben', 'Maßnahmen', 2],
      ['Giftnotruf angerufen (Nummer auf dem Handy nachgeschaut)', 'Notruf', 3, true],
      ['Notruf 112 bei Atemnot, Bewusstseinsstörung oder Unsicherheit', 'Notruf', 2, true],
      ['Verpackung für den Arzt aufbewahrt', 'Übergabe', 2],
      ['Eltern gesucht und informiert', 'Betreuung'],
      ['Kind beruhigt und beobachtet', 'Betreuung'],
    ]),
  },
  {
    id: 'knopfbatterie',
    thema: 'alltag',
    schwierigkeit: 'mittel',
    titel: 'Knopfbatterie verschluckt',
    kurz: 'Die Batterie aus der Lichterkette ist weg – das Kind hat sie verschluckt.',
    lage:
      'Beim Basteln merkt ein Betreuer, dass eine Knopfbatterie aus der Lichterkette fehlt. Ein Kleinkind sagt stolz: „Hab ich gegessen!“ Es wirkt noch völlig fit.',
    mimeAnleitung:
      'Du bist ein fröhliches Kleinkind, spielst weiter und hast keine Beschwerden. Hinweis an die Spielleitung: Es geht darum, ob die Helfer die Gefahr trotzdem ernst nehmen – Knopfbatterien können in wenigen Stunden schwere Verätzungen machen.',
    requisiten: 'Lichterkette, leere Knopfbatterie-Verpackung.',
    vitalStart: werte({ puls: 110, atemfrequenz: 24, bewusstsein: 'wach', haut: 'normal' }),
    checkliste: liste('batterie', [
      ['Gefahr erkannt, obwohl das Kind fit wirkt', 'Erstkontakt', 3, true],
      ['Sofort Notruf 112 bzw. schnellstmöglich in die Klinik', 'Notruf', 3, true],
      ['Kein Erbrechen ausgelöst', 'Maßnahmen', 2, true],
      ['Nichts zu essen gegeben', 'Maßnahmen'],
      ['Verpackung bzw. Batterietyp mitgegeben', 'Übergabe', 2],
      ['Uhrzeit des Verschluckens gemerkt', 'Übergabe'],
      ['Eltern informiert', 'Betreuung'],
    ]),
  },
  {
    id: 'erdnuss',
    thema: 'alltag',
    schwierigkeit: 'mittel',
    titel: 'Erdnuss-Allergie beim Kindergeburtstag',
    kurz: 'Im Kuchen waren doch Nüsse – das Kind bekommt keine Luft.',
    lage:
      'Beim Kindergeburtstag im Vereinsheim hat ein 8-jähriges Kind vom Kuchen gegessen. Jetzt hat es Quaddeln im Gesicht, hustet und sagt: „Ich krieg keine Luft!“ In seinem Rucksack ist ein Notfallset.',
    mimeAnleitung:
      'Du kratzt dich, hustest und atmest schnell. Du hast Angst. Du weißt, dass du allergisch bist, und zeigst auf deinen Rucksack. Nach Anwendung des Auto-Injektors (Trainer, in den Oberschenkel) wird es nach einigen Minuten besser.',
    requisiten: 'Trainings-Auto-Injektor, Notfallpass, Rucksack, Kuchen, rote Flecken schminken.',
    vitalStart: werte({ puls: 145, atemfrequenz: 34, rrSys: 90, rrDia: 50, spo2: 91, bewusstsein: 'wach', haut: 'Quaddeln, Gesicht geschwollen' }),
    vitalNachBehandlung: werte({ puls: 120, atemfrequenz: 26, rrSys: 100, rrDia: 60, spo2: 95, haut: 'Quaddeln gehen zurück' }),
    checkliste: liste('erdnuss', [
      ...START,
      ['Allergie erkannt, nach Notfallset gefragt', 'Erstkontakt', 2, true],
      ['Auto-Injektor in den äußeren Oberschenkel angewendet (bzw. unterstützt)', 'Maßnahmen', 3, true],
      ['Notruf 112 „anaphylaktischer Schock“', 'Notruf', 3, true],
      ['Lagerung: bei Atemnot sitzend, bei Kreislaufproblemen flach', 'Maßnahmen', 2],
      ['Uhrzeit der Anwendung notiert (2. Dosis nach Notfallplan möglich)', 'Übergabe', 2],
      ['Eltern informiert', 'Betreuung'],
      ...ENDE,
    ]),
  },
  {
    id: 'hundebiss',
    thema: 'alltag',
    schwierigkeit: 'leicht',
    titel: 'Hundebiss beim Joggen',
    kurz: 'Ein nicht angeleinter Hund hat zugebissen.',
    lage:
      'Am Seeufer kommt eine Joggerin humpelnd auf euch zu. Ein nicht angeleinter Hund hat sie in die Wade gebissen. Der Hundebesitzer steht mit dem Hund in einiger Entfernung.',
    mimeAnleitung:
      'Du bist aufgewühlt und wütend auf den Hundebesitzer. Die Wade blutet mäßig, es sind mehrere Bissspuren zu sehen. Du hast keine Ahnung, ob der Hund geimpft ist.',
    requisiten: 'Bissspuren und etwas Kunstblut an der Wade, Verbandmaterial.',
    vitalStart: werte({ puls: 110, atemfrequenz: 20, rrSys: 135, rrDia: 85, bewusstsein: 'wach', haut: 'Bisswunde an der Wade' }),
    checkliste: liste('biss', [
      ['Eigenschutz: Hund ist angeleint bzw. weit genug weg', 'Eigenschutz', 2, true],
      ['Person angesprochen und sich vorgestellt', 'Erstkontakt'],
      ['Blutung gestillt, Wunde keimfrei verbunden', 'Maßnahmen', 3, true],
      ['Daten des Hundehalters notiert (Impfstatus des Hundes)', 'Übergabe', 2],
      ['Nach eigenem Tetanus-Impfschutz gefragt', 'Erstkontakt'],
      ['Arztbesuch veranlasst (Bisswunden entzünden sich leicht)', 'Notruf', 3, true],
      ['Betroffene Person betreut, beruhigt und nicht allein gelassen', 'Betreuung'],
    ]),
  },
  {
    id: 'fahrrad-kopf',
    thema: 'alltag',
    schwierigkeit: 'leicht',
    titel: 'Fahrradsturz ohne Helm',
    kurz: 'Platzwunde am Kopf – und er fragt immer wieder dasselbe.',
    lage:
      'Ein Jugendlicher ist auf dem Weg zum Training mit dem Fahrrad gestürzt – ohne Helm. Er sitzt am Straßenrand, hat eine blutende Platzwunde am Hinterkopf.',
    mimeAnleitung:
      'Du bist etwas benommen und fragst alle 1–2 Minuten: „Was ist passiert?“ Du erinnerst dich nicht an den Sturz. Dir ist leicht übel. Der Nacken tut nicht weh.',
    requisiten: 'Fahrrad, Kunstblut am Hinterkopf, Verbandmaterial.',
    vitalStart: werte({ puls: 95, bewusstsein: 'verwirrt', haut: 'blass, Platzwunde am Hinterkopf' }),
    checkliste: liste('radkopf', [
      ['Eigenschutz: aus dem Straßenverkehr gebracht bzw. abgesichert', 'Eigenschutz', 2, true],
      ['Person angesprochen und sich vorgestellt', 'Erstkontakt'],
      ['Nach Nackenschmerzen gefragt', 'Erstkontakt', 2],
      ['Wunde mit Kompresse und Druck versorgt', 'Maßnahmen', 2],
      ['Warnzeichen erkannt: Erinnerungslücke, Übelkeit (Gehirnerschütterung)', 'Maßnahmen', 3, true],
      ['Notruf 112 bzw. ärztliche Abklärung veranlasst', 'Notruf', 2, true],
      ['Bewusstsein wiederholt kontrolliert', 'Betreuung', 2],
      ['Eltern informiert', 'Betreuung'],
    ]),
  },
  {
    id: 'panikattacke',
    thema: 'alltag',
    schwierigkeit: 'leicht',
    titel: 'Panikattacke vor der Prüfung',
    kurz: 'Herzrasen und Todesangst kurz vor der Rettungsschwimmer-Prüfung.',
    lage:
      'Kurz vor der Rettungsschwimmer-Prüfung sitzt ein Prüfling zitternd in der Umkleide. Er sagt, sein Herz rase, er habe Angst zu sterben und bekomme keine Luft.',
    mimeAnleitung:
      'Du hast Herzrasen, zitterst, atmest schnell und hast große Angst. Keine Brustschmerzen, keine Vorerkrankungen. Wirst du ruhig und bestimmt angesprochen und atmest gemeinsam langsam, wird es nach einigen Minuten besser.',
    requisiten: 'Keine besonderen.',
    vitalStart: werte({ puls: 125, atemfrequenz: 28, rrSys: 145, rrDia: 90, spo2: 99, bewusstsein: 'wach', haut: 'schwitzig, zittrig' }),
    vitalNachBehandlung: werte({ puls: 90, atemfrequenz: 16, rrSys: 130, rrDia: 80, haut: 'normal' }),
    checkliste: liste('panik', [
      ...START,
      ['An einen ruhigen Ort gebracht, Zuschauer weggeschickt', 'Maßnahmen', 2],
      ['Ruhig und bestimmt gesprochen, Sicherheit vermittelt', 'Betreuung', 3, true],
      ['Zum langsamen Atmen angeleitet', 'Maßnahmen', 2, true],
      ['Nach Brustschmerz, Vorerkrankungen und Medikamenten gefragt', 'Erstkontakt', 2, true],
      ['Notruf 112 bei Brustschmerz, Bewusstseinsstörung oder Unsicherheit', 'Notruf'],
      ['Nicht allein gelassen', 'Betreuung'],
    ]),
  },
  {
    id: 'schulter',
    thema: 'alltag',
    schwierigkeit: 'leicht',
    titel: 'Schulter ausgekugelt beim Volleyball',
    kurz: 'Nach einem Sturz hängt der Arm seltsam herunter.',
    lage:
      'Beim Beachvolleyball ist eine Spielerin nach einem Hechtsprung auf den ausgestreckten Arm gefallen. Sie hält ihren rechten Arm fest an den Körper gedrückt, die Schulter sieht eckig aus.',
    mimeAnleitung:
      'Du hast starke Schmerzen, hältst den Arm mit der anderen Hand und lässt niemanden daran ziehen. Ein Mitspieler (zweite Mime) will die Schulter „wieder reinmachen“, weil er das mal gesehen hat.',
    requisiten: 'Volleyball, Polster/Kissen, Dreiecktuch, Kühlpack.',
    vitalStart: werte({ puls: 110, atemfrequenz: 20, bewusstsein: 'wach', haut: 'blass, Schulter eckig' }),
    checkliste: liste('schulter', [
      ...START,
      ['Keinen Einrenkversuch zugelassen', 'Maßnahmen', 3, true],
      ['Arm in Schonhaltung abgepolstert und gestützt', 'Maßnahmen', 3, true],
      ['Gekühlt (nicht direkt Eis auf die Haut)', 'Maßnahmen'],
      ['Durchblutung, Gefühl und Beweglichkeit der Finger geprüft', 'Maßnahmen', 2],
      ['Rettungsdienst bzw. Transport ins Krankenhaus veranlasst', 'Notruf', 2, true],
      ...ENDE,
    ]),
  },
];
