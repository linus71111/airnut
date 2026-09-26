import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Absatz, Karte, Knopf, Ueberschrift } from '../components/ui';
import { erstelleSicherung, exportiereSicherung, waehleSicherung, type Sicherung } from '../lib/sicherung';
import { useStore } from '../lib/store';
import { abstand, macheStile, useFarben } from '../theme';

type Meldung = { art: 'ok' | 'fehler'; text: string } | null;

export default function DatenSeite() {
  const styles = useStyles();
  const farben = useFarben();
  const { eigeneFaelle, durchgaenge, personen, importiere } = useStore();
  const insets = useSafeAreaInsets();
  const [meldung, setMeldung] = useState<Meldung>(null);
  const [geladen, setGeladen] = useState<Sicherung | null>(null);
  const [beschaeftigt, setBeschaeftigt] = useState(false);

  const sichern = async () => {
    setMeldung(null);
    setBeschaeftigt(true);
    try {
      await exportiereSicherung(erstelleSicherung({ eigeneFaelle, durchgaenge, personen }));
      setMeldung({ art: 'ok', text: 'Sicherung erstellt. Bewahre die Datei gut auf (z.B. in „Dateien“ oder per Messenger an dich selbst).' });
    } catch (e) {
      setMeldung({ art: 'fehler', text: (e as Error).message || 'Sicherung fehlgeschlagen.' });
    } finally {
      setBeschaeftigt(false);
    }
  };

  const oeffnen = async () => {
    setMeldung(null);
    try {
      const s = await waehleSicherung();
      if (s) setGeladen(s);
    } catch (e) {
      setMeldung({ art: 'fehler', text: (e as Error).message || 'Die Datei konnte nicht gelesen werden.' });
    }
  };

  const einspielen = (modus: 'zusammenfuehren' | 'ersetzen') => {
    if (!geladen) return;
    const r = importiere(geladen, modus);
    setGeladen(null);
    setMeldung({
      art: 'ok',
      text: `Eingespielt: ${r.faelle} eigene Fälle, ${r.einsaetze} Einsätze, ${r.personen} Personen${
        modus === 'ersetzen' ? ' (alte Daten ersetzt)' : ''
      }.`,
    });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: abstand.l, paddingBottom: insets.bottom + 40 }}>
      <Stack.Screen options={{ title: 'Sicherung' }} />

      <Absatz leise>
        Alle Daten liegen nur auf diesem Gerät. Mit einer Sicherung kannst du sie auf ein neues Handy umziehen oder an eine andere
        Gruppenleitung weitergeben.
      </Absatz>

      <Karte stil={{ marginTop: abstand.m }}>
        <Ueberschrift>💾 Sicherung erstellen</Ueberschrift>
        <View style={styles.zahlen}>
          <Zahl wert={durchgaenge.length} text="Einsätze" />
          <Zahl wert={personen.length} text="Personen" />
          <Zahl wert={eigeneFaelle.length} text="eigene Fälle" />
        </View>
        <Absatz leise>Alles landet in einer einzigen Datei (.json), die du speichern oder verschicken kannst.</Absatz>
        <Knopf titel={beschaeftigt ? 'Einen Moment …' : '💾 Sicherung speichern / teilen'} onPress={sichern} deaktiviert={beschaeftigt} stil={{ marginTop: abstand.m }} />
      </Karte>

      <Karte>
        <Ueberschrift>📥 Sicherung einspielen</Ueberschrift>
        {geladen ? (
          <>
            <View style={[styles.vorschau, { backgroundColor: farben.tonal }]}>
              <Text style={styles.vorschauTitel}>Datei geladen</Text>
              {geladen.erstellt > 0 && (
                <Text style={styles.vorschauText}>Erstellt am {new Date(geladen.erstellt).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}</Text>
              )}
              <Text style={styles.vorschauText}>
                {geladen.durchgaenge.length} Einsätze · {geladen.personen.length} Personen · {geladen.eigeneFaelle.length} eigene Fälle
              </Text>
            </View>
            <Knopf titel="➕ Zu meinen Daten hinzufügen" onPress={() => einspielen('zusammenfuehren')} />
            <Text style={styles.erklaerung}>Empfohlen: Deine Daten bleiben, Neues kommt dazu. Gleiche Einträge werden aktualisiert.</Text>
            <Knopf titel="Alles ersetzen" art="gefahr" onPress={() => einspielen('ersetzen')} stil={{ marginTop: abstand.m }} />
            <Text style={styles.erklaerung}>Löscht alle Einsätze, Personen und eigenen Fälle auf diesem Gerät und übernimmt die aus der Datei.</Text>
            <Pressable onPress={() => setGeladen(null)} hitSlop={8} style={{ marginTop: abstand.m, alignSelf: 'center' }}>
              <Text style={styles.abbrechen}>Abbrechen</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Absatz leise>Wähle eine Sicherungsdatei aus. Du siehst erst, was drin ist, bevor etwas übernommen wird.</Absatz>
            <Knopf titel="📂 Datei auswählen" art="sekundaer" onPress={oeffnen} stil={{ marginTop: abstand.m }} />
          </>
        )}
      </Karte>

      {meldung && (
        <View style={[styles.meldung, { backgroundColor: meldung.art === 'ok' ? farben.gruen : farben.gefahr }]}>
          <Text style={styles.meldungText}>
            {meldung.art === 'ok' ? '✓ ' : '⚠ '}
            {meldung.text}
          </Text>
        </View>
      )}

      <Karte>
        <Ueberschrift>🔗 Einzelnen Fall teilen</Ueberschrift>
        <Absatz leise>
          Eigene Fälle kannst du auch einzeln per Link oder QR-Code weitergeben: Fall öffnen → „Teilen“. Einen erhaltenen Link oder Code
          kannst du hier einfügen.
        </Absatz>
        <Knopf titel="Link oder Code einfügen" art="tonal" onPress={() => router.push('/import')} stil={{ marginTop: abstand.m }} />
      </Karte>
    </ScrollView>
  );
}

function Zahl({ wert, text }: { wert: number; text: string }) {
  const styles = useStyles();
  return (
    <View style={styles.zahl}>
      <Text style={styles.zahlWert}>{wert}</Text>
      <Text style={styles.zahlText}>{text}</Text>
    </View>
  );
}

const useStyles = macheStile((farben) => ({
  zahlen: { flexDirection: 'row', gap: abstand.s, marginVertical: abstand.s },
  zahl: { flex: 1, alignItems: 'center', backgroundColor: farben.eingabe, borderRadius: 12, paddingVertical: 10 },
  zahlWert: { fontSize: 22, fontWeight: '900', color: farben.text },
  zahlText: { fontSize: 12, fontWeight: '700', color: farben.textLeise },
  vorschau: { borderRadius: 12, padding: abstand.m, marginVertical: abstand.m },
  vorschauTitel: { fontSize: 16, fontWeight: '800', color: farben.text },
  vorschauText: { fontSize: 14, color: farben.text, marginTop: 2 },
  erklaerung: { fontSize: 13, color: farben.textLeise, marginTop: 6 },
  abbrechen: { color: farben.rot, fontWeight: '800', fontSize: 15 },
  meldung: { borderRadius: 12, padding: abstand.m, marginBottom: abstand.m },
  meldungText: { color: '#fff', fontWeight: '700', fontSize: 15, lineHeight: 21 },
}));
