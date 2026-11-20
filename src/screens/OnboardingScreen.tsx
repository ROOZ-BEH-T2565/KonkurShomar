import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import notifee from '@notifee/react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import JalaliDatePicker from '../components/JalaliDatePicker';
import { JDate, formatJalali, jKey, todayJalali } from '../utils/date';

export default function OnboardingScreen() {
  const { setExamDate } = useApp();
  const { colors } = useTheme();
  const [show, setShow] = useState(false);
  const [date, setDate] = useState<JDate>(() => ({ ...todayJalali(), jy: todayJalali().jy + (todayJalali().jm > 4 ? 1 : 0), jm: 4, jd: 1 }));

  const confirm = async () => {
    await notifee.requestPermission(); // POST_NOTIFICATIONS on Android 13+
    setExamDate(jKey(date));
  };

  return (
    <View style={[s.wrap, { backgroundColor: colors.bg }]}>
      <Text style={s.emoji}>🎯</Text>
      <Text style={[s.title, { color: colors.text }]}>به کنکور شمار خوش آمدی</Text>
      <Text style={[s.sub, { color: colors.sub }]}>تاریخ کنکورت را انتخاب کن تا شمارش معکوس شروع شود.</Text>

      <Pressable onPress={() => setShow(true)} style={[s.dateBtn, { borderColor: colors.primary, backgroundColor: colors.card }]}>
        <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>{formatJalali(jKey(date))}</Text>
      </Pressable>

      <Pressable onPress={confirm} style={[s.go, { backgroundColor: colors.primary }]}>
        <Text style={{ color: colors.onPrimary, fontWeight: '800', fontSize: 16 }}>شروع</Text>
      </Pressable>

      <JalaliDatePicker visible={show} value={date} onConfirm={d => { setDate(d); setShow(false); }} onCancel={() => setShow(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emoji: { fontSize: 64 },
  title: { fontSize: 24, fontWeight: '800', marginVertical: 8 },
  sub: { textAlign: 'center', marginBottom: 24 },
  dateBtn: { borderWidth: 2, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28, marginBottom: 20 },
  go: { borderRadius: 16, paddingVertical: 14, paddingHorizontal: 56 },
});
