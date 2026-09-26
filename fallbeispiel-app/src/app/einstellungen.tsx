import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Absatz, Karte, Knopf, Ueberschrift, Umschalter } from '../components/ui';
import { bestaetigen } from '../lib/bestaetigen';
import { useEinstellungen, type Design } from '../lib/einstellungen';
import { useStore } from '../lib/store';
import { spieleTon } from '../lib/ton';
import { abstand, macheStile, useFarben } from '../theme';

const DESIGNS: { wert: Design; text: string }[] = [
  { wert: 'system', text: '📱 Wie Handy' },
  { wert: 'hell', text: '☀️ Hell' },
  { wert: 'dunkel', text: '🌙 Dunkel' },
];

const ZEITLIMITS = [0, 5, 10, 15, 20];

export default function EinstellungenSeite() {
  const styles = useStyles();
  const { einstellungen: e, setze } = useEinstellungen();
  const { durchgaenge, personen, faelle, loescheDaten } = useStore();
  const insets = useSafeAreaInsets();
  const eigeneFaelle = faelle.filter((f) => f.eigenes).length;

  return (
    <ScrollView contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }}>
      <Stack.Screen options={{ title: 'Einstellungen' }} />

      <Karte>
        <Ueberschrift>Darstellung</Ueberschrift>
        <View style={styles.chips}>
          {DESIGNS.map((d) => (
            <Chip key={d.wert} text={d.text} an={e.design === d.wert} onPress={() => setze({ design: d.wert })} />
          ))}
        </View>
        <Absatz leise>„Wie Handy“ folgt automatisch dem Hell- oder Dunkelmodus deines Handys.</Absatz>
      </Karte>

      <Karte>
        <Ueberschrift>Töne</Ueberschrift>
        <Schalter titel="Töne an" text="Hauptschalter für alle Töne." wert={e.toene} onChange={(v) => setze({ toene: v })} />
        <Schalter
          titel="Herzschlag-Piepton"
          text="Der Monitor piept im Takt des Pulses – wie im Rettungswagen."
          wert={e.herzton}
          aus={!e.toene}
          onChange={(v) => setze({ herzton: v })}
          test={() => spieleTon('piep')}
        />
        <Schalter
          titel="Alarm bei auffälligen Werten"
          text="Ertönt, wenn ein Vitalwert aus dem Normalbereich rutscht."
          wert={e.alarm}
          aus={!e.toene}
          onChange={(v) => setze({ alarm: v })}
          test={() => spieleTon('alarm')}
        />
        <Schalter
          titel="Ton beim Abhaken"
          text="Kurzer Klick, wenn ein Punkt in der Checkliste abgehakt wird."
          wert={e.klickton}
          aus={!e.toene}
          onChange={(v) => setze({ klickton: v })}
          test={() => spieleTon('klick')}
        />
        {Platform.OS !== 'web' && (
          <Schalter titel="Vibration beim Abhaken" wert={e.vibration} onChange={(v) => setze({ vibration: v })} />
        )}
      </Karte>

      <Karte>
        <Ueberschrift>Übung</Ueberschrift>
        <Schalter
          titel="Messen-Modus automatisch an"
          text="Vitalwerte sind zu Beginn jeder Übung verdeckt."
          wert={e.messenModus}
          onChange={(v) => setze({ messenModus: v })}
        />
        <Schalter
          titel="„So geht's“-Hinweis auf der Startseite"
          text="Kurze Schritt-für-Schritt-Hilfe für neue Nutzer:innen."
          wert={e.startHinweis}
          onChange={(v) => setze({ startHinweis: v })}
        />
        <Schalter
          titel="Werte im Einsatz ändern"
          text="Aus: Die Vitalwerte bleiben fest und werden nur angesagt. An: Die Spielleitung kann sie mit + / – und „Nach Behandlung“ verändern."
          wert={e.werteAendern}
          onChange={(v) => setze({ werteAendern: v })}
        />
        <Text style={styles.label}>Zeitlimit mit Signalton</Text>
        <View style={styles.chips}>
          {ZEITLIMITS.map((m) => (
            <Chip key={m} text={m === 0 ? 'Aus' : `${m} Min.`} an={e.zeitlimit === m} onPress={() => setze({ zeitlimit: m })} />
          ))}
        </View>
      </Karte>

      <Karte>
        <Ueberschrift>Daten</Ueberschrift>
        <Absatz leise>
          Alles wird nur auf diesem Gerät gespeichert: {durchgaenge.length} Einsätze, {personen.length} Personen, {eigeneFaelle} eigene
          Fälle.
        </Absatz>
        <View style={{ gap: abstand.s, marginTop: abstand.m }}>
          <Knopf
            titel="Alle Einsätze löschen"
            art="sekundaer"
            deaktiviert={durchgaenge.length === 0}
            onPress={() =>
              bestaetigen('Alle Einsätze löschen?', 'Alle Durchgänge und Bewertungen werden gelöscht. Personen und Fälle bleiben.', 'Löschen', () =>
                loescheDaten({ einsaetze: true }),
              )
            }
          />
          <Knopf
            titel="Alles zurücksetzen"
            art="gefahr"
            onPress={() =>
              bestaetigen(
                'Alles zurücksetzen?',
                'Einsätze, Personen und eigene Fälle werden endgültig gelöscht.',
                'Alles löschen',
                () => {
                  loescheDaten({ einsaetze: true, personen: true, faelle: true });
                },
              )
            }
          />
        </View>
      </Karte>

      <Text style={styles.version}>DLRG Fallbeispiel-Trainer · Version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
    </ScrollView>
  );
}

function Schalter({
  titel,
  text,
  wert,
  onChange,
  aus,
  test,
}: {
  titel: string;
  text?: string;
  wert: boolean;
  onChange: (v: boolean) => void;
  aus?: boolean;
  test?: () => void;
}) {
  const styles = useStyles();
  const farben = useFarben();
  return (
    <View style={[styles.zeile, aus && { opacity: 0.45 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.titel}>{titel}</Text>
        {text ? <Text style={styles.text}>{text}</Text> : null}
        {test && !aus && (
          <Pressable onPress={test} hitSlop={6}>
            <Text style={styles.test}>▶ Anhören</Text>
          </Pressable>
        )}
      </View>
      <Umschalter value={wert} onValueChange={onChange} disabled={aus} />
    </View>
  );
}

function Chip({ text, an, onPress }: { text: string; an: boolean; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable onPress={onPress} accessibilityState={{ selected: an }} style={[styles.chip, an && styles.chipAn]}>
      <Text style={[styles.chipText, an && { color: '#fff' }]}>{text}</Text>
    </Pressable>
  );
}

const useStyles = macheStile((farben) => ({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: abstand.s },
  chip: { borderWidth: 2, borderColor: farben.rand, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: farben.eingabe },
  chipAn: { backgroundColor: farben.rot, borderColor: farben.rot },
  chipText: { fontSize: 14, fontWeight: '700', color: farben.text },
  zeile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: abstand.m,
    paddingVertical: abstand.s,
    borderBottomWidth: 1,
    borderBottomColor: farben.rand,
  },
  titel: { fontSize: 16, fontWeight: '700', color: farben.text },
  text: { fontSize: 13, color: farben.textLeise, marginTop: 2 },
  test: { fontSize: 13, color: farben.rot, fontWeight: '800', marginTop: 4 },
  label: { fontSize: 13, fontWeight: '700', color: farben.textLeise, marginTop: abstand.m, marginBottom: 6, textTransform: 'uppercase' },
  version: { textAlign: 'center', color: farben.textLeise, fontSize: 12 },
}));
