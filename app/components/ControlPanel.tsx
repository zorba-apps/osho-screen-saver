import { useState, useEffect } from 'react';
import { TransitionType } from '~/lib/transitionService';

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
    <div className="fixed top-4 right-4 bg-black bg-opacity-90 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white border-opacity-20 z-50 min-w-80">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Osho Screen Saver</h2>
          <button
            onClick={hidePanel}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Play/Pause Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onPreviousImage}
            className="control-button p-2"
            title="Previous Image (Left Arrow)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={onTogglePlay}
            className={`control-button px-6 py-3 text-lg font-medium ${isPlaying ? 'bg-red-500 bg-opacity-80' : 'bg-green-500 bg-opacity-80'}`}
            title="Play/Pause (Spacebar)"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <button
            onClick={onNextImage}
            className="control-button p-2"
            title="Next Image (Right Arrow)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Current Image Info */}
        {currentImageName && (
          <div className="text-sm text-gray-300">
            <div className="font-medium">Current Image:</div>
            <div className="truncate">{currentImageName}</div>
          </div>
        )}

        {/* Transition Type Selection */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Transition Effect
          </label>
          <select
            value={transitionType}
            onChange={(e) => onTransitionTypeChange(e.target.value as TransitionType)}
            className="w-full bg-black bg-opacity-50 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          >
            {transitionTypes.map((type) => (
              <option key={type.value} value={type.value} className="bg-black">
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Transition Duration */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Transition Duration: {transitionDuration}ms
          </label>
          <input
            type="range"
            min="1000"
            max="10000"
            step="500"
            value={transitionDuration}
            onChange={(e) => onTransitionDurationChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1s</span>
            <span>10s</span>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="text-xs text-gray-400 space-y-1">
          <div className="font-medium text-white mb-2">Keyboard Shortcuts:</div>
          <div>Spacebar - Play/Pause</div>
          <div>← → - Previous/Next Image</div>
          <div>Esc - Hide Controls</div>
        </div>
      </div>
    </div>
  );
}
