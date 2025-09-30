import { ReactNode } from 'react';
import { getButtonColors } from '../lib/colorUtils';

interface IconButtonProps {
  onClick: () => void;
  title: string;
  isDarkBackground: boolean;
  isActive?: boolean;
  children: ReactNode;
  className?: string;
  isMobile?: boolean;
}

export default function IconButton({
  onClick,
  title,
  isDarkBackground,
  isActive = false,
  children,
  className = '',
  isMobile = false
}: IconButtonProps) {
  const colors = getButtonColors(isDarkBackground, isActive);
  
  const padding = isMobile ? 'p-3' : 'p-1.5';
  const iconSize = isMobile ? 'w-6 h-6' : 'w-4 h-4';
  
  return (
    <button
      onClick={onClick}
      className={`
        ${padding} rounded-lg transition-all duration-200 hover:scale-105
        ${colors.background} ${colors.backgroundHover}
        ${colors.text} hover:${isDarkBackground ? 'text-white' : 'text-gray-800'}
        ${className}
      `.trim()}
      title={title}
    >
      <div className={iconSize}>
        {children}
      </div>
    </button>
  );
}
