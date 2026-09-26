import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PersonAnlegen } from '../../components/PersonAnlegen';
import { VitalMonitor } from '../../components/VitalMonitor';
import { Absatz, Badge, Eingabe, Karte, Knopf, SchwierigkeitBadge, Ueberschrift } from '../../components/ui';
import { bestaetigen } from '../../lib/bestaetigen';
import { neueId } from '../../lib/score';
import { QUALIFIKATION_INFO } from '../../lib/qualifikation';
import { useStore } from '../../lib/store';
import type { Schwierigkeit } from '../../lib/types';
import { oeffneZufallsFall } from '../../lib/zufall';
import { abstand, macheStile, useFarben } from '../../theme';

export default function FallDetail() {
  const styles = useStyles();
  const farben = useFarben();
  const { id, zufall, stufe } = useLocalSearchParams<{ id: string; zufall?: string; stufe?: Schwierigkeit }>();
  const { fall, faelle, speichereDurchgang, loescheFall, personen } = useStore();
  const f = fall(id);
  const [team, setTeam] = useState('');
  const [helfer, setHelfer] = useState<string[]>([]);
  const [neuOffen, setNeuOffen] = useState(false);
  /** Punkte, die in diesem Durchgang nicht bewertet werden */
  const [abgewaehlt, setAbgewaehlt] = useState<Record<string, boolean>>({});
  const [mimeZeigen, setMimeZeigen] = useState(false);
  const insets = useSafeAreaInsets();

  if (!f) return <Absatz>Fallbeispiel nicht gefunden.</Absatz>;

  const aktiv = f.checkliste.filter((c) => !abgewaehlt[c.id]);

  const umschalten = (pid: string) => setHelfer((h) => (h.includes(pid) ? h.filter((x) => x !== pid) : [...h, pid]));

  const starten = () => {
    const namen = personen.filter((p) => helfer.includes(p.id)).map((p) => p.name);
    const d = {
      id: neueId(),
      fallId: f.id,
      fallTitel: f.titel,
      schwierigkeit: f.schwierigkeit,
      helferIds: helfer,
      team: team.trim() || namen.join(' & ') || 'Team 1',
      start: Date.now(),
      checkliste: aktiv,
      bewertungen: [],
    };
    speichereDurchgang(d);
    router.replace(`/durchgang/${d.id}`);
  };

  const kategorien = [...new Set(f.checkliste.map((c) => c.kategorie))];
  const anzahlAus = f.checkliste.filter((c) => abgewaehlt[c.id]).length;

  return (
    <ScrollView contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }}>
      <Stack.Screen options={{ title: 'Fallbeispiel' }} />
      {zufall && (
        <View style={styles.zufall}>
          <Text style={styles.zufallText}>🎲 Zufällig ausgewählt</Text>
          <Pressable onPress={() => oeffneZufallsFall(faelle, stufe, true)} hitSlop={8} accessibilityRole="button">
            <Text style={styles.zufallKnopf}>Neu würfeln</Text>
          </Pressable>
        </View>
      )}
      <Text style={styles.titel}>{f.titel}</Text>
      <View style={{ flexDirection: 'row', marginTop: -abstand.s, marginBottom: abstand.m }}>
        <SchwierigkeitBadge stufe={f.schwierigkeit} />
      </View>

      <Karte>
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
        <Ueberschrift>
          ✅ Checkliste ({aktiv.length}
          {anzahlAus > 0 ? ` von ${f.checkliste.length}` : ''} Punkte)
        </Ueberschrift>
        <Absatz leise>Tippe einen Punkt an, wenn er diesmal nicht bewertet werden soll (z.B. kein Übungs-AED vorhanden).</Absatz>
        {anzahlAus > 0 && (
          <Pressable onPress={() => setAbgewaehlt({})} hitSlop={6} style={{ marginTop: abstand.s }}>
            <Text style={styles.alleAn}>↺ Alle {anzahlAus} abgewählten Punkte wieder aktivieren</Text>
          </Pressable>
        )}
        {kategorien.map((k) => (
          <View key={k} style={{ marginBottom: abstand.s }}>
            <Text style={styles.kategorie}>{k}</Text>
            {f.checkliste
              .filter((c) => c.kategorie === k)
              .map((c) => (
                <Pressable
                  key={c.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: !abgewaehlt[c.id] }}
                  onPress={() => setAbgewaehlt((a) => ({ ...a, [c.id]: !a[c.id] }))}
                  style={({ pressed }) => [styles.punkt, abgewaehlt[c.id] && { opacity: 0.45 }, pressed && { opacity: 0.6 }]}>
                  <Text style={[styles.punktText, abgewaehlt[c.id] && styles.durchgestrichen]}>
                    {abgewaehlt[c.id] ? '⊘' : '•'} {c.text}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {abgewaehlt[c.id] ? (
                      <Badge text="ABGEWÄHLT" farbe="#5F6368" />
                    ) : (
                      <>
                        {c.kritisch && <Badge text="WICHTIG" />}
                        <Badge text={`${c.punkte} P`} farbe="#5F6368" />
                      </>
                    )}
                  </View>
                </Pressable>
              ))}
          </View>
        ))}
      </Karte>

      <Karte stil={{ backgroundColor: farben.hinweis }}>
        <Ueberschrift>Durchgang starten</Ueberschrift>
        <Text style={styles.label}>Wer hilft? (antippen)</Text>
        <View style={styles.chips}>
          {personen.map((p) => {
            const an = helfer.includes(p.id);
            return (
              <Pressable key={p.id} onPress={() => umschalten(p.id)} style={[styles.chip, an && styles.chipAn]}>
                <Text style={[styles.chipText, an && { color: '#fff' }]}>
                  {an ? '✓ ' : ''}
                  {p.name}
                  {p.qualifikation ? <Text style={styles.chipQuali}> · {QUALIFIKATION_INFO[p.qualifikation].kurz}</Text> : null}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {neuOffen ? (
          <View style={styles.neu}>
            <PersonAnlegen
              onAngelegt={(pid) => {
                setHelfer((h) => [...h, pid]);
                setNeuOffen(false);
              }}
            />
          </View>
        ) : (
          <Pressable onPress={() => setNeuOffen(true)} hitSlop={6} style={{ marginBottom: abstand.m }}>
            <Text style={styles.neuLink}>+ Neue Person anlegen</Text>
          </Pressable>
        )}
        <Eingabe label="Teamname (optional)" value={team} onChangeText={setTeam} placeholder="sonst die Namen der Helfer:innen" />
        <Knopf titel={`▶ Start (${aktiv.length} Prüfpunkte)`} onPress={starten} deaktiviert={aktiv.length === 0} />
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

const useStyles = macheStile((farben) => ({
  titel: { fontSize: 24, fontWeight: '900', color: farben.text, marginBottom: abstand.m },
  kategorie: { fontSize: 13, fontWeight: '800', color: farben.rot, textTransform: 'uppercase', marginTop: 6 },
  punkt: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  punktText: { flex: 1, fontSize: 15, lineHeight: 21, color: farben.text },
  durchgestrichen: { textDecorationLine: 'line-through' },
  zufall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: farben.tonal,
    borderRadius: 12,
    paddingHorizontal: abstand.m,
    paddingVertical: 10,
    marginBottom: abstand.m,
  },
  zufallText: { color: farben.text, fontWeight: '800', fontSize: 15 },
  zufallKnopf: { color: farben.rot, fontWeight: '900', fontSize: 15 },
  alleAn: { color: farben.rot, fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '700', color: farben.textLeise, marginBottom: 6, textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: abstand.m },
  chip: { borderWidth: 1, borderColor: farben.rand, backgroundColor: farben.eingabe, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 7 },
  chipAn: { backgroundColor: farben.gruen, borderColor: farben.gruen },
  chipText: { fontSize: 15, fontWeight: '600', color: farben.text },
  neu: { backgroundColor: farben.karte, borderRadius: 14, padding: abstand.m, marginBottom: abstand.m },
  neuLink: { color: farben.rot, fontWeight: '800', fontSize: 15 },
  chipQuali: { fontWeight: '500', opacity: 0.75 },
}));
