import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font } from '../theme/tokens';

// Label over a raised input box; extra props go to TextInput.
export default function Field({ label, style, ...input }) {
  return (
    <View style={[styles.wrap, style]}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TextInput style={styles.input} placeholderTextColor={colors.faint} selectionColor={colors.lime} {...input} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, marginBottom: 14 },
  label: { fontFamily: font.medium, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.sub, marginBottom: 6 },
  input: {
    fontFamily: font.regular,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceHi,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
});
