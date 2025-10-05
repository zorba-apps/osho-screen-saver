import { useState, useEffect, useRef } from 'react';
import { getColorScheme } from '../lib/colorUtils';
import IconButton from './IconButton';

interface FloatingControlButtonProps {
  isDarkBackground?: boolean;
  isMobile?: boolean;
  onTogglePanel: () => void;
  isPanelVisible: boolean;
  isPlaying?: boolean;
  onPositionChange?: (position: { top: number; left: number; width: number; height: number }) => void;
}

export default function FloatingControlButton({
  isDarkBackground = true,
  isMobile = false,
  onTogglePanel,
  isPanelVisible,
  isPlaying = false,
  onPositionChange
}: FloatingControlButtonProps) {
  const colors = getColorScheme(isDarkBackground);
  const [isVisible, setIsVisible] = useState(true);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

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

  const updateButtonPosition = () => {
    if (buttonRef.current && onPositionChange) {
      const rect = buttonRef.current.getBoundingClientRect();
      const position = {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      };
      setButtonPosition(position);
      onPositionChange(position);
    }
  };

  const handleTogglePanel = () => {
    if (!isDragging) {
      updateButtonPosition();
      onTogglePanel();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      setDragOffset({
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      });
    }
  };

  const handleDragMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Constrain to viewport
      const buttonSize = isMobile ? 56 : 64; // w-14 h-14 or w-16 h-16
      const constrainedX = Math.max(0, Math.min(window.innerWidth - buttonSize, newX));
      const constrainedY = Math.max(0, Math.min(window.innerHeight - buttonSize, newY));
      
      
      if (buttonRef.current) {
        buttonRef.current.style.left = `${constrainedX}px`;
        buttonRef.current.style.top = `${constrainedY}px`;
        buttonRef.current.style.right = 'auto';
        buttonRef.current.style.bottom = 'auto';
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      e.preventDefault();
      const newX = e.touches[0].clientX - dragOffset.x;
      const newY = e.touches[0].clientY - dragOffset.y;
      
      // Constrain to viewport
      const buttonSize = isMobile ? 56 : 64;
      const constrainedX = Math.max(0, Math.min(window.innerWidth - buttonSize, newX));
      const constrainedY = Math.max(0, Math.min(window.innerHeight - buttonSize, newY));
      
      if (buttonRef.current) {
        buttonRef.current.style.left = `${constrainedX}px`;
        buttonRef.current.style.top = `${constrainedY}px`;
        buttonRef.current.style.right = 'auto';
        buttonRef.current.style.bottom = 'auto';
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      updateButtonPosition();
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      updateButtonPosition();
    }
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

  // Handle dragging events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMouseMove);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset]);

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
    <div 
      ref={buttonRef}
      className={`fixed ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-[9999] transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      <button
        onClick={handleTogglePanel}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`
          group relative overflow-hidden rounded-full transition-all duration-500 ease-out
          ${isMobile ? 'w-14 h-14' : 'w-16 h-16'}
          ${isDarkBackground 
            ? 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30' 
            : 'bg-gray-900/10 hover:bg-gray-900/20 border-gray-700/20 hover:border-gray-700/30'
          }
          border backdrop-blur-md shadow-lg hover:shadow-xl
          ${isDragging ? 'scale-110 shadow-xl' : 'hover:scale-110 active:scale-95'}
          ${isPlaying ? 'animate-pulse' : ''}
          transform-gpu select-none
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}
        title={isDragging ? "Dragging..." : "Drag to move or click to open"}
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
