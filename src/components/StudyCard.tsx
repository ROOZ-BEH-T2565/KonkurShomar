import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';
import { formatMinutes, todayKey, toFa } from '../utils/date';

export default function StudyCard() {
  const { studyLogs, goalMinutes, addStudyMinutes, timerStart, startTimer, stopTimer } = useApp();
  const { colors } = useTheme();
  const [now, setNow] = useState(Date.now());
  const [manual, setManual] = useState('');

  useEffect(() => {
    if (timerStart == null) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [timerStart]);

  const key = todayKey();
  const running = timerStart != null ? Math.floor((now - timerStart) / 60000) : 0;
  const done = (studyLogs[key] ?? 0) + running;
  const pct = Math.min(1, goalMinutes ? done / goalMinutes : 0);

  const secs = timerStart != null ? Math.floor((now - timerStart) / 1000) : 0;
  const clock = `${String(Math.floor(secs / 3600)).padStart(2, '0')}:${String(Math.floor((secs % 3600) / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

  const addManual = () => {
    const n = parseInt(manual.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))), 10);
    if (n > 0) addStudyMinutes(key, n);
    setManual('');
  };

  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[s.title, { color: colors.text }]}>مطالعه امروز</Text>
      <Text style={[s.progress, { color: colors.primary }]}>
        {formatMinutes(done)} / {formatMinutes(goalMinutes)}
      </Text>
      <View style={[s.bar, { backgroundColor: colors.border }]}>
        <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: pct >= 1 ? colors.success : colors.primary, borderRadius: 6 }} />
      </View>

      <View style={s.row}>
        <Pressable
          onPress={timerStart == null ? startTimer : stopTimer}
          style={[s.btn, { backgroundColor: timerStart == null ? colors.primary : colors.danger }]}>
          <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>
            {timerStart == null ? 'شروع تایمر' : `توقف (${toFa(clock)})`}
          </Text>
        </Pressable>
      </View>

      <View style={s.row}>
        {[15, 30, 60].map(m => (
          <Pressable key={m} onPress={() => addStudyMinutes(key, m)} style={[s.chip, { borderColor: colors.border }]}>
            <Text style={{ color: colors.text }}>+{toFa(m)}د</Text>
          </Pressable>
        ))}
        <TextInput
          value={manual}
          onChangeText={setManual}
          placeholder="دقیقه"
          placeholderTextColor={colors.sub}
          keyboardType="number-pad"
          onSubmitEditing={addManual}
          style={[s.input, { color: colors.text, borderColor: colors.border }]}
        />
        <Pressable onPress={addManual} style={[s.chip, { borderColor: colors.primary }]}>
          <Text style={{ color: colors.primary }}>ثبت</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '700' },
  progress: { fontSize: 20, fontWeight: '800', marginVertical: 8 },
  bar: { height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  btn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, textAlign: 'right' },
});
