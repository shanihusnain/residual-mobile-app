/**
 * Residual.ae design tokens — aligned to Owner Figma
 * https://www.figma.com/design/gQwgKxF32toOC29y0OG7m6/Residual.ae--Apr-2026---Copy-
 */

import "@/global.css";

import { Platform, TextStyle } from "react-native";

import { fonts } from "@/assets/fonts";

/** Brand / UI palette from Figma screenshots + provided tokens */
export const Colors = {
  light: {
    text: "rgba(0, 0, 0, 1)",
    background: "rgba(245, 245, 245, 1)",
    backgroundElement: "rgba(255, 255, 255, 1)",
    backgroundSelected: "rgba(243, 243, 243, 1)",
    textSecondary: "rgba(102, 102, 102, 1)",
    white: "rgba(255, 255, 255, 1)",
    black: "rgba(0, 0, 0, 1)",
    /** Primary accent (buttons, active nav, progress) */
    yellow: "rgba(211, 160, 93, 1)",
    primary: "rgba(211, 160, 93, 1)",
    darkGray: "rgba(51, 51, 51, 1)",
    lightGray: "rgba(241, 241, 241, 1)",
    gray: "rgba(243, 243, 243, 1)",
    border: "rgba(229, 229, 229, 1)",
    inputBackground: "rgba(255, 255, 255, 1)",
    page: "rgba(245, 245, 245, 1)",
    surface: "rgba(255, 255, 255, 1)",
    authBackdrop: "rgba(26, 26, 26, 1)",
    purple: "rgba(138, 56, 245, 1)",
    blue: "rgba(17, 152, 194, 1)",
    teal: "rgba(17, 152, 194, 1)",
    green: "rgba(63, 125, 94, 1)",
    red: "rgba(179, 67, 58, 1)",
  },
  dark: {
    text: "rgba(0, 0, 0, 1)",
    background: "rgba(245, 245, 245, 1)",
    backgroundElement: "rgba(255, 255, 255, 1)",
    backgroundSelected: "rgba(243, 243, 243, 1)",
    textSecondary: "rgba(102, 102, 102, 1)",
    white: "rgba(255, 255, 255, 1)",
    black: "rgba(0, 0, 0, 1)",
    /** Primary accent (buttons, active nav, progress) */
    yellow: "rgba(211, 160, 93, 1)",
    primary: "rgba(211, 160, 93, 1)",
    darkGray: "rgba(51, 51, 51, 1)",
    lightGray: "rgba(241, 241, 241, 1)",
    gray: "rgba(243, 243, 243, 1)",
    border: "rgba(229, 229, 229, 1)",
    inputBackground: "rgba(255, 255, 255, 1)",
    page: "rgba(245, 245, 245, 1)",
    surface: "rgba(255, 255, 255, 1)",
    authBackdrop: "rgba(26, 26, 26, 1)",
    purple: "rgba(138, 56, 245, 1)",
    blue: "rgba(17, 152, 194, 1)",
    teal: "rgba(17, 152, 194, 1)",
    green: "rgba(63, 125, 94, 1)",
    red: "rgba(179, 67, 58, 1)",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.light;

/**
 * Figma typography:
 * - Inter → body / UI (labels, inputs, buttons)
 * - Gabarito → brand / display headings (logo, screen titles)
 */
export const Typography = {
  brand: {
    fontFamily: fonts.gabarito.bold,
    fontSize: 28,
    color: Colors.light.black,
  } satisfies TextStyle,
  brandAccent: {
    fontFamily: fonts.gabarito.bold,
    fontSize: 28,
    color: Colors.light.primary,
  } satisfies TextStyle,
  h1: {
    fontFamily: fonts.inter18.bold,
    fontSize: 28,
    color: Colors.light.black,
  } satisfies TextStyle,
  h2: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 22,
    color: Colors.light.black,
  } satisfies TextStyle,
  h3: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 18,
    color: Colors.light.black,
  } satisfies TextStyle,
  body: {
    fontFamily: fonts.inter18.regular,
    fontSize: 15,
    color: Colors.light.darkGray,
  } satisfies TextStyle,
  bodyMedium: {
    fontFamily: fonts.inter18.medium,
    fontSize: 15,
    color: Colors.light.darkGray,
  } satisfies TextStyle,
  label: {
    fontFamily: fonts.inter18.medium,
    fontSize: 13,
    color: Colors.light.darkGray,
  } satisfies TextStyle,
  caption: {
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
    color: Colors.light.textSecondary,
  } satisfies TextStyle,
  button: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 16,
    color: Colors.light.white,
  } satisfies TextStyle,
  link: {
    fontFamily: fonts.inter18.medium,
    fontSize: 14,
    color: Colors.light.primary,
  } satisfies TextStyle,
} as const;

/** System / platform fallbacks. Prefer Typography + fonts from @/assets/fonts. */
export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
