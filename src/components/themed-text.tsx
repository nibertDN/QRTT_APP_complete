import { Text, type TextProps } from 'react-native';
import { usePresetColors } from '@/context/ThemeContext';
import { FONT_SIZES, FONT_WEIGHTS } from '@/constants/colors';

export type ThemedTextProps = TextProps & {
  variant?: 'default' | 'title' | 'subtitle' | 'heading' | 'body' | 'caption' | 'overline' | 'code' | 'link' | 'linkPrimary' | 'button';
  weight?: keyof typeof FONT_WEIGHTS;
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'onPrimary' | 'success' | 'warning' | 'danger' | 'info' | 'inherit';
};

export function ThemedText({ 
  style, 
  variant = 'default', 
  weight, 
  color = 'primary', 
  children,
  ...rest 
}: ThemedTextProps) {
  const colors = usePresetColors();

  const colorMap: Record<string, string> = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    inverse: colors.textInverse,
    onPrimary: colors.textOnPrimary,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    info: colors.info,
    inherit: 'currentColor',
  };

  const variantStyles = {
    default: { fontSize: FONT_SIZES.md, lineHeight: 22, fontWeight: FONT_WEIGHTS.normal },
    title: { fontSize: FONT_SIZES['4xl'], lineHeight: 40, fontWeight: FONT_WEIGHTS.extrabold },
    subtitle: { fontSize: FONT_SIZES['2xl'], lineHeight: 32, fontWeight: FONT_WEIGHTS.bold },
    heading: { fontSize: FONT_SIZES.xl, lineHeight: 28, fontWeight: FONT_WEIGHTS.semibold },
    body: { fontSize: FONT_SIZES.md, lineHeight: 24, fontWeight: FONT_WEIGHTS.normal },
    caption: { fontSize: FONT_SIZES.sm, lineHeight: 18, fontWeight: FONT_WEIGHTS.normal },
    overline: { fontSize: FONT_SIZES.xs, lineHeight: 16, fontWeight: FONT_WEIGHTS.semibold, letterSpacing: 1.2, textTransform: 'uppercase' as const },
    code: { fontSize: FONT_SIZES.sm, lineHeight: 20, fontFamily: 'monospace', fontWeight: FONT_WEIGHTS.medium },
    link: { fontSize: FONT_SIZES.md, lineHeight: 24, fontWeight: FONT_WEIGHTS.medium, textDecorationLine: 'underline' as const },
    linkPrimary: { fontSize: FONT_SIZES.md, lineHeight: 24, fontWeight: FONT_WEIGHTS.semibold },
    button: { fontSize: FONT_SIZES.md, lineHeight: 24, fontWeight: FONT_WEIGHTS.semibold },
  }[variant];

  return (
    <Text
      style={[
        variantStyles,
        { color: colorMap[color] },
        weight && { fontWeight: FONT_WEIGHTS[weight] },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}