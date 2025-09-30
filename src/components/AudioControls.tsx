import { useRef } from 'react';
import { getColorScheme } from '../lib/colorUtils';

interface AudioControlsProps {
  isDarkBackground?: boolean;
  isMobile?: boolean;
  // Audio state props
  audioFile?: File | null;
  isAudioPlaying?: boolean;
  audioCurrentTime?: number;
  audioDuration?: number;
  audioTrackName?: string;
  // Image props for album art
  currentImageUrl?: string;
  // Audio control functions
  onAudioFileSelect?: (file: File) => void;
  onAudioPlayPause?: () => void;
  onAudioStop?: () => void;
}

export default function AudioControls({
  isDarkBackground = true,
  isMobile = false,
  // Audio state props
  audioFile,
  isAudioPlaying = false,
  audioCurrentTime = 0,
  audioDuration = 0,
  audioTrackName = '',
  // Image props for album art
  currentImageUrl,
  // Audio control functions
  onAudioFileSelect,
  onAudioPlayPause,
  onAudioStop
}: AudioControlsProps) {
  const colors = getColorScheme(isDarkBackground);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onAudioFileSelect) {
      onAudioFileSelect(file);
    }
  };

  const handlePlayPause = () => {
    if (onAudioPlayPause) {
      onAudioPlayPause();
    }
  };

  const handleStop = () => {
    if (onAudioStop) {
      onAudioStop();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0;

  return (
    <div className={`space-y-3 p-4 rounded-xl ${isDarkBackground ? 'bg-white/5 border-white/10' : 'bg-gray-900/10 border-gray-700/20'} backdrop-blur-sm border glass-card`}>
      <label className={`block text-sm font-semibold ${colors.text}`}>
        Audio File
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`px-4 py-2 rounded-lg ${colors.background} ${colors.backgroundHover} ${colors.textSecondary} hover:${colors.text} transition-all duration-200 hover:scale-105 text-sm`}
        >
          {audioFile ? 'Change Osho Discourse' : 'Select Osho Discourse'}
        </button>
      </div>

      {/* Album Art - Always show current image */}
      {currentImageUrl && (
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg">
            <img 
              src={currentImageUrl} 
              alt="Current Image" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Audio Controls */}
      {audioFile && (
        <div>
          {/* Track Info */}
          {audioTrackName && (
            <div className={`text-center text-sm ${colors.text} truncate px-2 mb-2`}>
              {audioTrackName.replace(/^\d+[\s\-_]*/, '').replace(/\.[^/.]+$/, '')}
            </div>
          )}

          {/* Progress Bar */}
          {audioDuration > 0 && (
            <div className="space-y-2 mb-2">
              <div className={`w-full h-2 ${isDarkBackground ? 'bg-white/20' : 'bg-gray-600/30'} rounded-full overflow-hidden`}>
                <div 
                  className={`h-full ${isAudioPlaying ? 'bg-green-400' : 'bg-blue-400'} transition-all duration-300 ease-out`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs">
                <span className={colors.textTertiary}>{formatTime(audioCurrentTime)}</span>
                <span className={colors.textTertiary}>{formatTime(audioDuration)}</span>
              </div>
            </div>
          )}

          {/* Playback Controls */}
          <div className="flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                isDarkBackground 
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                  : 'bg-gray-900/10 hover:bg-gray-900/20 text-gray-900 border border-gray-900/20'
              }`}
              title={isAudioPlaying ? 'Pause' : 'Play'}
            >
              {isAudioPlaying ? (
                <svg className="w-6 h-6 m-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-6 h-6 m-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}