import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useSettings } from '../context/SettingsContext';

// Round icon button: liquid glass on iOS 26+, a plain chip elsewhere.
export default function GlassButton({ children, onPress, label, size = 40 }) {
  const { colors } = useSettings();
  const round = { width: size, height: size, borderRadius: size / 2 };

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}>
      {isLiquidGlassAvailable() ? (
        <GlassView glassEffectStyle="regular" isInteractive style={[styles.center, round]}>
          {children}
        </GlassView>
      ) : (
        <View style={[styles.center, round, { backgroundColor: colors.input, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border }]}>{children}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
