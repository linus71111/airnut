import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SchwierigkeitBadge } from '../components/ui';
import { SCHWIERIGKEIT_INFO, SCHWIERIGKEITEN } from '../lib/schwierigkeit';
import { dauer, gesamt, note } from '../lib/score';
import { useStore } from '../lib/store';
import type { Schwierigkeit } from '../lib/types';
import { abstand, macheStile, useFarben } from '../theme';

export default function Verlauf() {
  const styles = useStyles();
  const farben = useFarben();
  const { durchgaenge, personen } = useStore();
  const insets = useSafeAreaInsets();
  const [stufe, setStufe] = useState<Schwierigkeit | null>(null);
  const [personId, setPersonId] = useState<string | null>(null);

  const liste = durchgaenge
    .filter((d) => (!stufe || d.schwierigkeit === stufe) && (!personId || d.helferIds?.includes(personId)))
    .sort((a, b) => b.start - a.start);
  const bewertet = liste.filter((d) => d.ende && d.bewertungen.length > 0);
  const schnitt = bewertet.length ? Math.round(bewertet.reduce((s, d) => s + gesamt(d).durchschnittProzent, 0) / bewertet.length) : null;

  return (
    <FlatList
      data={liste}
      keyExtractor={(d) => d.id}
      contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }}
      ListHeaderComponent={
        <View>
          <Stack.Screen options={{ title: 'Einsatz-Historie' }} />

          <View style={styles.zahlen}>
            <View style={styles.zahl}>
              <Text style={styles.zahlWert}>{liste.length}</Text>
              <Text style={styles.zahlLabel}>Einsätze</Text>
            </View>
            <View style={styles.zahl}>
              <Text style={[styles.zahlWert, schnitt !== null && { color: note(schnitt).farbe }]}>{schnitt === null ? '–' : `${schnitt}%`}</Text>
              <Text style={styles.zahlLabel}>Durchschnitt</Text>
            </View>
          </View>

          <View style={styles.filter}>
            <Chip text="Alle Stufen" an={!stufe} onPress={() => setStufe(null)} />
            {SCHWIERIGKEITEN.map((s) => (
              <Chip
                key={s}
                text={SCHWIERIGKEIT_INFO[s].label}
                farbe={SCHWIERIGKEIT_INFO[s].farbe}
                an={stufe === s}
                onPress={() => setStufe(stufe === s ? null : s)}
              />
            ))}
          </View>
          {personen.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filter}>
              <Chip text="Alle Personen" an={!personId} onPress={() => setPersonId(null)} />
              {personen.map((p) => (
                <Chip key={p.id} text={p.name} an={personId === p.id} onPress={() => setPersonId(personId === p.id ? null : p.id)} />
              ))}
            </ScrollView>
          )}
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.leer}>{durchgaenge.length ? 'Keine Einsätze für diesen Filter.' : 'Noch keine Einsätze. Starte ein Fallbeispiel!'}</Text>
      }
      renderItem={({ item: d }) => {
        const g = gesamt(d);
        const n = note(g.durchschnittProzent);
        const fertig = d.ende && g.anzahl > 0;
        return (
          <Pressable
            style={({ pressed }) => [styles.eintrag, pressed && { opacity: 0.7 }]}
            onPress={() => router.push(fertig ? `/ergebnis/${d.id}` : `/durchgang/${d.id}`)}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.titel}>{d.fallTitel}</Text>
              <SchwierigkeitBadge stufe={d.schwierigkeit} />
              <Text style={styles.meta}>
                👥 {d.team}
                {'\n'}
                {new Date(d.start).toLocaleDateString('de-DE')}{' '}
                {new Date(d.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                {d.ende ? ` · ${dauer(d.ende - d.start)} min` : ' · läuft noch'}
              </Text>
            </View>
            <View style={[styles.wert, { backgroundColor: fertig ? n.farbe : farben.grau }]}>
              <Text style={styles.wertText}>{fertig ? `${g.durchschnittProzent}%` : '…'}</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

function Chip({ text, an, onPress, farbe: eigeneFarbe }: { text: string; an: boolean; onPress: () => void; farbe?: string }) {
  const styles = useStyles();
  const farben = useFarben();
  const farbe = eigeneFarbe ?? farben.neutral;
  return (
    <Pressable onPress={onPress} style={[styles.chip, { borderColor: farbe }, an && { backgroundColor: farbe }]}>
      <Text style={[styles.chipText, { color: an ? '#fff' : farbe }]}>{text}</Text>
    </Pressable>
  );
}

const useStyles = macheStile((farben) => ({
  leer: { textAlign: 'center', color: farben.textLeise, marginTop: 40, fontSize: 16 },
  zahlen: { flexDirection: 'row', gap: abstand.s, marginBottom: abstand.m },
  zahl: { flex: 1, backgroundColor: farben.karte, borderRadius: 14, paddingVertical: abstand.m, alignItems: 'center' },
  zahlWert: { fontSize: 26, fontWeight: '900', color: farben.text, fontVariant: ['tabular-nums'] },
  zahlLabel: { fontSize: 12, color: farben.textLeise, fontWeight: '700' },
  filter: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: abstand.m },
  chip: { borderWidth: 2, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 5 },
  chipText: { fontSize: 14, fontWeight: '800' },
  eintrag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: abstand.m,
    backgroundColor: farben.karte,
    borderRadius: 14,
    padding: abstand.l,
    marginBottom: abstand.m,
  },
  titel: { fontSize: 16, fontWeight: '800', color: farben.text },
  meta: { fontSize: 13, color: farben.textLeise, lineHeight: 19 },
  wert: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, minWidth: 60, alignItems: 'center' },
  wertText: { color: '#fff', fontWeight: '900', fontSize: 16 },
}));
