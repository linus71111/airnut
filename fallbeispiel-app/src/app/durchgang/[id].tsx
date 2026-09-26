import { useKeepAwake } from 'expo-keep-awake';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChecklistEingabe } from '../../components/ChecklistEingabe';
import { VitalMonitor } from '../../components/VitalMonitor';
import { Absatz, Eingabe, Karte, Knopf, Ueberschrift } from '../../components/ui';
import { bestaetigen } from '../../lib/bestaetigen';
import { bewerte, dauer, neueId } from '../../lib/score';
import { useStore } from '../../lib/store';
import type { Durchgang, LiveBewertung, Vitalwerte } from '../../lib/types';
import { NORMALWERTE } from '../../lib/vitals';
import { abstand, farben } from '../../theme';

export default function DurchgangScreen() {
  useKeepAwake(); // Bildschirm bleibt während der Übung an
  const { id } = useLocalSearchParams<{ id: string }>();
  const { durchgang, fall, speichereDurchgang, loescheDurchgang } = useStore();
  const d = durchgang(id);
  const f = d ? fall(d.fallId) : undefined;
  const insets = useSafeAreaInsets();

  const [werte, setWerte] = useState<Vitalwerte>(f?.vitalStart ?? NORMALWERTE);
  const [verdeckt, setVerdeckt] = useState(false);
  const [lageZeigen, setLageZeigen] = useState(false);
  const [jetzt, setJetzt] = useState(Date.now());
  const [reiter, setReiter] = useState<'monitor' | 'bewertung'>('monitor');

  const laeuft = !!d && !d.ende;
  useEffect(() => {
    if (!laeuft) return;
    const t = setInterval(() => setJetzt(Date.now()), 500);
    return () => clearInterval(t);
  }, [laeuft]);

  if (!d) return <Absatz>Durchgang nicht gefunden.</Absatz>;

  const zeit = dauer((d.ende ?? jetzt) - d.start);
  const live: LiveBewertung = d.live ?? { name: '', erledigt: {}, zeiten: {}, notiz: '' };
  const liveAnzahl = d.checkliste.filter((c) => live.erledigt[c.id]).length;

  const setzeLive = (neu: Partial<LiveBewertung>) => speichereDurchgang({ ...d, live: { ...live, ...neu } });
  const liveUmschalten = (itemId: string) => {
    const an = !live.erledigt[itemId];
    const zeiten = { ...live.zeiten };
    if (an) zeiten[itemId] = Date.now() - d.start;
    else delete zeiten[itemId];
    setzeLive({ erledigt: { ...live.erledigt, [itemId]: an }, zeiten });
  };

  /** Beenden: Die Live-Bewertung wird automatisch als Bewertung gespeichert */
  const beenden = () => {
    const neu: Durchgang = { ...d, ende: Date.now(), live: undefined };
    if (liveAnzahl > 0 || live.notiz.trim()) {
      neu.bewertungen = [
        ...d.bewertungen,
        {
          id: neueId(),
          name: `${live.name.trim() || 'Live-Bewertung'} (live)`,
          erledigt: live.erledigt,
          zeiten: live.zeiten,
          notiz: live.notiz.trim(),
          zeit: Date.now(),
        },
      ];
    }
    speichereDurchgang(neu);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }}>
      <Stack.Screen options={{ title: d.team }} />

      <View style={[styles.timer, !laeuft && { backgroundColor: '#37474F' }]}>
        <Text style={styles.timerLabel}>{laeuft ? 'LÄUFT' : 'BEENDET'}</Text>
        <Text style={styles.timerZeit}>{zeit}</Text>
        <Text style={styles.timerFall} numberOfLines={2}>
          {d.fallTitel}
        </Text>
      </View>

      {laeuft ? (
        <>
          <View style={styles.reiter}>
            <Reiter text="🩺 Monitor" an={reiter === 'monitor'} onPress={() => setReiter('monitor')} />
            <Reiter
              text={`✅ Live-Bewertung (${liveAnzahl}/${d.checkliste.length})`}
              an={reiter === 'bewertung'}
              onPress={() => setReiter('bewertung')}
            />
          </View>

          {reiter === 'monitor' ? (
            <>
              {f && (
                <Karte>
                  <Knopf titel={lageZeigen ? 'Lage & Mimen-Infos ausblenden' : 'Lage & Mimen-Infos anzeigen'} art="sekundaer" onPress={() => setLageZeigen(!lageZeigen)} />
                  {lageZeigen && (
                    <View style={{ marginTop: abstand.m, gap: abstand.s }}>
                      <Absatz>📢 {f.lage}</Absatz>
                      <Absatz leise>🎭 {f.mimeAnleitung}</Absatz>
                    </View>
                  )}
                </Karte>
              )}

              <View style={styles.zeile}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.schalterTitel}>Messen-Modus</Text>
                  <Text style={styles.schalterText}>Werte verdeckt – erst beim Antippen sichtbar, wenn die Helfer:innen messen.</Text>
                </View>
                <Switch value={verdeckt} onValueChange={setVerdeckt} trackColor={{ true: farben.rot }} />
              </View>

              <VitalMonitor werte={werte} onChange={setWerte} verdeckt={verdeckt} />

              {f && (
                <View style={styles.knoepfe}>
                  <Knopf titel="Ausgangswerte" art="sekundaer" onPress={() => setWerte(f.vitalStart)} stil={{ flex: 1 }} />
                  {f.vitalNachBehandlung && (
                    <Knopf titel="Nach Behandlung" art="gelb" onPress={() => setWerte(f.vitalNachBehandlung!)} stil={{ flex: 1 }} />
                  )}
                </View>
              )}
            </>
          ) : (
            <>
              <Absatz leise>
                Hake während der Übung ab, was die Helfer:innen machen. Die Zeit seit dem Start wird mitgespeichert. Beim Beenden wird das
                automatisch als Bewertung übernommen.
              </Absatz>
              <Karte stil={{ marginTop: abstand.m }}>
                <Eingabe label="Wer bewertet live?" value={live.name} onChangeText={(t) => setzeLive({ name: t })} placeholder="Name" />
              </Karte>
              <ChecklistEingabe checkliste={d.checkliste} erledigt={live.erledigt} zeiten={live.zeiten} onUmschalten={liveUmschalten} />
              <Karte>
                <Eingabe
                  label="Notizen / Feedback"
                  value={live.notiz}
                  onChangeText={(t) => setzeLive({ notiz: t })}
                  multiline
                  placeholder="z.B. Notruf kam erst spät"
                />
              </Karte>
            </>
          )}

          <Knopf
            titel="■ Übung beenden"
            onPress={beenden}
            stil={{ marginTop: abstand.m }}
          />
        </>
      ) : (
        <>
          <Karte>
            <Ueberschrift>Bewertung durch die Zuschauer:innen</Ueberschrift>
            <Absatz leise>
              Jede Person bewertet einzeln mit der Checkliste. Das Handy einfach weitergeben – oder ihr bewertet gemeinsam.
            </Absatz>
            <Knopf titel="+ Bewertung abgeben" onPress={() => router.push(`/bewerten/${d.id}`)} stil={{ marginTop: abstand.m }} />
          </Karte>

          {d.bewertungen.length > 0 && (
            <Karte>
              <Ueberschrift>Bisher {d.bewertungen.length} Bewertung(en)</Ueberschrift>
              {d.bewertungen.map((b) => {
                const e = bewerte(d.checkliste, b);
                return (
                  <View key={b.id} style={styles.bewertung}>
                    <Text style={styles.bewertungName}>{b.name}</Text>
                    <Text style={styles.bewertungWert}>
                      {e.punkte}/{e.maxPunkte} P · {e.prozent}%
                    </Text>
                  </View>
                );
              })}
            </Karte>
          )}

          <Knopf
            titel="🏆 Ergebnis anzeigen"
            art="gelb"
            deaktiviert={d.bewertungen.length === 0}
            onPress={() => router.push(`/ergebnis/${d.id}`)}
          />
          <Knopf
            titel="Übung fortsetzen"
            art="sekundaer"
            onPress={() => speichereDurchgang({ ...d, ende: undefined })}
            stil={{ marginTop: abstand.m }}
          />
        </>
      )}

      <Knopf
        titel="Durchgang löschen"
        art="gefahr"
        stil={{ marginTop: abstand.xl }}
        onPress={() =>
          bestaetigen('Durchgang löschen?', 'Alle Bewertungen dieses Durchgangs gehen verloren.', 'Löschen', () => {
            loescheDurchgang(d.id);
            router.back();
          })
        }
      />
    </ScrollView>
  );
}

