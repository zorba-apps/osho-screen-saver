export interface PWAUpdateState {
  updateAvailable: boolean;
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
}

export interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export class PWAService {
  private static instance: PWAService;
  private updateState: PWAUpdateState = {
    updateAvailable: false,
    isOnline: navigator.onLine,
    isInstalled: false,
    canInstall: false
  };
  
  private listeners: Map<string, Set<(state: PWAUpdateState) => void>> = new Map();
  private installPrompt: PWAInstallPrompt | null = null;
  private updateCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  private initialize() {
    this.setupEventListeners();
    this.checkInstallability();
    this.checkForUpdates();
  }

  private setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.updateState.isOnline = true;
      this.startPeriodicUpdates();
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      this.updateState.isOnline = false;
      this.stopPeriodicUpdates();
      this.notifyListeners();
    });

    // PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as PWAInstallPrompt;
      this.updateState.canInstall = true;
      this.notifyListeners();
    });

    // App installed detection
    window.addEventListener('appinstalled', () => {
      this.updateState.isInstalled = true;
      this.updateState.canInstall = false;
      this.installPrompt = null;
      this.notifyListeners();
    });

    // Service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event);
      });
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent) {
    switch (event.data?.type) {
      case 'UPDATE_AVAILABLE':
        this.updateState.updateAvailable = true;
        this.notifyListeners();
        break;
      case 'UPDATE_CHECK_COMPLETE':
        // Handle update check completion if needed
        break;
    }
  }

  private async checkInstallability() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        this.updateState.isInstalled = !!registration;
      } catch (error) {
        console.log('Error checking installability:', error);
      }
    }
  }

  private async checkForUpdates() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.addEventListener('updatefound', () => {
            this.updateState.updateAvailable = true;
            this.notifyListeners();
          });
          
          await registration.update();
        }
      } catch (error) {
        console.log('Error checking for updates:', error);
      }
    }
  }

  private startPeriodicUpdates() {
    if (this.updateState.isOnline && !this.updateCheckInterval) {
      this.updateCheckInterval = setInterval(() => {
        this.checkForUpdates();
      }, 5 * 60 * 1000); // 5 minutes

      // Notify service worker to start periodic updates
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ 
          type: 'START_UPDATE_CHECK' 
        });
      }
    }
  }

  private stopPeriodicUpdates() {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }

    // Notify service worker to stop periodic updates
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ 
        type: 'STOP_UPDATE_CHECK' 
      });
    }
  }

  public async installApp(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.updateState.isInstalled = true;
        this.updateState.canInstall = false;
        this.installPrompt = null;
        this.notifyListeners();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error installing app:', error);
      return false;
    }
  }

  public async updateApp(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
          return true;
        }
      } catch (error) {
        console.error('Error updating app:', error);
      }
    }
    return false;
  }

  public dismissUpdate() {
    this.updateState.updateAvailable = false;
    this.notifyListeners();
  }

  public getState(): PWAUpdateState {
    return { ...this.updateState };
  }

  public subscribe(event: string, callback: (state: PWAUpdateState) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public unsubscribe(event: string, callback: (state: PWAUpdateState) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((callbacks) => {
      callbacks.forEach((callback) => {
        callback(this.getState());
      });
    });
  }

  public destroy() {
    this.stopPeriodicUpdates();
    this.listeners.clear();
  }
}
