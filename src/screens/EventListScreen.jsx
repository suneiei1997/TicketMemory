import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Search } from 'lucide-react-native';
import Button from '../components/button';
import FilterMenu from '../components/filter-menu';
import GlassButton from '../components/glass-button';
import Screen from '../components/screen';
import ScreenHeader from '../components/screen-header';
import SectionHeader from '../components/section-header';
import TicketCard from '../components/ticket-card';
import { useEvents } from '../context/EventsContext';
import { useSettings } from '../context/SettingsContext';
import { colors as tk, font, type } from '../theme/tokens';
import { isUpcoming } from '../utils/events';

const FILTERS = [
  { value: 'all', label: 'allFilter' },
  { value: 'upcoming', label: 'upcoming' },
  { value: 'past', label: 'past' },
];

export default function EventListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { events, deletePast } = useEvents();
  const { colors, t } = useSettings();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showClear, setShowClear] = useState(false);

  const { upcoming, past } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (e) => !q || [e.title, e.artist, e.venue, e.city].some((f) => (f || '').toLowerCase().includes(q));
    const list = events.filter(match);
    return {
      upcoming: list.filter(isUpcoming).sort((a, b) => a.date.localeCompare(b.date)),
      past: list.filter((e) => !isUpcoming(e)).sort((a, b) => b.date.localeCompare(a.date)),
    };
  }, [events, query]);

  const open = (id) => router.push({ pathname: '/event/[id]', params: { id } });
  const section = (key, items, isPast) =>
    (filter === 'all' || filter === key) && (
      <View key={key} style={styles.section}>
        <SectionHeader title={t(key)} count={items.length} muted={isPast} />
        {isPast && items.length > 0 && (
          <Pressable onPress={() => setShowClear(true)} style={styles.clear}>
            <Text style={styles.clearText}>{t('clearPast')}</Text>
          </Pressable>
        )}
        {items.length === 0 && <Text style={[styles.empty, { color: colors.sub }]}>{t('noConcerts')}</Text>}
        {items.map((e) => (
          <TicketCard key={e.id} event={e} past={isPast} onPress={() => open(e.id)} />
        ))}
      </View>
    );

  return (
    <Screen style={{ paddingTop: insets.top }}>
      <View style={styles.pad}>
        <ScreenHeader
          title={t('myConcerts')}
          right={
            <GlassButton label={t('newConcert')} onPress={() => router.push('/event/new')}>
              <Plus color={tk.lime} size={22} strokeWidth={1.75} />
            </GlassButton>
          }
        />
        <View style={styles.search}>
          <Search color={colors.placeholder} size={18} strokeWidth={1.75} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchPh')}
            placeholderTextColor={tk.faint}
            selectionColor={tk.lime}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>
        <FilterMenu value={filter} onChange={setFilter} options={FILTERS} />
      </View>

      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic">
        {section('upcoming', upcoming, false)}
        {section('past', past, true)}
      </ScrollView>

      <Modal visible={showClear} transparent animationType="fade" onRequestClose={() => setShowClear(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={() => setShowClear(false)}>
          <Pressable style={[styles.modal, { backgroundColor: colors.card }]} onPress={() => {}}>
            <Text style={styles.modalTitle}>{t('clearPastTitle')}</Text>
            <Text style={styles.modalBody}>{t('clearPastBody', { n: past.length })}</Text>
            <View style={styles.modalRow}>
              <Button label={t('cancel')} variant="outline" onPress={() => setShowClear(false)} style={styles.flex1} />
              <Button
                label={t('delete')}
                variant="danger"
                onPress={() => {
                  deletePast().catch(() => {});
                  setShowClear(false);
                }}
                style={styles.flex1}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: tk.surfaceHi, borderRadius: 14, paddingHorizontal: 14, marginTop: 4, marginBottom: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: tk.line },
  searchInput: { flex: 1, fontFamily: font.regular, fontSize: 15, color: tk.text, paddingVertical: 12 },
  list: { padding: 20, paddingTop: 16, paddingBottom: 120 },
  section: { marginBottom: 20 },
  empty: { ...type.body, textAlign: 'center', marginVertical: 16 },
  clear: { alignSelf: 'flex-start', marginBottom: 14 },
  clearText: { ...type.bodyStrong, color: tk.danger },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modal: { width: '86%', borderRadius: 20, padding: 22 },
  modalTitle: { ...type.title, color: tk.text, marginBottom: 8 },
  modalBody: { ...type.body, color: tk.sub, marginBottom: 20 },
  modalRow: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
});
