import { useState, useEffect } from 'react';
import { TransitionType } from '../lib/transitionService';
import { getColorScheme } from '../lib/colorUtils';
import IconButton from './IconButton';
import TransitionSelector from './TransitionSelector';
import AudioControls from './AudioControls';
import CollapsibleCard from './CollapsibleCard';

interface ControlPanelProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  transitionType: TransitionType;
  onTransitionTypeChange: (type: TransitionType) => void;
  transitionDuration: number;
  onTransitionDurationChange: (duration: number) => void;
  onNextImage?: () => void;
  onPreviousImage?: () => void;
  isDarkBackground?: boolean;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  onToggleGallery?: () => void;
  isMobile?: boolean;
  onDownloadImage?: () => void;
  onClose?: () => void;
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
  // Morphing props
  isMorphing?: boolean;
  customStyle?: React.CSSProperties;
  disableAnimation?: boolean;
}


export default function ControlPanel({
  isPlaying,
  onTogglePlay,
  transitionType,
  onTransitionTypeChange,
  transitionDuration,
  onTransitionDurationChange,
  onNextImage,
  onPreviousImage,
  isDarkBackground = true,
  isFullScreen = false,
  onToggleFullScreen,
  onToggleGallery,
  isMobile = false,
  onDownloadImage,
  onClose,
  // Audio props
  audioFile,
  isAudioPlaying = false,
  audioCurrentTime = 0,
  audioDuration = 0,
  audioTrackName = '',
  currentImageUrl,
  onAudioFileSelect,
  onAudioPlayPause,
  onAudioStop,
  // Meditation props
  onMeditationSelect,
  selectedMeditationId,
  hasMeditationLoaded,
  // Morphing props
  isMorphing = false,
  customStyle,
  disableAnimation = false
}: ControlPanelProps) {
  const [buttonImageError, setButtonImageError] = useState(false);

  // Get color scheme based on background
  const colors = getColorScheme(isDarkBackground);

  const hidePanel = () => {
    // This will be handled by the parent component
    // We can add a close button or let the parent handle it
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hidePanel();
      } else if (e.key === ' ') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.key === 'ArrowRight') {
        onNextImage?.();
      } else if (e.key === 'ArrowLeft') {
        onPreviousImage?.();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        onToggleGallery?.();
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [onTogglePlay, onNextImage, onPreviousImage]);

  return (
    <div 
      className={`
        ${isMorphing ? 'absolute' : 'fixed'} 
        ${isMorphing ? '' : (isMobile ? 'top-4 right-4 left-4 bottom-4' : 'top-8 right-8')} 
        bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 dark:border-white/10 
        ${isMobile ? 'rounded-2xl p-4' : 'rounded-3xl p-6'} 
        shadow-xl z-50 
        ${isMorphing ? 'w-full h-full' : (isMobile ? 'min-w-full h-auto min-h-[400px] max-h-[calc(100vh-2rem)]' : 'min-w-80 w-auto max-w-[400px] h-auto min-h-[500px] max-h-[800px]')} 
        ${disableAnimation ? '' : 'animate-in slide-in-from-right duration-500 ease-out'} 
        liquid-glass transform-gpu
      `}
      style={customStyle}
    >
      <div className={`space-y-6 ${isMobile ? 'overflow-y-auto max-h-full pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent' : 'overflow-y-auto max-h-full pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent'}`}>
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
              <h2 className={`text-xl font-bold ${isDarkBackground ? 'bg-gradient-to-r from-white to-gray-300' : 'bg-gradient-to-r from-gray-800 to-gray-600'} bg-clip-text text-transparent`}>
                Osho Screen Saver
              </h2>
            </div>
            <IconButton
              onClick={onClose || (() => {})}
              title="Close Panel (Esc)"
              isDarkBackground={isDarkBackground}
              isMobile={isMobile}
            >
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconButton>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-3">
            <IconButton
              onClick={onDownloadImage || (() => {})}
              title="Download Current Image"
              isDarkBackground={isDarkBackground}
              isMobile={isMobile}
            >
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </IconButton>
            <IconButton
              onClick={onToggleFullScreen || (() => {})}
              title={isFullScreen ? "Exit Full Screen (F11)" : "Enter Full Screen (F11)"}
              isDarkBackground={isDarkBackground}
              isActive={isFullScreen}
              isMobile={isMobile}
            >
              {isFullScreen ? (
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5" />
                </svg>
              ) : (
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </IconButton>
            <IconButton
              onClick={onToggleGallery || (() => {})}
              title="Gallery (G)"
              isDarkBackground={isDarkBackground}
              isMobile={isMobile}
            >
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </IconButton>
          </div>
        </div>

        {/* Play/Pause Controls */}
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={onPreviousImage}
            className={`group p-3 rounded-xl ${colors.background} ${colors.backgroundHover} ${colors.textSecondary} hover:${colors.text} transition-all duration-200 hover:scale-105`}
            title="Previous Image (Left Arrow)"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={onTogglePlay}
            className={`group relative px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 ${
              isPlaying 
                ? 'bg-gradient-to-r from-red-500/90 to-red-600/90 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/25' 
                : 'bg-gradient-to-r from-green-500/90 to-green-600/90 hover:from-green-500 hover:to-green-600 text-white shadow-lg shadow-green-500/25'
            }`}
            title="Play/Pause (Spacebar)"
          >
            <div className="flex items-center space-x-2">
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </div>
          </button>
          
          <button
            onClick={onNextImage}
            className={`group p-3 rounded-xl ${colors.background} ${colors.backgroundHover} ${colors.textSecondary} hover:${colors.text} transition-all duration-200 hover:scale-105`}
            title="Next Image (Right Arrow)"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>


        {/* Transition Controls Card */}
        <CollapsibleCard
          title="Transition Effects"
          isDarkBackground={isDarkBackground}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        >
          <div className="space-y-4">
            {/* Transition Type Selection */}
            <TransitionSelector
              transitionType={transitionType}
              onTransitionTypeChange={onTransitionTypeChange}
              isDarkBackground={isDarkBackground}
            />

            {/* Transition Duration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-semibold ${colors.text}`}>
                  Transition Duration
                </label>
                <span className="text-sm font-mono text-blue-400 bg-blue-500/20 px-2 py-1 rounded-lg">
                  {(transitionDuration / 1000).toFixed(1)}s
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={transitionDuration}
                  onChange={(e) => onTransitionDurationChange(Number(e.target.value))}
                  className={`w-full h-2 ${isDarkBackground ? 'bg-white/20' : 'bg-gray-600/30'} rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                />
                <div className={`flex justify-between text-xs ${colors.textMuted} mt-2`}>
                  <span>1s</span>
                  <span>10s</span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleCard>

        {/* Audio Controls */}
        <AudioControls
          isDarkBackground={isDarkBackground}
          isMobile={isMobile}
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
        />

        {/* Keyboard Shortcuts */}
        <CollapsibleCard
          title="Shortcuts"
          isDarkBackground={isDarkBackground}
          isCollapsed={true}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        >
          <div className={`space-y-2 text-xs ${colors.textTertiary}`}>
            {isMobile ? (
              <>
                <div className="flex justify-between">
                  <span>Swipe Up</span>
                  <span className={colors.text}>Show Panel</span>
                </div>
                <div className="flex justify-between">
                  <span>Swipe Down</span>
                  <span className={colors.text}>Hide Panel</span>
                </div>
                <div className="flex justify-between">
                  <span>Tap</span>
                  <span className={colors.text}>Play/Pause</span>
                </div>
                <div className="flex justify-between">
                  <span>Download Button</span>
                  <span className={colors.text}>Save Image</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Spacebar</span>
                  <span className={colors.text}>Play/Pause</span>
                </div>
                <div className="flex justify-between">
                  <span>← →</span>
                  <span className={colors.text}>Navigate</span>
                </div>
                <div className="flex justify-between">
                  <span>Download Button</span>
                  <span className={colors.text}>Save Image</span>
                </div>
                <div className="flex justify-between">
                  <span>F11</span>
                  <span className={colors.text}>Full Screen</span>
                </div>
                <div className="flex justify-between">
                  <span>Esc</span>
                  <span className={colors.text}>{isFullScreen ? 'Exit Full Screen' : 'Hide Panel'}</span>
                </div>
              </>
            )}
          </div>
        </CollapsibleCard>

        {/* Buy Me a Coffee */}
        <div className="flex justify-center relative z-10">
          <a 
            href="https://www.buymeacoffee.com/zorzen" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-transform duration-200 hover:scale-105"
          >
            {!buttonImageError ? (
              <img 
                src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=zorzen&button_colour=5F7FFF&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" 
                alt="Buy me a coffee" 
                className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
                width="217"
                style={{  minWidth: '217px' }}
                onError={() => {
                  setButtonImageError(true);
                }}
                
              />
            ) : (
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center font-semibold text-sm"
                style={{ minWidth: '217px', minHeight: '60px' }}
              >
                ☕ Buy me a coffee
              </div>
            )}
          </a>
        </div>
      </div>
    </div>
  );
}
