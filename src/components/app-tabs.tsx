import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTheme, usePresetColors } from '@/context/ThemeContext';
import { withAlpha } from '@/constants/colors';

export default function AppTabs() {
  const colors = usePresetColors();
  const { scheme } = useTheme();
  const isDark = scheme === 'dark';

  return (
    <NativeTabs
      backgroundColor={colors.surface}
      iconColor={{ default: colors.textTertiary, selected: colors.primary }}
      labelStyle={{
        default: { color: colors.textTertiary, fontSize: 11, fontWeight: '600' },
        selected: { color: colors.primary, fontSize: 11, fontWeight: '700' },
      }}
      indicatorColor={withAlpha(colors.primary, isDark ? 0.24 : 0.16)}
      rippleColor={withAlpha(colors.primary, isDark ? 0.22 : 0.14)}
      shadowColor={colors.border}
      disableTransparentOnScrollEdge
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md={{ default: 'home', selected: 'home' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="scan">
        <NativeTabs.Trigger.Label>Scan</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'qrcode', selected: 'qrcode' }}
          md={{ default: 'qr_code_scanner', selected: 'qr_code_scanner' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'clock', selected: 'clock.fill' }}
          md={{ default: 'history', selected: 'history' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="teacher">
        <NativeTabs.Trigger.Label>Teacher</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.2', selected: 'person.2.fill' }}
          md={{ default: 'school', selected: 'school' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          md={{ default: 'person', selected: 'person' }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
