/**
 * DevSpace Notion-Inspired Design System Tokens
 * Centralized design tokens for colors, typography, spacing, radius, and elevation.
 */

export const THEME_COLORS = {
  light: {
    mainBg: '#FFFFFF',
    secondaryBg: '#F7F7F5',
    sidebarBg: '#FAFAF9',
    cardBg: '#FFFFFF',
    border: '#E8E8E5',
    borderSubtle: '#F0F0ED',
    borderStrong: '#D1D1CD',
    hoverBg: '#F1F1EF',
    activeBg: '#EAEAE7',

    // Text tokens
    textPrimary: '#252525',
    textSecondary: '#777777',
    textMuted: '#999999',

    // Primary Button tokens
    buttonPrimaryBg: '#252525',
    buttonPrimaryText: '#FFFFFF',
    buttonPrimaryHover: '#111111',

    // Secondary Button tokens
    buttonSecondaryBg: '#F7F7F5',
    buttonSecondaryText: '#252525',
    buttonSecondaryBorder: '#E8E8E5',
    buttonSecondaryHover: '#F1F1EF',

    // Semantic tokens (restrained)
    success: '#107C41',
    successBg: '#EBF8F1',
    successBorder: '#D1F0DE',

    error: '#D83B01',
    errorBg: '#FDF3F2',
    errorBorder: '#F9D5D3',

    warning: '#B26B00',
    warningBg: '#FEF8ED',
    warningBorder: '#FBE5C3',

    info: '#0078D4',
    infoBg: '#EFF6FC',
    infoBorder: '#C7E0F4'
  },
  dark: {
    mainBg: '#191919',
    secondaryBg: '#202020',
    sidebarBg: '#1C1C1C',
    cardBg: '#242424',
    border: '#353535',
    borderSubtle: '#2C2C2C',
    borderStrong: '#444444',
    hoverBg: '#2A2A2A',
    activeBg: '#333333',

    // Text tokens
    textPrimary: '#F2F2F2',
    textSecondary: '#A0A0A0',
    textMuted: '#777777',

    // Primary Button tokens
    buttonPrimaryBg: '#F2F2F2',
    buttonPrimaryText: '#191919',
    buttonPrimaryHover: '#FFFFFF',

    // Secondary Button tokens
    buttonSecondaryBg: '#242424',
    buttonSecondaryText: '#F2F2F2',
    buttonSecondaryBorder: '#353535',
    buttonSecondaryHover: '#2A2A2A',

    // Semantic tokens (restrained)
    success: '#4EBE7E',
    successBg: 'rgba(78, 190, 126, 0.12)',
    successBorder: 'rgba(78, 190, 126, 0.25)',

    error: '#F87171',
    errorBg: 'rgba(248, 113, 113, 0.12)',
    errorBorder: 'rgba(248, 113, 113, 0.25)',

    warning: '#FBBF24',
    warningBg: 'rgba(251, 191, 36, 0.12)',
    warningBorder: 'rgba(251, 191, 36, 0.25)',

    info: '#60A5FA',
    infoBg: 'rgba(96, 165, 250, 0.12)',
    infoBorder: 'rgba(96, 165, 250, 0.25)'
  }
};

export const TYPOGRAPHY = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  scale: {
    pageTitle: 'text-xl sm:text-2xl font-semibold tracking-tight text-primary',
    sectionTitle: 'text-base sm:text-lg font-semibold tracking-tight text-primary',
    cardTitle: 'text-sm sm:text-base font-semibold text-primary',
    subheading: 'text-xs sm:text-sm font-medium text-secondary',
    body: 'text-xs sm:text-sm text-primary',
    supporting: 'text-xs text-secondary',
    label: 'text-xs font-medium text-secondary',
    metadata: 'text-[11px] font-mono text-muted'
  }
};

export const SPACING = {
  pagePadding: 'p-4 sm:p-6 lg:p-8',
  sectionGap: 'space-y-6',
  componentGap: 'gap-3 sm:gap-4',
  inputHeight: {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-10'
  },
  buttonHeight: {
    sm: 'h-7 px-2.5 text-xs',
    md: 'h-9 px-3 text-xs',
    lg: 'h-10 px-4 text-sm'
  },
  sidebarWidth: 'w-64',
  radius: {
    subtle: 'rounded', // 4px
    default: 'rounded-md', // 6px
    card: 'rounded-lg' // 8px
  }
};

export default {
  THEME_COLORS,
  TYPOGRAPHY,
  SPACING
};

