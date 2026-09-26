import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MenueKnopf } from '../components/Kopfleiste';
import { Badge, SchwierigkeitBadge } from '../components/ui';
import { useEinstellungen } from '../lib/einstellungen';
import { SCHWIERIGKEIT_INFO, SCHWIERIGKEITEN } from '../lib/schwierigkeit';
import { useStore } from '../lib/store';
import { THEMA_INFO, THEMEN } from '../lib/thema';
import type { Schwierigkeit, Thema } from '../lib/types';
import { oeffneZufallsFall } from '../lib/zufall';
import { abstand, kartenStil, macheStile, useFarben } from '../theme';

export default function Start() {
  const styles = useStyles();
  const farben = useFarben();
  const { faelle, durchgaenge, personen, geladen } = useStore();
  const [suche, setSuche] = useState('');
  const [stufe, setStufe] = useState<Schwierigkeit | null>(null);
  const [sucheFokus, setSucheFokus] = useState(false);
  const [thema, setThema] = useState<Thema | null>(null);
  const { einstellungen, setze } = useEinstellungen();
  const insets = useSafeAreaInsets();

  if (!geladen) return <ActivityIndicator style={{ marginTop: 40 }} color={farben.rot} />;

  const s = suche.trim().toLowerCase();
  const gefiltert = faelle.filter(
    (f) => (!s || (f.titel + ' ' + f.kurz).toLowerCase().includes(s)) &&
      (!stufe || f.schwierigkeit === stufe) &&
      (!thema || (f.thema ?? 'alltag') === thema),
  );
  const laufend = durchgaenge.filter((d) => !d.ende);

  return (
    <FlatList
      data={gefiltert}
      keyExtractor={(f) => f.id}
      contentContainerStyle={{ padding: abstand.l, paddingTop: insets.top + abstand.s, paddingBottom: insets.bottom + 40 }}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View>
          <View style={styles.leiste}>
            <Text style={styles.leisteText}>🛟 DLRG · Jugend-Einsatz-Team</Text>
            <MenueKnopf imInhalt />
          </View>

          <View style={styles.hero}>
            <View style={styles.heroZeile}>
              <View style={styles.heroIcon}>
                <Text style={styles.heroIconText}>🛟</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitel}>Fallbeispiel-Trainer</Text>
                <Text style={styles.heroUnter}>Übung macht sicher</Text>
              </View>
            </View>
            <Text style={styles.heroText}>
              Notfälle realistisch nachspielen, Vitalwerte ansagen und gemeinsam mit der Checkliste bewerten.
            </Text>
            <View style={styles.heroZahlen}>
              <Zahl wert={faelle.length} text="Fälle" />
              <View style={styles.heroTrenner} />
              <Zahl wert={durchgaenge.length} text="Einsätze" />
              <View style={styles.heroTrenner} />
              <Zahl wert={personen.length} text="Helfer" />
            </View>
          </View>

          {einstellungen.startHinweis && (
            <View style={styles.tipp}>
              <View style={styles.tippKopf}>
                <Text style={styles.tippTitel}>👋 So geht's</Text>
                <Pressable onPress={() => setze({ startHinweis: false })} hitSlop={10} accessibilityRole="button" accessibilityLabel="Hinweis ausblenden">
                  <Text style={styles.tippZu}>✕</Text>
                </Pressable>
              </View>
              {[
                'Unter „Helfer“ das Team anlegen',
                'Einen Fall antippen oder würfeln',
                'Lage vorlesen, Helfer auswählen, Start drücken',
                'Vitalwerte ansagen, danach bewerten die Zuschauer:innen',
              ].map((t, i) => (
                <View key={t} style={styles.tippZeile}>
                  <View style={styles.tippNr}>
                    <Text style={styles.tippNrText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.tippText}>{t}</Text>
                </View>
              ))}
              <Pressable onPress={() => router.push('/anleitung')} hitSlop={6}>
                <Text style={styles.tippLink}>Ausführliche Anleitung ›</Text>
              </Pressable>
            </View>
          )}

          {laufend.map((d) => (
            <Pressable
              key={d.id}
              style={({ pressed }) => [styles.laufend, pressed && { opacity: 0.85 }]}
              onPress={() => router.push(`/durchgang/${d.id}`)}>
              <View style={styles.laufendPunkt} />
              <View style={{ flex: 1 }}>
                <Text style={styles.laufendTitel}>Übung läuft</Text>
                <Text style={styles.laufendText} numberOfLines={1}>
                  {d.fallTitel} · {d.team}
                </Text>
              </View>
              <Text style={styles.laufendPfeil}>›</Text>
            </Pressable>
          ))}

          <View style={styles.kacheln}>
            <Kachel icon="📖" text="Anleitung" ziel="/anleitung" />
            <Kachel icon="👥" text="Helfer" ziel="/personen" />
            <Kachel icon="📋" text="Einsätze" ziel="/verlauf" />
            <Kachel icon="➕" text="Neuer Fall" ziel="/editor" />
          </View>

          <View style={[styles.suche, sucheFokus && styles.sucheFokus]}>
            <Text style={styles.sucheIcon}>🔍</Text>
            <TextInput
              value={suche}
              onChangeText={setSuche}
              onFocus={() => setSucheFokus(true)}
              onBlur={() => setSucheFokus(false)}
              placeholder="Fallbeispiel suchen"
              placeholderTextColor={farben.platzhalter}
              returnKeyType="search"
              autoCorrect={false}
              style={styles.sucheFeld}
            />
            {suche.length > 0 && (
              <Pressable onPress={() => setSuche('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Suche löschen" style={styles.sucheLoeschen}>
                <Text style={styles.sucheLoeschenText}>✕</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.filter}>
            <FilterChip text="Alle" an={!stufe} farbe={farben.neutral} onPress={() => setStufe(null)} />
            {SCHWIERIGKEITEN.map((st) => (
              <FilterChip
                key={st}
                text={SCHWIERIGKEIT_INFO[st].label}
                an={stufe === st}
                farbe={SCHWIERIGKEIT_INFO[st].farbe}
                onPress={() => setStufe(stufe === st ? null : st)}
              />
            ))}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themen} style={styles.themenLeiste}>
            <FilterChip text="Alle Themen" an={!thema} farbe={farben.neutral} onPress={() => setThema(null)} />
            {THEMEN.map((t) => (
              <FilterChip
                key={t}
                text={`${THEMA_INFO[t].icon} ${THEMA_INFO[t].label}`}
                an={thema === t}
                farbe={farben.neutral}
                onPress={() => setThema(thema === t ? null : t)}
              />
            ))}
          </ScrollView>

          <Pressable
            accessibilityRole="button"
            onPress={() => oeffneZufallsFall(faelle, stufe ?? undefined)}
            style={({ pressed }) => [styles.zufall, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}>
            <Text style={styles.zufallIcon}>🎲</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.zufallTitel}>Zufallsfall</Text>
              <Text style={styles.zufallText}>
                {stufe ? `Ein zufälliger Fall der Stufe „${SCHWIERIGKEIT_INFO[stufe].label}“` : 'Die App wählt einen Fall für euch aus'}
              </Text>
            </View>
            <Text style={styles.zufallPfeil}>›</Text>
          </Pressable>

          <Text style={styles.abschnitt}>
            Fallbeispiele <Text style={styles.abschnittZahl}>{gefiltert.length}</Text>
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push(`/fall/${item.id}`)}
          style={({ pressed }) => [styles.fall, pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] }]}>
          <View style={styles.fallKopf}>
            <Text style={styles.fallTitel}>{item.titel}</Text>
            <Text style={styles.fallPfeil}>›</Text>
          </View>
          <Text style={styles.fallKurz}>{item.kurz}</Text>
          <View style={styles.fallFuss}>
            <SchwierigkeitBadge stufe={item.schwierigkeit} />
            {item.eigenes && <Badge text="EIGENER" farbe="#1565C0" />}
            <Text style={styles.fallMeta}>
              {THEMA_INFO[item.thema ?? 'alltag'].icon} · {item.checkliste.length} Prüfpunkte
            </Text>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={<Text style={styles.leer}>Kein Fallbeispiel gefunden.</Text>}
    />
  );
}

