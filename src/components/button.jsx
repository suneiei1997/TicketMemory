import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, font } from '../theme/tokens';

// Solid pill: lime for the main action, outlined for secondary, plain text for danger.
export default function Button({ label, onPress, style, disabled, variant = 'primary' }) {
  const primary = variant === 'primary';
  const danger = variant === 'danger';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        primary && styles.primary,
        variant === 'outline' && styles.outline,
        danger && styles.danger,
        (pressed || disabled) && styles.dim,
        style,
      ]}
    >
      <Text style={[styles.text, { color: primary ? colors.limeInk : danger ? colors.danger : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: 999, paddingVertical: 15, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.lime },
  outline: { borderWidth: 1, borderColor: colors.line },
  danger: { borderWidth: 1, borderColor: colors.danger },
  dim: { opacity: 0.6 },
  text: { fontFamily: font.semibold, fontSize: 15 },
});
