import React, { useId, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Mask, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';
import { PALETTES } from '../theme/ticket-palettes';

// Blurred multi-colour backdrop: a base fill with soft radial blobs on top.
// texture: paper-like dot grid + top sheen.  notchFromRight/notchR: punch half-circles out of the top and
// bottom edge (real holes, so whatever is behind the card shows through).  veil: 0-1 darkening.
// The SVG is sized in pixels from onLayout: percentage sizes rendered ~10% short inside absolute boxes.
export default function MeshGradient({ palette = 'orchid', style, children, texture, notchFromRight, notchR = 9, veil = 0 }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const p = PALETTES[palette] ?? PALETTES.orchid;
  const [size, setSize] = useState(null);
  const notched = notchFromRight != null;
  const w = size?.width ?? 0;
  const h = size?.height ?? 0;

  const art = size && (
    <>
      <Rect width={w} height={h} fill={p.base} />
      {p.blobs.map((b, i) => (
        <Rect key={i} width={w} height={h} fill={`url(#${id}${i})`} />
      ))}
      {texture && (
        <>
          <Rect width={w} height={h} fill={`url(#${id}t)`} />
          <Rect width={w} height={h} fill={`url(#${id}s)`} />
        </>
      )}
      {veil > 0 && <Rect width={w} height={h} fill="#0A0A0A" fillOpacity={veil} />}
    </>
  );

  return (
    <View style={[styles.fill, style]} onLayout={(e) => setSize(e.nativeEvent.layout)}>
      {size && (
        <Svg style={styles.svg} width={w} height={h} viewBox={`0 0 ${w} ${h}`} pointerEvents="none">
          <Defs>
            {p.blobs.map((b, i) => (
              <RadialGradient key={i} id={`${id}${i}`} cx={b.x} cy={b.y} r={b.r * 1.35} fx={b.x} fy={b.y}>
                <Stop offset="0" stopColor={b.c} stopOpacity="1" />
                <Stop offset="0.5" stopColor={b.c} stopOpacity="0.55" />
                <Stop offset="1" stopColor={b.c} stopOpacity="0" />
              </RadialGradient>
            ))}
            <Pattern id={`${id}t`} patternUnits="userSpaceOnUse" width="7" height="7">
              <Circle cx="3.5" cy="3.5" r="0.9" fill="#0A0A0A" fillOpacity="0.16" />
            </Pattern>
            <LinearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.2" />
              <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
            {notched && (
              <Mask id={`${id}m`} x="0" y="0" width={w} height={h}>
                <Rect width={w} height={h} fill="#FFFFFF" />
                <Circle cx={w - notchFromRight} cy={0} r={notchR} fill="#000000" />
                <Circle cx={w - notchFromRight} cy={h} r={notchR} fill="#000000" />
              </Mask>
            )}
          </Defs>
          {notched ? <G mask={`url(#${id}m)`}>{art}</G> : art}
        </Svg>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { overflow: 'hidden' },
  svg: { position: 'absolute', top: 0, left: 0 },
});
