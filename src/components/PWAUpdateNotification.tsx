import React from 'react';
import { usePWAUpdate } from '../lib/usePWA';

interface PWAUpdateNotificationProps {
  className?: string;
}

export const PWAUpdateNotification: React.FC<PWAUpdateNotificationProps> = ({ 
  className = '' 
}) => {
  const { updateAvailable, updateApp, dismissUpdate } = usePWAUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Update Available</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            A new version of the app is available. Update now to get the latest features.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={updateApp}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={dismissUpdate}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-xs px-3 py-1 rounded transition-colors"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={dismissUpdate}
          className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Close notification"
          aria-label="Close update notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
