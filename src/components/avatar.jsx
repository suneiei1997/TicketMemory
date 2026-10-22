import React from 'react';
import { Image, Text, View } from 'react-native';
import { colors, font } from '../theme/tokens';

// Profile picture, or the name's initial on a white disc when none is set.
export default function Avatar({ uri, name, size = 40 }) {
  const round = { width: size, height: size, borderRadius: size / 2 };
  if (uri) return <Image source={{ uri }} style={round} />;
  return (
    <View style={[round, { backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color: colors.limeInk, fontFamily: font.bold, fontSize: size * 0.42 }}>
        {(name || '?').trim().charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}
