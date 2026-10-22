import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import Button from '../components/button';
import GlassButton from '../components/glass-button';
import MeshGradient from '../components/mesh-gradient';
import Panel from '../components/panel';
import Screen from '../components/screen';
import { useEvents } from '../context/EventsContext';
import { useSettings } from '../context/SettingsContext';
import { colors as tk, font, type } from '../theme/tokens';
import { paletteKeyFor } from '../theme/ticket-palettes';
import { dateParts, daysUntil, formatDate, formatMoney, yearLabel } from '../utils/events';

const INK = '#0A0A0A';

function Detail({ label, value, last }) {
  return (
    <View style={[styles.detail, last && styles.detailLast]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function EventDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [showDelete, setShowDelete] = useState(false);
  const { events, deleteEvent } = useEvents();
  const { lang, t } = useSettings();
  const event = events.find((e) => e.id === params.id);

  if (!event) return null;
  const dash = (v) => v || '—';
  const { month, day } = dateParts(event, lang);
  const n = daysUntil(event.date);
  const status = n === null ? '' : n < 0 ? t('attended') : n === 0 ? t('today') : t('dayShort', { n });

  const seats = [
    ['zone', event.zone],
    ['section', event.section],
    ['row', event.row],
    ['seat', event.seat],
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>
        <View style={styles.bar}>
          <GlassButton label={t('back')} onPress={() => router.back()}>
            <ArrowLeft color={tk.text} size={20} strokeWidth={1.75} />
          </GlassButton>
          <Pressable onPress={() => router.push({ pathname: '/event/edit/[id]', params: { id: event.id } })} hitSlop={10}>
            <Text style={styles.edit}>{t('edit')}</Text>
          </Pressable>
        </View>

        <MeshGradient palette={paletteKeyFor(event)} texture style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.flex1}>
              {!!event.artist && <Text style={styles.heroArtist}>{event.artist}</Text>}
              <Text style={styles.heroTitle}>{event.title}</Text>
            </View>
            {!!event.ticketImage && <Image source={{ uri: event.ticketImage }} style={styles.poster} contentFit="cover" />}
          </View>
          <View style={styles.heroBottom}>
            <Text style={styles.heroDay}>{day}</Text>
            <View>
              <Text style={styles.heroMonth}>{month}</Text>
              <Text style={styles.heroYear}>{yearLabel(event, lang)}</Text>
            </View>
            {!!status && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{status}</Text>
              </View>
            )}
          </View>
        </MeshGradient>

        <Panel title={t('concertInfo')}>
          <Detail label={t('dateTime')} value={`${formatDate(event, lang)}  ·  ${event.time}`} />
          <Detail label={t('venue')} value={dash([event.venue, event.city].filter(Boolean).join(', '))} />
          <Detail
            label={t('priceLabel')}
            last
            value={`${event.price !== '' ? formatMoney(event.price, event.currency) : t('noPrice')}${event.purchaseChannel ? `  ·  ${event.purchaseChannel}` : ''}`}
          />
        </Panel>

        <Panel title={t('ticketSeating')}>
          <View style={styles.seats}>
            {seats.map(([key, val]) => (
              <View key={key} style={styles.seat}>
                <Text style={styles.seatVal}>{dash(val)}</Text>
                <Text style={styles.seatLabel}>{t(key)}</Text>
              </View>
            ))}
          </View>
        </Panel>

        {!!event.ticketImage && (
          <Panel title={t('ticketPhoto')}>
            <Image source={{ uri: event.ticketImage }} style={styles.ticketImage} contentFit="contain" />
          </Panel>
        )}

        <Button label={t('deleteConcert')} variant="danger" onPress={() => setShowDelete(true)} style={styles.delete} />
      </ScrollView>

      <Modal visible={showDelete} transparent animationType="fade" onRequestClose={() => setShowDelete(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowDelete(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalTitle}>{t('deleteTitle')}</Text>
            <Text style={styles.modalBody}>{t('deleteBody', { title: event.title })}</Text>
            <View style={styles.modalRow}>
              <Button label={t('cancel')} variant="outline" onPress={() => setShowDelete(false)} style={styles.flex1} />
              <Button
                label={t('delete')}
                variant="danger"
                style={styles.flex1}
                onPress={async () => {
                  setShowDelete(false);
                  try {
                    await deleteEvent(event.id);
                    router.back();
                  } catch {}
                }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 60 },
  flex1: { flex: 1 },
  bar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  edit: { ...type.bodyStrong, color: tk.lime },
  hero: { borderRadius: 28, padding: 20, minHeight: 300, justifyContent: 'space-between', marginBottom: 8 },
  heroTop: { flexDirection: 'row', gap: 14 },
  heroArtist: { ...type.label, color: INK, opacity: 0.7, marginBottom: 4 },
  heroTitle: { fontFamily: font.bold, fontSize: 30, lineHeight: 42, letterSpacing: 0, color: INK },
  poster: { width: 84, height: 112, borderRadius: 12 },
  heroBottom: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  heroDay: { fontFamily: font.bold, fontSize: 72, lineHeight: 80, letterSpacing: -2, color: INK },
  heroMonth: { fontFamily: font.semibold, fontSize: 16, letterSpacing: 2, color: INK },
  heroYear: { fontFamily: font.medium, fontSize: 13, color: INK, opacity: 0.7 },
  badge: { marginLeft: 'auto', backgroundColor: INK, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { fontFamily: font.semibold, fontSize: 13, color: tk.lime },
  detail: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: tk.line },
  detailLast: { borderBottomWidth: 0, paddingBottom: 4 },
  detailLabel: { ...type.label, color: tk.sub },
  detailValue: { ...type.body, fontSize: 16, color: tk.text, marginTop: 4 },
  seats: { flexDirection: 'row', gap: 8, marginTop: 6 },
  seat: { flex: 1, backgroundColor: tk.surfaceHi, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  seatVal: { fontFamily: font.bold, fontSize: 24, letterSpacing: -1, color: tk.text },
  seatLabel: { ...type.label, color: tk.faint, marginTop: 2 },
  ticketImage: { width: '100%', height: 340, borderRadius: 16 },
  delete: { marginTop: 36 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '86%', borderRadius: 20, padding: 22, backgroundColor: tk.surfaceHi },
  modalTitle: { ...type.title, color: tk.text, marginBottom: 8 },
  modalBody: { ...type.body, color: tk.sub, marginBottom: 20 },
  modalRow: { flexDirection: 'row', gap: 10 },
});
