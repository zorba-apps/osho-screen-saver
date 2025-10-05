import { useState } from 'react';
import { getColorScheme } from '../lib/colorUtils';

interface CollapsibleCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isDarkBackground?: boolean;
  isCollapsed?: boolean;
  className?: string;
}

export default function CollapsibleCard({
  title,
  icon,
  children,
  isDarkBackground = true,
  isCollapsed = false,
  className = ''
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(!isCollapsed);
  const colors = getColorScheme(isDarkBackground);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${isDarkBackground ? 'bg-white/5 border-white/10' : 'bg-gray-900/10 border-gray-700/20'} backdrop-blur-sm border glass-card rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className={`w-full flex items-center justify-between p-4 hover:${colors.backgroundHover} transition-all duration-200 group`}
      >
        <div className="flex items-center space-x-2">
          {icon && (
            <div className={`w-4 h-4 ${colors.textSecondary} group-hover:${colors.text} transition-colors duration-200`}>
              {icon}
            </div>
          )}
          <div className={`text-sm font-semibold ${colors.textSecondary} group-hover:${colors.text} transition-colors duration-200`}>
            {title}
          </div>
        </div>
        <div className={`w-4 h-4 ${colors.textSecondary} group-hover:${colors.text} transition-all duration-300 transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Content */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded 
            ? 'max-h-[1000px] opacity-100' 
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}
