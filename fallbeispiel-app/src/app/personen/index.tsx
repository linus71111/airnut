import { router, Stack } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PersonAnlegen, QualifikationBadge } from '../../components/PersonAnlegen';
import { Karte } from '../../components/ui';
import { akte, note } from '../../lib/score';
import { useStore } from '../../lib/store';
import { abstand, kartenStil, macheStile } from '../../theme';

export default function Personen() {
  const styles = useStyles();
  const { personen, durchgaenge } = useStore();
  const insets = useSafeAreaInsets();

  return (
    <FlatList
      data={personen}
      keyExtractor={(p) => p.id}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }}
      ListHeaderComponent={
        <>
          <Stack.Screen options={{ title: 'Helfer:innen' }} />
          <Karte>
            <PersonAnlegen />
          </Karte>
        </>
      }
      ListEmptyComponent={
        <Text style={styles.leer}>Noch niemand angelegt. Jede Person bekommt eine eigene Akte mit allen Einsätzen und Bewertungen.</Text>
      }
      renderItem={({ item: p }) => {
        const a = akte(p.id, durchgaenge);
        return (
          <Pressable style={({ pressed }) => [styles.eintrag, pressed && { opacity: 0.7 }]} onPress={() => router.push(`/personen/${p.id}`)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{p.name.slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={styles.name}>{p.name}</Text>
                <QualifikationBadge wert={p.qualifikation} />
              </View>
              <Text style={styles.meta}>
                {a.eintraege.length} Einsätze{p.notiz ? ` · ${p.notiz}` : ''}
              </Text>
            </View>
            {a.durchschnitt !== null && (
              <View style={[styles.wert, { backgroundColor: note(a.durchschnitt).farbe }]}>
                <Text style={styles.wertText}>Ø {a.durchschnitt}%</Text>
              </View>
            )}
          </Pressable>
        );
      }}
    />
  );
}

const useStyles = macheStile((farben) => ({
  leer: { textAlign: 'center', color: farben.textLeise, marginTop: abstand.l, fontSize: 15, lineHeight: 21 },
  eintrag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: abstand.m,
    backgroundColor: farben.karte,
    borderRadius: 16,
    padding: abstand.m,
    marginBottom: abstand.s,
    ...kartenStil(farben),
  },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: farben.tonal, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '900', color: farben.rot },
  name: { fontSize: 16, fontWeight: '800', color: farben.text },
  meta: { fontSize: 13, color: farben.textLeise, marginTop: 2 },
  wert: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  wertText: { color: '#fff', fontWeight: '900' },
}));
