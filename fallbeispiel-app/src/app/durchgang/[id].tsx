import { useKeepAwake } from 'expo-keep-awake';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChecklistEingabe } from '../../components/ChecklistEingabe';
import { VitalMonitor } from '../../components/VitalMonitor';
import { Absatz, Eingabe, Karte, Knopf, Ueberschrift, Umschalter } from '../../components/ui';
import { bestaetigen } from '../../lib/bestaetigen';
import { bewerte, dauer, neueId } from '../../lib/score';
import { useEinstellungen } from '../../lib/einstellungen';
import { useStore } from '../../lib/store';
import { useToene } from '../../lib/toene';
import type { Durchgang, LiveBewertung, Vitalwerte } from '../../lib/types';
import { NORMALWERTE } from '../../lib/vitals';
import { abstand, kartenStil, macheStile, useFarben } from '../../theme';

export default function DurchgangScreen() {
  const styles = useStyles();
  const farben = useFarben();
  useKeepAwake(); // Bildschirm bleibt während der Übung an
  const { id } = useLocalSearchParams<{ id: string }>();
  const { durchgang, fall, speichereDurchgang, loescheDurchgang } = useStore();
  const d = durchgang(id);
  const f = d ? fall(d.fallId) : undefined;
  const insets = useSafeAreaInsets();

  const [werte, setWerte] = useState<Vitalwerte>(f?.vitalStart ?? NORMALWERTE);
  const { einstellungen } = useEinstellungen();
  const toene = useToene();
  const [verdeckt, setVerdeckt] = useState(einstellungen.messenModus);
  const [lageZeigen, setLageZeigen] = useState(false);
  const [jetzt, setJetzt] = useState(Date.now());
  const [reiter, setReiter] = useState<'monitor' | 'bewertung'>('monitor');
  /** Name der zuletzt abgegebenen Live-Bewertung (für die Bestätigung) */
  const [abgegeben, setAbgegeben] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    if (!abgegeben) return;
    const t = setTimeout(() => setAbgegeben(null), 4000);
    return () => clearTimeout(t);
  }, [abgegeben]);

  const laeuft = !!d && !d.ende;
  useEffect(() => {
    if (!laeuft) return;
    const t = setInterval(() => setJetzt(Date.now()), 500);
    return () => clearInterval(t);
  }, [laeuft]);

  // Zeitlimit aus den Einstellungen: einmal ein Signal, wenn es gerade erreicht wurde
  const limitMs = einstellungen.zeitlimit * 60000;
  const ueberzogen = !!d && laeuft && limitMs > 0 ? jetzt - d.start - limitMs : -1;
  const signalGegeben = useRef(false);
  useEffect(() => {
    if (ueberzogen >= 0 && ueberzogen < 5000 && !signalGegeben.current) {
      signalGegeben.current = true;
      toene.fertig();
    }
  }, [ueberzogen, toene]);

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

  const liveHatInhalt = liveAnzahl > 0 || !!live.notiz.trim();
  const liveName = live.name.trim() || `Live-Bewertung ${d.bewertungen.length + 1}`;
  const liveAlsBewertung = () => ({
    id: neueId(),
    name: `${liveName} (live)`,
    erledigt: live.erledigt,
    zeiten: live.zeiten,
    notiz: live.notiz.trim(),
    zeit: Date.now(),
  });

  /** Live-Bewertung speichern, die Übung läuft weiter; die Checkliste ist danach leer für die nächste Person */
  const liveAbgeben = () => {
    if (!liveHatInhalt) return;
    speichereDurchgang({ ...d, bewertungen: [...d.bewertungen, liveAlsBewertung()], live: undefined });
    setAbgegeben(liveName);
    // nach dem Neuzeichnen nach oben springen, damit die nächste Person oben anfängt
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), 50);
  };

  /** Beenden: Eine noch offene Live-Bewertung wird automatisch mitgespeichert */
  const beenden = () => {
    const neu: Durchgang = { ...d, ende: Date.now(), live: undefined };
    if (liveHatInhalt) neu.bewertungen = [...d.bewertungen, liveAlsBewertung()];
    speichereDurchgang(neu);
  };

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }}>
      <Stack.Screen options={{ title: d.team }} />

      <View style={[styles.timer, !laeuft && { backgroundColor: farben.timerBeendet }]}>
        <Text style={styles.timerLabel}>{laeuft ? 'LÄUFT' : 'BEENDET'}</Text>
        <Text style={styles.timerZeit}>{zeit}</Text>
        <Text style={styles.timerFall} numberOfLines={2}>
          {d.fallTitel}
        </Text>
      </View>

      {ueberzogen >= 0 && (
        <View style={styles.limit}>
          <Text style={styles.limitText}>⏰ Zeitlimit von {einstellungen.zeitlimit} Minuten erreicht</Text>
        </View>
      )}

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
                <Umschalter value={verdeckt} onValueChange={setVerdeckt} />
              </View>

              <VitalMonitor werte={werte} onChange={einstellungen.werteAendern ? setWerte : undefined} verdeckt={verdeckt} mitTon />

              {f && einstellungen.werteAendern && (
                <View style={styles.knoepfe}>
                  <Knopf titel="Ausgangswerte" art="sekundaer" onPress={() => setWerte(f.vitalStart)} stil={{ flex: 1 }} />
                  {f.vitalNachBehandlung && (
                    <Knopf titel="Nach Behandlung" art="tonal" onPress={() => setWerte(f.vitalNachBehandlung!)} stil={{ flex: 1 }} />
                  )}
                </View>
              )}
            </>
          ) : (
            <>
              {abgegeben && (
                <View style={styles.gespeichert}>
                  <Text style={styles.gespeichertText}>✓ Bewertung von {abgegeben} gespeichert – die Übung läuft weiter</Text>
                </View>
              )}
              <Absatz leise>
                Hake während der Übung ab, was die Helfer:innen machen. Die Zeit seit dem Start wird mitgespeichert. Mit „Bewertung
                abgeben“ speicherst du sie, ohne die Übung zu beenden – danach kann die nächste Person bewerten.
              </Absatz>
              {d.bewertungen.length > 0 && (
                <Text style={styles.bisher}>
                  Bisher abgegeben: {d.bewertungen.length} ({d.bewertungen.map((b) => b.name.replace(' (live)', '')).join(', ')})
                </Text>
              )}
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
              <Knopf
                titel={`✓ Bewertung abgeben (${liveAnzahl}/${d.checkliste.length})`}
                art="tonal"
                onPress={liveAbgeben}
                deaktiviert={!liveHatInhalt}
              />
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
            art="tonal"
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
  const styles = useStyles();
  return (
    <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: an }} style={[styles.reiterKnopf, an && styles.reiterAn]}>
      <Text style={[styles.reiterText, an && { color: '#fff' }]}>{text}</Text>
    </Pressable>
  );
}

