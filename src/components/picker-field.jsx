import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View, StyleSheet, Pressable } from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import { useSettings } from '../context/SettingsContext';
import { colors as tk, font } from '../theme/tokens';
import { formatDate } from '../utils/events';
import Button from './button';
import MonthGrid from './month-grid';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const pad = (n) => String(n).padStart(2, '0');

function Column({ items, value, onPick, colors }) {
  return (
    <ScrollView style={styles.column} showsVerticalScrollIndicator={false} nestedScrollEnabled>
      {items.map((n) => {
        const active = n === value;
        const label = <Text style={[styles.itemText, { color: active ? tk.limeInk : colors.text }]}>{pad(n)}</Text>;
        return (
          <TouchableOpacity key={n} onPress={() => onPick(n)}>
            <View style={[styles.item, active && { backgroundColor: tk.lime }]}>{label}</View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function TimeSheet({ value, onConfirm }) {
  const { colors, t } = useSettings();
  const m = /^(\d{1,2}):(\d{2})$/.exec(value || '');
  const [h, setH] = useState(m ? Math.min(Number(m[1]), 23) : 19);
  const [min, setMin] = useState(m ? Number(m[2]) : 0);

  return (
    <>
      <View style={styles.columns}>
        <Column items={HOURS} value={h} onPick={setH} colors={colors} />
        <Text style={[styles.colon, { color: colors.text }]}>:</Text>
        <Column items={MINUTES} value={min} onPick={setMin} colors={colors} />
      </View>
      <Button label={t('ok')} onPress={() => onConfirm(`${pad(h)}:${pad(min)}`)} />
    </>
  );
}

// Tap-to-open field that picks a date (kind="date") or time (kind="time") instead of typing.
export default function PickerField({ kind, label, value, onChange, placeholder }) {
  const { colors, lang, t } = useSettings();
  const [open, setOpen] = useState(false);

  const shown = value ? (kind === 'date' ? formatDate({ date: value }, lang) : value) : '';

  return (
    <View style={styles.flex1}>
      <Text style={[styles.label, { color: colors.sub }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.field, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setOpen(true)}
      >
        <Text style={{ fontFamily: font.regular, fontSize: 15, color: shown ? colors.text : colors.placeholder }} numberOfLines={1}>
          {shown || placeholder}
        </Text>
        {kind === 'date' ? <Calendar color={colors.sub} size={16} strokeWidth={1.75} /> : <Clock color={colors.sub} size={16} strokeWidth={1.75} />}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={() => setOpen(false)}>
          {/* inner Pressable stops taps on the sheet from closing it */}
          <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
            {kind === 'date' ? (
              <MonthGrid
                initial={value}
                selected={value}
                onSelect={(key) => {
                  onChange(key);
                  setOpen(false);
                }}
              />
            ) : (
              <TimeSheet
                value={value}
                onConfirm={(v) => {
                  onChange(v);
                  setOpen(false);
                }}
              />
            )}
            <TouchableOpacity style={styles.cancel} onPress={() => setOpen(false)}>
              <Text style={{ color: colors.sub, fontWeight: 'bold' }}>{t('cancel')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  label: { fontFamily: font.medium, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  field: { backgroundColor: tk.surfaceHi, borderWidth: StyleSheet.hairlineWidth, borderColor: tk.line, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  sheet: { width: '100%', maxWidth: 380, borderRadius: 16, padding: 16 },
  columns: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  column: { height: 220, width: 80 },
  colon: { fontSize: 24, fontWeight: 'bold', marginHorizontal: 8 },
  item: { paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  itemText: { fontFamily: font.bold, fontSize: 18 },
  cancel: { alignItems: 'center', paddingTop: 14 },
});
