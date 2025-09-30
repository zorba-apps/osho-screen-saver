export type TransitionType = 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom-in' | 'zoom-out' | 'zoom-pulse' | 'collage';

export interface TransitionConfig {
  type: TransitionType;
  duration: number;
  delay?: number;
}

export class TransitionService {
  private static instance: TransitionService;
  private currentTransition: TransitionType = 'fade';
  private transitionDuration: number = 3000;

  static getInstance(): TransitionService {
    if (!TransitionService.instance) {
      TransitionService.instance = new TransitionService();
    }
    return TransitionService.instance;
  }

  setTransitionType(type: TransitionType): void {
    this.currentTransition = type;
  }

  setTransitionDuration(duration: number): void {
    this.transitionDuration = duration;
  }

  getTransitionType(): TransitionType {
    return this.currentTransition;
  }

  getTransitionDuration(): number {
    return this.transitionDuration;
  }

  getRandomTransition(): TransitionType {
    const transitions: TransitionType[] = [
      'fade',
      'slide-left',
      'slide-right',
      'slide-up',
      'slide-down',
      'zoom-in',
      'zoom-out',
      'zoom-pulse',
      'collage'
    ];
    const randomIndex = Math.floor(Math.random() * transitions.length);
    return transitions[randomIndex];
  }

  applyTransition(
    currentElement: HTMLElement,
    nextElement: HTMLElement,
    onComplete?: () => void
  ): void {
    const transitionType = this.currentTransition;
    const duration = this.transitionDuration;

    // Reset any existing transitions
    currentElement.style.transition = '';
    nextElement.style.transition = '';

    switch (transitionType) {
      case 'fade':
        this.applyFadeTransition(currentElement, nextElement, duration, onComplete);
        break;
      case 'slide-left':
        this.applySlideTransition(currentElement, nextElement, 'left', duration, onComplete);
        break;
      case 'slide-right':
        this.applySlideTransition(currentElement, nextElement, 'right', duration, onComplete);
        break;
      case 'slide-up':
        this.applySlideTransition(currentElement, nextElement, 'up', duration, onComplete);
        break;
      case 'slide-down':
        this.applySlideTransition(currentElement, nextElement, 'down', duration, onComplete);
        break;
      case 'zoom-in':
        this.applyZoomTransition(currentElement, nextElement, 'in', duration, onComplete);
        break;
      case 'zoom-out':
        this.applyZoomTransition(currentElement, nextElement, 'out', duration, onComplete);
        break;
      case 'zoom-pulse':
        this.applyZoomPulseTransition(currentElement, nextElement, duration, onComplete);
        break;
      case 'collage':
        this.applyCollageTransition(currentElement, nextElement, duration, onComplete);
        break;
    }
  }

