import { useWindowDimensions } from 'react-native';

export const colors = {
  // Primario Karate (Naranja enérgico del kit DojoStrike)
  primary: '#FF6B00',
  primaryHover: '#FF8533',
  primaryDark: '#D95700',
  primaryLight: 'rgba(255, 107, 0, 0.15)',
  primaryGlow: 'rgba(255, 107, 0, 0.35)',

  // Acentos y Dorados
  accent: '#F59E0B',
  accentGold: '#F59E0B',
  accentGoldLight: 'rgba(245, 158, 11, 0.15)',

  // Fondos Oscuros Premium (Obsidian & Charcoal Navy)
  bgDarkest: '#0B0F19', // Fondo general de la app
  bgDark: '#121724',    // Alias fondo intermedio
  bgSurface: '#121724', // Barras y paneles laterales
  bgCard: '#182032',    // Tarjetas principales
  bgCardElevated: '#1F2940', // Tarjetas flotantes / hover / activas
  bgInput: '#0E1422',   // Inputs y campos de texto

  // Secciones Claras (Para contraste dinámico como en el kit)
  bgLightSection: '#F8FAFC',
  textLightSection: '#0F172A',

  // Bordes
  border: '#222C42',       // Alias borde general
  borderSubtle: '#222C42',
  borderLight: '#2C3954',
  borderActive: '#FF6B00',
  borderGlow: 'rgba(255, 107, 0, 0.5)',

  // Textos
  textPrimary: '#FFFFFF',
  textSecondary: '#E2E8F0',
  textMuted: '#8F9BB3',
  textDim: '#64748B',

  // Estados
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.16)',
  successBorder: '#059669',

  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.16)',
  warningBorder: '#D97706',

  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.16)',
  dangerBorder: '#DC2626',

  info: '#38BDF8',
  infoBg: 'rgba(56, 189, 248, 0.16)',
  infoBorder: '#0284C7',
};

export const radii = {
  xs: 0,
  sm: 0,
  md: 0,
  lg: 0,
  xl: 0,
  full: 0,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  glowPrimary: {
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
};

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
  };
};
