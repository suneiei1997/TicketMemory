import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MonthGrid from '../components/month-grid';
import Panel from '../components/panel';
import Screen from '../components/screen';
import ScreenHeader from '../components/screen-header';
import TicketCard from '../components/ticket-card';
import { useEvents } from '../context/EventsContext';
import { useSettings } from '../context/SettingsContext';
import { useTicketing } from '../context/TicketingContext';
import { colors as tk, type } from '../theme/tokens';
import { isUpcoming, toKey } from '../utils/events';

const dayKey = (iso) => {
  const d = new Date(iso);
  return toKey(d.getFullYear(), d.getMonth(), d.getDate());
};

export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { events } = useEvents();
  const { rounds } = useTicketing();
  const { t } = useSettings();
  const now = new Date();
  const todayKey = toKey(now.getFullYear(), now.getMonth(), now.getDate());
  const [selected, setSelected] = useState(todayKey);

  // Concerts and pending ticketing rounds both mark the grid.
  const byDate = useMemo(() => {
    const map = {};
    for (const e of events) (map[e.date] ||= { events: [], rounds: [] }).events.push(e);
    for (const r of rounds) if (r.result === 'pending') (map[dayKey(r.saleAt)] ||= { events: [], rounds: [] }).rounds.push(r);
    return map;
  }, [events, rounds]);

  const day = byDate[selected] ?? { events: [], rounds: [] };
  const empty = day.events.length === 0 && day.rounds.length === 0;

  return (
    <Screen>
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
      contentInsetAdjustmentBehavior="automatic"
    >
      <ScreenHeader title={t('calendar')} />

      <Panel>
        <MonthGrid initial={todayKey} selected={selected} marked={byDate} onSelect={setSelected} />
      </Panel>

      <View style={styles.list}>
        {empty && <Text style={styles.empty}>{t('noEventsOnDay')}</Text>}

        {day.rounds.map((r) => (
          <View key={r.id} style={styles.round}>
            <Text style={styles.roundLabel}>{t('prayTitle')}</Text>
            <Text style={styles.roundTitle} numberOfLines={1}>{r.title}</Text>
            <Text style={styles.roundSub}>
              {new Date(r.saleAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {r.platform ? `  ·  ${r.platform}` : ''}
            </Text>
          </View>
        ))}

        {day.events.map((e) => (
          <TicketCard
            key={e.id}
            event={e}
            past={!isUpcoming(e)}
            onPress={() => router.push({ pathname: '/event/[id]', params: { id: e.id } })}
          />
        ))}
      </View>
    </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  list: { marginTop: 20 },
  empty: { ...type.body, color: tk.sub, textAlign: 'center', marginTop: 8 },
  round: { padding: 16, marginBottom: 14, borderRadius: 18, backgroundColor: tk.surfaceHi, borderLeftWidth: 3, borderLeftColor: tk.lime },
  roundLabel: { ...type.label, color: tk.lime },
  roundTitle: { ...type.title, color: tk.text, marginTop: 4 },
  roundSub: { ...type.body, color: tk.sub, marginTop: 2 },
});
