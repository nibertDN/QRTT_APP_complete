import { View, type ViewProps } from 'react-native';
import { usePresetColors } from '@/context/ThemeContext';

export type ThemedViewProps = ViewProps & {
  variant?: 'background' | 'surface' | 'elevated' | 'sunken' | 'surfaceHover' | 'surfacePressed' | 'border' | 'primary' | 'primaryLight' | 'accent' | 'accentLight' | 'success' | 'successLight' | 'warning' | 'warningLight' | 'danger' | 'dangerLight' | 'info' | 'infoLight' | 'overlay';
};

export function ThemedView({ style, variant = 'surface', ...otherProps }: ThemedViewProps) {
  const colors = usePresetColors();

  const colorMap: Record<string, string> = {
    background: colors.background,
    surface: colors.surface,
    elevated: colors.surfaceElevated,
    sunken: colors.surfaceSunken,
    surfaceHover: colors.surfaceHover,
    surfacePressed: colors.surfacePressed,
    border: colors.border,
    primary: colors.primary,
    primaryLight: colors.primaryLight,
    accent: colors.accent,
    accentLight: colors.accentLight,
    success: colors.success,
    successLight: colors.successLight,
    warning: colors.warning,
    warningLight: colors.warningLight,
    danger: colors.danger,
    dangerLight: colors.dangerLight,
    info: colors.info,
    infoLight: colors.infoLight,
    overlay: colors.overlay,
  };

  return <View style={[{ backgroundColor: colorMap[variant] }, style]} {...otherProps} />;
}