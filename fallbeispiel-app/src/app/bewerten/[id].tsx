import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChecklistEingabe } from '../../components/ChecklistEingabe';
import { Absatz, Eingabe, Karte, Knopf } from '../../components/ui';
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

  const anzahl = d.checkliste.filter((c) => erledigt[c.id]).length;

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

      <ChecklistEingabe
        checkliste={d.checkliste}
        erledigt={erledigt}
        onUmschalten={(itemId) => setErledigt((e) => ({ ...e, [itemId]: !e[itemId] }))}
      />

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
});
