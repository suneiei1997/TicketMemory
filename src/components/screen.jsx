import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';
import Backdrop from './backdrop';

// Page root: opaque base + layered backdrop. Pages in a stack overlap, so each draws its own.
export default function Screen({ children, style }) {
  return (
    <View style={[styles.root, style]}>
      <Backdrop />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.bg } });
