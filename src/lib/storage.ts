// src/lib/storage.ts
export const storage = {
    get: (key: string) => {
      try {
        if (typeof window !== 'undefined') {
          return localStorage.getItem(key);
        }
      } catch (error) {
        console.warn('Error accessing localStorage:', error);
      }
      return null;
    },
  
    set: (key: string, value: string) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, value);
        }
      } catch (error) {
        console.warn('Error setting localStorage:', error);
      }
    },
  
    remove: (key: string) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.warn('Error removing from localStorage:', error);
      }
    },
  
    // Método helper para verificar si localStorage está disponible
    isAvailable: () => {
      try {
        return typeof window !== 'undefined' && window.localStorage !== null;
      } catch (e) {
        return false;
      }
    }
  };