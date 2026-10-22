import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useSettings } from '../context/SettingsContext';
import { colors as tk, font, type } from '../theme/tokens';
import { parseDate } from '../utils/events';
import { pickImage } from '../utils/pick-image';
import Button from './button';
import ColorPicker from './color-picker';
import Field from './field';
import Panel from './panel';
import PickerField from './picker-field';

const EMPTY = {
  title: '', artist: '', venue: '', city: '', date: '', time: '19:00',
  zone: '', section: '', row: '', seat: '',
  price: '', currency: 'THB', purchaseChannel: '', color: '',
};

const CURRENCIES = ['THB', 'USD', 'KRW', 'JPY'];

export default function EventForm({ initial, submitLabel, onSubmit }) {
  const { t } = useSettings();
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title.trim()) return setError(t('errName'));
    if (!parseDate(form.date)) return setError(t('errDate'));
    setError('');
    setBusy(true);
    try {
      await onSubmit({ ...form, title: form.title.trim(), artist: form.artist.trim(), date: form.date.trim() });
    } catch {
      setError(t('errNetwork'));
      setBusy(false);
    }
  };

  return (
    <View>
      <Panel title={t('concertInfo')}>
      <Field label={t('fName')} value={form.title} onChangeText={set('title')} placeholder={t('fNamePh')} />
      <Field label={t('fArtist')} value={form.artist} onChangeText={set('artist')} />
      <View style={styles.row}>
        <Field label={t('fVenue')} value={form.venue} onChangeText={set('venue')} />
        <Field label={t('fCity')} value={form.city} onChangeText={set('city')} />
      </View>
      <View style={styles.row}>
        <PickerField kind="date" label={t('fDate')} value={form.date} onChange={set('date')} placeholder={t('selectDate')} />
        <PickerField kind="time" label={t('fTime')} value={form.time} onChange={set('time')} placeholder={t('selectTime')} />
      </View>

      </Panel>

      <Panel title={t('ticketColor')}>
        <ColorPicker value={form.color} onChange={set('color')} />
      </Panel>

      <Panel title={t('ticketSeating')}>
      <Pressable
        style={styles.upload}
        onPress={async () => {
          const uri = await pickImage();
          if (uri) set('ticketImage')(uri);
        }}
      >
        {form.ticketImage ? (
          <Image source={{ uri: form.ticketImage }} style={styles.preview} contentFit="contain" />
        ) : (
          <>
            <Text style={styles.uploadTitle}>{t('ticketPhoto')}</Text>
            <Text style={styles.uploadSub}>{t('ticketPhotoSub')}</Text>
          </>
        )}
        <Text style={styles.uploadBtn}>{form.ticketImage ? t('changeTicket') : t('addTicket')}</Text>
      </Pressable>
      {!!form.ticketImage && (
        <Pressable onPress={() => set('ticketImage')(null)} style={styles.remove}>
          <Text style={styles.removeText}>{t('removeTicket')}</Text>
        </Pressable>
      )}

      <View style={styles.row}>
        <Field label={t('zone')} value={form.zone} onChangeText={set('zone')} />
        <Field label={t('section')} value={form.section} onChangeText={set('section')} />
        <Field label={t('row')} value={form.row} onChangeText={set('row')} />
        <Field label={t('seat')} value={form.seat} onChangeText={set('seat')} />
      </View>
      </Panel>

      <Panel title={t('priceLabel')}>
      <View style={styles.row}>
        <Field label={t('priceField')} value={String(form.price ?? '')} onChangeText={set('price')} placeholder="0" keyboardType="decimal-pad" />
        <View style={styles.flex1}>
          <Text style={styles.label}>{t('currencyField')}</Text>
          <View style={styles.chips}>
            {CURRENCIES.map((c) => {
              const active = form.currency === c;
              return (
                <Pressable key={c} onPress={() => set('currency')(c)} style={[styles.chip, active && styles.chipOn]}>
                  <Text style={[styles.chipText, { color: active ? tk.limeInk : tk.text }]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
      <Field label={t('channelField')} value={form.purchaseChannel} onChangeText={set('purchaseChannel')} placeholder={t('channelPh')} />
      </Panel>

      {!!error && <Text style={styles.error}>{error}</Text>}
      <Button label={submitLabel} onPress={submit} disabled={busy} style={styles.save} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  label: { ...type.label, color: tk.sub, marginBottom: 8 },
  upload: { borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.18)', backgroundColor: tk.surfaceHi, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 12 },
  uploadTitle: { ...type.label, color: tk.text },
  uploadSub: { ...type.body, fontSize: 13, color: tk.sub, marginBottom: 8 },
  uploadBtn: { fontFamily: font.semibold, fontSize: 14, color: tk.lime, marginTop: 4 },
  preview: { width: '100%', height: 200, borderRadius: 10 },
  remove: { alignSelf: 'center', marginBottom: 12 },
  removeText: { fontFamily: font.semibold, color: tk.danger },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  chipOn: { backgroundColor: tk.lime, borderColor: tk.lime },
  chipText: { fontFamily: font.semibold, fontSize: 12 },
  error: { ...type.body, color: tk.danger, marginTop: 8 },
  save: { marginTop: 20, marginBottom: 40 },
});
