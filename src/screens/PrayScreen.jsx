import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { ExternalLink, HandHeart, Pencil, Plus } from 'lucide-react-native';
import Button from '../components/button';
import GlassButton from '../components/glass-button';
import MeshGradient from '../components/mesh-gradient';
import Panel from '../components/panel';
import Screen from '../components/screen';
import ScreenHeader from '../components/screen-header';
import { useSettings } from '../context/SettingsContext';
import { useTicketing } from '../context/TicketingContext';
import { colors as tk, font, type } from '../theme/tokens';

const pad = (n) => String(n).padStart(2, '0');
const INK = '#0A0A0A';

function useNow(ms) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

function countdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d}d ${pad(h)}h` : `${pad(h)}:${pad(m)}:${pad(s % 60)}`;
}

function RoundCard({ round, now, hero }) {
  const router = useRouter();
  const { lang, t } = useSettings();
  const { pray, setResult } = useTicketing();
  const scale = useSharedValue(1);
  const handStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const left = new Date(round.saleAt).getTime() - now;
  const sale = new Date(round.saleAt);

  const wish = () => {
    scale.set(withSequence(withSpring(1.3, { damping: 6 }), withSpring(1)));
    pray(round.id);
  };

  const openSale = async () => {
    if (!round.url) return;
    try {
      await WebBrowser.openBrowserAsync(round.url);
    } catch {
      Linking.openURL(round.url).catch(() => {});
    }
  };

  const got = () =>
    router.push({ pathname: '/event/new', params: { fromRound: round.id, title: round.title, artist: round.artist } });
  const miss = () => setResult(round.id, 'missed').catch(() => Alert.alert(t('errNetwork')));

  const fg = hero ? INK : tk.text;
  const bg = hero ? 'rgba(10,10,10,0.55)' : tk.sub;

  const body = (
    <View style={styles.cardBody}>
      <View style={styles.cardTop}>
        <View style={styles.flex1}>
          <Text style={[styles.title, { color: fg }]} numberOfLines={2}>{round.title}</Text>
          <Text style={[styles.meta, { color: bg }]}>
            {[round.artist, sale.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short' }) + ` ${pad(sale.getHours())}:${pad(sale.getMinutes())}`, round.platform].filter(Boolean).join('  ·  ')}
          </Text>
        </View>
        <Pressable onPress={() => router.push({ pathname: '/ticketing/[id]', params: { id: round.id } })} hitSlop={10}>
          <Pencil color={fg} size={18} strokeWidth={1.75} />
        </Pressable>
      </View>

      <Text style={[styles.label, { color: bg }]}>{left > 0 ? t('opensIn') : t('saleOpen')}</Text>
      <Text style={[styles.timer, { color: fg }]}>{left > 0 ? countdown(left) : '00:00:00'}</Text>

      <View style={styles.actions}>
        <Pressable onPress={wish} style={styles.prayBtn} accessibilityLabel={t('pray')}>
          <Animated.View style={handStyle}>
            <HandHeart color={INK} size={28} strokeWidth={1.75} />
          </Animated.View>
        </Pressable>
        <View style={styles.flex1}>
          <Text style={[styles.count, { color: fg }]}>×{round.prayers}</Text>
          <Text style={[styles.meta, { color: bg }]}>{t('pray')}</Text>
        </View>
        {!!round.url && (
          <Pressable style={[styles.link, { borderColor: fg }]} onPress={openSale}>
            <ExternalLink color={fg} size={15} strokeWidth={1.75} />
            <Text style={[styles.linkText, { color: fg }]}>{t('openSale')}</Text>
          </Pressable>
        )}
      </View>

      {left <= 0 && (
        <View style={styles.resultRow}>
          <Button label={t('gotIt')} onPress={got} style={styles.flex1} />
          <Button label={t('missedIt')} variant="outline" onPress={miss} style={styles.flex1} />
        </View>
      )}
    </View>
  );

  return hero ? (
    <MeshGradient palette="orchid" style={styles.card}>{body}</MeshGradient>
  ) : (
    <View style={[styles.card, styles.plain]}>{body}</View>
  );
}

export default function PrayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { rounds } = useTicketing();
  const { t } = useSettings();
  const now = useNow(1000);

  const { pending, done } = useMemo(
    () => ({
      pending: rounds.filter((r) => r.result === 'pending'),
      done: rounds.filter((r) => r.result !== 'pending').reverse(),
    }),
    [rounds]
  );

  return (
    <Screen>
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
      contentInsetAdjustmentBehavior="automatic"
    >
      <ScreenHeader
        title={t('prayTitle')}
        right={
          <GlassButton label={t('addRound')} onPress={() => router.push('/ticketing/new')}>
            <Plus color={tk.lime} size={22} strokeWidth={1.75} />
          </GlassButton>
        }
      />

      {pending.length === 0 && <Text style={styles.empty}>{t('prayEmpty')}</Text>}
      {pending.map((r, i) => (
        <RoundCard key={r.id} round={r} now={now} hero={i === 0} />
      ))}

      {done.length > 0 && (
        <Panel title={t('roundsPast')} style={styles.donePanel}>
          {done.map((r, i) => (
            <Pressable
              key={r.id}
              style={[styles.doneRow, i === done.length - 1 && styles.doneLast]}
              onPress={() => router.push({ pathname: '/ticketing/[id]', params: { id: r.id } })}
            >
              <View style={styles.flex1}>
                <Text style={styles.doneTitle} numberOfLines={1}>{r.title}</Text>
                <Text style={styles.doneMeta}>×{r.prayers}</Text>
              </View>
              <Text style={[styles.doneResult, { color: r.result === 'got' ? tk.lime : tk.sub }]}>
                {r.result === 'got' ? t('resultGot') : t('resultMissed')}
              </Text>
            </Pressable>
          ))}
        </Panel>
      )}
    </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  flex1: { flex: 1 },
  empty: { ...type.body, color: tk.sub, marginTop: 24 },
  card: { borderRadius: 24, marginTop: 14, overflow: 'hidden' },
  plain: { borderWidth: StyleSheet.hairlineWidth, borderColor: tk.line, backgroundColor: tk.surface },
  cardBody: { padding: 20 },
  cardTop: { flexDirection: 'row', gap: 12 },
  title: { ...type.title },
  meta: { ...type.body, fontSize: 13, marginTop: 2 },
  label: { ...type.label, marginTop: 22 },
  timer: { ...type.number },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18 },
  prayBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  count: { fontFamily: font.bold, fontSize: 28, letterSpacing: -1, fontVariant: ['tabular-nums'] },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 11 },
  linkText: { fontFamily: font.semibold, fontSize: 13 },
  resultRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  donePanel: { marginTop: 28 },
  doneLast: { borderBottomWidth: 0 },
  doneRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: tk.line },
  doneTitle: { ...type.bodyStrong, color: tk.text },
  doneMeta: { ...type.body, fontSize: 13, color: tk.sub },
  doneResult: { fontFamily: font.bold, fontSize: 14 },
});
