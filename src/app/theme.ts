export const theme = {
  colors: {
    brand: '#1F6FEB',
    brandLight: '#539BF5',
    surface: '#FFFFFF',
    surfaceDark: '#161B22',
    bg: '#F9FAFB',
    bgDark: '#0C111D',
    textPrimary: '#0F172A',
    textPrimaryDark: '#F8FAFC',
    textSecondary: '#64748B',
    textSecondaryDark: '#A0AEC0',
    success: '#17B26A',
    successLight: '#3DD68C',
    warning: '#F79009',
    warningLight: '#F9B44E',
    danger: '#F04438',
    dangerLight: '#F97066',
    neutral: '#E2E8F0',
    neutralDark: '#334155',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
  },
  shadow: {
    soft: '0 4px 12px rgba(0,0,0,0.05)',
    card: '0 8px 24px rgba(0,0,0,0.06)',
    md: '0 10px 30px rgba(0,0,0,0.1)',
    lg: '0 20px 40px rgba(0,0,0,0.15)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.22,1,0.36,1)',
    normal: '200ms cubic-bezier(0.22,1,0.36,1)',
    slow: '300ms cubic-bezier(0.22,1,0.36,1)',
  },
};

export type Theme = typeof theme;
