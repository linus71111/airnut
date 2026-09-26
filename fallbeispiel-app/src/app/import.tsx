import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Absatz, Eingabe, Karte, Knopf, SchwierigkeitBadge, Ueberschrift } from '../components/ui';
import { useStore } from '../lib/store';
import { codeZuFall } from '../lib/teilen';
import { THEMA_INFO } from '../lib/thema';
import type { Fallbeispiel } from '../lib/types';
import { abstand, macheStile, useFarben } from '../theme';

/** Übernimmt einen geteilten Fall – aus einem Link (?fall=…) oder einem eingefügten Code */
export default function ImportSeite() {
  const styles = useStyles();
  const farben = useFarben();
  const { fall: code } = useLocalSearchParams<{ fall?: string }>();
  const { speichereFall } = useStore();
  const insets = useSafeAreaInsets();
  const [eingabe, setEingabe] = useState('');
  const [ausEingabe, setAusEingabe] = useState<{ fall?: Fallbeispiel; fehler?: string } | null>(null);

  const ausLink = useMemo(() => {
    if (!code) return null;
    try {
      return { fall: codeZuFall(code) };
    } catch (e) {
      return { fehler: (e as Error).message };
    }
  }, [code]);

  const ergebnis = ausEingabe ?? ausLink;
  const f = ergebnis?.fall;

  const pruefen = () => {
    try {
      setAusEingabe({ fall: codeZuFall(eingabe) });
    } catch (e) {
      setAusEingabe({ fehler: (e as Error).message });
    }
  };

  const uebernehmen = () => {
    if (!f) return;
    speichereFall(f);
    router.replace(`/fall/${f.id}`);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: 'Fall übernehmen' }} />

      {f ? (
        <Karte stil={{ borderWidth: 2, borderColor: farben.rot }}>
          <Text style={styles.klein}>GETEILTES FALLBEISPIEL</Text>
          <Text style={styles.titel}>{f.titel}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: abstand.m }}>
            <SchwierigkeitBadge stufe={f.schwierigkeit} />
            <Text style={styles.klein}>
              {THEMA_INFO[f.thema ?? 'alltag'].icon} {THEMA_INFO[f.thema ?? 'alltag'].label} · {f.checkliste.length} Prüfpunkte
            </Text>
          </View>
          {f.kurz ? <Absatz>{f.kurz}</Absatz> : null}
          <Knopf titel="✓ Fall übernehmen" onPress={uebernehmen} stil={{ marginTop: abstand.m }} />
          <Text style={styles.hinweis}>Der Fall wird bei deinen eigenen Fällen gespeichert und kann danach bearbeitet werden.</Text>
        </Karte>
      ) : ergebnis?.fehler ? (
        <View style={[styles.fehler, { backgroundColor: farben.gefahr }]}>
          <Text style={styles.fehlerText}>⚠ {ergebnis.fehler}</Text>
        </View>
      ) : null}

      <Karte>
        <Ueberschrift>Link oder Code einfügen</Ueberschrift>
        <Absatz leise>Hast du einen Fall per Nachricht bekommen? Kopiere den ganzen Link hier hinein.</Absatz>
        <View style={{ marginTop: abstand.m }}>
          <Eingabe
            label="Link / Code"
            value={eingabe}
            onChangeText={(t) => {
              setEingabe(t);
              setAusEingabe(null);
            }}
            placeholder="https://…/import?fall=…"
            autoCapitalize="none"
            autoCorrect={false}
            multiline
          />
        </View>
        <Knopf titel="Prüfen" art="sekundaer" onPress={pruefen} deaktiviert={!eingabe.trim()} />
      </Karte>
    </ScrollView>
  );
}

const useStyles = macheStile((farben) => ({
  klein: { fontSize: 12, fontWeight: '800', color: farben.textLeise },
  titel: { fontSize: 22, fontWeight: '900', color: farben.text, marginVertical: abstand.s },
  hinweis: { fontSize: 13, color: farben.textLeise, marginTop: 6 },
  fehler: { borderRadius: 12, padding: abstand.m, marginBottom: abstand.m },
  fehlerText: { color: '#fff', fontWeight: '700', fontSize: 15 },
}));
