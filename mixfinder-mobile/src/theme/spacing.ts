/**
 * Spacing system for MixFinder Mobile
 */

export const spacing = {
  // Base spacing units (in pixels)
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
  
  // Semantic spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
  '5xl': 128,
  
  // Component-specific spacing
  component: {
    padding: {
      xs: 8,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
    },
    margin: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
    },
    gap: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
    },
  },
  
  // Layout spacing
  layout: {
    container: {
      padding: 16,
      margin: 16,
    },
    section: {
      marginBottom: 24,
    },
    card: {
      padding: 16,
      margin: 8,
    },
    list: {
      itemGap: 12,
      sectionGap: 24,
    },
  },
  
  // Screen spacing
  screen: {
    padding: 16,
    margin: 16,
    safeArea: {
      top: 44, // iOS status bar height
      bottom: 34, // iOS home indicator height
    },
  },
  
  // Button spacing
  button: {
    padding: {
      sm: { vertical: 8, horizontal: 12 },
      md: { vertical: 12, horizontal: 16 },
      lg: { vertical: 16, horizontal: 20 },
      xl: { vertical: 20, horizontal: 24 },
    },
    gap: 8,
  },
  
  // Input spacing
  input: {
    padding: {
      vertical: 12,
      horizontal: 16,
    },
    margin: {
      bottom: 16,
    },
  },
  
  // Card spacing
  card: {
    padding: 16,
    margin: 8,
    borderRadius: 12,
    gap: 12,
  },
  
  // List spacing
  list: {
    itemPadding: 16,
    itemGap: 12,
    sectionGap: 24,
    headerPadding: 16,
  },
  
  // Modal spacing
  modal: {
    padding: 24,
    margin: 16,
    borderRadius: 16,
    gap: 16,
  },
  
  // Grid spacing
  grid: {
    gap: 12,
    itemGap: 8,
  },
};

export type SpacingKey = keyof typeof spacing;
export type ComponentSpacingKey = keyof typeof spacing.component;
export type LayoutSpacingKey = keyof typeof spacing.layout;
export type ScreenSpacingKey = keyof typeof spacing.screen;
export type ButtonSpacingKey = keyof typeof spacing.button;
export type InputSpacingKey = keyof typeof spacing.input;
export type CardSpacingKey = keyof typeof spacing.card;
export type ListSpacingKey = keyof typeof spacing.list;
export type ModalSpacingKey = keyof typeof spacing.modal;
export type GridSpacingKey = keyof typeof spacing.grid;
