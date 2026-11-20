import { NativeModules, Platform } from 'react-native';

const M = NativeModules.KonkurCountdown;
const on = Platform.OS === 'android' && !!M;

export const Countdown = {
  setExamDate: (iso: string) => (on ? M.setExamDate(iso) : Promise.resolve()),
  start: () => (on ? M.start() : Promise.resolve()),
  stop: () => (on ? M.stop() : Promise.resolve()),
  canScheduleExactAlarms: (): Promise<boolean> => (on ? M.canScheduleExactAlarms() : Promise.resolve(true)),
  openExactAlarmSettings: () => on && M.openExactAlarmSettings(),
  isIgnoringBatteryOptimizations: (): Promise<boolean> =>
    on ? M.isIgnoringBatteryOptimizations() : Promise.resolve(true),
  requestIgnoreBatteryOptimizations: () => on && M.requestIgnoreBatteryOptimizations(),
};
