import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

/**
 * Main theme configuration for MixFinder Mobile
 */

export const theme = {
  colors,
  typography,
  spacing,
  
  // Border radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
  },
  
  // Shadows
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 16,
    },
  },
  
  // Component styles
  components: {
    // Button styles
    button: {
      primary: {
        backgroundColor: colors.primary[500],
        borderRadius: spacing.component.padding.md,
        paddingVertical: spacing.button.padding.md.vertical,
        paddingHorizontal: spacing.button.padding.md.horizontal,
        ...typography.textStyles.button,
        color: colors.white,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border.primary,
        borderRadius: spacing.component.padding.md,
        paddingVertical: spacing.button.padding.md.vertical,
        paddingHorizontal: spacing.button.padding.md.horizontal,
        ...typography.textStyles.button,
        color: colors.text.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderRadius: spacing.component.padding.md,
        paddingVertical: spacing.button.padding.md.vertical,
        paddingHorizontal: spacing.button.padding.md.horizontal,
        ...typography.textStyles.button,
        color: colors.primary[500],
      },
    },
    
    // Input styles
    input: {
      default: {
        backgroundColor: colors.background.card,
        borderWidth: 1,
        borderColor: colors.border.primary,
        borderRadius: spacing.component.padding.md,
        paddingVertical: spacing.input.padding.vertical,
        paddingHorizontal: spacing.input.padding.horizontal,
        ...typography.textStyles.body,
        color: colors.text.primary,
      },
      focused: {
        borderColor: colors.border.focus,
        backgroundColor: colors.background.tertiary,
      },
      error: {
        borderColor: colors.border.error,
        backgroundColor: colors.background.card,
      },
    },
    
    // Card styles
    card: {
      default: {
        backgroundColor: colors.background.card,
        borderRadius: spacing.card.borderRadius,
        padding: spacing.card.padding,
        ...theme.shadows.md,
      },
      elevated: {
        backgroundColor: colors.background.card,
        borderRadius: spacing.card.borderRadius,
        padding: spacing.card.padding,
        ...theme.shadows.lg,
      },
    },
    
    // List styles
    list: {
      item: {
        backgroundColor: colors.background.card,
        borderRadius: spacing.component.padding.md,
        padding: spacing.list.itemPadding,
        marginBottom: spacing.list.itemGap,
        ...theme.shadows.sm,
      },
      separator: {
        height: 1,
        backgroundColor: colors.border.primary,
        marginVertical: spacing.list.itemGap / 2,
      },
    },
    
    // Modal styles
    modal: {
      overlay: {
        backgroundColor: colors.overlay.darker,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      content: {
        backgroundColor: colors.background.card,
        borderRadius: spacing.modal.borderRadius,
        padding: spacing.modal.padding,
        margin: spacing.modal.margin,
        maxWidth: '90%',
        maxHeight: '80%',
        ...theme.shadows.xl,
      },
    },
  },
  
  // Animation durations
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },
  
  // Z-index values
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export type Theme = typeof theme;
export type BorderRadiusKey = keyof typeof theme.borderRadius;
export type ShadowKey = keyof typeof theme.shadows;
export type ComponentKey = keyof typeof theme.components;
export type AnimationKey = keyof typeof theme.animation;
export type ZIndexKey = keyof typeof theme.zIndex;

// Export individual theme parts for convenience
export { colors, typography, spacing };
