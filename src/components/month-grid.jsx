import React, { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useSettings } from '../context/SettingsContext';
import { colors as tk, font } from '../theme/tokens';
import { MONTHS_FULL, WEEKDAYS, parseDate, toKey } from '../utils/events';

// Month calendar. `marked` is an object keyed by YYYY-MM-DD; `initial` picks the starting month.
export default function MonthGrid({ initial, selected, marked = {}, onSelect }) {
  const { colors, lang } = useSettings();
  const now = new Date();
  const todayKey = toKey(now.getFullYear(), now.getMonth(), now.getDate());
  const start = parseDate(initial) || now;

  const [view, setView] = useState({ y: start.getFullYear(), m: start.getMonth() });

  const shift = (delta) =>
    setView(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  // Leading blanks so day 1 lands on the right weekday, then the days.
  const first = new Date(view.y, view.m, 1).getDay();
  const count = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const year = lang === 'th' ? view.y + 543 : view.y;

  return (
    <View>
      <View style={styles.monthRow}>
        <TouchableOpacity style={styles.arrow} onPress={() => shift(-1)} hitSlop={8}>
          <ChevronLeft color={colors.text} size={22} strokeWidth={1.75} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: colors.text }]}>{MONTHS_FULL[lang][view.m]} {year}</Text>
        <TouchableOpacity style={styles.arrow} onPress={() => shift(1)} hitSlop={8}>
          <ChevronRight color={colors.text} size={22} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      <View style={styles.week}>
        {WEEKDAYS[lang].map((w, i) => (
          <Text key={i} style={[styles.weekday, { color: colors.sub }]}>{w}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={i} style={styles.cell} />;
          const key = toKey(view.y, view.m, day);
          const isSel = key === selected;
          const isToday = key === todayKey;
          return (
            <TouchableOpacity key={i} style={styles.cell} onPress={() => onSelect(key)}>
              <View style={[styles.dayInner, isSel && styles.dayOn]}>
                <Text style={[styles.dayText, { color: isSel ? tk.limeInk : colors.text }, isToday && !isSel && styles.today]}>{day}</Text>
                {!!marked[key] && (
                  <View style={styles.dots}>
                    {(marked[key].events?.length ?? 1) > 0 && <View style={[styles.dot, { backgroundColor: isSel ? tk.limeInk : '#FFFFFF' }]} />}
                    {marked[key].rounds?.length > 0 && <View style={[styles.dot, { backgroundColor: isSel ? tk.limeInk : tk.lime }]} />}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthText: { fontFamily: font.semibold, fontSize: 17 },
  arrow: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row', marginBottom: 4 },
  weekday: { flex: 1, textAlign: 'center', fontFamily: font.medium, fontSize: 11 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  dayInner: { flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontFamily: font.medium, fontSize: 15 },
  dayOn: { backgroundColor: tk.lime },
  today: { textDecorationLine: 'underline', color: tk.lime },
  dots: { flexDirection: 'row', gap: 3, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
