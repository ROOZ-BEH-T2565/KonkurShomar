import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import CountdownCard from '../components/CountdownCard';
import StudyCard from '../components/StudyCard';
import TodoList from '../components/TodoList';
import { formatJalali, todayKey } from '../utils/date';

export default function TodayScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const key = todayKey();
  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16 }}
      keyboardShouldPersistTaps="handled">
      <CountdownCard />
      <StudyCard />
      <Text style={[s.h, { color: colors.text }]}>کارهای امروز — {formatJalali(key)}</Text>
      <TodoList dateKey={key} />
    </ScrollView>
  );
}
const s = StyleSheet.create({ h: { fontSize: 16, fontWeight: '700', marginBottom: 12 } });
