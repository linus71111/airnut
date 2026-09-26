import { useKeepAwake } from 'expo-keep-awake';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VitalMonitor } from '../../components/VitalMonitor';
import { Absatz, Karte, Knopf, Ueberschrift } from '../../components/ui';
import { bestaetigen } from '../../lib/bestaetigen';
import { bewerte, dauer } from '../../lib/score';
import { useStore } from '../../lib/store';
import type { Vitalwerte } from '../../lib/types';
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

  const laeuft = !!d && !d.ende;
  useEffect(() => {
    if (!laeuft) return;
    const t = setInterval(() => setJetzt(Date.now()), 500);
    return () => clearInterval(t);
  }, [laeuft]);

  if (!d) return <Absatz>Durchgang nicht gefunden.</Absatz>;

  const zeit = dauer((d.ende ?? jetzt) - d.start);

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

          <Knopf
            titel="■ Übung beenden"
            onPress={() => speichereDurchgang({ ...d, ende: Date.now() })}
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

const styles = StyleSheet.create({
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
