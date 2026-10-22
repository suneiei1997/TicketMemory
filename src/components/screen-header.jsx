import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, type } from '../theme/tokens';

// Small brand label + actions on top, big left-aligned title below.
export default function ScreenHeader({ title, right }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Text style={styles.brand}>TICKETMEMORY</Text>
        <View style={styles.right}>{right}</View>
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 4, paddingBottom: 12 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 },
  brand: { ...type.label, color: colors.sub },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { ...type.display, color: colors.text, marginTop: 6 },
});
