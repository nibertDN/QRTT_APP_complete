import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import type { RelativePathString } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import AppButton from '@/components/AppButton';
import { ThemedText } from '@/components/themed-text';
import { Panel, ScreenHeader, ScreenScroll } from '@/components/ui/screen-shell';
import { usePresetColors, useThemeControls } from '@/context/ThemeContext';
import { signOut, useAuth } from '@/lib/auth';
import { getProfile, updateProfile, type Profile } from '@/lib/profiles';
import { THEME_PRESETS, type ThemePresetName } from '@/constants/themePresets';
import { FONT_SIZES, RADIUS, SPACING, type ColorScheme } from '@/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colors = usePresetColors();
  const { preset, setPreset, colorScheme, setColorScheme, availablePresets } = useThemeControls();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draftName, setDraftName] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const nextProfile = await getProfile(user.id);
    setProfile(nextProfile);
    setDraftName(nextProfile?.full_name ?? '');
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    router.replace('/login' as RelativePathString);
  };

  const handleSaveName = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await updateProfile(user.id, { full_name: draftName.trim() });
    setSaving(false);
    if (error) {
      Alert.alert('Error', error);
      return;
    }
    setProfile((current) => (current ? { ...current, full_name: draftName.trim() } : current));
    setEditing(false);
  };

  const roleLabel = profile?.role === 'teacher' ? 'Teacher' : 'Student';

  return (
    <ScreenScroll contentContainerStyle={styles.scrollContent}>
      <ScreenHeader
        code="ACCOUNT / IDENTITY"
        title="My profile"
        subtitle="Account details, appearance and session controls."
      />

      <Panel bar style={styles.panel}>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: profile?.role === 'teacher' ? colors.primaryLight : colors.infoLight },
          ]}
        >
          <SymbolView
            name={
              profile?.role === 'teacher'
                ? { ios: 'person.2.fill', android: 'school', web: 'school' }
                : { ios: 'graduationcap.fill', android: 'school', web: 'school' }
            }
            tintColor={profile?.role === 'teacher' ? colors.primary : colors.info}
            size={14}
          />
          <ThemedText
            variant="caption"
            weight="extrabold"
            color={profile?.role === 'teacher' ? 'primary' : 'info'}
          >
            {roleLabel}
          </ThemedText>
        </View>

        <Field label="Name">
          {editing ? (
            <View style={styles.nameEditRow}>
              <TextInput
                value={draftName}
                onChangeText={setDraftName}
                style={[
                  styles.input,
                  { backgroundColor: colors.surfaceSunken, borderColor: colors.border, color: colors.textPrimary },
                ]}
                placeholder="Your name"
                placeholderTextColor={colors.textTertiary}
                editable={!saving}
              />
              <AppButton
                variant="primary"
                size="sm"
                icon="save"
                title={saving ? '...' : 'Save'}
                onPress={handleSaveName}
                disabled={saving}
              />
            </View>
          ) : (
            <Pressable
              onPress={() => setEditing(true)}
              style={({ pressed }) => [
                styles.valueRow,
                { backgroundColor: colors.surfaceSunken, borderColor: pressed ? colors.borderStrong : colors.border },
              ]}
            >
              <ThemedText variant="body" color={profile?.full_name ? 'primary' : 'tertiary'} style={styles.valueText}>
                {profile?.full_name || 'Tap to add your name'}
              </ThemedText>
              <ThemedText variant="caption" weight="bold" color="primary">
                EDIT
              </ThemedText>
            </Pressable>
          )}
        </Field>

        <Field label="Email">
          <ThemedText variant="body" color="primary">
            {user?.email ?? 'Unknown account'}
          </ThemedText>
        </Field>

        <Field label="User ID">
          <ThemedText variant="code" color="tertiary" selectable style={styles.id}>
            {user?.id ?? 'Not available'}
          </ThemedText>
        </Field>
      </Panel>

      <Panel style={styles.panel}>
        <View style={styles.sectionHead}>
          <ThemedText variant="overline" weight="extrabold" color="secondary">
            APPEARANCE
          </ThemedText>
          <ThemedText variant="caption" color="tertiary">
            {THEME_PRESETS[preset].description}
          </ThemedText>
        </View>

        <View style={styles.presetGrid}>
          {availablePresets.map((p) => {
            const active = preset === p.name;
            return (
              <Pressable
                key={p.name}
                onPress={() => setPreset(p.name as ThemePresetName)}
                style={({ pressed }) => [
                  styles.presetTile,
                  {
                    backgroundColor: active ? colors.primaryLight : colors.surfaceSunken,
                    borderColor: active ? colors.primary : colors.border,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <View style={styles.swatchRow}>
                  <View style={[styles.swatch, { backgroundColor: p.light.primary }]} />
                  <View style={[styles.swatch, { backgroundColor: p.dark.primary }]} />
                  <View style={[styles.swatch, { backgroundColor: p.dark.accent }]} />
                </View>
                <ThemedText
                  variant="caption"
                  weight="bold"
                  color={active ? 'primary' : 'secondary'}
                  numberOfLines={1}
                  style={styles.presetLabel}
                >
                  {p.label.replace('IT ', '')}
                </ThemedText>
                {active ? (
                  <SymbolView
                    name={{ ios: 'checkmark.circle.fill', android: 'done', web: 'check_circle' }}
                    tintColor={colors.primary}
                    size={14}
                    style={styles.presetCheck}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.modeRow}>
          <View style={styles.modeLabels}>
            <ThemedText variant="caption" weight="semibold" color="secondary">
              Interface mode
            </ThemedText>
            <ThemedText variant="caption" color="tertiary">
              {colorScheme === 'dark' ? 'Dark console palette' : 'Light workspace palette'}
            </ThemedText>
          </View>
          <View style={[styles.segment, { backgroundColor: colors.surfaceSunken, borderColor: colors.border }]}>
            {(['dark', 'light'] as const).map((mode) => {
              const active = colorScheme === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => setColorScheme(mode as ColorScheme)}
                  style={[styles.segmentItem, active && { backgroundColor: colors.primary }]}
                >
                  <ThemedText variant="caption" weight="bold" color={active ? 'onPrimary' : 'secondary'}>
                    {mode === 'dark' ? 'DARK' : 'LIGHT'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Panel>

      <View style={styles.signOutBlock}>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
        ) : (
          <AppButton variant="danger" size="lg" fullWidth icon="logout" title="Sign out" onPress={handleSignOut} />
        )}
      </View>
    </ScreenScroll>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText variant="overline" weight="extrabold" color="secondary">
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.lg,
  },
  signOutBlock: {
    marginTop: SPACING.xs,
  },
  panel: {
    marginBottom: SPACING.md,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 1,
  },
  field: {
    gap: SPACING.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  valueText: {
    flex: 1,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
  id: {
    fontSize: FONT_SIZES.xs,
  },
  sectionHead: {
    gap: SPACING.xs,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  presetTile: {
    flexGrow: 1,
    minWidth: '30%',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm + 4,
    gap: SPACING.xs,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 4,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.35)',
  },
  presetLabel: {
    flexShrink: 1,
  },
  presetCheck: {
    alignSelf: 'flex-start',
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  modeLabels: {
    flex: 1,
    gap: 2,
    minWidth: 140,
  },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: RADIUS.full,
    padding: 3,
    gap: 3,
  },
  segmentItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.full,
  },
  loader: {
    marginVertical: SPACING.lg,
  },
});
