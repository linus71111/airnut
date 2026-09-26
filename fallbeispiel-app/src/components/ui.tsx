import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';

import { SCHWIERIGKEIT_INFO } from '../lib/schwierigkeit';
import type { Schwierigkeit } from '../lib/types';
import { abstand, farben } from '../theme';

type ButtonArt = 'primaer' | 'sekundaer' | 'gefahr' | 'gelb';

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
  const hg = { primaer: farben.rot, sekundaer: farben.karte, gefahr: '#5F0A12', gelb: farben.gelb }[art];
  const fg = art === 'sekundaer' ? farben.rot : art === 'gelb' ? farben.text : '#fff';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={deaktiviert}
      onPress={onPress}
      style={({ pressed }) => [
        styles.knopf,
        { backgroundColor: hg, opacity: deaktiviert ? 0.4 : pressed ? 0.8 : 1 },
        art === 'sekundaer' && { borderWidth: 2, borderColor: farben.rot },
        stil,
      ]}>
      <Text style={[styles.knopfText, { color: fg }]}>{titel}</Text>
    </Pressable>
  );
}

export function Karte({ children, stil }: { children: ReactNode; stil?: ViewStyle }) {
  return <View style={[styles.karte, stil]}>{children}</View>;
}

export function Ueberschrift({ children }: { children: ReactNode }) {
  return <Text style={styles.ueberschrift}>{children}</Text>;
}

export function Absatz({ children, leise }: { children: ReactNode; leise?: boolean }) {
  return <Text style={[styles.absatz, leise && { color: farben.textLeise }]}>{children}</Text>;
}

export function Eingabe({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: abstand.m }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor="#999" {...props} style={[styles.eingabe, props.multiline && { minHeight: 80, textAlignVertical: 'top' }, props.style]} />
    </View>
  );
}

export function Checkbox({ an, onPress, text, unterText }: { an: boolean; onPress: () => void; text: string; unterText?: ReactNode }) {
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

export function Badge({ text, farbe = farben.rot }: { text: string; farbe?: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: farbe }]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  knopf: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  knopfText: { fontSize: 16, fontWeight: '700' },
  karte: {
    backgroundColor: farben.karte,
    borderRadius: 14,
    padding: abstand.l,
    marginBottom: abstand.m,
    borderWidth: 1,
    borderColor: farben.rand,
  },
  ueberschrift: { fontSize: 18, fontWeight: '800', color: farben.text, marginBottom: abstand.s },
  absatz: { fontSize: 15, lineHeight: 22, color: farben.text },
  label: { fontSize: 13, fontWeight: '700', color: farben.textLeise, marginBottom: 4, textTransform: 'uppercase' },
  eingabe: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: farben.rand,
    borderRadius: 10,
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
    borderColor: '#9AA0A6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  haken: { color: '#fff', fontSize: 18, fontWeight: '900', lineHeight: 20 },
  checkText: { fontSize: 16, lineHeight: 22, color: farben.text },
  badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});

export function SchwierigkeitBadge({ stufe }: { stufe?: Schwierigkeit }) {
  if (!stufe) return null;
  const info = SCHWIERIGKEIT_INFO[stufe];
  return <Badge text={info.label.toUpperCase()} farbe={info.farbe} />;
}
