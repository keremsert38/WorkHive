export const colors = {
    // Primary Colors
    primary: '#FBBF24',      // yellow-400
    primaryDark: '#F59E0B',  // yellow-500
    primaryLight: '#FEF3C7', // yellow-50

    // Secondary Colors
    secondary: '#0D9488',    // teal-600
    secondaryDark: '#0F766E', // teal-700
    secondaryLight: '#CCFBF1', // teal-50

    // Background Colors
    background: '#F9FAFB',   // gray-50
    card: '#FFFFFF',
    surface: '#F3F4F6',      // gray-100

    // Text Colors
    text: '#1E293B',         // slate-800
    textPrimary: '#0F172A',  // slate-900
    textSecondary: '#64748B', // slate-500
    textMuted: '#94A3B8',    // slate-400
    textLight: '#CBD5E1',    // slate-300

    // Border Colors
    border: '#F3F4F6',       // gray-100
    borderLight: '#F9FAFB',  // gray-50

    // Status Colors
    success: '#22C55E',      // green-500
    successLight: '#DCFCE7', // green-50
    warning: '#F97316',      // orange-500
    warningLight: '#FFF7ED', // orange-50
    error: '#EF4444',        // red-500
    errorLight: '#FEE2E2',   // red-50
    info: '#3B82F6',         // blue-500
    infoLight: '#EFF6FF',    // blue-50

    // Utility Colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    overlay: 'rgba(0, 0, 0, 0.5)',
};

export type ColorName = keyof typeof colors;
