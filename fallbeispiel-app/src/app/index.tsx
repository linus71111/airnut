import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Knopf } from '../components/ui';
import { useStore } from '../lib/store';
import { abstand, farben } from '../theme';

export default function Start() {
  const { faelle, durchgaenge, geladen } = useStore();
  const [suche, setSuche] = useState('');
  const insets = useSafeAreaInsets();

  if (!geladen) return <ActivityIndicator style={{ marginTop: 40 }} color={farben.rot} />;

  const s = suche.trim().toLowerCase();
  const gefiltert = s ? faelle.filter((f) => (f.titel + ' ' + f.kurz).toLowerCase().includes(s)) : faelle;
  const laufend = durchgaenge.filter((d) => !d.ende);

  return (
    <FlatList
      data={gefiltert}
      keyExtractor={(f) => f.id}
      contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }}
      ListHeaderComponent={
        <View>
          <View style={styles.banner}>
            <Text style={styles.bannerTitel}>Fallbeispiel-Trainer</Text>
            <Text style={styles.bannerText}>
              Spielt realistische Notfälle nach. Die Spielleitung steuert die Vitalwerte, die Zuschauer:innen bewerten mit der
              Checkliste.
            </Text>
          </View>

          {laufend.map((d) => (
            <Pressable key={d.id} style={styles.laufend} onPress={() => router.push(`/durchgang/${d.id}`)}>
              <Text style={styles.laufendText}>▶ Läuft: {d.fallTitel} – Team „{d.team}“</Text>
            </Pressable>
          ))}

          <View style={styles.knoepfe}>
            <Knopf titel="+ Eigener Fall" onPress={() => router.push('/editor')} stil={{ flex: 1 }} />
            <Knopf titel={`Verlauf (${durchgaenge.length})`} art="sekundaer" onPress={() => router.push('/verlauf')} stil={{ flex: 1 }} />
          </View>

          <TextInput
            value={suche}
            onChangeText={setSuche}
            placeholder="Fallbeispiel suchen …"
            placeholderTextColor="#999"
            style={styles.suche}
          />
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push(`/fall/${item.id}`)}
          style={({ pressed }) => [styles.fall, pressed && { opacity: 0.7 }]}>
          <View style={styles.fallKopf}>
            <Text style={styles.fallTitel}>{item.titel}</Text>
            {item.eigenes && <Badge text="EIGENER" farbe="#1565C0" />}
          </View>
          <Text style={styles.fallKurz}>{item.kurz}</Text>
          <Text style={styles.fallMeta}>{item.checkliste.length} Prüfpunkte</Text>
        </Pressable>
      )}
      ListEmptyComponent={<Text style={{ color: farben.textLeise, textAlign: 'center' }}>Nichts gefunden.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: farben.gelb, borderRadius: 16, padding: abstand.l, marginBottom: abstand.m },
  bannerTitel: { fontSize: 22, fontWeight: '900', color: farben.rot },
  bannerText: { fontSize: 15, lineHeight: 21, color: farben.text, marginTop: 4 },
  laufend: { backgroundColor: farben.gruen, borderRadius: 12, padding: 14, marginBottom: abstand.m },
  laufendText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  knoepfe: { flexDirection: 'row', gap: abstand.m, marginBottom: abstand.m },
  suche: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: farben.rand,
    padding: 12,
    fontSize: 16,
    marginBottom: abstand.m,
  },
  fall: {
    backgroundColor: farben.karte,
    borderRadius: 14,
    padding: abstand.l,
    marginBottom: abstand.m,
    borderLeftWidth: 5,
    borderLeftColor: farben.rot,
  },
  fallKopf: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' },
  fallTitel: { fontSize: 17, fontWeight: '800', color: farben.text, flex: 1 },
  fallKurz: { fontSize: 15, color: farben.textLeise, marginTop: 4 },
  fallMeta: { fontSize: 12, color: farben.rot, fontWeight: '700', marginTop: 8 },
});
