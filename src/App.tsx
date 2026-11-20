import React from 'react';
import { ActivityIndicator, I18nManager, StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import Navigation from './navigation';
import OnboardingScreen from './screens/OnboardingScreen';

// Native side (MainApplication) already forces RTL before the first frame;
// this is a safety net for dev builds.
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

function Root() {
  const { loaded, examDate } = useApp();
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      {!loaded ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : examDate ? (
        <Navigation />
      ) : (
        <OnboardingScreen />
      )}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemeProvider>
          <Root />
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
