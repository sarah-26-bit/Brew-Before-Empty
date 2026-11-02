/**
 * Brew Before Empty — Mobile Design System & Theme
 * Shared emerald-green, deep forest, and antique gold alchemical palette
 */

export const colors = {
  // Midnight & Forest Backgrounds
  bgMidnight: '#101713',
  bgForest: '#17251D',
  forestCard: '#1D3025',
  borderSubtle: '#274233',
  borderLight: '#355845',

  // Primary Emerald Greens
  accentEmerald: '#237A57',
  accentEmeraldLight: '#2FA375',
  accentEmeraldDark: '#123D2C',

  // Antique Gold & Warm Ivory
  accentGold: '#C5A46D',
  accentGoldLight: '#DFBF88',
  textPrimary: '#F3F0E6',
  textSecondary: '#A6B99B',
  textMuted: '#7D9472',

  // Alert & Status Colors
  statusHealthy: '#2FA375',
  statusLow: '#E9A23B',
  statusCritical: '#D65C56',
  curseRed: '#D65C56',
  enchantedBlue: '#4F9DDE',
  cursePurple: '#8E44AD',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const Colors = colors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  headerHeight: 56,
  tabBarHeight: 64,
};

export const Spacing = spacing;

export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const BorderRadius = borderRadius;

export const typography = {
  h1: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    color: colors.textMuted,
  },
  button: {
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
};

export const Typography = typography;
