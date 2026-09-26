import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Absatz, Karte, Ueberschrift } from '../components/ui';
import { SCHWIERIGKEIT_INFO, SCHWIERIGKEITEN } from '../lib/schwierigkeit';
import { abstand, macheStile, useFarben } from '../theme';

const ROLLEN: [string, string][] = [
  ['Spielleitung', 'Hat das Handy mit der App, liest die Lage vor, sagt die Vitalwerte an und achtet auf die Sicherheit.'],
  ['Mime (Patient:in)', 'Spielt die verletzte oder kranke Person. Kennt die geheime Mimen-Anleitung und bleibt in der Rolle.'],
  ['Helfer:innen', 'Das Team, das übt (meist 2–3 Personen). Kennt den Fall vorher nicht.'],
  ['Zuschauer:innen', 'Beobachten genau und bewerten danach mit der Checkliste. Sie sagen während der Übung nichts.'],
];

const ABLAUF: [string, string][] = [
  ['Fall auswählen', 'Wähle einen Fall passend zum Können der Helfer:innen: leicht, mittel oder schwer.'],
  [
    'Vorbereiten (10–15 Min.)',
    'Mime liest die Anleitung, wird geschminkt und bekommt die Requisiten. Die Helfer:innen warten so lange außer Sicht- und Hörweite. Ihr braucht Handschuhe, Verbandmaterial, Rettungsdecke und, wenn nötig, eine Übungspuppe und einen Trainings-AED.',
  ],
  ['Zuschauer:innen einweisen', 'Zeig ihnen kurz die Checkliste, damit sie wissen, worauf sie achten sollen.'],
  [
    'Durchgang starten',
    'In der App die Helfer:innen auswählen und auf Start drücken. Dann die Lage laut vorlesen und die Helfer:innen losschicken.',
  ],
  [
    'Spielen',
    'Die Helfer:innen handeln wie im Ernstfall. Fragen sie nach einem Wert („Wie ist der Puls?“) oder messen ihn, zeigt oder sagt die Spielleitung den Wert aus der App. Im Messen-Modus tippt ihr die Kachel erst an, wenn wirklich gemessen wurde.',
  ],
  [
    'Werte ansagen',
    'Die Vitalwerte bleiben während der Übung fest. Die Spielleitung sagt sie an, sobald die Helfer:innen fragen oder messen. Wer die Werte während der Übung verändern möchte, schaltet das in den Einstellungen ein („Werte im Einsatz ändern“).',
  ],
  ['Übung beenden', 'Nach der Übergabe an den „Rettungsdienst“ oder nach etwa 10–15 Minuten auf „Übung beenden“ drücken.'],
  ['Bewerten', 'Jede:r Zuschauer:in füllt die Checkliste aus. Das Handy wird dazu weitergegeben.'],
  ['Nachbesprechen', 'Das Ergebnis gemeinsam anschauen und die Nachbesprechung machen (siehe unten).'],
];

const FEEDBACK = [
  'Zuerst erzählen die Helfer:innen selbst: Wie ging es euch? Was lief gut, was nicht?',
  'Dann berichtet die Mime, wie sie sich als Patient:in gefühlt hat.',
  'Danach geben die Zuschauer:innen Feedback: zuerst was gut war, dann was man besser machen kann.',
  'Sprecht über das Verhalten und nicht über die Person („Der Notruf kam spät“ statt „Du bist zu langsam“).',
  'Zum Schluss gibt es einen Tipp zum Mitnehmen für das nächste Mal.',
];

const SICHERHEIT = [
  'Stoppwort vereinbaren: Wer „ECHTER NOTFALL“ ruft, beendet sofort die Übung.',
  'Keine Herzdruckmassage und Beatmung an echten Menschen: dafür die Übungspuppe nehmen.',
  'Kein echtes Glas und keine spitzen Gegenstände als Requisiten verwenden.',
  'Mimen nicht grob anfassen. Bei Übungen am oder im Wasser muss immer eine Wasseraufsicht dabei sein.',
  'Wenn jemandem etwas zu nah geht (z.B. bei eigenen Erfahrungen), ist Aussteigen jederzeit okay.',
];

