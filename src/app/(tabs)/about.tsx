import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Panel, ScreenHeader, ScreenScroll } from '@/components/ui/screen-shell';
import { usePresetColors } from '@/context/ThemeContext';
import { RADIUS, SPACING } from '@/constants/colors';

export default function AboutScreen() {
  const colors = usePresetColors();

  return (
    <ScreenScroll contentContainerStyle={styles.scrollContent}>
      <ScreenHeader
        code="SYSTEM / ABOUT"
        title="QRTT Attendance"
        subtitle="QR-based attendance tracking for IT departments."
      />

      <Panel bar>
        <View style={[styles.iconTile, { backgroundColor: colors.primaryLight }]}>
          <SymbolView
            name={{ ios: 'qrcode.viewfinder', android: 'qr_code_scanner', web: 'qr_code_scanner' }}
            tintColor={colors.primary}
            size={26}
          />
        </View>

        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <ThemedText variant="overline" weight="extrabold" color="secondary">Version</ThemedText>
          <ThemedText variant="body" color="primary">1.0.0</ThemedText>
        </View>

        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <ThemedText variant="overline" weight="extrabold" color="secondary">Platform</ThemedText>
          <ThemedText variant="body" color="primary">Expo / React Native</ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText variant="overline" weight="extrabold" color="secondary">Stack</ThemedText>
          <ThemedText variant="body" color="primary">Supabase + TypeScript</ThemedText>
        </View>

        <ThemedText variant="caption" color="tertiary" style={styles.footer}>
          Built with Expo Router, Supabase, and TypeScript.
        </ThemedText>
      </Panel>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: SPACING.lg,
  },
  iconTile: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  footer: {
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
