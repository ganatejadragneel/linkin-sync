// Custom hook for fetching Spotify playlists

import { useState, useEffect } from 'react';
import { spotifyApiService } from '../services/api';
import { SpotifyPlaylist } from '../types';
import { useErrorHandler } from './useErrorHandler';
import { storageService } from '../services/storage.service';

export const useSpotifyPlaylists = () => {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();
  
  const isAuthenticated = storageService.isAuthenticated();

  const fetchPlaylists = async () => {
    if (!isAuthenticated) {
      setError('Please log in to view your playlists');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await spotifyApiService.getAllUserPlaylists();
      setPlaylists(response.items);
    } catch (err) {
      const errorMessage = 'Failed to load playlists';
      setError(errorMessage);
      handleError(err, { 
        defaultMessage: errorMessage,
        showToast: false // We'll show error in component instead
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [isAuthenticated]);

  return {
    playlists,
    loading,
    error,
    refetch: fetchPlaylists,
    isAuthenticated,
  };
};