import { Text, View } from 'react-native';

import { dauer } from '../lib/score';
import { useToene } from '../lib/toene';
import type { CheckItem } from '../lib/types';
import { macheStile } from '../theme';
import { Badge, Checkbox, Karte } from './ui';

type Props = {
  checkliste: CheckItem[];
  erledigt: Record<string, boolean>;
  onUmschalten: (itemId: string) => void;
  /** Wann ein Punkt abgehakt wurde (ms seit Start) – wird neben dem Punkt angezeigt */
  zeiten?: Record<string, number>;
};

/** Checkliste zum Abhaken, nach Kategorien gruppiert */
export function ChecklistEingabe({ checkliste, erledigt, onUmschalten, zeiten }: Props) {
  const styles = useStyles();
  const toene = useToene();
  const kategorien = [...new Set(checkliste.map((c) => c.kategorie))];

  const umschalten = (id: string) => {
    toene.abhaken();
    onUmschalten(id);
  };

  return (
    <>
      {kategorien.map((k) => (
        <Karte key={k}>
          <Text style={styles.kategorie}>{k}</Text>
          {checkliste
            .filter((c) => c.kategorie === k)
            .map((c) => (
              <Checkbox
                key={c.id}
                an={!!erledigt[c.id]}
                onPress={() => umschalten(c.id)}
                text={c.text}
                unterText={
                  <View style={styles.badges}>
                    {c.kritisch && <Badge text="WICHTIG" />}
                    <Badge text={`${c.punkte} P`} farbe="#5F6368" />
                    {erledigt[c.id] && zeiten?.[c.id] !== undefined && (
                      <Text style={styles.zeit}>⏱ nach {dauer(zeiten[c.id])}</Text>
                    )}
                  </View>
                }
              />
            ))}
        </Karte>
      ))}
    </>
  );
}

const useStyles = macheStile((farben) => ({
  kategorie: { fontSize: 13, fontWeight: '800', color: farben.rot, textTransform: 'uppercase' },
  badges: { flexDirection: 'row', gap: 4, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' },
  zeit: { fontSize: 12, color: farben.gruen, fontWeight: '800', marginLeft: 4 },
}));
