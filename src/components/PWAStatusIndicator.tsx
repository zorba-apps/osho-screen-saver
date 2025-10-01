import React from 'react';
import { usePWAConnectivity } from '../lib/usePWA';

interface PWAStatusIndicatorProps {
  className?: string;
  showOnline?: boolean;
}

export const PWAStatusIndicator: React.FC<PWAStatusIndicatorProps> = ({ 
  className = '',
  showOnline = false 
}) => {
  const { isOnline } = usePWAConnectivity();

  if (isOnline && !showOnline) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
        isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-yellow-500 text-white'
      }`}>
        {isOnline ? 'Online' : 'Offline Mode'}
      </div>
    </div>
  );
};
