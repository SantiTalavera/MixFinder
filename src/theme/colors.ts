/**
 * Color palette for MixFinder Mobile
 * Based on Spotify's design system with custom accents
 */

export const colors = {
  // Primary colors (Spotify green)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#1DB954', // Main Spotify green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Secondary colors (dark theme)
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Accent colors
  accent: {
    purple: '#8B5CF6',
    pink: '#EC4899',
    blue: '#3B82F6',
    orange: '#F59E0B',
    red: '#EF4444',
    yellow: '#EAB308',
  },
  
  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Background colors
  background: {
    primary: '#000000',
    secondary: '#121212',
    tertiary: '#1a1a1a',
    card: '#1e1e1e',
    modal: 'rgba(0, 0, 0, 0.8)',
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#6B7280',
    disabled: '#4B5563',
    inverse: '#000000',
  },
  
  // Border colors
  border: {
    primary: '#2A2A2A',
    secondary: '#404040',
    focus: '#1DB954',
    error: '#EF4444',
  },
  
  // Overlay colors
  overlay: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(0, 0, 0, 0.5)',
    darker: 'rgba(0, 0, 0, 0.8)',
  },
  
  // Gradient colors
  gradient: {
    primary: ['#1DB954', '#1ed760'],
    secondary: ['#8B5CF6', '#EC4899'],
    dark: ['#000000', '#1a1a1a'],
    card: ['#1e1e1e', '#2a2a2a'],
  },
  
  // Status colors for compatibility scores
  compatibility: {
    excellent: '#10B981', // Green
    veryGood: '#34D399', // Light green
    good: '#FBBF24', // Yellow
    fair: '#F59E0B', // Orange
    poor: '#EF4444', // Red
    veryPoor: '#DC2626', // Dark red
  },
  
  // BPM compatibility colors
  bpm: {
    exact: '#10B981',
    tolerance: '#34D399',
    halfTime: '#8B5CF6',
    doubleTime: '#EC4899',
    incompatible: '#EF4444',
  },
  
  // Key/Camelot colors
  camelot: {
    major: '#3B82F6', // Blue for major keys
    minor: '#8B5CF6', // Purple for minor keys
    unknown: '#6B7280', // Gray for unknown keys
  },
};

export type ColorKey = keyof typeof colors;
export type PrimaryColorKey = keyof typeof colors.primary;
export type SecondaryColorKey = keyof typeof colors.secondary;
export type AccentColorKey = keyof typeof colors.accent;
export type GrayColorKey = keyof typeof colors.gray;
export type BackgroundColorKey = keyof typeof colors.background;
export type TextColorKey = keyof typeof colors.text;
export type BorderColorKey = keyof typeof colors.border;
export type OverlayColorKey = keyof typeof colors.overlay;
export type GradientColorKey = keyof typeof colors.gradient;
export type CompatibilityColorKey = keyof typeof colors.compatibility;
export type BPMColorKey = keyof typeof colors.bpm;
export type CamelotColorKey = keyof typeof colors.camelot;
