import { useState, useEffect, useRef } from 'react';
import { getColorScheme } from '../lib/colorUtils';
import ControlPanel from './ControlPanel';
import FloatingControlButton from './FloatingControlButton';

interface MorphingControlPanelProps {
  isDarkBackground?: boolean;
  isMobile?: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  transitionType: any;
  onTransitionTypeChange: (type: any) => void;
  transitionDuration: number;
  onTransitionDurationChange: (duration: number) => void;
  onNextImage?: () => void;
  onPreviousImage?: () => void;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  onToggleGallery?: () => void;
  onDownloadImage?: () => void;
  isBlurBackgroundEnabled?: boolean;
  onToggleBlurBackground?: () => void;
  // Audio props
  audioFile?: File | null;
  isAudioPlaying?: boolean;
  audioCurrentTime?: number;
  audioDuration?: number;
  audioTrackName?: string;
  currentImageUrl?: string;
  onAudioFileSelect?: (file: File) => void;
  onAudioPlayPause?: () => void;
  onAudioStop?: () => void;
  // Meditation props
  onMeditationSelect?: (meditationUrl: string, meditationName: string, urls?: string[]) => void;
  selectedMeditationId?: string;
  hasMeditationLoaded?: boolean;
}

export default function MorphingControlPanel({
  isDarkBackground = true,
  isMobile = false,
  isPlaying,
  onTogglePlay,
  transitionType,
  onTransitionTypeChange,
  transitionDuration,
  onTransitionDurationChange,
  onNextImage,
  onPreviousImage,
  isFullScreen = false,
  onToggleFullScreen,
  onToggleGallery,
  onDownloadImage,
  isBlurBackgroundEnabled = false,
  onToggleBlurBackground,
  audioFile,
  isAudioPlaying = false,
  audioCurrentTime = 0,
  audioDuration = 0,
  audioTrackName = '',
  currentImageUrl,
  onAudioFileSelect,
  onAudioPlayPause,
  onAudioStop,
  onMeditationSelect,
  selectedMeditationId,
  hasMeditationLoaded
}: MorphingControlPanelProps) {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  
  // Force panel to be hidden initially
  useEffect(() => {
    setIsPanelVisible(false);
  }, []);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isMorphing, setIsMorphing] = useState(false);
  const morphingRef = useRef<HTMLDivElement>(null);
  const colors = getColorScheme(isDarkBackground);

  const handleTogglePanel = () => {
    if (!isPanelVisible) {
      // Opening: Show panel immediately and start morphing
      setIsPanelVisible(true);
      setIsMorphing(true);
      
      // End morphing after animation completes
      setTimeout(() => {
        setIsMorphing(false);
      }, 800);
    } else {
      // Closing: Start reverse morphing
      setIsMorphing(true);
      
      // Hide panel after morphing completes
      setTimeout(() => {
        setIsPanelVisible(false);
        setIsMorphing(false);
      }, 600);
    }
  };

  const handlePositionChange = (position: { top: number; left: number; width: number; height: number }) => {
    setButtonPosition(position);
  };

  // Calculate panel position and size for morphing
  const getPanelStyle = () => {
    const margin = isMobile ? 16 : 32;
    
    // Better sizing for different screen sizes
    let maxWidth, maxHeight;
    if (isMobile) {
      maxWidth = window.innerWidth - margin * 2;
      maxHeight = window.innerHeight - margin * 2;
    } else {
      // Desktop: more reasonable sizing based on screen size
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      if (screenWidth >= 1920) {
        // Large screens (4K, etc.)
        maxWidth = Math.min(400, screenWidth * 0.22);
        maxHeight = Math.min(800, screenHeight * 0.85);
      } else if (screenWidth >= 1440) {
        // Large desktop screens
        maxWidth = Math.min(380, screenWidth * 0.25);
        maxHeight = Math.min(750, screenHeight * 0.8);
      } else if (screenWidth >= 1200) {
        // Standard desktop screens
        maxWidth = Math.min(360, screenWidth * 0.28);
        maxHeight = Math.min(700, screenHeight * 0.75);
      } else {
        // Smaller desktop screens
        maxWidth = Math.min(340, screenWidth * 0.32);
        maxHeight = Math.min(650, screenHeight * 0.7);
      }
      
      // Set min-height for auto-sizing
      const minHeight = isMobile ? 400 : 500;
      
      // Ensure minimum margins
      maxWidth = Math.min(maxWidth, screenWidth - margin * 2);
      maxHeight = Math.min(maxHeight, screenHeight - margin * 2);
    }
    
    // Calculate final position with better centering logic
    let panelTop, panelLeft;
    
    if (isMobile) {
      // Mobile: center the panel
      panelTop = margin;
      panelLeft = margin;
    } else {
      // Desktop: smarter positioning based on screen size and button location
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const buttonCenterX = buttonPosition.left + buttonPosition.width / 2;
      const buttonCenterY = buttonPosition.top + buttonPosition.height / 2;
      
      // For larger screens, prefer right-side positioning with better centering
      if (screenWidth >= 1440) {
        // Large screens: position on right side, vertically centered
        panelLeft = screenWidth - maxWidth - margin;
        panelTop = Math.max(margin, Math.min(
          (screenHeight - maxHeight) / 2,
          screenHeight - maxHeight - margin
        ));
      } else {
        // Smaller screens: try to center around button
        panelLeft = Math.max(margin, Math.min(buttonCenterX - maxWidth / 2, screenWidth - maxWidth - margin));
        panelTop = Math.max(margin, Math.min(buttonCenterY - maxHeight / 2, screenHeight - maxHeight - margin));
      }
      
      // Ensure panel doesn't get too close to edges
      if (panelLeft < margin * 2) {
        panelLeft = margin;
      }
      if (panelTop < margin * 2) {
        panelTop = margin;
      }
      if (panelLeft + maxWidth > screenWidth - margin * 2) {
        panelLeft = screenWidth - maxWidth - margin;
      }
      if (panelTop + maxHeight > screenHeight - margin * 2) {
        panelTop = screenHeight - maxHeight - margin;
      }
    }
    
    // Always use final position, but animate from button position during morphing
    return {
      position: 'fixed' as const,
      top: isMorphing ? `${buttonPosition.top}px` : `${panelTop}px`,
      left: isMorphing ? `${buttonPosition.left}px` : `${panelLeft}px`,
      width: isMorphing ? `${buttonPosition.width}px` : `${maxWidth}px`,
      height: isMorphing ? `${buttonPosition.height}px` : 'auto',
      minHeight: isMorphing ? `${buttonPosition.height}px` : (isMobile ? '400px' : '500px'),
      maxHeight: isMorphing ? `${buttonPosition.height}px` : `${maxHeight}px`,
      transform: 'scale(1)',
      borderRadius: isMorphing ? '50%' : (isMobile ? '1rem' : '1.5rem'),
      transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
    };
  };

  return (
    <>
      {/* Floating Button - only show when panel is closed */}
      {!isPanelVisible && (
        <FloatingControlButton
          isDarkBackground={isDarkBackground}
          isMobile={isMobile}
          onTogglePanel={handleTogglePanel}
          isPanelVisible={isPanelVisible}
          isPlaying={isPlaying}
          onPositionChange={handlePositionChange}
        />
      )}

      {/* Morphing Panel - only show when panel is visible */}
      {isPanelVisible && (
        <div
          key="morphing-panel"
          ref={morphingRef}
          className={`
            bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl z-[9999]
            ${isMorphing ? 'overflow-hidden' : 'overflow-visible'}
            relative
            isolate
            cursor-grab
            liquid-glass
          `}
          style={{
            ...getPanelStyle(),
            isolation: 'isolate'
          }}
        >
          {/* Content that fades in during morphing */}
          <div 
            className={`
              h-full w-full transition-opacity duration-500
              ${isMorphing ? 'opacity-0' : 'opacity-100'}
            `}
            style={{
              transitionDelay: isMorphing ? '0ms' : '400ms'
            }}
          >
            <ControlPanel
              isPlaying={isPlaying}
              onTogglePlay={onTogglePlay}
              transitionType={transitionType}
              onTransitionTypeChange={onTransitionTypeChange}
              transitionDuration={transitionDuration}
              onTransitionDurationChange={onTransitionDurationChange}
              onNextImage={onNextImage}
              onPreviousImage={onPreviousImage}
              isDarkBackground={isDarkBackground}
              isFullScreen={isFullScreen}
              onToggleFullScreen={onToggleFullScreen}
              onToggleGallery={onToggleGallery}
              isMobile={isMobile}
              onDownloadImage={onDownloadImage}
              isBlurBackgroundEnabled={isBlurBackgroundEnabled}
              onToggleBlurBackground={onToggleBlurBackground}
              onClose={() => handleTogglePanel()}
              audioFile={audioFile}
              isAudioPlaying={isAudioPlaying}
              audioCurrentTime={audioCurrentTime}
              audioDuration={audioDuration}
              audioTrackName={audioTrackName}
              currentImageUrl={currentImageUrl}
              onAudioFileSelect={onAudioFileSelect}
              onAudioPlayPause={onAudioPlayPause}
              onAudioStop={onAudioStop}
              onMeditationSelect={onMeditationSelect}
              selectedMeditationId={selectedMeditationId}
              hasMeditationLoaded={hasMeditationLoaded}
              isMorphing={true}
              customStyle={{
                position: 'relative',
                width: '100%',
                height: '100%',
                top: 'auto',
                left: 'auto',
                right: 'auto',
                bottom: 'auto'
              }}
              disableAnimation={true}
            />
          </div>
        </div>
      )}
    </>
  );
}
