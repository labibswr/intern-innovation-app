import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import AlertDetailScreen from '../screens/AlertDetailScreen';
import AiCallScreen from '../screens/AiCallScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Tab icon helper ──────────────────────────────────────────────────────────

function TabIcon({ emoji, label, focused }) {
  return (
    <View style={tabStyles.iconWrapper}>
      <Text style={[tabStyles.emoji, { opacity: focused ? 1 : 0.45 }]}>{emoji}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrapper: { alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
});

// ── Home stack (Home → AlertDetail) ─────────────────────────────────────────

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />
    </Stack.Navigator>
  );
}

// ── Main bottom tabs ─────────────────────────────────────────────────────────

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e8edf2',
          borderTopWidth: 1,
          height: 82,
          paddingBottom: 18,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#8a9bb0',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔔" label="Alerts" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ── Root navigator ───────────────────────────────────────────────────────────
// AiCall is at the root stack so it covers the tab bar (true full-screen, like FaceTime)

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="AiCall"
        component={AiCallScreen}
        options={{
          // Slide up like a call screen, covering the tab bar entirely
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}
