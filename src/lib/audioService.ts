export interface AudioTrack {
  name: string;
  url: string;
  duration: number;
}

export class AudioService {
  private static instance: AudioService;
  private audio: HTMLAudioElement | null = null;
  private currentTrack: AudioTrack | null = null;
  private isPlayingState = false;
  private currentTime = 0;
  private duration = 0;
  private listeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.setupAudioElement();
  }

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private setupAudioElement(): void {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    
    this.audio.addEventListener('loadedmetadata', () => {
      this.duration = this.audio?.duration || 0;
      this.emit('durationChange', this.duration);
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio?.currentTime || 0;
      this.emit('timeUpdate', this.currentTime);
    });

    this.audio.addEventListener('ended', () => {
      this.isPlayingState = false;
      this.emit('playbackEnded');
    });

    this.audio.addEventListener('play', () => {
      this.isPlayingState = true;
      this.emit('playbackStateChange', true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlayingState = false;
      this.emit('playbackStateChange', false);
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      this.emit('error', e);
    });
  }

  loadFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.audio) {
        reject(new Error('Audio element not initialized'));
        return;
      }

      const url = URL.createObjectURL(file);
      this.audio.src = url;
      this.currentTrack = {
        name: file.name,
        url,
        duration: 0
      };

      this.audio.addEventListener('loadedmetadata', () => {
        this.duration = this.audio?.duration || 0;
        this.currentTrack!.duration = this.duration;
        this.emit('trackLoaded', this.currentTrack);
        resolve();
      }, { once: true });

      this.audio.addEventListener('error', (e) => {
        reject(e);
      }, { once: true });
    });
  }

  play(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.audio) {
        reject(new Error('Audio element not initialized'));
        return;
      }

      this.audio.play()
        .then(() => resolve())
        .catch(reject);
    });
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.currentTime = 0;
      this.emit('timeUpdate', 0);
    }
  }

  setCurrentTime(time: number): void {
    if (this.audio) {
      this.audio.currentTime = time;
    }
  }

  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Getters
  getCurrentTrack(): AudioTrack | null {
    return this.currentTrack;
  }

  getIsPlaying(): boolean {
    return this.isPlayingState;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getDuration(): number {
    return this.duration;
  }

  // Cleanup
  destroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }
    this.listeners.clear();
  }
}
