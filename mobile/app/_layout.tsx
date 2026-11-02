import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { InventoryProvider } from '../context/InventoryContext';
import { FloatingAIChatbot } from '../components/FloatingAIChatbot';
import { colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <AuthProvider>
        <InventoryProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bgMidnight },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="auth"
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
          </Stack>
          <FloatingAIChatbot />
        </InventoryProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
