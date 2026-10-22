import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Button from '../components/button';
import Field from '../components/field';
import PickerField from '../components/picker-field';
import Screen from '../components/screen';
import { useSettings } from '../context/SettingsContext';
import { useTicketing } from '../context/TicketingContext';
import { colors as tk, type } from '../theme/tokens';
import { parseDate, toKey } from '../utils/events';

const pad = (n) => String(n).padStart(2, '0');

// Splits an ISO timestamp into the local date/time strings the pickers use.
function toParts(iso) {
  if (!iso) return { date: '', time: '20:00' };
  const d = new Date(iso);
  return { date: toKey(d.getFullYear(), d.getMonth(), d.getDate()), time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

export default function TicketingFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { rounds, addRound, updateRound, deleteRound } = useTicketing();
  const { t } = useSettings();
  const existing = id && id !== 'new' ? rounds.find((r) => r.id === id) : null;

  const [form, setForm] = useState(() => ({
    title: existing?.title ?? '',
    artist: existing?.artist ?? '',
    platform: existing?.platform ?? '',
    url: existing?.url ?? '',
    note: existing?.note ?? '',
    ...toParts(existing?.saleAt),
  }));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title.trim()) return setError(t('errRoundName'));
    const day = parseDate(form.date);
    if (!day) return setError(t('errSaleDate'));
    const [h, m] = form.time.split(':').map(Number);
    day.setHours(h || 0, m || 0, 0, 0);
    setError('');
    setBusy(true);
    const data = { ...form, title: form.title.trim(), saleAt: day.toISOString() };
    try {
      if (existing) await updateRound(existing.id, data);
      else await addRound(data);
      router.back();
    } catch {
      setError(t('errNetwork'));
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      await deleteRound(existing.id);
      router.back();
    } catch {
      setError(t('errNetwork'));
    }
  };

  const field = (key, label, extra) => <Field label={label} value={form[key]} onChangeText={set(key)} {...extra} />;

  return (
    <Screen>
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{existing ? t('editRound') : t('newRound')}</Text>
      {field('title', t('roundName'), { placeholder: t('roundNamePh') })}
      {field('artist', t('fArtist'))}
      <View style={styles.row}>
        <PickerField kind="date" label={t('saleDate')} value={form.date} onChange={set('date')} placeholder={t('selectDate')} />
        <PickerField kind="time" label={t('saleTime')} value={form.time} onChange={set('time')} placeholder={t('selectTime')} />
      </View>
      {field('platform', t('salePlatform'), { placeholder: t('salePlatformPh') })}
      {field('url', t('saleUrl'), { placeholder: 'https://', autoCapitalize: 'none', keyboardType: 'url' })}
      {field('note', t('roundNote'), { multiline: true })}

      {!!error && <Text style={styles.error}>{error}</Text>}
      <Button label={t('saveRound')} onPress={submit} disabled={busy} style={styles.save} />
      {!!existing && <Button label={t('delete')} variant="danger" onPress={remove} style={styles.delete} />}
    </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  heading: { ...type.display, color: tk.text, marginTop: 8, marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12 },
  error: { ...type.body, color: tk.danger, marginBottom: 8 },
  save: { marginTop: 12 },
  delete: { marginTop: 12 },
});
