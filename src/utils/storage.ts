import AsyncStorage from '@react-native-async-storage/async-storage';

export const K = {
  examDate: 'examDate',
  goal: 'goalMinutes',
  theme: 'themeMode',
  todos: 'todos',
  study: 'studyLogs',
  timer: 'timerStart',
  notif: 'notifEnabled',
};

export async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const v = await AsyncStorage.getItem(key);
    return v == null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}
export async function save(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
