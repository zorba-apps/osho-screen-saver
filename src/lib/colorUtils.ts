// Color utility functions for dynamic theming
export interface ColorScheme {
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  background: string;
  backgroundHover: string;
  border: string;
  borderHover: string;
}

export const getColorScheme = (isDarkBackground: boolean): ColorScheme => {
  if (isDarkBackground) {
    return {
      text: 'text-white',
      textSecondary: 'text-white/70',
      textTertiary: 'text-white/60',
      textMuted: 'text-white/50',
      background: 'bg-white/10',
      backgroundHover: 'hover:bg-white/20',
      border: 'border-white/20',
      borderHover: 'hover:border-white/30',
    };
  } else {
    return {
      text: 'text-gray-800',
      textSecondary: 'text-gray-600',
      textTertiary: 'text-gray-500',
      textMuted: 'text-gray-400',
      background: 'bg-gray-800/20',
      backgroundHover: 'hover:bg-gray-800/30',
      border: 'border-gray-600/30',
      borderHover: 'hover:border-gray-600/40',
    };
  }
};

export const getButtonColors = (isDarkBackground: boolean, isActive: boolean = false) => {
  const baseColors = getColorScheme(isDarkBackground);
  
  if (isActive) {
    return {
      background: isDarkBackground ? 'bg-blue-500/20' : 'bg-blue-600/20',
      backgroundHover: isDarkBackground ? 'hover:bg-blue-500/30' : 'hover:bg-blue-600/30',
      text: isDarkBackground ? 'text-blue-400' : 'text-blue-600',
      border: isDarkBackground ? 'border-blue-400/30' : 'border-blue-600/30',
    };
  }
  
  return {
    background: baseColors.background,
    backgroundHover: baseColors.backgroundHover,
    text: baseColors.textSecondary,
    border: baseColors.border,
  };
};
