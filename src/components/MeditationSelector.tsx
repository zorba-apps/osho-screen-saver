import { useState, useEffect } from 'react';
import { getColorScheme } from '../lib/colorUtils';
import { MeditationService, MeditationData } from '../lib/meditationService';

interface MeditationSelectorProps {
  isDarkBackground?: boolean;
  isMobile?: boolean;
  onMeditationSelect?: (meditationUrl: string, meditationName: string, urls?: string[]) => void;
  selectedMeditationId?: string;
}

export default function MeditationSelector({
  isDarkBackground = true,
  isMobile = false,
  onMeditationSelect,
  selectedMeditationId
}: MeditationSelectorProps) {
  const colors = getColorScheme(isDarkBackground);
  const [showList, setShowList] = useState(false);
  const [meditations, setMeditations] = useState<MeditationData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMeditations();
  }, []);

  const loadMeditations = async () => {
    setLoading(true);
    try {
      const meditationService = MeditationService.getInstance();
      const meditationList = await meditationService.loadMeditations();
      setMeditations(meditationList);
    } catch (error) {
      console.error('Error loading meditations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMeditationSelect = (meditation: MeditationData) => {
    if (onMeditationSelect) {
      onMeditationSelect(meditation.url, meditation.name, meditation.urls);
    }
    setShowList(false);
  };


  const selectedMeditation = meditations.find(m => m.id === selectedMeditationId);

  return (
    <div className="relative">
      {/* Meditation Button */}
      <button
        onClick={() => setShowList(!showList)}
        className={`w-full px-4 py-2 rounded-lg ${colors.background} ${colors.backgroundHover} ${colors.textSecondary} hover:${colors.text} transition-all duration-200 hover:scale-105 text-sm flex items-center justify-center space-x-2 ${
          showList ? 'ring-2 ring-blue-400' : ''
        }`}
        title="Select Meditation"
        disabled={loading}
      >
        {loading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
        <span>{selectedMeditation ? selectedMeditation.name : 'Meditations'}</span>
        <svg 
          className={`w-3 h-3 transition-transform duration-200 ${showList ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Meditation List Dropdown */}
      {showList && (
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-lg ${isDarkBackground ? 'bg-white/20 border-white/30' : 'bg-gray-900/30 border-gray-700/50'} border backdrop-blur-md z-[100] shadow-2xl`}>
          <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
            {meditations.length === 0 && !loading ? (
              <div className={`text-center py-4 text-sm ${colors.textTertiary}`}>
                No meditations available
              </div>
            ) : (
              meditations.map((meditation) => (
                <button
                  key={meditation.id}
                  onClick={() => handleMeditationSelect(meditation)}
                  className={`w-full text-left px-3 py-3 rounded-md text-sm transition-all duration-200 hover:scale-105 ${
                    selectedMeditationId === meditation.id
                      ? `${isDarkBackground ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50' : 'bg-blue-600/30 text-blue-800 border border-blue-500/50'}`
                      : isDarkBackground 
                        ? 'hover:bg-white/30 text-white border border-transparent hover:border-white/20' 
                        : 'hover:bg-gray-900/30 text-gray-900 border border-transparent hover:border-gray-700/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <div className={`truncate font-medium ${isDarkBackground ? 'text-white' : 'text-gray-900'}`}>{meditation.name}</div>
                        {meditation.description && (
                          <div className={`text-xs truncate ${isDarkBackground ? 'text-gray-300' : 'text-gray-600'}`}>
                            {meditation.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
