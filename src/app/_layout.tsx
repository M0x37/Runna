import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { isRunningInExpoGo } from 'expo';
import * as Sentry from '@sentry/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Archivo_600SemiBold, Archivo_700Bold, Archivo_800ExtraBold } from '@expo-google-fonts/archivo';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import '../global.css';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.EXPO_PUBLIC_SENTRY_DSN),
  sendDefaultPii: false,
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  integrations: [
    Sentry.expoRouterIntegration({
      enableTimeToInitialDisplay: !isRunningInExpoGo(),
    }),
  ],
  enableNativeFramesTracking: !isRunningInExpoGo(),
});

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayout() {
  const [fontsLoaded] = useFonts({
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0D0D0E' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontFamily: 'Archivo_700Bold', fontSize: 17 },
          headerTitleAlign: 'left',
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: '#0D0D0E' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="new-route" options={{ title: 'Route planen' }} />
        <Stack.Screen name="route/[id]" options={{ title: 'Deine Route' }} />
      </Stack>
    </>
  );
}

export default Sentry.wrap(RootLayout);
