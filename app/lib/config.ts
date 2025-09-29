// Environment configuration for the app
const getEnvVar = (name: string): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  // Try multiple ways to get environment variables
  const importMeta = (import.meta as any)?.env;
  if (importMeta && importMeta[name]) {
    return importMeta[name];
  }
  
  // Fallback to window object (for debugging)
  const windowEnv = (window as any).__ENV__;
  if (windowEnv && windowEnv[name]) {
    return windowEnv[name];
  }
  
  return undefined;
};

export const config = {
  googleDrive: {
    apiKey: getEnvVar('VITE_GOOGLE_DRIVE_API_KEY'),
    folderId: getEnvVar('VITE_GOOGLE_DRIVE_FOLDER_ID'),
  },
  isConfigured: () => {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const apiKey = getEnvVar('VITE_GOOGLE_DRIVE_API_KEY');
    const folderId = getEnvVar('VITE_GOOGLE_DRIVE_FOLDER_ID');
    
    return !!(apiKey && folderId);
  }
};
