import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import type { RelativePathString } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import AppButton from '@/components/AppButton';
import { ThemedText } from '@/components/themed-text';
import { Panel, ScreenScroll } from '@/components/ui/screen-shell';
import { usePresetColors } from '@/context/ThemeContext';
import { signUp } from '@/lib/auth';
import { FONT_SIZES, RADIUS, SPACING, type ThemeColors } from '@/constants/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const colors = usePresetColors();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) return setError('All fields are required.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      const { data, error: authError } = await signUp(email.trim(), password, {
        full_name: fullName.trim(),
        role,
      });
      if (authError) setError(authError.message);
      else if (data.session) router.replace('/(tabs)');
      else setSuccess(true);
    } catch {
      setError('Unable to create your account. Please try again.');
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
            Create account
          </ThemedText>
          <ThemedText variant="body" color="secondary">
            Register to start recording attendance.
          </ThemedText>
          <View style={styles.ruleRow}>
            <View style={[styles.ruleAccent, { backgroundColor: colors.primary }]} />
            <View style={[styles.rule, { backgroundColor: colors.border }]} />
          </View>
        </View>

        {success ? (
          <Panel bar tone="elevated" style={styles.successCard}>
            <View style={[styles.successIcon, { backgroundColor: colors.successLight }]}>
              <SymbolView
                name={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }}
                tintColor={colors.success}
                size={24}
              />
            </View>
            <ThemedText variant="heading" weight="bold" color="primary" style={styles.centerText}>
              Check your email
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={[styles.centerText, styles.successText]}>
              Confirm your account, then return to sign in.
            </ThemedText>
            <AppButton
              variant="primary"
              size="md"
              fullWidth
              title="Go to Sign In"
              icon="login"
              onPress={() => router.replace('/login' as RelativePathString)}
            />
          </Panel>
        ) : (
          <>
            <Panel bar>
              <Field label="Full name">
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Your name"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.input, stylesField(colors)]}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </Field>

              <Field label="Email">
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@school.edu"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.input, stylesField(colors)]}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </Field>

              <Field label="Password">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.input, stylesField(colors)]}
                  secureTextEntry
                  editable={!loading}
                />
              </Field>

              <Field label="Confirm password">
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat your password"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.input, stylesField(colors)]}
                  secureTextEntry
                  editable={!loading}
                />
              </Field>

              <Field label="I am a...">
                <View style={styles.roleRow}>
                  {(['student', 'teacher'] as const).map((option) => {
                    const active = role === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setRole(option)}
                        style={({ pressed }) => [
                          styles.roleTile,
                          {
                            backgroundColor: active ? colors.primaryLight : colors.surfaceSunken,
                            borderColor: active ? colors.primary : colors.border,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                        disabled={loading}
                      >
                        <SymbolView
                          name={
                            option === 'student'
                              ? { ios: 'graduationcap.fill', android: 'school', web: 'school' }
                              : { ios: 'person.2.fill', android: 'person', web: 'person' }
                          }
                          tintColor={active ? colors.primary : colors.textTertiary}
                          size={20}
                        />
                        <ThemedText variant="caption" weight="bold" color={active ? 'primary' : 'secondary'}>
                          {option === 'student' ? 'Student' : 'Teacher'}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </Field>
            </Panel>

            {error && (
              <View style={[styles.errorBanner, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
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
                icon="register"
                title="Sign up"
                onPress={handleRegister}
                disabled={loading}
              />
            )}
          </>
        )}

        <View style={styles.footer}>
          <ThemedText variant="body" color="tertiary">Already have an account?</ThemedText>
          <Link href={'/login' as RelativePathString} asChild>
            <Pressable onPress={() => router.push('/login' as RelativePathString)} style={styles.footerLink}>
              <ThemedText variant="body" weight="semibold" color="primary">
                Sign in
              </ThemedText>
            </Pressable>
          </Link>
        </View>
      </ScreenScroll>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldGroup}>
      <ThemedText variant="overline" weight="extrabold" color="secondary">
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

const stylesField = (colors: ThemeColors) => ({
  backgroundColor: colors.surfaceSunken,
  borderColor: colors.border,
  color: colors.textPrimary,
});

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
  roleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  roleTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
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
  successCard: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  successIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  successText: {
    marginBottom: SPACING.sm,
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
