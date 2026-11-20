import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { useApp } from '../context/AppContext';

export type Colors = {
  bg: string; card: string; text: string; sub: string; primary: string;
  border: string; danger: string; success: string; onPrimary: string;
};
const light: Colors = {
  bg: '#F4F6FB', card: '#FFFFFF', text: '#1B1F2A', sub: '#6B7280', primary: '#3F51B5',
  border: '#E3E7F0', danger: '#D32F2F', success: '#2E9E5B', onPrimary: '#FFFFFF',
};
const dark: Colors = {
  bg: '#0F1220', card: '#1A1F33', text: '#ECEFF8', sub: '#9AA3BD', primary: '#8C9EFF',
  border: '#2A3050', danger: '#FF6B6B', success: '#4CD08A', onPrimary: '#0F1220',
};

type T = { colors: Colors; isDark: boolean; navTheme: Theme };
const ThemeCtx = createContext<T>(null as unknown as T);
export const useTheme = () => useContext(ThemeCtx);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeMode } = useApp();
  const system = useColorScheme();
  const isDark = themeMode === 'system' ? system === 'dark' : themeMode === 'dark';
  const value = useMemo<T>(() => {
    const colors = isDark ? dark : light;
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      colors, isDark,
      navTheme: {
        ...base,
        colors: {
          ...base.colors, background: colors.bg, card: colors.card, text: colors.text,
          border: colors.border, primary: colors.primary,
        },
      },
    };
  }, [isDark]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
