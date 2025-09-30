// Touch gesture utilities for mobile support
export interface TouchPosition {
  x: number;
  y: number;
}

export interface SwipeDirection {
  direction: 'up' | 'down' | 'left' | 'right' | 'none';
  distance: number;
}

export class TouchGestureDetector {
  private startPosition: TouchPosition | null = null;
  private minSwipeDistance = 50;
  private maxSwipeTime = 500;
  private startTime = 0;

  onTouchStart = (e: TouchEvent): void => {
    const touch = e.touches[0];
    this.startPosition = { x: touch.clientX, y: touch.clientY };
    this.startTime = Date.now();
  };

  onTouchEnd = (e: TouchEvent): SwipeDirection => {
    if (!this.startPosition) {
      return { direction: 'none', distance: 0 };
    }

    const touch = e.changedTouches[0];
    const endPosition: TouchPosition = { x: touch.clientX, y: touch.clientY };
    const deltaX = endPosition.x - this.startPosition.x;
    const deltaY = endPosition.y - this.startPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const timeElapsed = Date.now() - this.startTime;

    // Reset start position
    this.startPosition = null;

    // Check if it's a valid swipe
    if (distance < this.minSwipeDistance || timeElapsed > this.maxSwipeTime) {
      return { direction: 'none', distance: 0 };
    }

    // Determine direction based on larger delta
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return {
        direction: deltaX > 0 ? 'right' : 'left',
        distance: Math.abs(deltaX)
      };
    } else {
      return {
        direction: deltaY > 0 ? 'down' : 'up',
        distance: Math.abs(deltaY)
      };
    }
  };

  // Static method for quick swipe detection
  static detectSwipe(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    minDistance: number = 50
  ): SwipeDirection {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < minDistance) {
      return { direction: 'none', distance: 0 };
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return {
        direction: deltaX > 0 ? 'right' : 'left',
        distance: Math.abs(deltaX)
      };
    } else {
      return {
        direction: deltaY > 0 ? 'down' : 'up',
        distance: Math.abs(deltaY)
      };
    }
  }
}
