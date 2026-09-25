import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import type { RelativePathString } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ExternalLink } from './external-link';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { usePresetColors } from '@/context/ThemeContext';
import { MaxContentWidth, RADIUS, SHADOWS, SPACING, withAlpha } from '@/constants/colors';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/(tabs)" asChild>
            <TabButton icon="home">Home</TabButton>
          </TabTrigger>
          <TabTrigger name="scan" href="/(tabs)/scan" asChild>
            <TabButton icon="scan">Scan</TabButton>
          </TabTrigger>
          <TabTrigger name="history" href={'/(tabs)/history' as RelativePathString} asChild>
            <TabButton icon="history">History</TabButton>
          </TabTrigger>
          <TabTrigger name="teacher" href={'/(tabs)/teacher' as RelativePathString} asChild>
            <TabButton icon="teachers">Teacher</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href={'/(tabs)/profile' as RelativePathString} asChild>
            <TabButton icon="profile">Profile</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({
  children,
  icon,
  isFocused,
  ...props
}: {
  children: React.ReactNode;
  icon: 'home' | 'teachers' | 'scan' | 'history' | 'profile';
  isFocused?: boolean;
} & Record<string, any>) {
  const colors = usePresetColors();

  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <View
        style={[
          styles.tabButtonView,
          {
            backgroundColor: isFocused ? withAlpha(colors.primary, 0.18) : colors.surfaceSunken,
            borderColor: isFocused ? withAlpha(colors.primary, 0.5) : colors.border,
          },
        ]}
      >
        <SymbolView
          name={
            icon === 'home'
              ? { ios: isFocused ? 'house.fill' : 'house', android: 'home', web: 'home' }
              : icon === 'teachers'
              ? { ios: isFocused ? 'person.2.fill' : 'person.2', android: 'school', web: 'school' }
              : icon === 'scan'
              ? { ios: 'qrcode.viewfinder', android: 'qr_code_scanner', web: 'qr_code_scanner' }
              : icon === 'history'
              ? { ios: isFocused ? 'clock.fill' : 'clock', android: 'history', web: 'history' }
              : { ios: isFocused ? 'person.fill' : 'person', android: 'person', web: 'person' }
          }
          tintColor={isFocused ? colors.primary : colors.textTertiary}
          size={18}
        />
        <ThemedText variant="caption" weight="semibold" color={isFocused ? 'primary' : 'tertiary'}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function CustomTabList(props: any) {
  const colors = usePresetColors();

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView
        variant="elevated"
        style={[styles.innerContainer, { borderColor: colors.border }]}
      >
        <ThemedText variant="overline" weight="extrabold" color="secondary" style={styles.brand}>
          QRTT
        </ThemedText>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {props.children}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <ExternalLink href="https://github.com" asChild>
          <Pressable style={styles.externalPressable}>
            <ThemedText variant="caption" weight="semibold" color="secondary">Docs</ThemedText>
            <SymbolView
              tintColor={colors.textTertiary}
              name={{ ios: 'arrow.up.right.square', web: 'link' }}
              size={12}
            />
          </Pressable>
        </ExternalLink>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  innerContainer: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    maxWidth: MaxContentWidth,
    borderWidth: 1,
    ...SHADOWS.lg,
  },
  brand: {
    paddingHorizontal: SPACING.sm,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(128, 128, 128, 0.25)',
    marginHorizontal: SPACING.xs,
  },
  tabButton: {
    minWidth: 64,
    borderRadius: RADIUS.md,
  },
  tabButtonView: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.75,
  },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
});
