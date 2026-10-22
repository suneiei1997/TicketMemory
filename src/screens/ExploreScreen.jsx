import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MeshGradient from '../components/mesh-gradient';
import Panel from '../components/panel';
import Screen from '../components/screen';
import ScreenHeader from '../components/screen-header';
import { useEvents } from '../context/EventsContext';
import { useSettings } from '../context/SettingsContext';
import { useTicketing } from '../context/TicketingContext';
import { colors as tk, font, type } from '../theme/tokens';
import { formatMoney } from '../utils/events';
import { summarize } from '../utils/stats';

const money = (byCurrency) => {
  const parts = Object.entries(byCurrency).map(([c, v]) => formatMoney(v, c));
  return parts.length ? parts.join(' + ') : '—';
};

// "7 /36" style row: big value, faint total, label beside it.
function Ratio({ label, value, of }) {
  return (
    <View style={styles.ratio}>
      <Text style={styles.ratioLabel}>{label}</Text>
      <Text style={styles.ratioValue}>
        {value}
        {of != null && <Text style={styles.ratioOf}> /{of}</Text>}
      </Text>
    </View>
  );
}

function List({ title, rows }) {
  if (!rows.length) return null;
  return (
    <Panel title={title}>
      {rows.map((r) => (
        <View key={r.name} style={styles.listRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listName} numberOfLines={1}>{r.name}</Text>
          <Text style={styles.listCount}>{r.count}</Text>
        </View>
      ))}
    </Panel>
  );
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { events } = useEvents();
  const { rounds } = useTicketing();
  const { lang, t } = useSettings();
  const s = useMemo(() => summarize(events, rounds), [events, rounds]);
  const decided = s.got + s.missed;

  return (
    <Screen>
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
      contentInsetAdjustmentBehavior="automatic"
    >
      <ScreenHeader title={t('exploreTitle')} />

      <MeshGradient palette="orchid" texture style={styles.hero}>
        <Text style={styles.heroLabel}>{t('statTotal')}</Text>
        <Text style={styles.heroNumber}>{s.total}</Text>
        <Text style={styles.heroSub}>{money(s.spent)}</Text>
      </MeshGradient>

      <Panel title={t('overview')}>
        <Ratio label={t('statAttended')} value={s.attended} of={s.total} />
        <Ratio label={t('statUpcoming')} value={s.upcoming} of={s.total} />
        <Ratio label={t('statGot')} value={s.got} of={decided || null} />
        <Ratio label={t('statAverage')} value={money(s.average)} />
        <Ratio label={t('statPrayers')} value={`×${s.prayers}`} />
      </Panel>

      <List title={t('topArtists')} rows={s.artists} />
      <List title={t('topPlaces')} rows={s.places} />

      {s.years.length > 0 && (
        <Panel title={t('byYear')}>
          {s.years.map((y) => (
            <View key={y.year} style={styles.listRow}>
              <Text style={styles.year}>{lang === 'th' ? Number(y.year) + 543 : y.year}</Text>
              <Text style={styles.listName}>{t('concertsCount', { n: y.count })}</Text>
              <Text style={styles.yearMoney}>{money(y.spent)}</Text>
            </View>
          ))}
        </Panel>
      )}

      {s.total === 0 && <Text style={styles.empty}>{t('noStats')}</Text>}
    </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  hero: { borderRadius: 24, padding: 20, minHeight: 210, justifyContent: 'flex-end' },
  heroLabel: { ...type.label, color: '#0A0A0A', opacity: 0.7 },
  heroNumber: { fontFamily: font.bold, fontSize: 88, lineHeight: 100, letterSpacing: -3, color: '#0A0A0A' },
  heroSub: { fontFamily: font.semibold, fontSize: 16, color: '#0A0A0A' },
  ratio: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: tk.line },
  ratioLabel: { ...type.body, color: tk.text, flex: 1 },
  ratioValue: { fontFamily: font.bold, fontSize: 24, color: tk.text, letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  ratioOf: { color: tk.faint, fontSize: 18 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: tk.line },
  bullet: { color: tk.lime, fontSize: 14 },
  listName: { ...type.body, color: tk.text, flex: 1 },
  listCount: { fontFamily: font.bold, fontSize: 18, color: tk.text },
  year: { fontFamily: font.bold, fontSize: 18, color: tk.lime, width: 60 },
  yearMoney: { ...type.body, fontSize: 13, color: tk.sub },
  empty: { ...type.body, color: tk.sub, marginTop: 24 },
});
