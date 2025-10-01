import { useState, useEffect, useCallback } from 'react';
import { PWAService, PWAUpdateState } from './pwaService';
import { isPWASupported, isStandalone, isMobileDevice } from './pwaUtils';

export interface UsePWAReturn {
  // State
  updateAvailable: boolean;
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  isSupported: boolean;
  isStandalone: boolean;
  isMobile: boolean;
  
  // Actions
  installApp: () => Promise<boolean>;
  updateApp: () => Promise<boolean>;
  dismissUpdate: () => void;
  checkForUpdates: () => Promise<void>;
}

/**
 * React hook for PWA functionality
 */
export function usePWA(): UsePWAReturn {
  const [state, setState] = useState<PWAUpdateState>({
    updateAvailable: false,
    isOnline: navigator.onLine,
    isInstalled: false,
    canInstall: false
  });

  const pwaService = PWAService.getInstance();

  // Update state when PWA service state changes
  useEffect(() => {
    const handleStateChange = (newState: PWAUpdateState) => {
      setState(newState);
    };

    pwaService.subscribe('stateChange', handleStateChange);
    
    // Get initial state
    setState(pwaService.getState());

    return () => {
      pwaService.unsubscribe('stateChange', handleStateChange);
    };
  }, [pwaService]);

  // Actions
  const installApp = useCallback(async (): Promise<boolean> => {
    return await pwaService.installApp();
  }, [pwaService]);

  const updateApp = useCallback(async (): Promise<boolean> => {
    return await pwaService.updateApp();
  }, [pwaService]);

  const dismissUpdate = useCallback(() => {
    pwaService.dismissUpdate();
  }, [pwaService]);

  const checkForUpdates = useCallback(async (): Promise<void> => {
    // This will trigger the PWA service to check for updates
    // The service will automatically notify listeners when updates are found
  }, []);

  return {
    // State
    updateAvailable: state.updateAvailable,
    isOnline: state.isOnline,
    isInstalled: state.isInstalled,
    canInstall: state.canInstall,
    isSupported: isPWASupported(),
    isStandalone: isStandalone(),
    isMobile: isMobileDevice(),
    
    // Actions
    installApp,
    updateApp,
    dismissUpdate,
    checkForUpdates
  };
}

/**
 * Hook for PWA installation prompt
 */
export function usePWAInstall() {
  const { canInstall, installApp } = usePWA();
  
  return {
    canInstall,
    installApp
  };
}

/**
 * Hook for PWA updates
 */
export function usePWAUpdate() {
  const { updateAvailable, updateApp, dismissUpdate } = usePWA();
  
  return {
    updateAvailable,
    updateApp,
    dismissUpdate
  };
}

/**
 * Hook for PWA connectivity
 */
export function usePWAConnectivity() {
  const { isOnline } = usePWA();
  
  return {
    isOnline
  };
}
