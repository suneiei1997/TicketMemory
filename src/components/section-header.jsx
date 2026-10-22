import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { colors, font } from '../theme/tokens';

// Section title with a count pill on the right (lime when live, grey when muted).
export default function SectionHeader({ title, count, muted }) {
  const { t } = useSettings();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, muted && styles.muted]}>{title}</Text>
      <View style={[styles.pill, muted ? styles.pillMuted : styles.pillLive]}>
        <Text style={[styles.pillText, { color: muted ? colors.sub : colors.lime }]}>{t('concerts', { n: count })}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 14 },
  title: { fontFamily: font.semibold, fontSize: 18, letterSpacing: -0.3, color: colors.text },
  muted: { color: colors.sub },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  pillLive: { backgroundColor: colors.limeSoft },
  pillMuted: { backgroundColor: colors.surfaceHi },
  pillText: { fontFamily: font.semibold, fontSize: 13 },
});