function Zahl({ wert, text }: { wert: number; text: string }) {
  const styles = useStyles();
  return (
    <View style={styles.zahl}>
      <Text style={styles.zahlWert}>{wert}</Text>
      <Text style={styles.zahlText}>{text}</Text>
    </View>
  );
}

function Kachel({ icon, text, ziel }: { icon: string; text: string; ziel: Href }) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(ziel)}
      style={({ pressed }) => [styles.kachel, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}>
      <View style={styles.kachelIcon}>
        <Text style={styles.kachelIconText}>{icon}</Text>
      </View>
      <Text style={styles.kachelText} numberOfLines={1}>
        {text}
      </Text>
    </Pressable>
  );
}

function FilterChip({ text, an, farbe, onPress }: { text: string; an: boolean; farbe: string; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityState={{ selected: an }}
      style={[styles.chip, { borderColor: an ? farbe : 'transparent' }, an && { backgroundColor: farbe }]}>
      <Text style={[styles.chipText, { color: an ? '#fff' : farbe }]}>{text}</Text>
    </Pressable>
  );
}

const useStyles = macheStile((farben) => ({
  leiste: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52, marginBottom: abstand.s },
  leisteText: { fontSize: 13, fontWeight: '800', color: farben.textLeise, letterSpacing: 0.4 },
  hero: { backgroundColor: farben.rot, borderRadius: 22, padding: abstand.l, marginBottom: abstand.m, gap: abstand.m },
  heroZeile: { flexDirection: 'row', alignItems: 'center', gap: abstand.m },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconText: { fontSize: 26 },
  heroTitel: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  heroUnter: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  heroText: { color: 'rgba(255,255,255,0.92)', fontSize: 15, lineHeight: 21 },
  heroZahlen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 14,
    paddingVertical: 10,
  },
  heroTrenner: { width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.25)' },
  zahl: { flex: 1, alignItems: 'center' },
  zahlWert: { color: '#fff', fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },
  zahlText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  laufend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: abstand.m,
    backgroundColor: farben.gruen,
    borderRadius: 16,
    padding: 14,
    marginBottom: abstand.m,
  },
  laufendPunkt: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
  laufendTitel: { color: '#fff', fontWeight: '900', fontSize: 15 },
  laufendText: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  laufendPfeil: { color: '#fff', fontSize: 26, fontWeight: '300' },
  kacheln: { flexDirection: 'row', gap: abstand.s, marginBottom: abstand.l },
  kachel: {
    flex: 1,
    backgroundColor: farben.karte,
    borderRadius: 16,
    paddingVertical: abstand.m,
    alignItems: 'center',
    gap: 6,
    ...kartenStil(farben),
  },
  kachelIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: farben.tonal, alignItems: 'center', justifyContent: 'center' },
  kachelIconText: { fontSize: 20 },
  kachelText: { fontSize: 12, fontWeight: '700', color: farben.text },
  suche: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: farben.eingabe,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: farben.rand,
    paddingLeft: 14,
    paddingRight: 8,
    minHeight: 50,
    marginBottom: abstand.m,
  },
  sucheFokus: { borderColor: farben.rot },
  sucheIcon: { fontSize: 15, opacity: 0.6 },
  sucheFeld: { flex: 1, alignSelf: 'stretch', paddingVertical: 12, paddingHorizontal: 10, fontSize: 16, color: farben.text },
  sucheLoeschen: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: farben.balkenHg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sucheLoeschenText: { color: farben.textLeise, fontSize: 13, fontWeight: '800' },
  filter: { flexDirection: 'row', gap: 8, marginBottom: abstand.s, flexWrap: 'wrap' },
  themenLeiste: { marginHorizontal: -abstand.l, marginBottom: abstand.m },
  themen: { flexDirection: 'row', gap: 8, paddingHorizontal: abstand.l },
  tipp: { backgroundColor: farben.karte, borderRadius: 18, padding: abstand.l, marginBottom: abstand.m, gap: 10, ...kartenStil(farben) },
  tippKopf: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tippTitel: { fontSize: 17, fontWeight: '900', color: farben.text },
  tippZu: { fontSize: 16, color: farben.textLeise, fontWeight: '800' },
  tippZeile: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tippNr: { width: 26, height: 26, borderRadius: 13, backgroundColor: farben.tonal, alignItems: 'center', justifyContent: 'center' },
  tippNrText: { color: farben.rot, fontWeight: '900', fontSize: 13 },
  tippText: { flex: 1, fontSize: 15, color: farben.text, lineHeight: 20 },
  tippLink: { color: farben.rot, fontWeight: '800', fontSize: 15, marginTop: 2 },
  chip: { borderWidth: 1.5, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: farben.karte },
  chipText: { fontSize: 14, fontWeight: '800' },
  zufall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: abstand.m,
    backgroundColor: farben.tonal,
    borderRadius: 16,
    padding: 14,
    marginBottom: abstand.l,
  },
  zufallIcon: { fontSize: 26 },
  zufallTitel: { color: farben.rot, fontWeight: '900', fontSize: 16 },
  zufallText: { color: farben.textLeise, fontSize: 13, marginTop: 1 },
  zufallPfeil: { color: farben.rot, fontSize: 26, fontWeight: '300' },
  abschnitt: {
    fontSize: 13,
    fontWeight: '800',
    color: farben.textLeise,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: abstand.s,
  },
  abschnittZahl: { color: farben.rot },
  fall: {
    backgroundColor: farben.karte,
    borderRadius: 16,
    padding: abstand.l,
    marginBottom: abstand.m,
    ...kartenStil(farben),
  },
  fallKopf: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' },
  fallTitel: { fontSize: 17, fontWeight: '800', color: farben.text, flex: 1, letterSpacing: -0.2 },
  fallPfeil: { color: farben.textLeise, fontSize: 24, fontWeight: '300', marginTop: -4 },
  fallKurz: { fontSize: 15, lineHeight: 21, color: farben.textLeise, marginTop: 4 },
  fallFuss: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: abstand.m },
  fallMeta: { fontSize: 12, color: farben.textLeise, fontWeight: '700' },
  leer: { color: farben.textLeise, textAlign: 'center', marginTop: abstand.l },
}));
