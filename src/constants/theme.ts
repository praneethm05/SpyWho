/**
 * Design system tokens for SpyWho.
 * All visual styling should reference these tokens — never hardcode colors/sizes.
 */

// ─── Colors ──────────────────────────────────────────────────────────────────

export const Colors = {
  primary: '#6367FF',
  secondary: '#8494FF',
  accent: '#C9BEFF',
  soft: '#FFDBFD',

  textPrimary: '#1A1A2E',
  textSecondary: '#4A4A6A',
  textOnPrimary: '#FFFFFF',

  surface: '#FFFFFF',
  background: '#FFFFFF', // Clean white background for blended UI
  error: '#FF6B6B',
  spy: '#FF4757',

  // Derived / utility
  border: '#E0D8F0',
  divider: '#F0EBF8', // Subtle divider for sections
  overlay: 'rgba(26, 26, 46, 0.5)',
  disabled: '#B0A8C0',
  ripple: 'rgba(99, 103, 255, 0.15)',
} as const;

// ─── Spacing (4-pt grid) ────────────────────────────────────────────────────

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
} as const;

// ─── Border Radius ──────────────────────────────────────────────────────────

export const Radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────

export const Typography = {
  /** Large screen titles */
  h1: {
    fontSize: 32,
    fontFamily: 'Fredoka-Bold',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  /** Section headings */
  h2: {
    fontSize: 24,
    fontFamily: 'Fredoka-Bold',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  /** Sub-section headings */
  h3: {
    fontSize: 20,
    fontFamily: 'Fredoka-SemiBold',
    lineHeight: 28,
  },
  /** Body text */
  body: {
    fontSize: 16,
    fontFamily: 'Fredoka-Regular',
    lineHeight: 24,
  },
  /** Emphasized body */
  bodyBold: {
    fontSize: 16,
    fontFamily: 'Fredoka-SemiBold',
    lineHeight: 24,
  },
  /** Small labels, captions */
  caption: {
    fontSize: 13,
    fontFamily: 'Fredoka-Regular',
    lineHeight: 18,
  },
  /** Button text */
  button: {
    fontSize: 16,
    fontFamily: 'Fredoka-Bold',
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  /** Large display number */
  display: {
    fontSize: 72,
    fontFamily: 'Fredoka-Bold',
    lineHeight: 80,
  },
} as const;

// ─── Shadows ────────────────────────────────────────────────────────────────

export const Shadows = {
  sm: {
    shadowColor: '#6367FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#6367FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6367FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ─── Animation Durations ────────────────────────────────────────────────────

export const AnimationDurations = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
