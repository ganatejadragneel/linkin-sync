import { useState, useEffect } from 'react';

export function useSpotifyAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const profile = localStorage.getItem('user_profile');
      
      if (token && profile) {
        try {
          setUserProfile(JSON.parse(profile));
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user profile:', error);
          setIsAuthenticated(false);
          setUserProfile(null);
        }
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