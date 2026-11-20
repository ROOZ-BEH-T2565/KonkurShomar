import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { daysUntil, formatJalali, toFa } from '../utils/date';

export default function CountdownCard() {
  const { examDate } = useApp();
  const { colors } = useTheme();
  const [, force] = useState(0);
  useEffect(() => { // re-evaluate every minute so the day rolls over while the app is open
    const t = setInterval(() => force(x => x + 1), 60000);
    return () => clearInterval(t);
  }, []);
  if (!examDate) return null;
  const days = daysUntil(examDate);
  const critical = days >= 0 && days <= 10;
  const bg = critical ? colors.danger : colors.primary;

  return (
    <View style={[s.card, { backgroundColor: bg }]}>
      {days > 0 && (
        <Text style={[s.small, { color: colors.onPrimary }]}>
          {critical ? '⚠️ مرحله نهایی — متمرکز بمان!' : 'تا کنکور'}
        </Text>
      )}
      <Text style={[s.big, { color: colors.onPrimary }]}>
        {days > 0 ? `${toFa(days)} روز` : days === 0 ? 'امروز روز کنکور است!' : 'کنکور برگزار شد'}
      </Text>
      <Text style={[s.small, { color: colors.onPrimary }]}>{formatJalali(examDate)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16 },
  big: { fontSize: 38, fontWeight: '800', marginVertical: 6 },
  small: { fontSize: 14, opacity: 0.9 },
});
