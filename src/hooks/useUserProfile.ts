// Custom hook for managing user profile

import { useState, useEffect } from 'react';
import { SpotifyUserProfile } from '../types';
import { storageService } from '../services/storage.service';
import { initiateSpotifyLogin } from '../utils/spotify-auth';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<SpotifyUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile = storageService.getUserProfile();
    if (profile) {
      setUserProfile(profile);
    }
    setLoading(false);
  }, []);

  const login = async () => {
    await initiateSpotifyLogin();
  };

  const logout = () => {
    storageService.clearAuthData();
    setUserProfile(null);
  };

  const updateProfile = (profile: SpotifyUserProfile) => {
    storageService.setUserProfile(profile);
    setUserProfile(profile);
  };

  return {
    userProfile,
    loading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!userProfile,
  };
};