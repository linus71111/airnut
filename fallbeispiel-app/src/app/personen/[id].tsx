import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Absatz, Eingabe, Karte, Knopf, SchwierigkeitBadge, Ueberschrift } from '../../components/ui';
import { bestaetigen } from '../../lib/bestaetigen';
import { SCHWIERIGKEIT_INFO, SCHWIERIGKEITEN } from '../../lib/schwierigkeit';
import { akte, note } from '../../lib/score';
import { useStore } from '../../lib/store';
import { abstand, farben } from '../../theme';

export default function PersonAkte() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { person, durchgaenge, speicherePerson, loeschePerson } = useStore();
  const p = person(id);
  const insets = useSafeAreaInsets();

  if (!p) return <Absatz>Person nicht gefunden.</Absatz>;

  const a = akte(p.id, durchgaenge);

  return (
    <ScrollView contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: 'Akte' }} />

      <View style={styles.kopf}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{p.name.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.seit}>Dabei seit {new Date(p.erstellt).toLocaleDateString('de-DE')}</Text>
        </View>
      </View>

      <View style={styles.zahlen}>
        <Zahl wert={String(a.eintraege.length)} label="Einsätze" />
        <Zahl wert={a.durchschnitt === null ? '–' : `${a.durchschnitt}%`} label="Durchschnitt" farbe={a.durchschnitt === null ? undefined : note(a.durchschnitt).farbe} />
        <Zahl wert={a.bestes === null ? '–' : `${a.bestes}%`} label="Bestes" />
      </View>

      <Karte>
        <Eingabe
          label="Notiz (z.B. Ausbildungsstand)"
          value={p.notiz}
          onChangeText={(t) => speicherePerson({ ...p, notiz: t })}
          placeholder="z.B. Juniorretter, EH-Kurs 2025"
        />
      </Karte>

      {Object.keys(a.proSchwierigkeit).length > 0 && (
        <Karte>
          <Ueberschrift>Nach Schwierigkeit</Ueberschrift>
          {SCHWIERIGKEITEN.filter((s) => a.proSchwierigkeit[s] !== undefined).map((s) => {
            const wert = a.proSchwierigkeit[s]!;
            return (
              <View key={s} style={{ marginBottom: abstand.s }}>
                <View style={styles.zeile}>
                  <Text style={styles.stufe}>{SCHWIERIGKEIT_INFO[s].label}</Text>
                  <Text style={styles.stufeWert}>Ø {wert}%</Text>
                </View>
                <View style={styles.balkenHg}>
                  <View style={[styles.balken, { width: `${wert}%`, backgroundColor: SCHWIERIGKEIT_INFO[s].farbe }]} />
                </View>
              </View>
            );
          })}
        </Karte>
      )}

      {a.staerken.length > 0 && (
        <Karte>
          <Ueberschrift>💪 Klappt schon gut</Ueberschrift>
          {a.staerken.map((s) => (
            <Absatz key={s.text}>
              • {s.text} <Text style={styles.anzahl}>({s.anzahl}×)</Text>
            </Absatz>
          ))}
        </Karte>
      )}

      {a.oftVergessen.length > 0 && (
        <Karte stil={{ borderColor: '#D18B00', borderWidth: 2 }}>
          <Ueberschrift>🎯 Daran noch arbeiten</Ueberschrift>
          {a.oftVergessen.map((s) => (
            <Absatz key={s.text}>
              • {s.text} <Text style={styles.anzahl}>({s.anzahl}× vergessen)</Text>
            </Absatz>
          ))}
        </Karte>
      )}

      <Karte>
        <Ueberschrift>Einsätze</Ueberschrift>
        {a.eintraege.length === 0 && <Absatz leise>Noch keine Einsätze. Wähle die Person beim Start eines Fallbeispiels aus.</Absatz>}
        {a.eintraege.map(({ durchgang: d, prozent }) => {
          const bewertet = d.bewertungen.length > 0;
          return (
            <Pressable
              key={d.id}
              style={({ pressed }) => [styles.einsatz, pressed && { opacity: 0.6 }]}
              onPress={() => router.push(bewertet && d.ende ? `/ergebnis/${d.id}` : `/durchgang/${d.id}`)}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.einsatzTitel}>{d.fallTitel}</Text>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <SchwierigkeitBadge stufe={d.schwierigkeit} />
                  <Text style={styles.datum}>
                    {new Date(d.start).toLocaleDateString('de-DE')} · mit {d.team}
                  </Text>
                </View>
              </View>
              <Text style={[styles.prozent, { color: bewertet ? note(prozent).farbe : farben.textLeise }]}>
                {bewertet ? `${prozent}%` : '–'}
              </Text>
            </Pressable>
          );
        })}
      </Karte>

      <Knopf
        titel="Person löschen"
        art="gefahr"
        onPress={() =>
          bestaetigen('Person löschen?', `Die Akte von ${p.name} wird gelöscht. Die Einsätze bleiben im Verlauf erhalten.`, 'Löschen', () => {
            loeschePerson(p.id);
            router.back();
          })
        }
      />
    </ScrollView>
  );
}

function Zahl({ wert, label, farbe }: { wert: string; label: string; farbe?: string }) {
  return (
    <View style={styles.zahl}>
      <Text style={[styles.zahlWert, farbe ? { color: farbe } : null]}>{wert}</Text>
      <Text style={styles.zahlLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kopf: { flexDirection: 'row', alignItems: 'center', gap: abstand.m, marginBottom: abstand.m },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: farben.gelb, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 26, fontWeight: '900', color: farben.rot },
  name: { fontSize: 24, fontWeight: '900', color: farben.text },
  seit: { fontSize: 13, color: farben.textLeise },
  zahlen: { flexDirection: 'row', gap: abstand.s, marginBottom: abstand.m },
  zahl: { flex: 1, backgroundColor: farben.karte, borderRadius: 14, paddingVertical: abstand.m, alignItems: 'center' },
  zahlWert: { fontSize: 24, fontWeight: '900', color: farben.text, fontVariant: ['tabular-nums'] },
  zahlLabel: { fontSize: 12, color: farben.textLeise, fontWeight: '700' },
  zeile: { flexDirection: 'row', justifyContent: 'space-between' },
  stufe: { fontSize: 15, fontWeight: '700', color: farben.text },
  stufeWert: { fontSize: 15, color: farben.textLeise, fontVariant: ['tabular-nums'] },
  balkenHg: { height: 8, backgroundColor: '#E8EAED', borderRadius: 4, marginTop: 4, overflow: 'hidden' },
  balken: { height: 8, borderRadius: 4 },
  anzahl: { color: farben.textLeise, fontSize: 13 },
  einsatz: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: abstand.m,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: farben.rand,
  },
  einsatzTitel: { fontSize: 15, fontWeight: '700', color: farben.text },
  datum: { fontSize: 12, color: farben.textLeise, flexShrink: 1 },
  prozent: { fontSize: 18, fontWeight: '900', fontVariant: ['tabular-nums'] },
});
