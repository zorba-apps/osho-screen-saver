import imagesConfig from './images.json';

export interface ImageData {
  url: string;
  name: string;
  width?: number;
  height?: number;
}

export class CloudinaryService {
  private static instance: CloudinaryService;
  private images: ImageData[] = [];
  private loadedImages: Map<string, HTMLImageElement> = new Map();

  static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }

  async loadImages(): Promise<ImageData[]> {
    try {
      const { oshoImages, cloudName, transformations } = imagesConfig;
      
      // Filter out any empty or undefined IDs
      const validImages = oshoImages.filter(id => id && id.trim() !== '');
      
      if (validImages.length === 0) {
        return this.getDemoImages();
      }
      
      // Build transformation string from config
      const transformString = `w_${transformations.width},h_${transformations.height},c_${transformations.crop},f_${transformations.format},q_${transformations.quality}`;
      
      const images = validImages.map((publicId, index) => ({
        url: `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`,
        name: `Osho ${index + 1}`,
      }));
      
      return images;
    } catch (error) {
      console.error('Error loading from Cloudinary:', error);
      return this.getDemoImages();
    }
  }

  private async loadImagesByTag(cloudName: string): Promise<ImageData[]> {
    try {
      // Try to get images by tag (if you tagged them)
      const apiUrl = `https://res.cloudinary.com/${cloudName}/image/list/osho.json`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        return this.getDemoImages();
      }
      
      const data = await response.json();
      
      if (!data.resources || data.resources.length === 0) {
        return this.getDemoImages();
      }
      
      const images = data.resources.map((resource: any, index: number) => ({
        url: `https://res.cloudinary.com/${cloudName}/image/upload/w_1920,h_1080,c_fill,f_auto,q_auto/${resource.public_id}`,
        name: resource.public_id.replace(/[_-]/g, ' '),
      }));
      
      return images;
    } catch (error) {
      console.error('Error loading images by tag:', error);
      return this.getDemoImages();
    }
  }

  // Method to add your Cloudinary images
  setCloudinaryImages(imagePublicIds: string[], cloudName: string): void {
    this.images = imagePublicIds.map((publicId, index) => ({
      url: `https://res.cloudinary.com/${cloudName}/image/upload/w_1920,h_1080,c_fill,f_auto,q_auto/${publicId}`,
      name: `Osho Image ${index + 1}`,
    }));
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
      }
    ];
  }

  async preloadImage(imageData: any): Promise<HTMLImageElement> {
    const url = imageData.url || imageData;
    if (this.loadedImages.has(url)) {
      return this.loadedImages.get(url)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedImages.set(url, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
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
}
