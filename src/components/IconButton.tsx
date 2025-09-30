import { ReactNode } from 'react';
import { getButtonColors } from '../lib/colorUtils';

interface IconButtonProps {
  onClick: () => void;
  title: string;
  isDarkBackground: boolean;
  isActive?: boolean;
  children: ReactNode;
  className?: string;
}

export default function IconButton({
  onClick,
  title,
  isDarkBackground,
  isActive = false,
  children,
  className = ''
}: IconButtonProps) {
  const colors = getButtonColors(isDarkBackground, isActive);
  
  return (
    <button
      onClick={onClick}
      className={`
        p-1.5 rounded-lg transition-all duration-200 hover:scale-105
        ${colors.background} ${colors.backgroundHover}
        ${colors.text} hover:${isDarkBackground ? 'text-white' : 'text-gray-800'}
        ${className}
      `.trim()}
      title={title}
    >
      {children}
    </button>
  );
}
