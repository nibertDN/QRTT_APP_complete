import type { ThemeColors } from './colors';
import { INK, PAPER, mix, readableTextOn, shift, withAlpha } from './colors';

export type ThemePresetName =
  | 'it-emerald'
  | 'it-sapphire'
  | 'it-amber'
  | 'it-crimson'
  | 'it-violet'
  | 'it-slate'
  | 'it-forest'
  | 'it-midnight';

export interface ThemePreset {
  name: ThemePresetName;
  label: string;
  description: string;
  light: ThemeColors;
  dark: ThemeColors;
}

const createPreset = (
  name: ThemePresetName,
  label: string,
  description: string,
  primary: string,
  accent: string,
): ThemePreset => {
  const darkPrimary = mix(primary, PAPER, 0.14);
  const darkAccent = mix(accent, PAPER, 0.14);

  return {
    name,
    label,
    description,
    light: {
      primary,
      primaryHover: shift(primary, -16),
      primaryLight: mix(primary, PAPER, 0.86),
      accent,
      accentHover: shift(accent, -16),
      accentLight: mix(accent, PAPER, 0.86),
      background: '#F3F6FA',
      surface: PAPER,
      surfaceElevated: PAPER,
      surfaceSunken: '#EAEFF5',
      surfaceHover: '#F0F4F9',
      surfacePressed: '#E4EAF1',
      border: '#DFE6EE',
      borderStrong: '#C2CDDB',
      textPrimary: '#0C1420',
      textSecondary: '#46566B',
      textTertiary: '#7A8999',
      textInverse: PAPER,
      textOnPrimary: readableTextOn(primary),
      success: '#0F7B47',
      successLight: '#E3F6EB',
      warning: '#96560A',
      warningLight: '#FCF0DE',
      danger: '#C42B25',
      dangerLight: '#FCEBEA',
      info: '#0B6CB8',
      infoLight: '#E4F1FD',
      overlay: 'rgba(12, 20, 32, 0.55)',
      shadow: 'rgba(12, 20, 32, 0.10)',
      focusRing: primary,
      glow: withAlpha(accent, 0.3),
    },
    dark: {
      primary: darkPrimary,
      primaryHover: mix(primary, PAPER, 0.24),
      primaryLight: withAlpha(primary, 0.18),
      accent: darkAccent,
      accentHover: mix(accent, PAPER, 0.24),
      accentLight: withAlpha(accent, 0.18),
      background: mix('#080B11', primary, 0.05),
      surface: mix('#0E131B', primary, 0.07),
      surfaceElevated: mix('#141A24', primary, 0.09),
      surfaceSunken: '#06080D',
      surfaceHover: mix('#181F2A', primary, 0.1),
      surfacePressed: '#1D2531',
      border: 'rgba(255, 255, 255, 0.08)',
      borderStrong: 'rgba(255, 255, 255, 0.16)',
      textPrimary: '#E9EFF6',
      textSecondary: '#A7B7C7',
      textTertiary: '#73869A',
      textInverse: INK,
      textOnPrimary: readableTextOn(darkPrimary),
      success: '#3DD68C',
      successLight: withAlpha('#3DD68C', 0.14),
      warning: '#FFB224',
      warningLight: withAlpha('#FFB224', 0.14),
      danger: '#FF6369',
      dangerLight: withAlpha('#FF6369', 0.14),
      info: '#58A6FF',
      infoLight: withAlpha('#58A6FF', 0.14),
      overlay: 'rgba(4, 6, 10, 0.78)',
      shadow: 'rgba(0, 0, 0, 0.55)',
      focusRing: darkAccent,
      glow: withAlpha(accent, 0.4),
    },
  };
};

export const THEME_PRESETS: Record<ThemePresetName, ThemePreset> = {
  'it-emerald': createPreset('it-emerald', 'IT Emerald', 'Classic tech green — reliable, secure, production-ready', '#2E7D5B', '#14B8A6'),
  'it-sapphire': createPreset('it-sapphire', 'IT Sapphire', 'Deep system blue — infrastructure, networking, cloud', '#2563EB', '#06B6D4'),
  'it-amber': createPreset('it-amber', 'IT Amber', 'Build pipeline gold — CI/CD, automation, deployment', '#C97A2B', '#F59E0B'),
  'it-crimson': createPreset('it-crimson', 'IT Crimson', 'Critical alert red — incidents, on-call, hotfixes', '#B3261E', '#EF4444'),
  'it-violet': createPreset('it-violet', 'IT Violet', 'Platform purple — architecture, frameworks, tooling', '#7C3AED', '#A855F7'),
  'it-slate': createPreset('it-slate', 'IT Slate', 'Neutral graphite — observability, logs, dashboards', '#475569', '#64748B'),
  'it-forest': createPreset('it-forest', 'IT Forest', 'Dark pine — legacy systems, mainframes, stability', '#166534', '#22C55E'),
  'it-midnight': createPreset('it-midnight', 'IT Midnight', 'Deep navy — security, encryption, zero-trust', '#1E3A5F', '#3B82F6'),
};

export const DEFAULT_PRESET: ThemePresetName = 'it-emerald';

export function getPreset(name: ThemePresetName): ThemePreset {
  return THEME_PRESETS[name] ?? THEME_PRESETS[DEFAULT_PRESET];
}

export function getAllPresets(): ThemePreset[] {
  return Object.values(THEME_PRESETS);
}
