// No Firebase needed - using Cloudinary and Google Drive API
import { config } from './config';
import { CloudinaryService } from './cloudinaryService';

export interface ImageData {
  url: string;
  name: string;
  width?: number;
  height?: number;
}

export class ImageService {
  private static instance: ImageService;
  private images: ImageData[] = [];
  private loadedImages: Map<string, HTMLImageElement> = new Map();

  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  async loadImages(): Promise<ImageData[]> {
    try {
          // Try Cloudinary first (no CORS issues)
          const cloudinaryService = CloudinaryService.getInstance();
          const cloudinaryImages = await cloudinaryService.loadImages();
          if (cloudinaryImages.length > 0) {
            this.images = cloudinaryImages;
            return this.images;
          }

          // Try Google Drive as fallback
          const driveImages = await this.loadFromGoogleDrive();
          if (driveImages.length > 0) {
            // Test if at least one image loads successfully
            const testImage = await this.testImageLoad(driveImages[0]);
            if (testImage) {
              this.images = driveImages;
              return this.images;
            }
          }

          // Fallback to demo images
          return this.getDemoImages();
    } catch (error) {
      console.error('Error loading images:', error);
      // Return demo images if anything fails
      return this.getDemoImages();
    }
  }

  private async testImageLoad(imageData: any): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000); // 5 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      
      img.src = imageData.url;
    });
  }

  private async loadFromGoogleDrive(): Promise<ImageData[]> {
    try {
      // Temporary hardcoded values for testing
      const apiKey = 'AIzaSyD5l6oTr-FLXk3f_rFa1ogA9O30dA-UFJ8';
      const folderId = '1eC_CXStn-zTRDEUPSgKDH9xExk49OHJI';
      

      // Use Google Drive API to list files in folder - only get web-compatible images
      const apiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+(mimeType+contains+'image/jpeg'+or+mimeType+contains+'image/jpg'+or+mimeType+contains+'image/png'+or+mimeType+contains+'image/webp'+or+mimeType+contains+'image/gif')&key=${apiKey}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch from Google Drive: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.files || data.files.length === 0) {
        return [];
      }

      // Filter out unsupported formats and convert to our format
      const supportedFiles = data.files.filter((file: any) => {
        const fileName = file.name.toLowerCase();
        const mimeType = file.mimeType.toLowerCase();
        
        // Only include web-compatible image formats
        const isSupported = (
          fileName.endsWith('.jpg') || 
          fileName.endsWith('.jpeg') || 
          fileName.endsWith('.png') || 
          fileName.endsWith('.webp') || 
          fileName.endsWith('.gif') ||
          mimeType.includes('jpeg') ||
          mimeType.includes('png') ||
          mimeType.includes('webp') ||
          mimeType.includes('gif')
        ) && !fileName.endsWith('.tiff') && !fileName.endsWith('.tif');
        
        
        return isSupported;
      });

      const images = supportedFiles.map((file: any) => {
        // Use Google Drive's thumbnail service which works better for CORS
        const urls = [
          `https://drive.google.com/thumbnail?id=${file.id}&sz=w1920-h1080`,
          `https://lh3.googleusercontent.com/d/${file.id}`,
          `https://drive.google.com/uc?export=view&id=${file.id}`,
        ];
        
        return {
          url: urls[0], // Start with thumbnail service
          fallbackUrls: urls.slice(1), // Keep fallbacks
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        };
      });

      
      return images;
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      return [];
    }
  }

  private getDemoImages(): ImageData[] {
    return [
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
        name: 'Mountain Landscape',
      },
      {
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop&crop=center',
        name: 'Forest Path',
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop&crop=center',
        name: 'Ocean Waves',
      },
      {
        url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&h=1080&fit=crop&crop=center',
        name: 'Desert Sunset',
      },
      {
        url: 'https://images.unsplash.com/photo-1519501025264-65f15b1e4f19?w=1920&h=1080&fit=crop&crop=center',
        name: 'City Lights',
      },
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
        name: 'Zen Garden',
      },
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
        name: 'Meditation Space',
      },
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
        name: 'Peaceful Garden',
      }
    ];
  }

  async preloadImage(imageData: any): Promise<HTMLImageElement> {
    const url = imageData.url || imageData;
    if (this.loadedImages.has(url)) {
      return this.loadedImages.get(url)!;
    }

    return new Promise((resolve, reject) => {
      const tryUrls = [url];
      if (imageData.fallbackUrls) {
        tryUrls.push(...imageData.fallbackUrls);
      }

      let currentIndex = 0;
      
      const tryNextUrl = () => {
        if (currentIndex >= tryUrls.length) {
          reject(new Error('All image URLs failed to load'));
          return;
        }

            const currentUrl = tryUrls[currentIndex];

            const img = new Image();
            // Don't set crossOrigin for Google Drive images
            
            img.onload = () => {
              this.loadedImages.set(currentUrl, img);
              resolve(img);
            };
            
            img.onerror = (error) => {
              currentIndex++;
              tryNextUrl();
            };
        
        img.src = currentUrl;
      };

      tryNextUrl();
    });
  }

  async preloadAllImages(): Promise<void> {
    const preloadPromises = this.images.map(image => this.preloadImage(image.url));
    await Promise.all(preloadPromises);
  }

  getImages(): ImageData[] {
    return this.images;
  }

  getRandomImage(): ImageData | null {
    if (this.images.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.images.length);
    return this.images[randomIndex];
  }

  getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  calculateImageFit(containerWidth: number, containerHeight: number, imageWidth: number, imageHeight: number): {
    width: number;
    height: number;
    x: number;
    y: number;
    scale: number;
  } {
    const containerAspect = containerWidth / containerHeight;
    const imageAspect = imageWidth / imageHeight;

    let scale: number;
    let width: number;
    let height: number;
    let x: number;
    let y: number;

    if (imageAspect > containerAspect) {
      // Image is wider than container
      scale = containerHeight / imageHeight;
      height = containerHeight;
      width = imageWidth * scale;
      x = (containerWidth - width) / 2;
      y = 0;
    } else {
      // Image is taller than container
      scale = containerWidth / imageWidth;
      width = containerWidth;
      height = imageHeight * scale;
      x = 0;
      y = (containerHeight - height) / 2;
    }

    return { width, height, x, y, scale };
  }
}
