import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Head from 'expo-router/head';

import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Content Security Policy for Web
  // Restricts sources for scripts, styles, images, and other resources to trusted origins.
  // 'unsafe-inline' is currently needed for some styled-components/react-native-web logic in dev,
  // but we try to be as restrictive as possible.
  // Note: 'frame-ancestors' is ignored in <meta> tags, but kept for documentation of intent
  // (it should be configured in server headers for real clickjacking protection).
  const cspContent = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // 'unsafe-inline' needed for hydration/hmr
    "style-src 'self' 'unsafe-inline'", // 'unsafe-inline' needed for CSS-in-JS
    "img-src 'self' data: https://huggingface.co https://*.huggingface.co", // Allow images from HF (if any) and data URIs
    "connect-src 'self' https://huggingface.co https://*.huggingface.co", // Allow fetching models
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ');

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Head>
        <meta httpEquiv="Content-Security-Policy" content={cspContent} />
        <meta name="referrer" content="no-referrer" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      </Head>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
