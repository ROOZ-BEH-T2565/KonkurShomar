import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../theme/ThemeContext';

export default function TodoList({ dateKey }: { dateKey: string }) {
  const { todos, addTodo, editTodo, toggleTodo, deleteTodo } = useApp();
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const items = todos.filter(t => t.date === dateKey);

  const submit = () => {
    const v = text.trim();
    if (!v) return;
    if (editingId) editTodo(editingId, v);
    else addTodo(dateKey, v);
    setText('');
    setEditingId(null);
  };

  return (
    <View>
      <View style={s.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={submit}
          placeholder={editingId ? 'ویرایش کار…' : 'کار جدید…'}
          placeholderTextColor={colors.sub}
          style={[s.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
        />
        <Pressable onPress={submit} style={[s.add, { backgroundColor: colors.primary }]}>
          <Icon name={editingId ? 'check' : 'plus'} size={24} color={colors.onPrimary} />
        </Pressable>
      </View>

      {items.length === 0 && (
        <Text style={{ color: colors.sub, textAlign: 'center', marginTop: 16 }}>کاری برای این روز ثبت نشده است.</Text>
      )}

      {items.map(t => (
        <View key={t.id} style={[s.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable onPress={() => toggleTodo(t.id)} hitSlop={8}>
            <Icon
              name={t.done ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
              size={26}
              color={t.done ? colors.success : colors.sub}
            />
          </Pressable>
          <Text
            style={[
              s.itemText,
              { color: t.done ? colors.sub : colors.text, textDecorationLine: t.done ? 'line-through' : 'none' },
            ]}>
            {t.title}
          </Text>
          <Pressable
            hitSlop={8}
            onPress={() => { setEditingId(t.id); setText(t.title); }}>
            <Icon name="pencil-outline" size={22} color={colors.sub} />
          </Pressable>
          <Pressable hitSlop={8} onPress={() => { deleteTodo(t.id); if (editingId === t.id) { setEditingId(null); setText(''); } }}>
            <Icon name="trash-can-outline" size={22} color={colors.danger} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, textAlign: 'right' },
  add: { width: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  itemText: { flex: 1, fontSize: 15 },
});
