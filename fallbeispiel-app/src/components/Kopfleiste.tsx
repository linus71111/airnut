import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '../lib/store';
import { oeffneZufallsFall } from '../lib/zufall';
import { macheStile, useFarben } from '../theme';

/** Gut sichtbarer Zurück-Knopf. Ohne Vorgänger (z.B. nach Neuladen im Browser) geht es zur Startseite. */
export function ZurueckKnopf() {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Zurück"
      hitSlop={10}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={({ pressed }) => [styles.kopfKnopf, pressed && { opacity: 0.6 }]}>
      <Text style={styles.zurueck}>‹ Zurück</Text>
    </Pressable>
  );
}

/** Burger-Menü (☰) mit allen Bereichen und den Akten der Helfer:innen */
export function MenueKnopf() {
  const styles = useStyles();
  const [offen, setOffen] = useState(false);
  const { personen, faelle } = useStore();
  const insets = useSafeAreaInsets();

  const gehe = (ziel: Href) => {
    setOffen(false);
    router.navigate(ziel);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Menü öffnen"
        hitSlop={10}
        onPress={() => setOffen(true)}
        style={({ pressed }) => [styles.kopfKnopf, pressed && { opacity: 0.6 }]}>
        <Text style={styles.burger}>☰</Text>
      </Pressable>

      <Modal visible={offen} transparent animationType="fade" onRequestClose={() => setOffen(false)}>
        <Pressable style={styles.hintergrund} onPress={() => setOffen(false)} accessibilityLabel="Menü schließen">
          <Pressable style={[styles.panel, { marginTop: insets.top + 8 }]} onPress={() => {}}>
            <View style={styles.panelKopf}>
              <Text style={styles.panelTitel}>Menü</Text>
              <Pressable onPress={() => setOffen(false)} hitSlop={10} accessibilityLabel="Menü schließen">
                <Text style={styles.schliessen}>✕</Text>
              </Pressable>
            </View>
            <ScrollView>
              <Eintrag text="🏠  Fallbeispiele" onPress={() => gehe('/')} />
              <Eintrag text="📖  Anleitung" onPress={() => gehe('/anleitung')} />
              <Eintrag text="📋  Einsatz-Historie" onPress={() => gehe('/verlauf')} />
              <Eintrag
                text="🎲  Zufallsfall"
                onPress={() => {
                  setOffen(false);
                  oeffneZufallsFall(faelle);
                }}
              />
              <Eintrag text="➕  Eigener Fall" onPress={() => gehe('/editor')} />
              <Eintrag text="⚙️  Einstellungen" onPress={() => gehe('/einstellungen')} />

              <Text style={styles.abschnitt}>Akten</Text>
              <Eintrag text="👥  Alle Helfer:innen" onPress={() => gehe('/personen')} />
              {personen.map((p) => (
                <Eintrag key={p.id} text={`📁  ${p.name}`} onPress={() => gehe(`/personen/${p.id}`)} eingerueckt />
              ))}
              {personen.length === 0 && <Text style={styles.leer}>Noch keine Personen angelegt.</Text>}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function Eintrag({ text, onPress, eingerueckt }: { text: string; onPress: () => void; eingerueckt?: boolean }) {
  const styles = useStyles();
  const farben = useFarben();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.eintrag, eingerueckt && { paddingLeft: 28 }, pressed && { backgroundColor: farben.gedrueckt }]}>
      <Text style={[styles.eintragText, eingerueckt && { fontSize: 15, fontWeight: '600' }]}>{text}</Text>
    </Pressable>
  );
}

const useStyles = macheStile((farben) => ({
  kopfKnopf: { paddingHorizontal: 8, paddingVertical: 4 },
  zurueck: { color: '#fff', fontSize: 17, fontWeight: '700' },
  burger: { color: '#fff', fontSize: 26, fontWeight: '700' },
  hintergrund: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'flex-end' },
  panel: {
    backgroundColor: farben.karte,
    width: '82%',
    maxWidth: 340,
    maxHeight: '85%',
    marginRight: 8,
    borderRadius: 16,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  panelKopf: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: farben.rot,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  panelTitel: { color: '#fff', fontSize: 18, fontWeight: '900' },
  schliessen: { color: '#fff', fontSize: 20, fontWeight: '800' },
  abschnitt: {
    fontSize: 12,
    fontWeight: '800',
    color: farben.rot,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  eintrag: { paddingHorizontal: 16, paddingVertical: 12 },
  eintragText: { fontSize: 16, fontWeight: '700', color: farben.text },
  leer: { paddingHorizontal: 28, paddingVertical: 8, color: farben.textLeise },
}));
