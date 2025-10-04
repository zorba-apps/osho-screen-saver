export interface MeditationData {
  id: string;
  name: string;
  url: string;
  urls?: string[]; // Multiple URL options to try
  duration?: number;
  description?: string;
  category?: string;
}

interface MeditationConfig {
  meditations: Array<{
    id: string;
    name: string;
    publicId: string;
    duration: number;
    description: string;
    category: string;
  }>;
  cloudName: string;
  transformations: {
    format: string;
    quality: string;
  };
}

export class MeditationService {
  private static instance: MeditationService;
  private meditations: MeditationData[] = [];

  static getInstance(): MeditationService {
    if (!MeditationService.instance) {
      MeditationService.instance = new MeditationService();
    }
    return MeditationService.instance;
  }

  async loadMeditations(): Promise<MeditationData[]> {
    try {
      // Import the meditations config
      const meditationConfig: MeditationConfig = await import('./meditations.json');
      const { meditations, cloudName, transformations } = meditationConfig;
      
      // Convert config to MeditationData format with multiple URL options
      this.meditations = meditations.map(meditation => {
        // Try different URL formats to find one that works
        const urls = [
          `https://res.cloudinary.com/${cloudName}/video/upload/f_${transformations.format},q_${transformations.quality}/${meditation.publicId}`,
          `https://res.cloudinary.com/${cloudName}/video/upload/${meditation.publicId}`,
          `https://res.cloudinary.com/${cloudName}/raw/upload/${meditation.publicId}`,
          `https://res.cloudinary.com/${cloudName}/video/upload/v1/${meditation.publicId}`,
        ];
        
        return {
          id: meditation.id,
          name: meditation.name,
          url: urls[0], // Start with the first URL, we'll test them in the component
          urls, // Store all URL options for testing
          duration: meditation.duration,
          description: meditation.description,
          category: meditation.category
        };
      });
      
      return this.meditations;
    } catch (error) {
      console.error('Error loading meditations from JSON:', error);
      return this.getDefaultMeditations();
    }
  }

  // Fallback meditations if JSON fails to load
  private getDefaultMeditations(): MeditationData[] {
    return [
      {
        id: 'nadabrahma-meditation',
        name: 'Nadabrahma Meditation with Osho Voice',
        url: 'https://res.cloudinary.com/dimgca1xu/video/upload/Nadabrahma_Meditaton_with_Osho_Voice_hswhsu',
        duration: 3600,
        description: 'A powerful Nadabrahma meditation guided by Osho\'s voice',
        category: 'guided'
      }
    ];
  }

  // Method to load meditations from Cloudinary (when you have the actual data)
  async loadMeditationsFromCloudinary(): Promise<MeditationData[]> {
    try {
      // This is where you'll implement the actual Cloudinary API call
      // Similar to how images are loaded, but for video/audio files
      const apiUrl = `https://res.cloudinary.com/${this.cloudName}/video/list/meditations.json`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        return this.getDefaultMeditations();
      }
      
      const data = await response.json();
      
      if (!data.resources || data.resources.length === 0) {
        return this.getDefaultMeditations();
      }
      
      const meditations = data.resources.map((resource: any, index: number) => ({
        id: resource.public_id,
        name: resource.public_id.replace(/[_-]/g, ' ').replace(/\.[^/.]+$/, ''),
        url: `https://res.cloudinary.com/${this.cloudName}/video/upload/f_auto,q_auto/${resource.public_id}`,
        duration: resource.duration || 0,
        description: `Meditation ${index + 1}`
      }));
      
      this.meditations = meditations;
      return meditations;
    } catch (error) {
      console.error('Error loading meditations from Cloudinary:', error);
      return this.getDefaultMeditations();
    }
  }

  getMeditations(): MeditationData[] {
    return this.meditations;
  }

  getMeditationById(id: string): MeditationData | null {
    return this.meditations.find(meditation => meditation.id === id) || null;
  }

  // Method to add custom meditations
  addMeditation(meditation: MeditationData): void {
    this.meditations.push(meditation);
  }

  // Method to set meditations from external source
  setMeditations(meditations: MeditationData[]): void {
    this.meditations = meditations;
  }
}
