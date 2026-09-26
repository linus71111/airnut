import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Eingabe, Karte, Knopf } from '../../components/ui';
import { akte, neueId, note } from '../../lib/score';
import { useStore } from '../../lib/store';
import { abstand, farben } from '../../theme';

export default function Personen() {
  const { personen, durchgaenge, speicherePerson } = useStore();
  const [name, setName] = useState('');
  const insets = useSafeAreaInsets();

  const anlegen = () => {
    if (!name.trim()) return;
    speicherePerson({ id: neueId(), name: name.trim(), notiz: '', erstellt: Date.now() });
    setName('');
  };

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
            <Eingabe label="Neue Person" value={name} onChangeText={setName} placeholder="Vor- und Nachname" onSubmitEditing={anlegen} />
            <Knopf titel="+ Hinzufügen" onPress={anlegen} deaktiviert={!name.trim()} />
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
              <Text style={styles.name}>{p.name}</Text>
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

const styles = StyleSheet.create({
  leer: { textAlign: 'center', color: farben.textLeise, marginTop: abstand.l, fontSize: 15, lineHeight: 21 },
  eintrag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: abstand.m,
    backgroundColor: farben.karte,
    borderRadius: 14,
    padding: abstand.m,
    marginBottom: abstand.s,
  },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: farben.gelb, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '900', color: farben.rot },
  name: { fontSize: 16, fontWeight: '800', color: farben.text },
  meta: { fontSize: 13, color: farben.textLeise, marginTop: 2 },
  wert: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  wertText: { color: '#fff', fontWeight: '900' },
});
