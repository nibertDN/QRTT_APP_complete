import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import type { RelativePathString } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import AppButton from '@/components/AppButton';
import { ThemedText } from '@/components/themed-text';
import { Panel, ScreenScroll } from '@/components/ui/screen-shell';
import { usePresetColors } from '@/context/ThemeContext';
import { signIn } from '@/lib/auth';
import { FONT_SIZES, RADIUS, SPACING } from '@/constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const colors = usePresetColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await signIn(email.trim(), password);
      if (authError) setError(authError.message);
      else router.replace('/(tabs)');
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScreenScroll contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <View style={[styles.brandMark, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <SymbolView
              name={{ ios: 'qrcode.viewfinder', android: 'qr_code_scanner', web: 'qr_code_scanner' }}
              tintColor={colors.primary}
              size={26}
            />
          </View>
          <View style={styles.brandText}>
            <ThemedText variant="subtitle" weight="extrabold" color="primary" style={styles.brandName}>
              QRTT
            </ThemedText>
            <ThemedText variant="overline" weight="bold" color="secondary">
              Attendance System
            </ThemedText>
          </View>
        </View>

        <View style={styles.header}>
          <ThemedText variant="title" weight="extrabold" color="primary">
            Welcome back
          </ThemedText>
          <ThemedText variant="body" color="secondary">
            Sign in to record your attendance.
          </ThemedText>
          <View style={styles.ruleRow}>
            <View style={[styles.ruleAccent, { backgroundColor: colors.primary }]} />
            <View style={[styles.rule, { backgroundColor: colors.border }]} />
          </View>
        </View>

        <Panel bar>
          <View style={styles.fieldGroup}>
            <ThemedText variant="overline" weight="extrabold" color="secondary">
              Email
            </ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@school.edu"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.input,
                { backgroundColor: colors.surfaceSunken, borderColor: colors.border, color: colors.textPrimary },
              ]}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText variant="overline" weight="extrabold" color="secondary">
              Password
            </ThemedText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.input,
                { backgroundColor: colors.surfaceSunken, borderColor: colors.border, color: colors.textPrimary },
              ]}
              secureTextEntry
              editable={!loading}
            />
          </View>
        </Panel>

        {error && (
          <View
            style={[styles.errorBanner, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}
          >
            <SymbolView
              name={{ ios: 'exclamationmark.triangle.fill', android: 'error', web: 'error' }}
              tintColor={colors.danger}
              size={16}
            />
            <ThemedText variant="caption" weight="medium" color="danger" style={styles.errorText}>
              {error}
            </ThemedText>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
        ) : (
          <AppButton
            variant="primary"
            size="lg"
            fullWidth
            icon="login"
            title="Sign in"
            onPress={handleLogin}
            disabled={loading}
          />
        )}

        <View style={styles.footer}>
          <ThemedText variant="body" color="tertiary">{"Don't have an account?"}</ThemedText>
          <Link href={'/register' as RelativePathString} asChild>
            <Pressable onPress={() => router.push('/register' as RelativePathString)} style={styles.footerLink}>
              <ThemedText variant="body" weight="semibold" color="primary">
                Sign up
              </ThemedText>
            </Pressable>
          </Link>
        </View>
      </ScreenScroll>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    gap: 2,
  },
  brandName: {
    letterSpacing: 2,
  },
  header: {
    gap: SPACING.xs,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  ruleAccent: {
    width: 44,
    height: 3,
    borderRadius: 2,
  },
  rule: {
    flex: 1,
    height: 1,
  },
  fieldGroup: {
    gap: SPACING.xs,
  },
  input: {
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
  errorBanner: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  errorText: {
    flex: 1,
  },
  loader: {
    marginVertical: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  footerLink: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
});
