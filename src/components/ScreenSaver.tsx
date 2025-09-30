import { useState, useEffect, useRef, useCallback } from 'react';
import { ImageService, ImageData } from '../lib/imageService';
import { TransitionService, TransitionType } from '../lib/transitionService';

interface ScreenSaverProps {
  isPlaying: boolean;
  transitionType: TransitionType;
  transitionDuration: number;
  onImageChange?: (image: ImageData) => void;
  onNextImage?: () => void;
  onPreviousImage?: () => void;
}

export default function ScreenSaver({
  isPlaying,
  transitionType,
  transitionDuration,
  onImageChange,
  onNextImage,
  onPreviousImage
}: ScreenSaverProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const imageService = useRef(ImageService.getInstance());
  const transitionService = useRef(TransitionService.getInstance());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentImageRef = useRef<HTMLDivElement>(null);
  const nextImageRef = useRef<HTMLDivElement>(null);

  // Load images on component mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        const loadedImages = await imageService.current.loadImages();
        setImages(loadedImages);
        if (loadedImages.length > 0) {
          await imageService.current.preloadAllImages();
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading images:', error);
        setIsLoading(false);
      }
    };

    loadImages();
  }, []);

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

    // Apply transition
    transitionService.current.applyTransition(
      currentImageRef.current,
      nextImageRef.current,
      () => {
        // After transition completes, swap the refs
        const temp = currentImageRef.current;
        currentImageRef.current = nextImageRef.current;
        nextImageRef.current = temp;
        
        setCurrentImageIndex(nextIndex);
        onImageChange?.(nextImage);
      }
    );
  }, [currentImageIndex, images, onImageChange]);

  // Navigation functions
  const goToNextImage = useCallback(() => {
    if (images.length > 1) {
      transitionToNextImage();
    }
  }, [transitionToNextImage, images.length]);

  const goToPreviousImage = useCallback(() => {
    if (images.length === 0 || !currentImageRef.current || !nextImageRef.current) return;

    const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    const prevImage = images[prevIndex];
    
    // Update next image source
    const nextImageElement = nextImageRef.current.querySelector('img') as HTMLImageElement;
    if (nextImageElement) {
      nextImageElement.src = prevImage.url;
      nextImageElement.alt = prevImage.name;
    }

    // Apply transition
    transitionService.current.applyTransition(
      currentImageRef.current,
      nextImageRef.current,
      () => {
        // After transition completes, swap the refs
        const temp = currentImageRef.current;
        currentImageRef.current = nextImageRef.current;
        nextImageRef.current = temp;
        
        setCurrentImageIndex(prevIndex);
        onImageChange?.(prevImage);
      }
    );
  }, [currentImageIndex, images]);

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
      {/* Current Image */}
      <div 
        ref={currentImageRef}
        className="image-container"
      >
        <img
          src={currentImage.url}
          alt={currentImage.name}
          className="image-fit"
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
          className="image-fit"
          draggable={false}
        />
      </div>
    </div>
  );
}
