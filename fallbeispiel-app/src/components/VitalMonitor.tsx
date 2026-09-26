import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Vitalwerte } from '../lib/types';
import { aendern, BEWUSSTSEIN_STUFEN, formatWert, istAuffaellig, VITAL_DEFS, type VitalDef } from '../lib/vitals';
import { farben } from '../theme';

type Props = {
  werte: Vitalwerte;
  /** Wenn gesetzt, können die Werte mit +/– verändert werden (Spielleitung) */
  onChange?: (w: Vitalwerte) => void;
  /** Messen-Modus: Werte sind verdeckt, bis die Helfer:innen sie "messen" (antippen) */
  verdeckt?: boolean;
};

export function VitalMonitor({ werte, onChange, verdeckt }: Props) {
  const [aufgedeckt, setAufgedeckt] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!verdeckt) setAufgedeckt({});
  }, [verdeckt]);

  const sichtbar = (key: string) => !verdeckt || aufgedeckt[key];
  const aufdecken = (key: string) => setAufgedeckt((a) => ({ ...a, [key]: !a[key] }));

  const bewusstseinIndex = BEWUSSTSEIN_STUFEN.indexOf(werte.bewusstsein);

  return (
    <View style={styles.monitor}>
      <Herzschlag puls={werte.puls} />
      <View style={styles.raster}>
        {VITAL_DEFS.map((def) => (
          <Kachel
            key={def.key}
            def={def}
            wert={werte[def.key]}
            sichtbar={sichtbar(def.key)}
            onTap={verdeckt ? () => aufdecken(def.key) : undefined}
            onPlus={onChange ? () => onChange(aendern(werte, def.key, def.schritt)) : undefined}
            onMinus={onChange ? () => onChange(aendern(werte, def.key, -def.schritt)) : undefined}
          />
        ))}
      </View>

      <Pressable style={styles.textKachel} onPress={verdeckt ? () => aufdecken('bewusstsein') : undefined}>
        <Text style={styles.textLabel}>Bewusstsein</Text>
        {sichtbar('bewusstsein') ? (
          <Text style={[styles.textWert, werte.bewusstsein !== 'wach' && { color: '#FF5252' }]}>{werte.bewusstsein}</Text>
        ) : (
          <Text style={styles.verdeckt}>Tippen zum Prüfen</Text>
        )}
        {onChange && (
          <View style={styles.reihe}>
            <MiniKnopf
              text="besser"
              onPress={() => onChange({ ...werte, bewusstsein: BEWUSSTSEIN_STUFEN[Math.max(0, bewusstseinIndex - 1)] })}
            />
            <MiniKnopf
              text="schlechter"
              onPress={() =>
                onChange({ ...werte, bewusstsein: BEWUSSTSEIN_STUFEN[Math.min(BEWUSSTSEIN_STUFEN.length - 1, bewusstseinIndex + 1)] })
              }
            />
          </View>
        )}
      </Pressable>

      <Pressable style={styles.textKachel} onPress={verdeckt ? () => aufdecken('haut') : undefined}>
        <Text style={styles.textLabel}>Haut</Text>
        {sichtbar('haut') ? <Text style={styles.textWert}>{werte.haut}</Text> : <Text style={styles.verdeckt}>Tippen zum Ansehen</Text>}
      </Pressable>
      <Pressable style={styles.textKachel} onPress={verdeckt ? () => aufdecken('pupillen') : undefined}>
        <Text style={styles.textLabel}>Pupillen</Text>
        {sichtbar('pupillen') ? (
          <Text style={styles.textWert}>{werte.pupillen}</Text>
        ) : (
          <Text style={styles.verdeckt}>Tippen zum Prüfen</Text>
        )}
      </Pressable>
    </View>
  );
}

function Kachel({
  def,
  wert,
  sichtbar,
  onTap,
  onPlus,
  onMinus,
}: {
  def: VitalDef;
  wert: number;
  sichtbar: boolean;
  onTap?: () => void;
  onPlus?: () => void;
  onMinus?: () => void;
}) {
  const alarm = istAuffaellig(def, wert);
  return (
    <Pressable onPress={onTap} style={[styles.kachel, sichtbar && alarm && styles.kachelAlarm]}>
      <Text style={[styles.kachelLabel, { color: def.farbe }]}>
        {def.kurz} <Text style={styles.einheit}>{def.einheit}</Text>
      </Text>
      {sichtbar ? (
        <Text style={[styles.kachelWert, { color: alarm ? '#FF5252' : def.farbe }]}>{formatWert(def, wert)}</Text>
      ) : (
        <Text style={styles.verdeckt}>Tippen zum Messen</Text>
      )}
      {onPlus && onMinus && (
        <View style={styles.reihe}>
          <MiniKnopf text="–" onPress={onMinus} />
          <MiniKnopf text="+" onPress={onPlus} />
        </View>
      )}
    </Pressable>
  );
}

function MiniKnopf({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} style={({ pressed }) => [styles.mini, pressed && { backgroundColor: '#33404F' }]}>
      <Text style={styles.miniText}>{text}</Text>
    </Pressable>
  );
}

/** Kleine pulsierende Herz-Anzeige im Takt des Pulses */
function Herzschlag({ puls }: { puls: number }) {
  const skala = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (puls <= 0) {
      skala.setValue(1);
      return;
    }
    const intervall = 60000 / puls;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(skala, { toValue: 1.3, duration: Math.min(120, intervall / 3), useNativeDriver: true }),
        Animated.timing(skala, { toValue: 1, duration: Math.min(200, intervall / 3), useNativeDriver: true }),
        Animated.delay(Math.max(0, intervall - Math.min(120, intervall / 3) - Math.min(200, intervall / 3))),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [puls, skala]);

  return (
    <View style={styles.kopf}>
      <Animated.Text style={[styles.herz, { transform: [{ scale: skala }] }, puls <= 0 && { color: '#555' }]}>♥</Animated.Text>
      <Text style={styles.kopfText}>{puls <= 0 ? 'KEIN PULS' : 'Patientenmonitor'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  monitor: { backgroundColor: farben.monitor, borderRadius: 16, padding: 10, marginBottom: 12 },
  kopf: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6, paddingBottom: 6 },
  herz: { color: '#FF5252', fontSize: 22 },
  kopfText: { color: '#9AA5B1', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  raster: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kachel: {
    backgroundColor: farben.monitorKarte,
    borderRadius: 12,
    padding: 10,
    flexGrow: 1,
    flexBasis: '46%',
    minHeight: 92,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  kachelAlarm: { borderColor: '#FF5252' },
  kachelLabel: { fontSize: 13, fontWeight: '800' },
  einheit: { fontSize: 11, fontWeight: '400', color: '#9AA5B1' },
  kachelWert: { fontSize: 38, fontWeight: '800', fontVariant: ['tabular-nums'] },
  verdeckt: { color: '#6B7785', fontSize: 14, fontStyle: 'italic', paddingVertical: 12 },
  reihe: { flexDirection: 'row', gap: 8, marginTop: 6 },
  mini: { backgroundColor: '#24303D', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, minWidth: 44, alignItems: 'center' },
  miniText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  textKachel: { backgroundColor: farben.monitorKarte, borderRadius: 12, padding: 10, marginTop: 8 },
  textLabel: { color: '#9AA5B1', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  textWert: { color: '#E8EDF2', fontSize: 17, fontWeight: '600', marginTop: 2 },
});
