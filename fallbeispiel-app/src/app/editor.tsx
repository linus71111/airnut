import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Absatz, Eingabe, Karte, Knopf, Ueberschrift } from '../components/ui';
import { neueId } from '../lib/score';
import { useStore } from '../lib/store';
import type { CheckItem, Fallbeispiel, Kategorie, Vitalwerte } from '../lib/types';
import { BEWUSSTSEIN_STUFEN, NORMALWERTE, VITAL_DEFS } from '../lib/vitals';
import { abstand, farben } from '../theme';

const KATEGORIEN: Kategorie[] = ['Eigenschutz', 'Erstkontakt', 'Notruf', 'Maßnahmen', 'Betreuung', 'Übergabe'];

const LEERER_FALL: Fallbeispiel = {
  id: '',
  titel: '',
  kurz: '',
  lage: '',
  mimeAnleitung: '',
  requisiten: '',
  vitalStart: NORMALWERTE,
  checkliste: [
    { id: 'n1', text: 'Eigenschutz beachtet (Handschuhe, Gefahren erkannt)', kategorie: 'Eigenschutz', punkte: 2, kritisch: true },
    { id: 'n2', text: 'Person angesprochen und sich vorgestellt', kategorie: 'Erstkontakt', punkte: 1 },
    { id: 'n3', text: 'Notruf 112 abgesetzt', kategorie: 'Notruf', punkte: 2, kritisch: true },
    { id: 'n4', text: 'Betroffene Person betreut und beruhigt', kategorie: 'Betreuung', punkte: 1 },
  ],
};

export default function Editor() {
  const { id, vorlage } = useLocalSearchParams<{ id?: string; vorlage?: string }>();
  const { fall, speichereFall } = useStore();
  const insets = useSafeAreaInsets();

  const [f, setF] = useState<Fallbeispiel>(() => {
    const basis = (id && fall(id)) || (vorlage && fall(vorlage));
    if (!basis) return { ...LEERER_FALL, id: neueId() };
    if (id) return basis;
    // Kopie einer Vorlage: neue IDs, damit das Original unverändert bleibt
    return { ...basis, id: neueId(), titel: `${basis.titel} (Kopie)`, eigenes: true };
  });

  const setze = <K extends keyof Fallbeispiel>(k: K, v: Fallbeispiel[K]) => setF((alt) => ({ ...alt, [k]: v }));
  const setzePunkt = (i: number, aenderung: Partial<CheckItem>) =>
    setze(
      'checkliste',
      f.checkliste.map((c, j) => (j === i ? { ...c, ...aenderung } : c)),
    );

  const fehler = !f.titel.trim() ? 'Bitte einen Titel eingeben.' : f.checkliste.length === 0 ? 'Mindestens ein Prüfpunkt nötig.' : null;

  const speichern = () => {
    if (fehler) return;
    speichereFall({ ...f, checkliste: f.checkliste.filter((c) => c.text.trim()) });
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: id ? 'Fall bearbeiten' : 'Neuer Fall' }} />

      <Karte>
        <Eingabe label="Titel *" value={f.titel} onChangeText={(t) => setze('titel', t)} placeholder="z.B. Bienenstich im Hals" />
        <Eingabe label="Kurzbeschreibung" value={f.kurz} onChangeText={(t) => setze('kurz', t)} />
        <Eingabe label="Lage (wird vorgelesen)" value={f.lage} onChangeText={(t) => setze('lage', t)} multiline />
        <Eingabe label="Anleitung für die Mime" value={f.mimeAnleitung} onChangeText={(t) => setze('mimeAnleitung', t)} multiline />
        <Eingabe label="Schminke & Requisiten" value={f.requisiten ?? ''} onChangeText={(t) => setze('requisiten', t)} multiline />
      </Karte>

      <Karte>
        <Ueberschrift>Vitalwerte zu Beginn</Ueberschrift>
        <VitalEditor werte={f.vitalStart} onChange={(w) => setze('vitalStart', w)} />
      </Karte>

      <Karte>
        <View style={styles.zeile}>
          <Ueberschrift>Werte nach Behandlung</Ueberschrift>
          <Switch
            value={!!f.vitalNachBehandlung}
            onValueChange={(an) => setze('vitalNachBehandlung', an ? { ...f.vitalStart } : undefined)}
            trackColor={{ true: farben.rot }}
          />
        </View>
        {f.vitalNachBehandlung ? (
          <VitalEditor werte={f.vitalNachBehandlung} onChange={(w) => setze('vitalNachBehandlung', w)} />
        ) : (
          <Absatz leise>Optional: Werte, auf die die Spielleitung bei richtiger Versorgung umschalten kann.</Absatz>
        )}
      </Karte>

      <Ueberschrift>Checkliste</Ueberschrift>
      {f.checkliste.map((c, i) => (
        <Karte key={c.id}>
          <TextInput
            value={c.text}
            onChangeText={(t) => setzePunkt(i, { text: t })}
            placeholder="Was soll gemacht werden?"
            placeholderTextColor="#999"
            multiline
            style={styles.punktEingabe}
          />
          <View style={styles.chips}>
            {KATEGORIEN.map((k) => (
              <Chip key={k} text={k} an={c.kategorie === k} onPress={() => setzePunkt(i, { kategorie: k })} />
            ))}
          </View>
          <View style={[styles.zeile, { marginTop: abstand.s }]}>
            <View style={styles.chips}>
              {[1, 2, 3].map((p) => (
                <Chip key={p} text={`${p} P`} an={c.punkte === p} onPress={() => setzePunkt(i, { punkte: p })} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.klein}>Wichtig</Text>
              <Switch value={!!c.kritisch} onValueChange={(v) => setzePunkt(i, { kritisch: v || undefined })} trackColor={{ true: farben.rot }} />
            </View>
          </View>
          <Pressable onPress={() => setze('checkliste', f.checkliste.filter((_, j) => j !== i))} style={{ marginTop: abstand.s }}>
            <Text style={styles.entfernen}>Punkt entfernen</Text>
          </Pressable>
        </Karte>
      ))}
      <Knopf
        titel="+ Prüfpunkt hinzufügen"
        art="sekundaer"
        onPress={() => setze('checkliste', [...f.checkliste, { id: neueId(), text: '', kategorie: 'Maßnahmen', punkte: 1 }])}
      />

      {fehler && <Text style={styles.fehler}>{fehler}</Text>}
      <Knopf titel="Speichern" onPress={speichern} deaktiviert={!!fehler} stil={{ marginTop: abstand.l }} />
    </ScrollView>
  );
}

