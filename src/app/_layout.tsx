import { Redirect, Stack, useSegments, ThemeProvider as NavigationThemeProvider, DarkTheme, DefaultTheme } from 'expo-router';
import type { RelativePathString } from 'expo-router';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { completeAuthFromUrl, useAuth } from '@/lib/auth';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

function LoadingScreen() {
  const colors = useTheme().colors;
  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

function RootNavigator() {
  const { session } = useAuth();
  const segments = useSegments();
  const { colors, scheme } = useTheme();

  const navTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      dark: scheme === 'dark',
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [scheme, colors]);

  const path = segments[0];
  const inAuthGroup = path === 'login' || path === 'register';
  const inTabsGroup = path === '(tabs)';

  return (
    <NavigationThemeProvider value={navTheme}>
      <Stack initialRouteName="login" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {!session && inTabsGroup && <Redirect href={'/login' as RelativePathString} />}
        {session && inAuthGroup && <Redirect href={'/(tabs)' as RelativePathString} />}
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const { loading } = useAuth();

  useEffect(() => {
    void SplashScreen.hideAsync();

    const handleUrl = ({ url }: { url: string }) => {
      void completeAuthFromUrl(url);
    };

    const subscription = Linking.addEventListener('url', handleUrl);
    void Linking.getInitialURL().then((url) => {
      if (url) void completeAuthFromUrl(url);
    });

    return () => subscription.remove();
  }, []);

  if (loading) {
    return <ThemeProvider><LoadingScreen /></ThemeProvider>;
  }

  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
