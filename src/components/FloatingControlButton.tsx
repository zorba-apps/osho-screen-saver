import { useState, useEffect } from 'react';
import { getColorScheme } from '../lib/colorUtils';
import IconButton from './IconButton';

interface FloatingControlButtonProps {
  isDarkBackground?: boolean;
  isMobile?: boolean;
  onTogglePanel: () => void;
  isPanelVisible: boolean;
  isPlaying?: boolean;
}

export default function FloatingControlButton({
  isDarkBackground = true,
  isMobile = false,
  onTogglePanel,
  isPanelVisible,
  isPlaying = false
}: FloatingControlButtonProps) {
  const colors = getColorScheme(isDarkBackground);
  const [isVisible, setIsVisible] = useState(true); // Start visible for testing
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const showButton = () => {
    if (isPanelVisible) return; // Don't show button when panel is open
    
    setIsVisible(true);
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    
    // Hide button after 3 seconds of no mouse movement
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
    setHideTimeout(timeout);
  };

  const hideButton = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    const handleMouseMove = () => {
      showButton();
    };

    // Show button immediately on mount
    showButton();

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [isPanelVisible, hideTimeout]);

  // Hide button when panel is visible
  useEffect(() => {
    if (isPanelVisible) {
      hideButton();
    } else {
      // Show button when panel is closed
      showButton();
    }
  }, [isPanelVisible]);

  return (
    <div className={`fixed ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-[9999] transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
      <button
        onClick={onTogglePanel}
        className={`
          group relative overflow-hidden rounded-full transition-all duration-500 ease-out
          ${isMobile ? 'w-14 h-14' : 'w-16 h-16'}
          ${isDarkBackground 
            ? 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30' 
            : 'bg-gray-900/10 hover:bg-gray-900/20 border-gray-700/20 hover:border-gray-700/30'
          }
          border backdrop-blur-md shadow-xl hover:shadow-2xl
          hover:scale-110 active:scale-95
          ${isPlaying ? 'animate-pulse' : ''}
          transform-gpu
        `}
        title="Open Control Panel"
      >
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Icon container */}
        <div className="relative flex items-center justify-center w-full h-full">
          <svg 
            className={`${isMobile ? 'w-6 h-6' : 'w-7 h-7'} ${colors.text} group-hover:scale-110 transition-transform duration-300`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </div>

        {/* Ripple effect on click */}
        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150" />
        
        {/* Glow effect when playing */}
        {isPlaying && (
          <div className="absolute inset-0 rounded-full bg-green-400/30 animate-ping" />
        )}
      </button>
    </div>
  );
}
