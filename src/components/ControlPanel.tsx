import { useState, useEffect } from 'react';
import { TransitionType } from '../lib/transitionService';

interface ControlPanelProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  transitionType: TransitionType;
  onTransitionTypeChange: (type: TransitionType) => void;
  transitionDuration: number;
  onTransitionDurationChange: (duration: number) => void;
  currentImageName?: string;
  onNextImage?: () => void;
  onPreviousImage?: () => void;
}

const transitionTypes: { value: TransitionType; label: string }[] = [
  { value: 'fade', label: 'Fade' },
  { value: 'slide-left', label: 'Slide Left' },
  { value: 'slide-right', label: 'Slide Right' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'slide-down', label: 'Slide Down' },
  { value: 'zoom-in', label: 'Zoom In' },
  { value: 'zoom-out', label: 'Zoom Out' },
  { value: 'zoom-pulse', label: 'Zoom Pulse' },
  { value: 'collage', label: 'Collage' },
];

export default function ControlPanel({
  isPlaying,
  onTogglePlay,
  transitionType,
  onTransitionTypeChange,
  transitionDuration,
  onTransitionDurationChange,
  currentImageName,
  onNextImage,
  onPreviousImage
}: ControlPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const showPanel = () => {
    setIsVisible(true);
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 5000);
    setHideTimeout(timeout);
  };

  const hidePanel = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    const handleMouseMove = () => {
      showPanel();
    };

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
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyPress);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout, onTogglePlay, onNextImage, onPreviousImage]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/20 z-50 min-w-80 animate-in slide-in-from-right duration-300 liquid-glass">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Osho Screen Saver
            </h2>
          </div>
          <button
            onClick={hidePanel}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Play/Pause Controls */}
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={onPreviousImage}
            className="group p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200 hover:scale-105"
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
            className="group p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200 hover:scale-105"
            title="Next Image (Right Arrow)"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Current Image Info */}
        {currentImageName && (
          <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 glass-card">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="text-xs font-semibold text-white/70 uppercase tracking-wide">Now Playing</div>
            </div>
            <div className="text-sm font-medium text-white truncate">{currentImageName}</div>
          </div>
        )}

        {/* Transition Type Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-white/90 mb-3">
            Transition Effect
          </label>
          <select
            value={transitionType}
            onChange={(e) => onTransitionTypeChange(e.target.value as TransitionType)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
          >
            {transitionTypes.map((type) => (
              <option key={type.value} value={type.value} className="bg-gray-800 text-white">
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Transition Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-white/90">
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
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <div className="flex justify-between text-xs text-white/50 mt-2">
              <span>1s</span>
              <span>10s</span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 glass-card">
          <div className="flex items-center space-x-2 mb-3">
            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-xs font-semibold text-white/70 uppercase tracking-wide">Shortcuts</div>
          </div>
          <div className="space-y-2 text-xs text-white/60">
            <div className="flex justify-between">
              <span>Spacebar</span>
              <span className="text-white/80">Play/Pause</span>
            </div>
            <div className="flex justify-between">
              <span>← →</span>
              <span className="text-white/80">Navigate</span>
            </div>
            <div className="flex justify-between">
              <span>Esc</span>
              <span className="text-white/80">Hide Panel</span>
            </div>
          </div>
        </div>

        {/* Buy Me a Coffee */}
        <div className="flex justify-center">
          <a 
            href="https://www.buymeacoffee.com/zorzen" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-transform duration-200 hover:scale-105"
          >
            <img 
              src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=zorzen&button_colour=5F7FFF&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" 
              alt="Buy me a coffee" 
              className="rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
