import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Absatz, Badge, Karte, Knopf, Ueberschrift } from '../../components/ui';
import { dauer, gesamt, note } from '../../lib/score';
import { useStore } from '../../lib/store';
import type { Durchgang } from '../../lib/types';
import { abstand, macheStile, useFarben, type Farben } from '../../theme';

function balkenFarbe(anteil: number, farben: Farben) {
  if (anteil >= 0.75) return farben.gruen;
  if (anteil >= 0.5) return farben.orange;
  return farben.fehler;
}

/** Frühester Zeitpunkt, zu dem ein Punkt live abgehakt wurde */
function zeitpunkt(d: Durchgang, itemId: string): number | undefined {
  const zeiten = d.bewertungen.map((b) => b.zeiten?.[itemId]).filter((z): z is number => z !== undefined);
  return zeiten.length ? Math.min(...zeiten) : undefined;
}

function alsText(d: Durchgang): string {
  const g = gesamt(d);
  const zeilen = [
    `🛟 Fallbeispiel: ${d.fallTitel}`,
    `👥 Team: ${d.team}`,
    `⏱ Dauer: ${d.ende ? dauer(d.ende - d.start) : '–'}`,
    `⭐ Ergebnis: ${g.durchschnittProzent}% (${g.durchschnittPunkte}/${g.maxPunkte} Punkte, ${g.anzahl} Bewertungen)`,
    '',
    ...d.checkliste.map((c) => {
      const z = zeitpunkt(d, c.id);
      return `${g.proPunkt[c.id] >= 0.5 ? '✅' : '❌'} ${c.text} (${Math.round(g.proPunkt[c.id] * 100)}%${z !== undefined ? `, nach ${dauer(z)}` : ''})`;
    }),
  ];
  const notizen = d.bewertungen.filter((b) => b.notiz);
  if (notizen.length) zeilen.push('', '💬 Feedback:', ...notizen.map((b) => `– ${b.name}: ${b.notiz}`));
  return zeilen.join('\n');
}

export default function Ergebnis() {
  const styles = useStyles();
  const farben = useFarben();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { durchgang, person } = useStore();
  const d = durchgang(id);
  const insets = useSafeAreaInsets();

  if (!d) return <Absatz>Durchgang nicht gefunden.</Absatz>;

  const g = gesamt(d);
  const n = note(g.durchschnittProzent);
  const kritischVergessen = d.checkliste.filter((c) => c.kritisch && g.proPunkt[c.id] < 0.5);
  const notizen = d.bewertungen.filter((b) => b.notiz);

  return (
    <ScrollView contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }}>
      <Stack.Screen options={{ title: 'Ergebnis' }} />

      <View style={[styles.kopf, { backgroundColor: n.farbe }]}>
        <Text style={styles.prozent}>{g.durchschnittProzent}%</Text>
        <Text style={styles.note}>{n.text}</Text>
        <Text style={styles.info}>
          {d.team} · {g.durchschnittPunkte}/{g.maxPunkte} Punkte · {g.anzahl} Bewertung(en)
          {d.ende ? ` · ${dauer(d.ende - d.start)} min` : ''}
        </Text>
      </View>

      {(d.helferIds ?? []).some((pid) => person(pid)) && (
        <View style={styles.helfer}>
          {(d.helferIds ?? []).map((pid) => {
            const p = person(pid);
            return p ? (
              <Pressable key={pid} onPress={() => router.push(`/personen/${pid}`)} style={styles.helferChip}>
                <Text style={styles.helferText}>📁 Akte {p.name}</Text>
              </Pressable>
            ) : null;
          })}
        </View>
      )}

      {kritischVergessen.length > 0 && (
        <Karte stil={{ borderColor: farben.fehler, borderWidth: 2 }}>
          <Ueberschrift>⚠️ Wichtige Punkte vergessen</Ueberschrift>
          {kritischVergessen.map((c) => (
            <Absatz key={c.id}>• {c.text}</Absatz>
          ))}
        </Karte>
      )}

      <Karte>
        <Ueberschrift>Checkliste im Detail</Ueberschrift>
        <Absatz leise>Balken = Anteil der Zuschauer:innen, die den Punkt gesehen haben.</Absatz>
        {d.checkliste.map((c) => {
          const anteil = g.proPunkt[c.id];
          const z = zeitpunkt(d, c.id);
          return (
            <View key={c.id} style={styles.punkt}>
              <View style={styles.punktKopf}>
                <Text style={styles.punktText}>
                  {anteil >= 0.5 ? '✅' : '❌'} {c.text}
                </Text>
                {c.kritisch && <Badge text="WICHTIG" />}
              </View>
              <View style={styles.balkenHg}>
                <View style={[styles.balken, { width: `${Math.round(anteil * 100)}%`, backgroundColor: balkenFarbe(anteil, farben) }]} />
              </View>
              <Text style={styles.anteil}>
                {Math.round(anteil * 100)}%{z !== undefined ? `  ·  ⏱ nach ${dauer(z)}` : ''}
              </Text>
            </View>
          );
        })}
      </Karte>

      {notizen.length > 0 && (
        <Karte>
          <Ueberschrift>💬 Feedback</Ueberschrift>
          {notizen.map((b) => (
            <View key={b.id} style={{ marginBottom: abstand.s }}>
              <Text style={styles.feedbackName}>{b.name}</Text>
              <Absatz>{b.notiz}</Absatz>
            </View>
          ))}
        </Karte>
      )}

      <Knopf titel="Ergebnis teilen (z.B. WhatsApp)" art="gelb" onPress={() => Share.share({ message: alsText(d) }).catch(() => {})} />
    </ScrollView>
  );
}

const useStyles = macheStile((farben) => ({
  kopf: { borderRadius: 18, padding: abstand.xl, alignItems: 'center', marginBottom: abstand.m },
  prozent: { color: '#fff', fontSize: 64, fontWeight: '900' },
  note: { color: '#fff', fontSize: 22, fontWeight: '800' },
  info: { color: '#fff', fontSize: 14, marginTop: 6, textAlign: 'center', opacity: 0.9 },
  punkt: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: farben.rand },
  punktKopf: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  punktText: { flex: 1, fontSize: 15, lineHeight: 21, color: farben.text },
  balkenHg: { height: 8, backgroundColor: farben.balkenHg, borderRadius: 4, marginTop: 6, overflow: 'hidden' },
  balken: { height: 8, borderRadius: 4 },
  anteil: { fontSize: 12, color: farben.textLeise, marginTop: 2 },
  feedbackName: { fontWeight: '800', color: farben.text },
  helfer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: abstand.m },
  helferChip: { backgroundColor: farben.karte, borderColor: farben.rot, borderWidth: 2, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 6 },
  helferText: { color: farben.rot, fontWeight: '800' },
}));
