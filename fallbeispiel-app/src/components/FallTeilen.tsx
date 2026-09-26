import { useMemo, useState } from 'react';
import { Platform, Pressable, Share, Text, useWindowDimensions, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { fallZuLink } from '../lib/teilen';
import type { Fallbeispiel } from '../lib/types';
import { abstand, macheStile } from '../theme';
import { Absatz, Karte, Knopf, Ueberschrift } from './ui';

/** Eigenen Fall per QR-Code oder Link an andere Gruppen weitergeben */
export function FallTeilen({ fall }: { fall: Fallbeispiel }) {
  const styles = useStyles();
  const [offen, setOffen] = useState(false);
  const [kopiert, setKopiert] = useState(false);
  const [qrFehler, setQrFehler] = useState(false);
  const { width } = useWindowDimensions();
  const link = useMemo(() => (offen ? fallZuLink(fall) : ''), [offen, fall]);
  // Viel Inhalt = dichter QR-Code, deshalb möglichst groß anzeigen
  const groesse = Math.min(width - 2 * abstand.l - 2 * abstand.m - 16, 340);

  const senden = async () => {
    const nav = Platform.OS === 'web' ? (globalThis.navigator as Navigator | undefined) : undefined;
    if (Platform.OS !== 'web') {
      await Share.share({ message: `Fallbeispiel „${fall.titel}“ für die DLRG-Fallbeispiel-App:\n${link}` }).catch(() => {});
    } else if (nav?.share) {
      await nav.share({ title: fall.titel, text: `Fallbeispiel „${fall.titel}“`, url: link }).catch(() => {});
    }
  };

  const kopieren = async () => {
    try {
      await globalThis.navigator?.clipboard?.writeText(link);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2500);
    } catch {
      setKopiert(false);
    }
  };

  const kannSenden = Platform.OS !== 'web' || !!(globalThis.navigator as Navigator | undefined)?.share;

  return (
    <Karte>
      <Ueberschrift>🔗 Fall teilen</Ueberschrift>
      {!offen ? (
        <>
          <Absatz leise>Gib diesen Fall an eine andere Gruppe weiter – per QR-Code zum Scannen oder als Link in einer Nachricht.</Absatz>
          <Knopf titel="🔗 Teilen" art="tonal" onPress={() => setOffen(true)} stil={{ marginTop: abstand.m }} />
        </>
      ) : (
        <>
          <Absatz leise>Mit der Handy-Kamera scannen und den Link öffnen. Dort auf „Fall übernehmen“ tippen.</Absatz>
          {qrFehler ? (
            <Text style={styles.qrFehler}>Der Fall ist zu lang für einen QR-Code – bitte den Link verschicken.</Text>
          ) : (
            <View style={styles.qr} accessibilityLabel="QR-Code zum Fall">
              <QRCode value={link} size={groesse} ecl="L" quietZone={8} backgroundColor="#fff" color="#000" onError={() => setQrFehler(true)} />
            </View>
          )}
          <View style={{ gap: abstand.s, marginTop: abstand.m }}>
            {kannSenden && <Knopf titel="📤 Link senden" onPress={senden} />}
            {Platform.OS === 'web' && <Knopf titel={kopiert ? '✓ Kopiert' : '📋 Link kopieren'} art="sekundaer" onPress={kopieren} />}
          </View>
          <Pressable onPress={() => setOffen(false)} hitSlop={8} style={{ marginTop: abstand.m, alignSelf: 'center' }}>
            <Text style={styles.schliessen}>Schließen</Text>
          </Pressable>
        </>
      )}
    </Karte>
  );
}

const useStyles = macheStile((farben) => ({
  qr: { alignSelf: 'center', backgroundColor: '#fff', padding: 8, borderRadius: 12, marginTop: abstand.m },
  qrFehler: { color: farben.fehler, fontWeight: '700', marginTop: abstand.m },
  schliessen: { color: farben.rot, fontWeight: '800', fontSize: 15 },
}));
