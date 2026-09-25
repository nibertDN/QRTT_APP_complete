import { ReactNode } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle, ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { usePresetColors } from '@/context/ThemeContext';
import { RADIUS, SHADOWS, SPACING } from '@/constants/colors';

const TOP_INSET = (insets: { top: number }) => insets.top + SPACING.lg;

export function Screen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: TOP_INSET(insets) }, style]}>
      {children}
    </View>
  );
}

export function ScreenScroll({
  children,
  style,
  contentContainerStyle,
  ...rest
}: ScrollViewProps & { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { paddingTop: TOP_INSET(insets) }, contentContainerStyle]}
      style={style}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

export function ScreenHeader({
  code,
  title,
  subtitle,
  right,
}: {
  code: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const colors = usePresetColors();

  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={[styles.tick, { backgroundColor: colors.primary }]} />
        <ThemedText variant="overline" weight="extrabold" color="secondary" style={styles.headerCode}>
          {code}
        </ThemedText>
        {right}
      </View>

      <ThemedText variant="title" weight="extrabold" color="primary" style={styles.headerTitle}>
        {title}
      </ThemedText>

      {subtitle ? (
        <ThemedText variant="body" color="secondary" style={styles.headerSubtitle}>
          {subtitle}
        </ThemedText>
      ) : null}

      <View style={styles.ruleRow}>
        <View style={[styles.ruleAccent, { backgroundColor: colors.primary }]} />
        <View style={[styles.rule, { backgroundColor: colors.border }]} />
      </View>
    </View>
  );
}

export function Panel({
  children,
  style,
  bar = false,
  tone = 'elevated',
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  bar?: boolean;
  tone?: 'elevated' | 'surface' | 'sunken';
}) {
  const colors = usePresetColors();
  const background =
    tone === 'elevated' ? colors.surfaceElevated : tone === 'sunken' ? colors.surfaceSunken : colors.surface;

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: background, borderColor: colors.border },
        tone === 'elevated' ? SHADOWS.md : SHADOWS.none,
        style,
      ]}
    >
      {bar ? <View style={[styles.panelBar, { backgroundColor: colors.primary }]} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  header: {
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tick: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  headerCode: {
    flexShrink: 1,
  },
  headerTitle: {
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    lineHeight: 22,
    maxWidth: 520,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
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
  panel: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  panelBar: {
    width: 36,
    height: 3,
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
});
