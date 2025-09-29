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
    // Add zoom effect to fade transition
    nextElement.style.opacity = '0';
    nextElement.style.transform = 'scale(1.1)';
    nextElement.style.display = 'block';

    setTimeout(() => {
      nextElement.style.transition = `opacity ${duration}ms ease-in-out, transform ${duration}ms ease-in-out`;
      nextElement.style.opacity = '1';
      nextElement.style.transform = 'scale(1)';
    }, 50);

    setTimeout(() => {
      currentElement.style.transition = `opacity ${duration}ms ease-in-out, transform ${duration}ms ease-in-out`;
      currentElement.style.opacity = '0';
      currentElement.style.transform = 'scale(0.95)';
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

    nextElement.style.transform = getTransform(direction, 100, 1.1);
    nextElement.style.display = 'block';

    setTimeout(() => {
      currentElement.style.transition = `transform ${duration}ms ease-in-out`;
      nextElement.style.transition = `transform ${duration}ms ease-in-out`;
      
      currentElement.style.transform = getTransform(direction, -100, 0.95);
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
    const scale = type === 'in' ? 0.7 : 1.3;
    nextElement.style.transform = `scale(${scale})`;
    nextElement.style.opacity = '0';
    nextElement.style.display = 'block';

    setTimeout(() => {
      currentElement.style.transition = `opacity ${duration}ms ease-in-out, transform ${duration}ms ease-in-out`;
      nextElement.style.transition = `transform ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`;
      
      currentElement.style.opacity = '0';
      currentElement.style.transform = `scale(${type === 'in' ? 1.1 : 0.9})`;
      nextElement.style.transform = 'scale(1)';
      nextElement.style.opacity = '1';
    }, 50);

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
    // Start with both images visible
    nextElement.style.opacity = '0';
    nextElement.style.transform = 'scale(0.8)';
    nextElement.style.display = 'block';

    // First phase: zoom out current image while fading
    setTimeout(() => {
      currentElement.style.transition = `opacity ${duration * 0.4}ms ease-in-out, transform ${duration * 0.4}ms ease-in-out`;
      currentElement.style.opacity = '0.3';
      currentElement.style.transform = 'scale(1.1)';
    }, 50);

    // Second phase: zoom in new image
    setTimeout(() => {
      nextElement.style.transition = `opacity ${duration * 0.6}ms ease-in-out, transform ${duration * 0.6}ms ease-in-out`;
      nextElement.style.opacity = '1';
      nextElement.style.transform = 'scale(1.05)';
    }, duration * 0.3);

    // Third phase: settle to normal scale
    setTimeout(() => {
      nextElement.style.transform = 'scale(1)';
    }, duration * 0.7);

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
