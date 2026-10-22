import React, { useId, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

// Layered screen background: vertical wash, soft glows, and a faint dot grid.
// Sized in pixels from onLayout (percentage sizes rendered short).
const GLOWS = [
  { c: '#6D3BFF', o: 0.3, x: 0.95, y: 0.02, r: 0.75 },
  { c: '#FF3DA8', o: 0.17, x: 0.0, y: 0.45, r: 0.7 },
  { c: '#DCFF3C', o: 0.07, x: 0.9, y: 1.0, r: 0.6 },
];

export default function Backdrop() {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [size, setSize] = useState(null);
  const w = size?.width ?? 0;
  const h = size?.height ?? 0;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={(e) => setSize(e.nativeEvent.layout)}>
      {size && (
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <Defs>
            <LinearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#161126" />
              <Stop offset="0.5" stopColor="#0F0D18" />
              <Stop offset="1" stopColor="#0C0B12" />
            </LinearGradient>
            {GLOWS.map((g, i) => (
              <RadialGradient key={i} id={`${id}g${i}`} cx={g.x} cy={g.y} r={g.r} fx={g.x} fy={g.y}>
                <Stop offset="0" stopColor={g.c} stopOpacity={g.o} />
                <Stop offset="1" stopColor={g.c} stopOpacity="0" />
              </RadialGradient>
            ))}
            <Pattern id={`${id}d`} patternUnits="userSpaceOnUse" width="14" height="14">
              <Circle cx="7" cy="7" r="0.9" fill="#FFFFFF" fillOpacity="0.045" />
            </Pattern>
          </Defs>
          <Rect width={w} height={h} fill={`url(#${id}w)`} />
          {GLOWS.map((g, i) => (
            <Rect key={i} width={w} height={h} fill={`url(#${id}g${i})`} />
          ))}
          <Rect width={w} height={h} fill={`url(#${id}d)`} />
        </Svg>
      )}
    </View>
  );
}
