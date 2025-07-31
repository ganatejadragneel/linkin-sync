// Custom hook for fetching featured content (playlists and top tracks)

import { useState, useEffect } from 'react';
import { spotifyApiService } from '../services/api';
import { SpotifyPlaylist, SpotifyPlaylistTrack } from '../types';
import { useErrorHandler } from './useErrorHandler';
import { storageService } from '../services/storage.service';

export interface FeaturedContentData {
  featuredPlaylists: SpotifyPlaylist[];
  topTracks: SpotifyPlaylistTrack[];
  message?: string;
}

export const useFeaturedContent = () => {
  const [data, setData] = useState<FeaturedContentData>({
    featuredPlaylists: [],
    topTracks: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();
  
  const isAuthenticated = storageService.isAuthenticated();

  const fetchFeaturedContent = async () => {
    if (!isAuthenticated) {
      setError('Please log in to view featured content');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      
      // Try to fetch featured playlists using well-known playlist IDs instead of browse endpoint
      // Since browse endpoints may be restricted, use popular Spotify playlists
      // Using Global Top 50 playlists from different regions
      const popularPlaylistIds = [
        '37i9dQZEVXbLRQDuF5jeBp', // Global Top 50
        '37i9dQZEVXbLp5XoPON0wI', // Top 50 - USA
        '37i9dQZEVXbJiZcmkrIHGU'  // Top 50 - Germany (English content)
      ];
      
      const [playlistResponses, topTracksResponse] = await Promise.all([
        Promise.all(popularPlaylistIds.map(id => 
          spotifyApiService.getPlaylist(id).catch(() => null)
        )),
        spotifyApiService.getPlaylistTracks('37i9dQZEVXbLRQDuF5jeBp', 9, 0).catch(() => null)
      ]);
      
      const featuredPlaylists = playlistResponses.filter((p): p is SpotifyPlaylist => p !== null);

      const newData: FeaturedContentData = {
        featuredPlaylists: featuredPlaylists,
        topTracks: topTracksResponse?.items || [],
        message: 'Popular playlists trending worldwide',
      };

      setData(newData);
    } catch (err) {
      const errorMessage = 'Failed to load featured content';
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
    fetchFeaturedContent();
  }, [isAuthenticated]);

  return {
    data,
    loading,
    error,
    refetch: fetchFeaturedContent,
    isAuthenticated,
  };
};