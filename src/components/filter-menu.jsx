import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { colors, font } from '../theme/tokens';

// Pill segments in a raised track; the active one is lime.
export default function FilterMenu({ value, onChange, options, style }) {
  const { t } = useSettings();
  return (
    <View style={[styles.track, style]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={[styles.item, active && styles.itemOn]}>
            <Text style={[styles.text, { color: active ? colors.limeInk : colors.sub }]}>{o.raw ?? t(o.label)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 999, padding: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  item: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 999 },
  itemOn: { backgroundColor: colors.lime },
  text: { fontFamily: font.semibold, fontSize: 13 },
});
