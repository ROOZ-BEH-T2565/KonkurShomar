import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp, ThemeMode } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { Countdown } from '../native/Countdown';
import JalaliDatePicker from '../components/JalaliDatePicker';
import { formatJalali, formatMinutes, jKey, parseKey, todayJalali } from '../utils/date';

const MODES: { id: ThemeMode; label: string }[] = [
  { id: 'system', label: 'سیستم' },
  { id: 'light', label: 'روشن' },
  { id: 'dark', label: 'تیره' },
];

export default function SettingsScreen() {
  const { examDate, setExamDate, goalMinutes, setGoalMinutes, themeMode, setThemeMode, notifEnabled, setNotifEnabled } = useApp();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [picker, setPicker] = useState(false);
  const [permOk, setPermOk] = useState(true);
  const [exactOk, setExactOk] = useState(true);
  const [battOk, setBattOk] = useState(true);

  const refresh = useCallback(async () => {
    const s = await notifee.getNotificationSettings();
    setPermOk(s.authorizationStatus === AuthorizationStatus.AUTHORIZED);
    setExactOk(await Countdown.canScheduleExactAlarms());
    setBattOk(await Countdown.isIgnoringBatteryOptimizations());
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[s.cardTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
  const Row = ({ label, ok, onPress }: { label: string; ok: boolean; onPress: () => void }) => (
    <View style={s.row}>
      <Text style={{ color: colors.text, flex: 1 }}>{label}</Text>
      {ok ? (
        <Text style={{ color: colors.success }}>فعال ✓</Text>
      ) : (
        <Pressable onPress={async () => { await onPress(); setTimeout(refresh, 800); }} style={[s.small, { backgroundColor: colors.primary }]}>
          <Text style={{ color: colors.onPrimary }}>اجازه دادن</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16 }}>
      <Card title="تاریخ کنکور">
        <Pressable onPress={() => setPicker(true)} style={[s.dateBtn, { borderColor: colors.primary }]}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>{examDate ? formatJalali(examDate) : 'انتخاب تاریخ'}</Text>
        </Pressable>
      </Card>

      <Card title="هدف مطالعه روزانه">
        <View style={s.stepper}>
          <Pressable onPress={() => setGoalMinutes(Math.max(30, goalMinutes - 30))} style={[s.stepBtn, { borderColor: colors.border }]}>
            <Text style={[s.stepTxt, { color: colors.text }]}>−</Text>
          </Pressable>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{formatMinutes(goalMinutes)}</Text>
          <Pressable onPress={() => setGoalMinutes(Math.min(1080, goalMinutes + 30))} style={[s.stepBtn, { borderColor: colors.border }]}>
            <Text style={[s.stepTxt, { color: colors.text }]}>+</Text>
          </Pressable>
        </View>
      </Card>

      <Card title="پوسته">
        <View style={s.seg}>
          {MODES.map(m => (
            <Pressable
              key={m.id}
              onPress={() => setThemeMode(m.id)}
              style={[s.segBtn, { backgroundColor: themeMode === m.id ? colors.primary : 'transparent', borderColor: colors.border }]}>
              <Text style={{ color: themeMode === m.id ? colors.onPrimary : colors.text }}>{m.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card title="اعلان شمارش معکوس">
        <View style={s.row}>
          <Text style={{ color: colors.text, flex: 1 }}>نمایش اعلان دائمی</Text>
          <Switch value={notifEnabled} onValueChange={async v => { await setNotifEnabled(v); refresh(); }} />
        </View>
        <Row label="مجوز اعلان‌ها" ok={permOk} onPress={() => notifee.requestPermission()} />
        <Row label="به‌روزرسانی دقیق نیمه‌شب" ok={exactOk} onPress={() => Countdown.openExactAlarmSettings()} />
        <Row label="معاف از بهینه‌سازی باتری (پیشنهادی)" ok={battOk} onPress={() => Countdown.requestIgnoreBatteryOptimizations()} />
      </Card>

      <JalaliDatePicker
        visible={picker}
        value={examDate ? parseKey(examDate) : todayJalali()}
        onConfirm={d => { setExamDate(jKey(d)); setPicker(false); }}
        onCancel={() => setPicker(false)}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  small: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  dateBtn: { borderWidth: 1.5, borderRadius: 12, padding: 12, alignItems: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepTxt: { fontSize: 24 },
  seg: { flexDirection: 'row', gap: 8 },
  segBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
});
