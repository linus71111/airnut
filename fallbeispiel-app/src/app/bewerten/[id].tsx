import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Absatz, Badge, Checkbox, Eingabe, Karte, Knopf } from '../../components/ui';
import { neueId } from '../../lib/score';
import { useStore } from '../../lib/store';
import { abstand, farben } from '../../theme';

export default function Bewerten() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { durchgang, fuegeBewertungHinzu } = useStore();
  const d = durchgang(id);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [erledigt, setErledigt] = useState<Record<string, boolean>>({});
  const [notiz, setNotiz] = useState('');

  if (!d) return <Absatz>Durchgang nicht gefunden.</Absatz>;

  const umschalten = (itemId: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
    setErledigt((e) => ({ ...e, [itemId]: !e[itemId] }));
  };

  const anzahl = d.checkliste.filter((c) => erledigt[c.id]).length;
  const kategorien = [...new Set(d.checkliste.map((c) => c.kategorie))];

  const absenden = () => {
    fuegeBewertungHinzu(d.id, {
      id: neueId(),
      name: name.trim() || `Zuschauer:in ${d.bewertungen.length + 1}`,
      erledigt,
      notiz: notiz.trim(),
      zeit: Date.now(),
    });
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }}>
      <Stack.Screen options={{ title: 'Bewerten' }} />
      <Text style={styles.titel}>{d.fallTitel}</Text>
      <Absatz leise>Team: {d.team} – Hake alles ab, was du gesehen hast.</Absatz>

      <Karte stil={{ marginTop: abstand.m }}>
        <Eingabe label="Dein Name" value={name} onChangeText={setName} placeholder="optional" />
      </Karte>

      {kategorien.map((k) => (
        <Karte key={k}>
          <Text style={styles.kategorie}>{k}</Text>
          {d.checkliste
            .filter((c) => c.kategorie === k)
            .map((c) => (
              <Checkbox
                key={c.id}
                an={!!erledigt[c.id]}
                onPress={() => umschalten(c.id)}
                text={c.text}
                unterText={
                  <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                    {c.kritisch && <Badge text="WICHTIG" />}
                    <Badge text={`${c.punkte} P`} farbe="#5F6368" />
                  </View>
                }
              />
            ))}
        </Karte>
      ))}

      <Karte>
        <Eingabe
          label="Feedback / Was war gut, was kann besser werden?"
          value={notiz}
          onChangeText={setNotiz}
          multiline
          placeholder="z.B. Super ruhige Betreuung, Notruf kam etwas spät"
        />
      </Karte>

      <Knopf titel={`Bewertung speichern (${anzahl}/${d.checkliste.length})`} onPress={absenden} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titel: { fontSize: 22, fontWeight: '900', color: farben.text, marginBottom: 4 },
  kategorie: { fontSize: 13, fontWeight: '800', color: farben.rot, textTransform: 'uppercase' },
});