function Reiter({ text, an, onPress }: { text: string; an: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: an }} style={[styles.reiterKnopf, an && styles.reiterAn]}>
      <Text style={[styles.reiterText, an && { color: '#fff' }]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  reiter: { flexDirection: 'row', backgroundColor: farben.karte, borderRadius: 12, padding: 4, gap: 4, marginBottom: abstand.m },
  reiterKnopf: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  reiterAn: { backgroundColor: farben.rot },
  reiterText: { fontSize: 14, fontWeight: '800', color: farben.text, textAlign: 'center' },
  timer: { backgroundColor: farben.rot, borderRadius: 16, padding: abstand.l, alignItems: 'center', marginBottom: abstand.m },
  timerLabel: { color: farben.gelb, fontWeight: '900', letterSpacing: 2, fontSize: 13 },
  timerZeit: { color: '#fff', fontSize: 56, fontWeight: '900', fontVariant: ['tabular-nums'] },
  timerFall: { color: '#fff', fontSize: 15, textAlign: 'center' },
  zeile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: abstand.m,
    backgroundColor: farben.karte,
    borderRadius: 14,
    padding: abstand.m,
    marginBottom: abstand.m,
  },
  schalterTitel: { fontSize: 16, fontWeight: '800', color: farben.text },
  schalterText: { fontSize: 13, color: farben.textLeise },
  knoepfe: { flexDirection: 'row', gap: abstand.m },
  bewertung: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: farben.rand },
  bewertungName: { fontSize: 16, fontWeight: '600', color: farben.text },
  bewertungWert: { fontSize: 16, color: farben.textLeise, fontVariant: ['tabular-nums'] },
});
