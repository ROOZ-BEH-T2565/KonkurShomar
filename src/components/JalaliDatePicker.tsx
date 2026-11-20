import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import { JALALI_MONTHS, JDate, monthLength, toFa } from '../utils/date';

type Props = {
  visible: boolean;
  value: JDate;
  minYear?: number;
  maxYear?: number;
  onConfirm: (d: JDate) => void;
  onCancel: () => void;
};

export default function JalaliDatePicker({
  visible, value, minYear = 1403, maxYear = 1415, onConfirm, onCancel,
}: Props) {
  const { colors } = useTheme();
  const [d, setD] = useState<JDate>(value);
  useEffect(() => { if (visible) setD(value); }, [visible, value]);

  const clamp = (n: JDate): JDate => ({ ...n, jd: Math.min(n.jd, monthLength(n.jy, n.jm)) });
  const wrap = (v: number, lo: number, hi: number) => (v > hi ? lo : v < lo ? hi : v);
  const step = (part: 'jy' | 'jm' | 'jd', delta: number) => {
    setD(prev => {
      const n = { ...prev };
      if (part === 'jy') n.jy = wrap(prev.jy + delta, minYear, maxYear);
      if (part === 'jm') n.jm = wrap(prev.jm + delta, 1, 12);
      if (part === 'jd') n.jd = wrap(prev.jd + delta, 1, monthLength(prev.jy, prev.jm));
      return clamp(n);
    });
  };

  const Col = ({ label, part, text }: { label: string; part: 'jy' | 'jm' | 'jd'; text: string }) => (
    <View style={s.col}>
      <Text style={[s.label, { color: colors.sub }]}>{label}</Text>
      <Pressable onPress={() => step(part, 1)} hitSlop={8}>
        <Icon name="chevron-up" size={32} color={colors.primary} />
      </Pressable>
      <Text style={[s.val, { color: colors.text }]}>{text}</Text>
      <Pressable onPress={() => step(part, -1)} hitSlop={8}>
        <Icon name="chevron-down" size={32} color={colors.primary} />
      </Pressable>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.backdrop}>
        <View style={[s.sheet, { backgroundColor: colors.card }]}>
          <Text style={[s.title, { color: colors.text }]}>انتخاب تاریخ (شمسی)</Text>
          <View style={s.row}>
            <Col label="سال" part="jy" text={toFa(d.jy)} />
            <Col label="ماه" part="jm" text={JALALI_MONTHS[d.jm - 1]} />
            <Col label="روز" part="jd" text={toFa(d.jd)} />
          </View>
          <View style={s.actions}>
            <Pressable style={[s.btn, { backgroundColor: colors.primary }]} onPress={() => onConfirm(d)}>
              <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>تأیید</Text>
            </Pressable>
            <Pressable style={[s.btn, { borderColor: colors.border, borderWidth: 1 }]} onPress={onCancel}>
              <Text style={{ color: colors.text }}>انصراف</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 24 },
  sheet: { borderRadius: 20, padding: 20 },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 },
  col: { alignItems: 'center', minWidth: 80 },
  label: { fontSize: 12, marginBottom: 4 },
  val: { fontSize: 20, fontWeight: '700', marginVertical: 4 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12 },
});
