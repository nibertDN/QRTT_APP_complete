import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePresetColors } from '@/context/ThemeContext';
import { RADIUS, SHADOWS } from '@/constants/colors';

type Props = {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  icon?: 'camera' | 'refresh' | 'login' | 'register' | 'logout' | 'scan' | 'save' | 'create' | 'edit' | 'delete' | 'download' | 'share';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function AppButton({ 
  title, 
  variant = 'primary', 
  icon, 
  size = 'md', 
  fullWidth = false, 
  onPress, 
  disabled, 
  loading 
}: Props) {
  const colors = usePresetColors();
  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: {
      background: colors.primary,
      border: colors.primary,
      text: colors.textOnPrimary,
      iconColor: colors.textOnPrimary,
      pressedBackground: colors.primaryHover,
    },
    secondary: {
      background: colors.accent,
      border: colors.accent,
      text: colors.textOnPrimary,
      iconColor: colors.textOnPrimary,
      pressedBackground: colors.accentHover,
    },
    outline: {
      background: 'transparent',
      border: colors.borderStrong,
      text: colors.primary,
      iconColor: colors.primary,
      pressedBackground: colors.primaryLight,
    },
    ghost: {
      background: 'transparent',
      border: 'transparent',
      text: colors.textPrimary,
      iconColor: colors.textPrimary,
      pressedBackground: colors.surfaceHover,
    },
    danger: {
      background: colors.danger,
      border: colors.danger,
      text: colors.textInverse,
      iconColor: colors.textInverse,
      pressedBackground: '#991B1B',
    },
  }[variant];

  const sizeStyles = {
    sm: { height: 36, paddingHorizontal: 12, fontSize: 13, iconSize: 16, gap: 6, radius: RADIUS.sm },
    md: { height: 44, paddingHorizontal: 16, fontSize: 15, iconSize: 18, gap: 8, radius: RADIUS.md },
    lg: { height: 52, paddingHorizontal: 24, fontSize: 16, iconSize: 20, gap: 10, radius: RADIUS.lg },
  }[size];

  const { height, paddingHorizontal, fontSize, iconSize, gap, radius } = sizeStyles;
  const { background, border, text, iconColor, pressedBackground } = variantStyles;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        SHADOWS.sm,
        { 
          height, 
          paddingHorizontal, 
          gap,
          borderRadius: radius, 
          backgroundColor: pressed && !isDisabled ? pressedBackground : background,
          borderColor: border,
          borderWidth: border === 'transparent' ? 0 : 1,
          opacity: isDisabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
      ]}
    >
      {(loading || icon) && (
        <View style={styles.iconSlot}>
          {loading ? (
            <View style={[styles.spinner, { borderColor: text, borderTopColor: 'transparent' }]} />
          ) : (
            <SymbolView
              name={
                icon === 'camera'
                  ? { ios: 'camera.fill', android: 'camera', web: 'camera' }
                  : icon === 'refresh'
                  ? { ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }
                  : icon === 'login'
                  ? { ios: 'arrow.right.circle.fill', android: 'login', web: 'login' }
                  : icon === 'register'
                  ? { ios: 'person.badge.plus', android: 'person_add', web: 'person_add' }
                  : icon === 'logout'
                  ? { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }
                  : icon === 'scan'
                  ? { ios: 'qrcode.viewfinder', android: 'qr_code_scanner', web: 'qr_code_scanner' }
                  : icon === 'save'
                  ? { ios: 'square.and.arrow.down', android: 'save', web: 'save' }
                  : icon === 'create'
                  ? { ios: 'plus.circle.fill', android: 'add', web: 'add' }
                  : icon === 'edit'
                  ? { ios: 'pencil', android: 'edit', web: 'edit' }
                  : icon === 'delete'
                  ? { ios: 'trash.fill', android: 'delete', web: 'delete' }
                  : icon === 'download'
                  ? { ios: 'arrow.down.circle.fill', android: 'download', web: 'download' }
                  : { ios: 'square.and.arrow.up', android: 'share', web: 'share' }
              }
              tintColor={isDisabled ? colors.textTertiary : iconColor}
              size={iconSize}
            />
          )}
        </View>
      )}
      <Text style={[styles.label, { fontSize, color: isDisabled ? colors.textTertiary : text }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  fullWidth: {
    width: '100%',
  },
  iconSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'center',
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
});
