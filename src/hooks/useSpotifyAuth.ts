import { useState, useEffect } from 'react';
import { storageService } from '../services/storage.service';

export function useSpotifyAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = storageService.getAccessToken();
      const profile = storageService.getUserProfile();
      
      if (token && profile) {
        setUserProfile(profile);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUserProfile(null);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return { isAuthenticated, userProfile };
}