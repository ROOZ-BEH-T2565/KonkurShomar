import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import TodayScreen from '../screens/TodayScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const ICONS: Record<string, string> = { Today: 'calendar-today', Calendar: 'calendar-month', Settings: 'cog' };

export default function Navigation() {
  const { navTheme } = useTheme();
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Icon name={ICONS[route.name]} size={size} color={color} />,
        })}>
        <Tab.Screen name="Today" component={TodayScreen} options={{ title: 'امروز' }} />
        <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'تقویم' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'تنظیمات' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
