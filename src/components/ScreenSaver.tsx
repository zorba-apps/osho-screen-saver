import { useState, useEffect, useRef, useCallback } from 'react';
import { ImageService, ImageData } from '../lib/imageService';
import { TransitionService, TransitionType } from '../lib/transitionService';

interface ScreenSaverProps {
  isPlaying: boolean;
  transitionType: TransitionType;
  transitionDuration: number;
  onImageChange?: (image: ImageData, index: number, total: number) => void;
  onNextImage?: () => void;
  onPreviousImage?: () => void;
  onTextColorChange?: (isDark: boolean) => void;
  isBlurBackgroundEnabled?: boolean;
}

export default function ScreenSaver({
  isPlaying,
  transitionType,
  transitionDuration,
  onImageChange,
  onNextImage,
  onPreviousImage,
  onTextColorChange,
  isBlurBackgroundEnabled = false
}: ScreenSaverProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const imageService = useRef(ImageService.getInstance());
  const transitionService = useRef(TransitionService.getInstance());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentImageRef = useRef<HTMLDivElement>(null);
  const nextImageRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Function to analyze image brightness
  const analyzeImageBrightness = useCallback((imageUrl: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to a smaller size for performance
        const size = 100;
        canvas.width = size;
        canvas.height = size;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, size, size);

        // Get image data
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        // Calculate average brightness
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Calculate perceived brightness using luminance formula
          const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          totalBrightness += brightness;
        }

        const averageBrightness = totalBrightness / (data.length / 4);
        const isDark = averageBrightness < 0.5;
        
        onTextColorChange?.(isDark);
      } catch (error) {
        console.warn('Could not analyze image brightness:', error);
        // Default to dark background assumption
        onTextColorChange?.(true);
      }
    };

    img.onerror = () => {
      // Default to dark background assumption on error
      onTextColorChange?.(true);
    };

    img.src = imageUrl;
  }, [onTextColorChange]);

  // Load images on component mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        const loadedImages = await imageService.current.loadImages();
        setImages(loadedImages);
        if (loadedImages.length > 0) {
          await imageService.current.preloadAllImages();
          // Set the first image
          onImageChange?.(loadedImages[0], 0, loadedImages.length);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading images:', error);
        setIsLoading(false);
      }
    };

    loadImages();
  }, [onImageChange]);

  // Update transition service when props change
  useEffect(() => {
    transitionService.current.setTransitionType(transitionType);
    transitionService.current.setTransitionDuration(transitionDuration);
  }, [transitionType, transitionDuration]);

  // Handle image transitions
  const transitionToNextImage = useCallback(() => {
    if (images.length === 0 || !currentImageRef.current || !nextImageRef.current) return;

    const nextIndex = (currentImageIndex + 1) % images.length;
    const nextImage = images[nextIndex];
    
    // Update next image source
    const nextImageElement = nextImageRef.current.querySelector('img') as HTMLImageElement;
    if (nextImageElement) {
      nextImageElement.src = nextImage.url;
      nextImageElement.alt = nextImage.name;
    }

    // Update background with same image
    if (backgroundRef.current) {
      const backgroundImg = backgroundRef.current.querySelector('img') as HTMLImageElement;
      if (backgroundImg) {
        backgroundImg.src = nextImage.url;
        backgroundImg.alt = nextImage.name;
      }
    }

    // Analyze image brightness for text color
    analyzeImageBrightness(nextImage.url);

    // Update state immediately when transition starts
    setCurrentImageIndex(nextIndex);
    onImageChange?.(nextImage, nextIndex, images.length);

    // Apply transition
    transitionService.current.applyTransition(
      currentImageRef.current,
      nextImageRef.current,
      () => {
        // After transition completes, swap the refs
        // Note: We can't directly assign to .current, so we'll handle this differently
        // The refs will be updated in the next render cycle
      }
    );
  }, [currentImageIndex, images, onImageChange]);

  // Navigation functions
  const goToNextImage = useCallback(() => {
    if (images.length > 1) {
      // Clear existing timer to prevent immediate automatic transition
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      transitionToNextImage();
      
      // Restart timer if playing
      if (isPlaying) {
        intervalRef.current = setInterval(transitionToNextImage, transitionDuration + 2000);
      }
    }
  }, [transitionToNextImage, images.length, isPlaying, transitionDuration]);

  const goToPreviousImage = useCallback(() => {
    if (images.length === 0 || !currentImageRef.current || !nextImageRef.current) return;

    // Clear existing timer to prevent immediate automatic transition
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    const prevImage = images[prevIndex];
    
    // Update next image source
    const nextImageElement = nextImageRef.current.querySelector('img') as HTMLImageElement;
    if (nextImageElement) {
      nextImageElement.src = prevImage.url;
      nextImageElement.alt = prevImage.name;
    }

    // Update background with same image
    if (backgroundRef.current) {
      const backgroundImg = backgroundRef.current.querySelector('img') as HTMLImageElement;
      if (backgroundImg) {
        backgroundImg.src = prevImage.url;
        backgroundImg.alt = prevImage.name;
      }
    }

    // Analyze image brightness for text color
    analyzeImageBrightness(prevImage.url);

    // Update state immediately when transition starts
    setCurrentImageIndex(prevIndex);
    onImageChange?.(prevImage, prevIndex, images.length);

    // Apply transition
    transitionService.current.applyTransition(
      currentImageRef.current,
      nextImageRef.current,
      () => {
        // After transition completes, swap the refs
        // Note: We can't directly assign to .current, so we'll handle this differently
        // The refs will be updated in the next render cycle
        
        // Restart timer if playing
        if (isPlaying) {
          intervalRef.current = setInterval(transitionToNextImage, transitionDuration + 2000);
        }
      }
    );
  }, [currentImageIndex, images, isPlaying, transitionDuration, transitionToNextImage]);

  // Expose navigation functions to parent
  useEffect(() => {
    if (onNextImage) {
      (window as any).nextImage = goToNextImage;
    }
    if (onPreviousImage) {
      (window as any).previousImage = goToPreviousImage;
    }
  }, [onNextImage, onPreviousImage, goToNextImage, goToPreviousImage]);

  // Handle play/pause
  useEffect(() => {
    if (isPlaying && images.length > 1) {
      intervalRef.current = setInterval(transitionToNextImage, transitionDuration + 2000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, images.length, transitionToNextImage, transitionDuration]);

  if (isLoading) {
    return (
      <div className="screen-saver-container flex items-center justify-center">
        <div className="text-4xl font-light">Loading Osho Images...</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="screen-saver-container flex items-center justify-center">
        <div className="text-4xl font-light text-center">
          <div>No images found in Firebase Storage</div>
          <div className="text-xl mt-4 opacity-75">Please upload images to the 'osho_images' folder</div>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];
  const nextImage = images[(currentImageIndex + 1) % images.length];

  return (
    <div className="screen-saver-container">
      {/* Conditional Background */}
      {isBlurBackgroundEnabled && (
        <div 
          ref={backgroundRef}
          className="image-background"
        >
          <img
            src={currentImage.url}
            alt={currentImage.name}
            className="background-image"
            draggable={false}
          />
        </div>
      )}
      
      {/* Current Image */}
      <div 
        ref={currentImageRef}
        className="image-container"
      >
        <img
          src={currentImage.url}
          alt={currentImage.name}
          className={isBlurBackgroundEnabled ? "image-fit" : "image-fit-cover"}
          draggable={false}
        />
      </div>

      {/* Next Image (hidden initially) */}
      <div 
        ref={nextImageRef}
        className="image-container"
        style={{ display: 'none' }}
      >
        <img
          src={nextImage.url}
          alt={nextImage.name}
          className={isBlurBackgroundEnabled ? "image-fit" : "image-fit-cover"}
          draggable={false}
        />
      </div>
    </div>
  );
}
