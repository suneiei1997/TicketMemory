import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MapPin } from 'lucide-react-native';
import { useSettings } from '../context/SettingsContext';
import { colors, font } from '../theme/tokens';
import { PALETTES, paletteKeyFor } from '../theme/ticket-palettes';
import { dateParts, daysUntil, yearLabel } from '../utils/events';
import MeshGradient from './mesh-gradient';

const INK = '#0A0A0A';
const STUB = 74; // dated stub width
const DOTS = 8;
const RIGHT_PAD = 26; // room for the vertical year
const NOTCH_FROM_RIGHT = RIGHT_PAD + STUB + 4; // centre of the perforation, from the card's right edge

// Ticket stub: textured mesh, poster, details, dotted tear line with punched notches, dated stub.
export default function TicketCard({ event, past, onPress }) {
  const { lang, t } = useSettings();
  const { month, day } = dateParts(event, lang);
  const img = event.ticketImage || event.image;
  const n = daysUntil(event.date);
  const badge = past ? t('attended') : n === 0 ? t('today') : n === 1 ? t('dayOne') : t('dayShort', { n });
  const key = paletteKeyFor(event);
  const dot = past ? colors.lime : 'rgba(10,10,10,0.5)';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, { shadowColor: PALETTES[key].base }, pressed && styles.pressed]}>
      <MeshGradient palette={key} texture notchFromRight={NOTCH_FROM_RIGHT} veil={past ? 0.5 : 0} style={styles.card}>
        <View style={styles.row}>
          {!!img && <Image source={{ uri: img }} style={styles.thumb} contentFit="cover" />}

          <View style={styles.details}>
            {!!event.artist && <Text style={styles.artist} numberOfLines={1}>{event.artist}</Text>}
            <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
            {!!(event.venue || event.city) && (
              <View style={styles.venueRow}>
                <MapPin color={INK} size={13} strokeWidth={1.75} />
                <Text style={styles.venue} numberOfLines={1}>{[event.venue, event.city].filter(Boolean).join(', ')}</Text>
              </View>
            )}
          </View>

          <View style={styles.perforation}>
            {Array.from({ length: DOTS }, (_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: dot }]} />
            ))}
          </View>

          <View style={styles.stub}>
            <Text style={styles.month}>{month}</Text>
            <Text style={styles.day}>{day}</Text>
            <View style={styles.rule} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.year}>{yearLabel(event, lang)}{lang === 'th' ? ' BE' : ''}</Text>
      </MeshGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  card: { borderRadius: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingLeft: 14, paddingRight: RIGHT_PAD },
  thumb: { width: 68, height: 88, borderRadius: 10, marginRight: 12 },
  details: { flex: 1, gap: 2, paddingRight: 8 },
  artist: { fontFamily: font.medium, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: INK, opacity: 0.7 },
  title: { fontFamily: font.bold, fontSize: 19, lineHeight: 23, letterSpacing: -0.4, color: INK },
  venueRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  venue: { fontFamily: font.regular, fontSize: 13, color: INK, opacity: 0.75, flexShrink: 1 },
  perforation: { width: 8, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'space-evenly', marginVertical: -4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  stub: { width: STUB, alignItems: 'center' },
  month: { fontFamily: font.semibold, fontSize: 12, letterSpacing: 2, color: INK },
  day: { fontFamily: font.bold, fontSize: 38, lineHeight: 42, letterSpacing: -1.5, color: INK },
  rule: { width: 28, height: 2, borderRadius: 1, backgroundColor: 'rgba(10,10,10,0.4)', marginVertical: 4 },
  badge: { backgroundColor: INK, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { fontFamily: font.semibold, fontSize: 11, color: colors.lime },
  year: {
    position: 'absolute',
    right: -14,
    top: '50%',
    width: 80,
    marginTop: -7,
    textAlign: 'center',
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: INK,
    opacity: 0.55,
    transform: [{ rotate: '90deg' }],
  },
});
