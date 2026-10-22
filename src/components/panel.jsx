import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, type } from '../theme/tokens';

// Raised box that groups related content; optional label and right-side slot.
export default function Panel({ title, right, children, style }) {
  return (
    <View style={[styles.panel, style]}>
      {(!!title || !!right) && (
        <View style={styles.head}>
          <Text style={styles.title}>{title}</Text>
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    marginTop: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  title: { ...type.label, color: colors.sub },
});