export default function Anleitung() {
  const styles = useStyles();
  const farben = useFarben();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }}>
      <Stack.Screen options={{ title: 'Anleitung' }} />

      <View style={styles.intro}>
        <Text style={styles.introTitel}>So läuft ein Fallbeispiel</Text>
        <Text style={styles.introText}>
          Bei einem Fallbeispiel wird ein Notfall so echt wie möglich nachgespielt. Die Helfer:innen üben die Erste Hilfe, die
          anderen schauen zu und lernen mit.
        </Text>
      </View>

      <Karte>
        <Ueberschrift>Wer macht was?</Ueberschrift>
        {ROLLEN.map(([rolle, text]) => (
          <View key={rolle} style={styles.rolle}>
            <Text style={styles.rolleName}>{rolle}</Text>
            <Absatz>{text}</Absatz>
          </View>
        ))}
      </Karte>

      <Karte>
        <Ueberschrift>Ablauf</Ueberschrift>
        {ABLAUF.map(([titel, text], i) => (
          <View key={titel} style={styles.schritt}>
            <View style={styles.nummer}>
              <Text style={styles.nummerText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.schrittTitel}>{titel}</Text>
              <Absatz>{text}</Absatz>
            </View>
          </View>
        ))}
      </Karte>

      <Karte>
        <Ueberschrift>Schwierigkeit</Ueberschrift>
        {SCHWIERIGKEITEN.map((s) => (
          <View key={s} style={styles.stufe}>
            <View style={[styles.punkt, { backgroundColor: SCHWIERIGKEIT_INFO[s].farbe }]} />
            <Text style={styles.stufeText}>
              <Text style={{ fontWeight: '800' }}>{SCHWIERIGKEIT_INFO[s].label}: </Text>
              {SCHWIERIGKEIT_INFO[s].text}
            </Text>
          </View>
        ))}
        <Absatz leise>Tipp: Neue Helfer:innen fangen mit „leicht“ an und steigern sich erst, wenn sie über 75% schaffen.</Absatz>
      </Karte>

      <Karte>
        <Ueberschrift>Nachbesprechung</Ueberschrift>
        {FEEDBACK.map((t) => (
          <Absatz key={t}>• {t}</Absatz>
        ))}
      </Karte>

      <Karte stil={{ borderColor: farben.rot, borderWidth: 2 }}>
        <Ueberschrift>Sicherheit geht vor</Ueberschrift>
        {SICHERHEIT.map((t) => (
          <Absatz key={t}>• {t}</Absatz>
        ))}
      </Karte>
    </ScrollView>
  );
}

const useStyles = macheStile((farben) => ({
  intro: { backgroundColor: farben.rot, borderRadius: 22, padding: abstand.l, marginBottom: abstand.m },
  introTitel: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  introText: { fontSize: 15, lineHeight: 21, color: 'rgba(255,255,255,0.92)', marginTop: 4 },
  rolle: { marginBottom: abstand.m },
  rolleName: { fontSize: 15, fontWeight: '800', color: farben.rot, marginBottom: 2 },
  schritt: { flexDirection: 'row', gap: abstand.m, marginBottom: abstand.m },
  nummer: { width: 28, height: 28, borderRadius: 14, backgroundColor: farben.rot, alignItems: 'center', justifyContent: 'center' },
  nummerText: { color: '#fff', fontWeight: '900' },
  schrittTitel: { fontSize: 16, fontWeight: '800', color: farben.text, marginBottom: 2 },
  stufe: { flexDirection: 'row', gap: abstand.s, alignItems: 'flex-start', marginBottom: abstand.s },
  punkt: { width: 12, height: 12, borderRadius: 6, marginTop: 5 },
  stufeText: { flex: 1, fontSize: 15, lineHeight: 22, color: farben.text },
}));
