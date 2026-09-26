import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { QUALIFIKATION_INFO, QUALIFIKATIONEN } from '../lib/qualifikation';
import { neueId } from '../lib/score';
import { useStore } from '../lib/store';
import type { Qualifikation } from '../lib/types';
import { abstand, macheStile } from '../theme';
import { Badge, Eingabe, Knopf } from './ui';

/** Formular für eine neue Person: Name und Ausbildung sind Pflicht */
export function PersonAnlegen({ onAngelegt }: { onAngelegt?: (personId: string) => void }) {
  const styles = useStyles();
  const { speicherePerson } = useStore();
  const [name, setName] = useState('');
  const [qualifikation, setQualifikation] = useState<Qualifikation | null>(null);

  const fertig = !!name.trim() && !!qualifikation;

  const anlegen = () => {
    if (!fertig) return;
    const id = neueId();
    speicherePerson({ id, name: name.trim(), qualifikation, notiz: '', erstellt: Date.now() });
    setName('');
    setQualifikation(null);
    onAngelegt?.(id);
  };

  return (
    <View>
      <Eingabe label="Neue Person" value={name} onChangeText={setName} placeholder="Vor- und Nachname" />
      <Text style={styles.label}>Ausbildung *</Text>
      <QualifikationWahl wert={qualifikation} onWahl={setQualifikation} />
      {!!name.trim() && !qualifikation && <Text style={styles.hinweis}>Bitte die Ausbildung auswählen.</Text>}
      <Knopf titel="+ Person hinzufügen" onPress={anlegen} deaktiviert={!fertig} stil={{ marginTop: abstand.m }} />
    </View>
  );
}

/** Auswahl der Ausbildung (Erste-Hilfe-Kurs, San A, San B, Rettungssanitäter) */
export function QualifikationWahl({ wert, onWahl }: { wert: Qualifikation | null | undefined; onWahl: (q: Qualifikation) => void }) {
  const styles = useStyles();
  return (
    <View style={styles.chips}>
      {QUALIFIKATIONEN.map((q) => {
        const an = wert === q;
        const farbe = QUALIFIKATION_INFO[q].farbe;
        return (
          <Pressable
            key={q}
            accessibilityRole="radio"
            accessibilityState={{ selected: an }}
            onPress={() => onWahl(q)}
            style={({ pressed }) => [styles.chip, an && { backgroundColor: farbe, borderColor: farbe }, pressed && { opacity: 0.8 }]}>
            <Text style={[styles.chipText, an && { color: '#fff' }]}>{QUALIFIKATION_INFO[q].label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function QualifikationBadge({ wert }: { wert?: Qualifikation }) {
  if (!wert) return null;
  return <Badge text={QUALIFIKATION_INFO[wert].kurz.toUpperCase()} farbe={QUALIFIKATION_INFO[wert].farbe} />;
}

const useStyles = macheStile((farben) => ({
  label: { fontSize: 12, fontWeight: '700', color: farben.textLeise, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderColor: farben.rand,
    backgroundColor: farben.eingabe,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: { fontSize: 14, fontWeight: '700', color: farben.text },
  hinweis: { color: farben.orange, fontSize: 13, fontWeight: '700', marginTop: abstand.s },
}));
