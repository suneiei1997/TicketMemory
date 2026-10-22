import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';
import { PALETTE_KEYS } from '../theme/ticket-palettes';
import MeshGradient from './mesh-gradient';

// Row of mesh swatches; the chosen one gets a lime ring.
export default function ColorPicker({ value, onChange }) {
  return (
    <View style={styles.row}>
      {PALETTE_KEYS.map((key) => (
        <Pressable key={key} onPress={() => onChange(key)} style={[styles.ring, value === key && styles.ringOn]} accessibilityLabel={key}>
          <MeshGradient palette={key} style={styles.swatch} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ring: { padding: 3, borderRadius: 24, borderWidth: 2, borderColor: 'transparent' },
  ringOn: { borderColor: colors.lime },
  swatch: { width: 36, height: 36, borderRadius: 18 },
});
