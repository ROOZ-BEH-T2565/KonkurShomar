import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import TodoList from '../components/TodoList';
import {
  JALALI_MONTHS, WEEKDAYS_SHORT, formatJalali, jKey, monthLength, toFa, todayJalali, todayKey, weekdayIndex,
} from '../utils/date';

export default function CalendarScreen() {
  const { colors } = useTheme();
  const { todos, examDate } = useApp();
  const insets = useSafeAreaInsets();
  const t = todayJalali();
  const [ym, setYm] = useState({ jy: t.jy, jm: t.jm });
  const [selected, setSelected] = useState<string | null>(null);

  const today = todayKey(); // marks are derived from "today", so they stay right when the exam date changes
  const withTodos = useMemo(() => new Set(todos.map(x => x.date)), [todos]);

  const move = (delta: number) =>
    setYm(p => {
      let m = p.jm + delta, y = p.jy;
      if (m > 12) { m = 1; y++; }
      if (m < 1) { m = 12; y--; }
      return { jy: y, jm: m };
    });

  const offset = weekdayIndex({ ...ym, jd: 1 });
  const len = monthLength(ym.jy, ym.jm);
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: len }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 12, paddingHorizontal: 12 }}>
      <View style={s.header}>
        <Pressable onPress={() => move(-1)} hitSlop={10}><Icon name="chevron-right" size={32} color={colors.primary} /></Pressable>
        <Text style={[s.month, { color: colors.text }]}>{JALALI_MONTHS[ym.jm - 1]} {toFa(ym.jy)}</Text>
        <Pressable onPress={() => move(1)} hitSlop={10}><Icon name="chevron-left" size={32} color={colors.primary} /></Pressable>
      </View>

      <View style={s.weekRow}>
        {WEEKDAYS_SHORT.map(w => (
          <Text key={w} style={[s.cellBox, s.weekday, { color: w === 'ج' ? colors.danger : colors.sub }]}>{w}</Text>
        ))}
      </View>

      <View style={s.grid}>
        {cells.map((d, i) => {
          if (d == null) return <View key={i} style={s.cellBox} />;
          const key = jKey({ ...ym, jd: d });
          const past = key < today;
          const isToday = key === today;
          const isExam = key === examDate;
          return (
            <Pressable key={i} style={s.cellBox} onPress={() => setSelected(key)}>
              <View
                style={[
                  s.cell,
                  { borderColor: isToday ? colors.primary : 'transparent', backgroundColor: isExam ? colors.danger : colors.card },
                ]}>
                <Text
                  style={{
                    color: isExam ? '#fff' : past ? colors.sub : colors.text,
                    textDecorationLine: past ? 'line-through' : 'none',
                    fontWeight: isToday ? '800' : '500',
                  }}>
                  {toFa(d)}
                </Text>
                {past && <Icon name="check" size={18} color={colors.success} style={s.check} />}
                {isExam && <Icon name="flag-checkered" size={12} color="#fff" style={s.flag} />}
                {withTodos.has(key) && <View style={[s.dot, { backgroundColor: colors.primary }]} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={s.backdrop}>
          <View style={[s.sheet, { backgroundColor: colors.bg }]}>
            <View style={s.sheetHead}>
              <Text style={[s.sheetTitle, { color: colors.text }]}>{selected ? formatJalali(selected) : ''}</Text>
              <Pressable onPress={() => setSelected(null)} hitSlop={10}>
                <Icon name="close" size={26} color={colors.sub} />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {selected && <TodoList dateKey={selected} />}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  month: { fontSize: 20, fontWeight: '800' },
  weekRow: { flexDirection: 'row' },
  weekday: { textAlign: 'center', fontWeight: '700', paddingVertical: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cellBox: { width: `${100 / 7}%` },
  cell: { margin: 2, aspectRatio: 1, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  check: { position: 'absolute', bottom: 1, end: 3 },
  flag: { position: 'absolute', top: 2, end: 3 },
  dot: { position: 'absolute', bottom: 4, width: 5, height: 5, borderRadius: 3 },
  backdrop: { flex: 1, backgroundColor: '#0007', justifyContent: 'flex-end' },
  sheet: { maxHeight: '80%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 18, fontWeight: '800' },
});
