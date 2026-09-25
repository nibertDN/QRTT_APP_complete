import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { THEME_PRESETS, DEFAULT_PRESET, type ThemePresetName, getPreset } from '@/constants/themePresets';
import type { ThemeColors, ColorScheme, ResolvedTheme } from '@/constants/colors';

interface ThemeContextValue {
  resolvedTheme: ResolvedTheme;
  preset: ThemePresetName;
  setPreset: (name: ThemePresetName) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
  availablePresets: ReturnType<typeof getPreset>[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY_PRESET = 'qrt_theme_preset';
const STORAGE_KEY_SCHEME = 'qrt_color_scheme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState<ThemePresetName>(DEFAULT_PRESET);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('dark');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const storedPreset = localStorage.getItem(STORAGE_KEY_PRESET) as ThemePresetName | null;
        const storedScheme = localStorage.getItem(STORAGE_KEY_SCHEME) as ColorScheme | null;
        if (mounted) {
          if (storedPreset && storedPreset in THEME_PRESETS) setPresetState(storedPreset);
          if (storedScheme) setColorSchemeState(storedScheme);
        }
      } catch {
      } finally {
        if (mounted) setHydrated(true);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  const setPreset = (name: ThemePresetName) => {
    setPresetState(name);
    try { localStorage.setItem(STORAGE_KEY_PRESET, name); } catch {}
  };

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    try { localStorage.setItem(STORAGE_KEY_SCHEME, scheme); } catch {}
  };

  const toggleColorScheme = () => setColorScheme(colorScheme === 'light' ? 'dark' : 'light');

  const presetData = useMemo(() => getPreset(preset), [preset]);
  const colors = colorScheme === 'dark' ? presetData.dark : presetData.light;

  const resolvedTheme = useMemo<ResolvedTheme>(() => ({
    colors,
    scheme: colorScheme,
    presetName: presetData.label,
  }), [colors, colorScheme, presetData.label]);

  if (!hydrated) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{
      resolvedTheme,
      preset,
      setPreset,
      colorScheme,
      setColorScheme,
      toggleColorScheme,
      availablePresets: Object.values(THEME_PRESETS),
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ResolvedTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx.resolvedTheme;
}

export function useThemeControls() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeControls must be used within ThemeContext');
  return {
    preset: ctx.preset,
    setPreset: ctx.setPreset,
    colorScheme: ctx.colorScheme,
    setColorScheme: ctx.setColorScheme,
    toggleColorScheme: ctx.toggleColorScheme,
    availablePresets: ctx.availablePresets,
  };
}

export function usePresetColors(): ThemeColors {
  return useTheme().colors;
}