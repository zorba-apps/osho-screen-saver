import { useEffect } from 'react';
import { getColorScheme } from '../lib/colorUtils';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkBackground?: boolean;
}

export default function GalleryModal({
  isOpen,
  onClose,
  isDarkBackground = true
}: GalleryModalProps) {
  const colors = getColorScheme(isDarkBackground);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className={`relative w-full max-w-4xl max-h-[80vh] ${isDarkBackground ? 'bg-white/5 border-white/10' : 'bg-gray-900/10 border-gray-700/20'} backdrop-blur-2xl rounded-3xl shadow-2xl border liquid-glass overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
            <h2 className={`text-2xl font-bold ${isDarkBackground ? 'bg-gradient-to-r from-white to-gray-300' : 'bg-gradient-to-r from-gray-800 to-gray-600'} bg-clip-text text-transparent`}>
              Image Gallery
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl ${colors.background} ${colors.backgroundHover} ${colors.textSecondary} hover:${colors.text} transition-all duration-200 hover:scale-105`}
            title="Close Gallery (Esc)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${colors.text}`}>
              Gallery Coming Soon
            </h3>
            <p className={`text-sm ${colors.textMuted} mb-4`}>
              Image gallery functionality will be added here
            </p>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${colors.background} ${colors.backgroundHover} ${colors.textSecondary} hover:${colors.text} transition-all duration-200 hover:scale-105`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
