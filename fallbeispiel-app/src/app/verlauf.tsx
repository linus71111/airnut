import { router, Stack } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { dauer, gesamt, note } from '../lib/score';
import { useStore } from '../lib/store';
import { abstand, farben } from '../theme';

export default function Verlauf() {
  const { durchgaenge } = useStore();
  const insets = useSafeAreaInsets();

  return (
    <FlatList
      data={durchgaenge}
      keyExtractor={(d) => d.id}
      contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }}
      ListHeaderComponent={<Stack.Screen options={{ title: 'Verlauf' }} />}
      ListEmptyComponent={<Text style={styles.leer}>Noch keine Durchgänge. Starte ein Fallbeispiel!</Text>}
      renderItem={({ item: d }) => {
        const g = gesamt(d);
        const n = note(g.durchschnittProzent);
        const fertig = d.ende && g.anzahl > 0;
        return (
          <Pressable
            style={({ pressed }) => [styles.eintrag, pressed && { opacity: 0.7 }]}
            onPress={() => router.push(fertig ? `/ergebnis/${d.id}` : `/durchgang/${d.id}`)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.titel}>{d.fallTitel}</Text>
              <Text style={styles.meta}>
                {d.team} · {new Date(d.start).toLocaleDateString('de-DE')} {new Date(d.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                {d.ende ? ` · ${dauer(d.ende - d.start)} min` : ' · läuft noch'}
              </Text>
            </View>
            <View style={[styles.wert, { backgroundColor: fertig ? n.farbe : '#9AA0A6' }]}>
              <Text style={styles.wertText}>{fertig ? `${g.durchschnittProzent}%` : '…'}</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  leer: { textAlign: 'center', color: farben.textLeise, marginTop: 40, fontSize: 16 },
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
  meta: { fontSize: 13, color: farben.textLeise, marginTop: 2 },
  wert: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, minWidth: 60, alignItems: 'center' },
  wertText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