function VitalEditor({ werte, onChange }: { werte: Vitalwerte; onChange: (w: Vitalwerte) => void }) {
  return (
    <View>
      <View style={styles.raster}>
        {VITAL_DEFS.map((def) => (
          <View key={def.key} style={styles.feld}>
            <Text style={styles.klein}>
              {def.label} ({def.einheit})
            </Text>
            <ZahlFeld wert={werte[def.key]} onWert={(v) => onChange({ ...werte, [def.key]: v })} />
          </View>
        ))}
      </View>
      <Text style={[styles.klein, { marginTop: abstand.s }]}>Bewusstsein</Text>
      <View style={styles.chips}>
        {BEWUSSTSEIN_STUFEN.map((b) => (
          <Chip key={b} text={b} an={werte.bewusstsein === b} onPress={() => onChange({ ...werte, bewusstsein: b })} />
        ))}
      </View>
      <View style={{ marginTop: abstand.m }}>
        <Eingabe label="Haut" value={werte.haut} onChangeText={(t) => onChange({ ...werte, haut: t })} />
        <Eingabe label="Pupillen" value={werte.pupillen} onChangeText={(t) => onChange({ ...werte, pupillen: t })} />
      </View>
    </View>
  );
}

/** Zahleneingabe, die auch Komma akzeptiert und Zwischenstände wie "36," erlaubt */
function ZahlFeld({ wert, onWert }: { wert: number; onWert: (v: number) => void }) {
  const [text, setText] = useState(String(wert).replace('.', ','));
  return (
    <TextInput
      value={text}
      keyboardType="decimal-pad"
      onChangeText={(t) => {
        setText(t);
        const zahl = parseFloat(t.replace(',', '.'));
        if (Number.isFinite(zahl)) onWert(zahl);
      }}
      style={styles.zahl}
    />
  );
}

function Chip({ text, an, onPress }: { text: string; an: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, an && { backgroundColor: farben.rot, borderColor: farben.rot }]}>
      <Text style={[styles.chipText, an && { color: '#fff' }]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  zeile: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: abstand.s },
  raster: { flexDirection: 'row', flexWrap: 'wrap', gap: abstand.m },
  feld: { flexBasis: '45%', flexGrow: 1 },
  klein: { fontSize: 12, fontWeight: '700', color: farben.textLeise },
  zahl: {
    borderWidth: 1,
    borderColor: farben.rand,
    borderRadius: 10,
    padding: 10,
    fontSize: 18,
    fontWeight: '700',
    color: farben.text,
    backgroundColor: '#fff',
    marginTop: 4,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chip: { borderWidth: 1, borderColor: farben.rand, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#fff' },
  chipText: { fontSize: 13, color: farben.text, fontWeight: '600' },
  punktEingabe: { fontSize: 16, color: farben.text, borderBottomWidth: 1, borderBottomColor: farben.rand, paddingVertical: 6 },
  entfernen: { color: '#C62828', fontWeight: '700' },
  fehler: { color: '#C62828', marginTop: abstand.m, fontWeight: '700' },
});
