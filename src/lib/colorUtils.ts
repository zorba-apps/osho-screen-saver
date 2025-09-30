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
    // White text for dark backgrounds
    return {
      text: 'text-white',
      textSecondary: 'text-white/90',
      textTertiary: 'text-white/80',
      textMuted: 'text-white/70',
      background: 'bg-black/30',
      backgroundHover: 'hover:bg-black/40',
      border: 'border-white/30',
      borderHover: 'hover:border-white/40',
    };
  } else {
    // Black text for light backgrounds
    return {
      text: 'text-black',
      textSecondary: 'text-black/90',
      textTertiary: 'text-black/80',
      textMuted: 'text-black/70',
      background: 'bg-white/30',
      backgroundHover: 'hover:bg-white/40',
      border: 'border-black/30',
      borderHover: 'hover:border-black/40',
    };
  }
};

export const getButtonColors = (isDarkBackground: boolean, isActive: boolean = false) => {
  const baseColors = getColorScheme(isDarkBackground);
  
  if (isActive) {
    return {
      background: 'bg-blue-500/30',
      backgroundHover: 'hover:bg-blue-500/40',
      text: 'text-blue-300',
      border: 'border-blue-400/40',
    };
  }
  
  return {
    background: baseColors.background,
    backgroundHover: baseColors.backgroundHover,
    text: baseColors.textSecondary,
    border: baseColors.border,
  };
};
