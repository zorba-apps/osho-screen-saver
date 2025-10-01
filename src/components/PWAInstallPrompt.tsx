import React from 'react';
import { usePWAInstall } from '../lib/usePWA';

interface PWAInstallPromptProps {
  className?: string;
  children?: React.ReactNode;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ 
  className = '',
  children 
}) => {
  const { canInstall, installApp } = usePWAInstall();
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (!canInstall || isDismissed) {
    return children ? <>{children}</> : null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-3">
        <div className="flex-1">
          <p className="text-sm font-medium">Install App</p>
          <p className="text-xs opacity-90">Add to home screen for better experience</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={installApp}
            className="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-gray-200 transition-colors"
            title="Dismiss install prompt"
            aria-label="Dismiss install prompt"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
