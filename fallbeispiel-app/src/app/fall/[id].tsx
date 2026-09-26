import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VitalMonitor } from '../../components/VitalMonitor';
import { Absatz, Badge, Eingabe, Karte, Knopf, Ueberschrift } from '../../components/ui';
import { bestaetigen } from '../../lib/bestaetigen';
import { neueId } from '../../lib/score';
import { useStore } from '../../lib/store';
import { abstand, farben } from '../../theme';

export default function FallDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fall, speichereDurchgang, loescheFall } = useStore();
  const f = fall(id);
  const [team, setTeam] = useState('');
  const [mimeZeigen, setMimeZeigen] = useState(false);
  const insets = useSafeAreaInsets();

  if (!f) return <Absatz>Fallbeispiel nicht gefunden.</Absatz>;

  const starten = () => {
    const d = {
      id: neueId(),
      fallId: f.id,
      fallTitel: f.titel,
      team: team.trim() || 'Team 1',
      start: Date.now(),
      checkliste: f.checkliste,
      bewertungen: [],
    };
    speichereDurchgang(d);
    router.replace(`/durchgang/${d.id}`);
  };

  const kategorien = [...new Set(f.checkliste.map((c) => c.kategorie))];

  return (
    <ScrollView contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }}>
      <Stack.Screen options={{ title: 'Fallbeispiel' }} />
      <Text style={styles.titel}>{f.titel}</Text>

      <Karte stil={{ borderLeftWidth: 5, borderLeftColor: farben.gelb }}>
        <Ueberschrift>📢 Lage (vorlesen)</Ueberschrift>
        <Absatz>{f.lage}</Absatz>
      </Karte>

      <Karte>
        <Ueberschrift>🎭 Für Mime & Spielleitung</Ueberschrift>
        {mimeZeigen ? (
          <>
            <Absatz>{f.mimeAnleitung}</Absatz>
            {f.requisiten ? (
              <View style={{ marginTop: abstand.m }}>
                <Absatz leise>Schminke & Requisiten: {f.requisiten}</Absatz>
              </View>
            ) : null}
          </>
        ) : (
          <Absatz leise>Geheim – nicht den Helfer:innen zeigen!</Absatz>
        )}
        <Knopf
          titel={mimeZeigen ? 'Verbergen' : 'Anzeigen'}
          art="sekundaer"
          onPress={() => setMimeZeigen(!mimeZeigen)}
          stil={{ marginTop: abstand.m }}
        />
      </Karte>

      <Ueberschrift>Vitalwerte zu Beginn</Ueberschrift>
      <VitalMonitor werte={f.vitalStart} />

      <Karte>
        <Ueberschrift>✅ Checkliste ({f.checkliste.length} Punkte)</Ueberschrift>
        {kategorien.map((k) => (
          <View key={k} style={{ marginBottom: abstand.s }}>
            <Text style={styles.kategorie}>{k}</Text>
            {f.checkliste
              .filter((c) => c.kategorie === k)
              .map((c) => (
                <View key={c.id} style={styles.punkt}>
                  <Text style={styles.punktText}>• {c.text}</Text>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {c.kritisch && <Badge text="WICHTIG" />}
                    <Badge text={`${c.punkte} P`} farbe="#5F6368" />
                  </View>
                </View>
              ))}
          </View>
        ))}
      </Karte>

      <Karte stil={{ backgroundColor: '#FFF8D6' }}>
        <Ueberschrift>Durchgang starten</Ueberschrift>
        <Eingabe label="Team / Helfer:innen" value={team} onChangeText={setTeam} placeholder="z.B. Lisa & Tom" />
        <Knopf titel="▶ Start" onPress={starten} />
      </Karte>

      <View style={{ flexDirection: 'row', gap: abstand.m }}>
        <Knopf
          titel={f.eigenes ? 'Bearbeiten' : 'Als Vorlage kopieren'}
          art="sekundaer"
          onPress={() => router.push({ pathname: '/editor', params: f.eigenes ? { id: f.id } : { vorlage: f.id } })}
          stil={{ flex: 1 }}
        />
        {f.eigenes && (
          <Knopf
            titel="Löschen"
            art="gefahr"
            stil={{ flex: 1 }}
            onPress={() =>
              bestaetigen('Fall löschen?', `„${f.titel}“ wird endgültig gelöscht.`, 'Löschen', () => {
                loescheFall(f.id);
                router.back();
              })
            }
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titel: { fontSize: 24, fontWeight: '900', color: farben.text, marginBottom: abstand.m },
  kategorie: { fontSize: 13, fontWeight: '800', color: farben.rot, textTransform: 'uppercase', marginTop: 6 },
  punkt: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  punktText: { flex: 1, fontSize: 15, lineHeight: 21, color: farben.text },
});