const useStyles = macheStile((farben) => ({
  gespeichert: { backgroundColor: farben.gruen, borderRadius: 12, padding: abstand.m, marginBottom: abstand.m },
  gespeichertText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  bisher: { color: farben.textLeise, fontSize: 13, fontWeight: '700', marginTop: abstand.s },
  reiter: { flexDirection: 'row', backgroundColor: farben.karte, borderRadius: 14, padding: 4, gap: 4, marginBottom: abstand.m, ...kartenStil(farben) },
  reiterKnopf: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  reiterAn: { backgroundColor: farben.rot },
  reiterText: { fontSize: 14, fontWeight: '800', color: farben.text, textAlign: 'center' },
  timer: { backgroundColor: farben.rot, borderRadius: 22, padding: abstand.l, alignItems: 'center', marginBottom: abstand.m },
  timerLabel: { color: 'rgba(255,255,255,0.85)', fontWeight: '900', letterSpacing: 2, fontSize: 13 },
  timerZeit: { color: '#fff', fontSize: 56, fontWeight: '900', fontVariant: ['tabular-nums'] },
  timerFall: { color: '#fff', fontSize: 15, textAlign: 'center' },
  limit: { backgroundColor: farben.orange, borderRadius: 12, padding: abstand.m, marginBottom: abstand.m, alignItems: 'center' },
  limitText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  zeile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: abstand.m,
    backgroundColor: farben.karte,
    borderRadius: 16,
    padding: abstand.m,
    marginBottom: abstand.m,
    ...kartenStil(farben),
  },
  schalterTitel: { fontSize: 16, fontWeight: '800', color: farben.text },
  schalterText: { fontSize: 13, color: farben.textLeise },
  knoepfe: { flexDirection: 'row', gap: abstand.m },
  bewertung: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: farben.rand },
  bewertungName: { fontSize: 16, fontWeight: '600', color: farben.text },
  bewertungWert: { fontSize: 16, color: farben.textLeise, fontVariant: ['tabular-nums'] },
}));
