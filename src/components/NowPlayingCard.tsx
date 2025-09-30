import { getColorScheme } from '../lib/colorUtils';

interface NowPlayingCardProps {
  trackName?: string;
  artistName?: string;
  currentTime?: number;
  duration?: number;
  isPlaying?: boolean;
  isDarkBackground?: boolean;
  isMobile?: boolean;
}

export default function NowPlayingCard({
  trackName = 'No track selected',
  artistName = 'Unknown Artist',
  currentTime = 0,
  duration = 0,
  isPlaying = false,
  isDarkBackground = true,
  isMobile = false
}: NowPlayingCardProps) {
  const colors = getColorScheme(isDarkBackground);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`p-4 rounded-xl ${isDarkBackground ? 'bg-white/5 border-white/10' : 'bg-gray-900/10 border-gray-700/20'} backdrop-blur-sm border glass-card`}>
      <div className="flex items-center space-x-2 mb-3">
        <div className={`w-2 h-2 rounded-full animate-pulse ${isPlaying ? 'bg-green-400' : 'bg-blue-400'}`}></div>
        <div className={`text-xs font-semibold ${colors.textSecondary} uppercase tracking-wide`}>
          {isPlaying ? 'Now Playing' : 'Paused'}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className={`text-sm font-medium ${colors.text} truncate`}>
          {trackName}
        </div>
        
        <div className={`text-xs ${colors.textTertiary} truncate`}>
          {artistName}
        </div>
        
        {duration > 0 && (
          <div className="space-y-1">
            <div className={`w-full h-1 ${isDarkBackground ? 'bg-white/20' : 'bg-gray-600/30'} rounded-full overflow-hidden`}>
              <div 
                className={`h-full ${isPlaying ? 'bg-green-400' : 'bg-blue-400'} transition-all duration-300 ease-out`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className={colors.textTertiary}>{formatTime(currentTime)}</span>
              <span className={colors.textTertiary}>{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
