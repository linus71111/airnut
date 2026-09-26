import type { ReactNode } from 'react';
import { Pressable, Switch, Text, TextInput, View, type SwitchProps, type TextInputProps, type ViewStyle } from 'react-native';

import { SCHWIERIGKEIT_INFO } from '../lib/schwierigkeit';
import type { Schwierigkeit } from '../lib/types';
import { abstand, kartenStil, macheStile, useFarben } from '../theme';

type ButtonArt = 'primaer' | 'sekundaer' | 'gefahr' | 'tonal';

export function Knopf({
  titel,
  onPress,
  art = 'primaer',
  deaktiviert,
  stil,
}: {
  titel: string;
  onPress: () => void;
  art?: ButtonArt;
  deaktiviert?: boolean;
  stil?: ViewStyle;
}) {
  const styles = useStyles();
  const farben = useFarben();
  const hg = { primaer: farben.rot, sekundaer: farben.karte, gefahr: farben.gefahr, tonal: farben.tonal }[art];
  const fg = art === 'sekundaer' || art === 'tonal' ? farben.rot : '#fff';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={deaktiviert}
      onPress={onPress}
      style={({ pressed }) => [
        styles.knopf,
        { backgroundColor: hg, opacity: deaktiviert ? 0.4 : 1 },
        pressed && !deaktiviert && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        art === 'sekundaer' && { borderWidth: 1.5, borderColor: farben.rot },
        stil,
      ]}>
      <Text style={[styles.knopfText, { color: fg }]}>{titel}</Text>
    </Pressable>
  );
}

export function Karte({ children, stil }: { children: ReactNode; stil?: ViewStyle }) {
  const styles = useStyles();
  return <View style={[styles.karte, stil]}>{children}</View>;
}

export function Ueberschrift({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.ueberschrift}>{children}</Text>;
}

export function Absatz({ children, leise }: { children: ReactNode; leise?: boolean }) {
  const styles = useStyles();
  const farben = useFarben();
  return <Text style={[styles.absatz, leise && { color: farben.textLeise }]}>{children}</Text>;
}

export function Eingabe({ label, ...props }: TextInputProps & { label: string }) {
  const styles = useStyles();
  const farben = useFarben();
  return (
    <View style={{ marginBottom: abstand.m }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={farben.platzhalter} {...props} style={[styles.eingabe, props.multiline && { minHeight: 80, textAlignVertical: 'top' }, props.style]} />
    </View>
  );
}

export function Checkbox({ an, onPress, text, unterText }: { an: boolean; onPress: () => void; text: string; unterText?: ReactNode }) {
  const styles = useStyles();
  const farben = useFarben();
  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: an }} style={styles.checkZeile}>
      <View style={[styles.checkBox, an && { backgroundColor: farben.gruen, borderColor: farben.gruen }]}>
        {an && <Text style={styles.haken}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.checkText}>{text}</Text>
        {unterText}
      </View>
    </Pressable>
  );
}

export function Badge({ text, farbe: eigeneFarbe }: { text: string; farbe?: string }) {
  const styles = useStyles();
  const farben = useFarben();
  const farbe = eigeneFarbe ?? farben.rot;
  return (
    <View style={[styles.badge, { backgroundColor: farbe }]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

const useStyles = macheStile((farben) => ({
  knopf: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  knopfText: { fontSize: 16, fontWeight: '700' },
  karte: {
    backgroundColor: farben.karte,
    borderRadius: 16,
    padding: abstand.l,
    marginBottom: abstand.m,
    ...kartenStil(farben),
  },
  ueberschrift: { fontSize: 18, fontWeight: '800', color: farben.text, marginBottom: abstand.s, letterSpacing: -0.2 },
  absatz: { fontSize: 15, lineHeight: 22, color: farben.text },
  label: { fontSize: 12, fontWeight: '700', color: farben.textLeise, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  eingabe: {
    backgroundColor: farben.eingabe,
    borderWidth: 1,
    borderColor: farben.rand,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: farben.text,
  },
  checkZeile: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10 },
  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: farben.grau,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  haken: { color: '#fff', fontSize: 18, fontWeight: '900', lineHeight: 20 },
  checkText: { fontSize: 16, lineHeight: 22, color: farben.text },
  badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
}));

export function SchwierigkeitBadge({ stufe }: { stufe?: Schwierigkeit }) {
  if (!stufe) return null;
  const info = SCHWIERIGKEIT_INFO[stufe];
  return <Badge text={info.label.toUpperCase()} farbe={info.farbe} />;
}

/** Schalter in App-Farben (rot = an), sieht auf Handy und im Browser gleich aus */
export function Umschalter(props: SwitchProps) {
  const farben = useFarben();
  // activeThumbColor gibt es nur im Browser (react-native-web)
  const web = { activeThumbColor: '#fff' } as object;
  return <Switch trackColor={{ true: farben.rot, false: farben.grau }} thumbColor="#fff" {...web} {...props} />;
}
