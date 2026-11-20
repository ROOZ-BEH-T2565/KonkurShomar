import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import notifee from '@notifee/react-native';
import { Countdown } from '../native/Countdown';
import { K, load, save } from '../utils/storage';
import { keyToIso, todayKey } from '../utils/date';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Todo = { id: string; date: string; title: string; done: boolean };

type Ctx = {
  loaded: boolean;
  examDate: string | null;
  setExamDate: (key: string) => void;
  goalMinutes: number;
  setGoalMinutes: (m: number) => void;
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  todos: Todo[];
  addTodo: (date: string, title: string) => void;
  editTodo: (id: string, title: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  studyLogs: Record<string, number>;
  addStudyMinutes: (date: string, minutes: number) => void;
  timerStart: number | null;
  startTimer: () => void;
  stopTimer: () => void;
  notifEnabled: boolean;
  setNotifEnabled: (on: boolean) => Promise<void>;
};

const AppCtx = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [examDate, setExam] = useState<string | null>(null);
  const [goalMinutes, setGoal] = useState(360);
  const [themeMode, setTheme] = useState<ThemeMode>('system');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [studyLogs, setStudy] = useState<Record<string, number>>({});
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [notifEnabled, setNotif] = useState(true);

  useEffect(() => {
    (async () => {
      const [e, g, t, td, s, tm, n] = await Promise.all([
        load<string | null>(K.examDate, null),
        load(K.goal, 360),
        load<ThemeMode>(K.theme, 'system'),
        load<Todo[]>(K.todos, []),
        load<Record<string, number>>(K.study, {}),
        load<number | null>(K.timer, null),
        load(K.notif, true),
      ]);
      setExam(e); setGoal(g); setTheme(t); setTodos(td); setStudy(s); setTimerStart(tm); setNotif(n);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { loaded && save(K.examDate, examDate); }, [examDate, loaded]);
  useEffect(() => { loaded && save(K.goal, goalMinutes); }, [goalMinutes, loaded]);
  useEffect(() => { loaded && save(K.theme, themeMode); }, [themeMode, loaded]);
  useEffect(() => { loaded && save(K.todos, todos); }, [todos, loaded]);
  useEffect(() => { loaded && save(K.study, studyLogs); }, [studyLogs, loaded]);
  useEffect(() => { loaded && save(K.timer, timerStart); }, [timerStart, loaded]);
  useEffect(() => { loaded && save(K.notif, notifEnabled); }, [notifEnabled, loaded]);

  // Keep the native foreground service in sync with the JS state.
  useEffect(() => {
    if (!loaded || !examDate) return;
    (async () => {
      await Countdown.setExamDate(keyToIso(examDate));
      if (notifEnabled) await Countdown.start().catch(() => {});
      else await Countdown.stop();
    })();
  }, [loaded, examDate, notifEnabled]);

  const setNotifEnabled = useCallback(async (on: boolean) => {
    if (on) await notifee.requestPermission(); // Android 13+ POST_NOTIFICATIONS
    setNotif(on);
  }, []);

  const value: Ctx = {
    loaded, examDate, setExamDate: setExam,
    goalMinutes, setGoalMinutes: setGoal,
    themeMode, setThemeMode: setTheme,
    todos,
    addTodo: (date, title) =>
      setTodos(p => [...p, { id: `${Date.now()}${Math.random().toString(36).slice(2, 6)}`, date, title, done: false }]),
    editTodo: (id, title) => setTodos(p => p.map(t => (t.id === id ? { ...t, title } : t))),
    toggleTodo: id => setTodos(p => p.map(t => (t.id === id ? { ...t, done: !t.done } : t))),
    deleteTodo: id => setTodos(p => p.filter(t => t.id !== id)),
    studyLogs,
    addStudyMinutes: (date, minutes) =>
      setStudy(p => ({ ...p, [date]: Math.max(0, (p[date] ?? 0) + minutes) })),
    timerStart,
    startTimer: () => setTimerStart(Date.now()),
    stopTimer: () => {
      if (timerStart == null) return;
      const mins = Math.round((Date.now() - timerStart) / 60000);
      const day = todayKey();
      setStudy(p => ({ ...p, [day]: (p[day] ?? 0) + mins }));
      setTimerStart(null);
    },
    notifEnabled, setNotifEnabled,
  };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