  private applyFadeTransition(
    currentElement: HTMLElement,
    nextElement: HTMLElement,
    duration: number,
    onComplete?: () => void
  ): void {
    // Add subtle zoom effect to fade transition
    nextElement.style.opacity = '0';
    nextElement.style.transform = 'scale(1.05)';
    nextElement.style.display = 'block';

    setTimeout(() => {
      nextElement.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      nextElement.style.opacity = '1';
      nextElement.style.transform = 'scale(1)';
    }, 50);

    setTimeout(() => {
      currentElement.style.transition = `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      currentElement.style.opacity = '0';
      currentElement.style.transform = 'scale(0.98)';
    }, duration / 2);

    setTimeout(() => {
      currentElement.style.display = 'none';
      onComplete?.();
    }, duration + 100);
  }

  private applySlideTransition(
    currentElement: HTMLElement,
    nextElement: HTMLElement,
    direction: 'left' | 'right' | 'up' | 'down',
    duration: number,
    onComplete?: () => void
  ): void {
    const getTransform = (dir: string, offset: number, scale: number = 1) => {
      const translate = (() => {
        switch (dir) {
          case 'left': return `translateX(-${offset}%)`;
          case 'right': return `translateX(${offset}%)`;
          case 'up': return `translateY(-${offset}%)`;
          case 'down': return `translateY(${offset}%)`;
          default: return `translateX(${offset}%)`;
        }
      })();
      return `${translate} scale(${scale})`;
    };

    nextElement.style.transform = getTransform(direction, 100, 1.02);
    nextElement.style.display = 'block';

    setTimeout(() => {
      currentElement.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      nextElement.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      
      currentElement.style.transform = getTransform(direction, -100, 0.98);
      nextElement.style.transform = 'translateX(0) translateY(0) scale(1)';
    }, 50);

    setTimeout(() => {
      currentElement.style.display = 'none';
      onComplete?.();
    }, duration + 100);
  }

  private applyZoomTransition(
    currentElement: HTMLElement,
    nextElement: HTMLElement,
    type: 'in' | 'out',
    duration: number,
    onComplete?: () => void
  ): void {
    // Drone-like zoom effect: simulate camera movement
    // Zoom-in: drone flies closer (image appears to get larger)
    // Zoom-out: drone flies away (image appears to get smaller)
    
    if (type === 'in') {
      // Drone coming closer: start far away, fly in
      nextElement.style.transform = 'scale(0.3) translateZ(-200px)';
      nextElement.style.opacity = '0';
      nextElement.style.display = 'block';
      nextElement.style.filter = 'blur(2px)';

      setTimeout(() => {
        currentElement.style.transition = `opacity ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), filter ${duration}ms ease-out`;
        nextElement.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), filter ${duration}ms ease-out`;
        
        currentElement.style.opacity = '0';
        currentElement.style.transform = 'scale(1.2) translateZ(50px)';
        currentElement.style.filter = 'blur(1px)';
        
        nextElement.style.transform = 'scale(1) translateZ(0px)';
        nextElement.style.opacity = '1';
        nextElement.style.filter = 'blur(0px)';
      }, 50);
    } else {
      // Drone flying away: start close, fly out
      nextElement.style.transform = 'scale(1.4) translateZ(100px)';
      nextElement.style.opacity = '0';
      nextElement.style.display = 'block';
      nextElement.style.filter = 'blur(1px)';

      setTimeout(() => {
        currentElement.style.transition = `opacity ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), filter ${duration}ms ease-out`;
        nextElement.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), filter ${duration}ms ease-out`;
        
        currentElement.style.opacity = '0';
        currentElement.style.transform = 'scale(0.6) translateZ(-150px)';
        currentElement.style.filter = 'blur(2px)';
        
        nextElement.style.transform = 'scale(1) translateZ(0px)';
        nextElement.style.opacity = '1';
        nextElement.style.filter = 'blur(0px)';
      }, 50);
    }

    setTimeout(() => {
      currentElement.style.display = 'none';
      onComplete?.();
    }, duration + 100);
  }

  private applyZoomPulseTransition(
    currentElement: HTMLElement,
    nextElement: HTMLElement,
    duration: number,
    onComplete?: () => void
  ): void {
    // Drone pulse effect: simulate drone hovering and then diving in
    nextElement.style.opacity = '0';
    nextElement.style.transform = 'scale(0.4) translateZ(-300px)';
    nextElement.style.display = 'block';
    nextElement.style.filter = 'blur(3px)';

    // First phase: drone hovers and current image fades
    setTimeout(() => {
      currentElement.style.transition = `opacity ${duration * 0.3}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform ${duration * 0.3}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), filter ${duration * 0.3}ms ease-out`;
      currentElement.style.opacity = '0.1';
      currentElement.style.transform = 'scale(1.3) translateZ(100px)';
      currentElement.style.filter = 'blur(2px)';
    }, 50);

    // Second phase: drone dives in quickly
    setTimeout(() => {
      nextElement.style.transition = `opacity ${duration * 0.4}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform ${duration * 0.4}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), filter ${duration * 0.4}ms ease-out`;
      nextElement.style.opacity = '1';
      nextElement.style.transform = 'scale(1.2) translateZ(50px)';
      nextElement.style.filter = 'blur(0px)';
    }, duration * 0.2);

    // Third phase: drone settles to normal position
    setTimeout(() => {
      nextElement.style.transition = `transform ${duration * 0.3}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
      nextElement.style.transform = 'scale(1) translateZ(0px)';
    }, duration * 0.6);

    // Final cleanup
    setTimeout(() => {
      currentElement.style.display = 'none';
      onComplete?.();
    }, duration + 100);
  }

  private applyCollageTransition(
    currentElement: HTMLElement,
    nextElement: HTMLElement,
    duration: number,
    onComplete?: () => void
  ): void {
    // For collage, we'll use a fade transition as the base
    // The actual collage layout will be handled by the component
    this.applyFadeTransition(currentElement, nextElement, duration, onComplete);
  }
}
