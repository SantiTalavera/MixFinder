/**
 * Typography system for MixFinder Mobile
 */

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },
  
  // Text styles
  textStyles: {
    // Headers
    h1: {
      fontSize: 36,
      lineHeight: 1.2,
      fontWeight: '700' as const,
      letterSpacing: -0.025,
    },
    h2: {
      fontSize: 30,
      lineHeight: 1.25,
      fontWeight: '700' as const,
      letterSpacing: -0.025,
    },
    h3: {
      fontSize: 24,
      lineHeight: 1.3,
      fontWeight: '600' as const,
      letterSpacing: -0.025,
    },
    h4: {
      fontSize: 20,
      lineHeight: 1.35,
      fontWeight: '600' as const,
      letterSpacing: -0.025,
    },
    h5: {
      fontSize: 18,
      lineHeight: 1.4,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    h6: {
      fontSize: 16,
      lineHeight: 1.4,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    
    // Body text
    body: {
      fontSize: 16,
      lineHeight: 1.5,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    bodyLarge: {
      fontSize: 18,
      lineHeight: 1.5,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 1.5,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    
    // Labels
    label: {
      fontSize: 14,
      lineHeight: 1.4,
      fontWeight: '500' as const,
      letterSpacing: 0.025,
    },
    labelSmall: {
      fontSize: 12,
      lineHeight: 1.4,
      fontWeight: '500' as const,
      letterSpacing: 0.025,
    },
    labelLarge: {
      fontSize: 16,
      lineHeight: 1.4,
      fontWeight: '500' as const,
      letterSpacing: 0.025,
    },
    
    // Captions
    caption: {
      fontSize: 12,
      lineHeight: 1.4,
      fontWeight: '400' as const,
      letterSpacing: 0.025,
    },
    captionSmall: {
      fontSize: 10,
      lineHeight: 1.4,
      fontWeight: '400' as const,
      letterSpacing: 0.05,
    },
    
    // Buttons
    button: {
      fontSize: 16,
      lineHeight: 1.4,
      fontWeight: '600' as const,
      letterSpacing: 0.025,
    },
    buttonSmall: {
      fontSize: 14,
      lineHeight: 1.4,
      fontWeight: '600' as const,
      letterSpacing: 0.025,
    },
    buttonLarge: {
      fontSize: 18,
      lineHeight: 1.4,
      fontWeight: '600' as const,
      letterSpacing: 0.025,
    },
    
    // Special text styles
    trackTitle: {
      fontSize: 16,
      lineHeight: 1.3,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    trackArtist: {
      fontSize: 14,
      lineHeight: 1.4,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    trackAlbum: {
      fontSize: 12,
      lineHeight: 1.4,
      fontWeight: '400' as const,
      letterSpacing: 0.025,
    },
    bpm: {
      fontSize: 14,
      lineHeight: 1.4,
      fontWeight: '600' as const,
      letterSpacing: 0.025,
    },
    camelot: {
      fontSize: 12,
      lineHeight: 1.4,
      fontWeight: '700' as const,
      letterSpacing: 0.05,
    },
    score: {
      fontSize: 14,
      lineHeight: 1.4,
      fontWeight: '700' as const,
      letterSpacing: 0.025,
    },
    genre: {
      fontSize: 11,
      lineHeight: 1.4,
      fontWeight: '500' as const,
      letterSpacing: 0.05,
    },
  },
};

export type FontSizeKey = keyof typeof typography.fontSize;
export type LineHeightKey = keyof typeof typography.lineHeight;
export type FontWeightKey = keyof typeof typography.fontWeight;
export type LetterSpacingKey = keyof typeof typography.letterSpacing;
export type TextStyleKey = keyof typeof typography.textStyles;
