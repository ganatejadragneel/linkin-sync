// Custom hook for fetching unified artists from both Spotify and YouTube

import { useState, useEffect } from 'react';
import { spotifyApiService } from '../services/api/spotify.service';
import { youtubeApiService } from '../services/api/youtube.service';
import { UnifiedArtist } from '../types';
import { useErrorHandler } from './useErrorHandler';
import { storageService } from '../services/storage.service';

export const useUnifiedArtists = () => {
  const [artists, setArtists] = useState<UnifiedArtist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();
  
  const isSpotifyAuthenticated = storageService.isAuthenticated();
  const isYouTubeAuthenticated = storageService.getYouTubeAccessToken() !== null;

  const fetchUnifiedArtists = async () => {
    if (!isSpotifyAuthenticated && !isYouTubeAuthenticated) {
      setError('Please log in to view your top artists');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching unified artists...');
      console.log('Spotify authenticated:', isSpotifyAuthenticated);
      console.log('YouTube authenticated:', isYouTubeAuthenticated);
      
      const allArtists: UnifiedArtist[] = [];
      
      // Fetch Spotify artists (first 10)
      if (isSpotifyAuthenticated) {
        try {
          console.log('Fetching Spotify artists...');
          const spotifyArtists = await spotifyApiService.getUnifiedArtists(10);
          console.log('Got Spotify artists:', spotifyArtists.length);
          allArtists.push(...spotifyArtists);
        } catch (spotifyError) {
          console.error('Failed to fetch Spotify artists:', spotifyError);
          // Don't fail completely, just log the error
        }
      }
      
      // Fetch YouTube artists (next 10)
      if (isYouTubeAuthenticated) {
        try {
          console.log('Fetching YouTube artists...');
          const youtubeArtists = await youtubeApiService.getUnifiedArtists();
          console.log('Got YouTube artists:', youtubeArtists.length);
          allArtists.push(...youtubeArtists);
        } catch (youtubeError) {
          console.error('Failed to fetch YouTube artists:', youtubeError);
          // Don't fail completely, just log the error
        }
      }
      
      // Remove duplicates by name (case-insensitive)
      const uniqueArtists = allArtists.filter((artist, index) => {
        const firstIndex = allArtists.findIndex(a => 
          a.name.toLowerCase() === artist.name.toLowerCase()
        );
        return firstIndex === index;
      });
      
      console.log('Total unified artists after deduplication:', uniqueArtists.length);
      setArtists(uniqueArtists.slice(0, 20)); // Limit to 20 total
      
    } catch (err) {
      console.error('Failed to fetch unified artists:', err);
      const errorMessage = 'Failed to load your top artists';
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
    fetchUnifiedArtists();
  }, [isSpotifyAuthenticated, isYouTubeAuthenticated]);

  return {
    artists,
    loading,
    error,
    refetch: fetchUnifiedArtists,
    isSpotifyAuthenticated,
    isYouTubeAuthenticated,
    hasAnyAuthentication: isSpotifyAuthenticated || isYouTubeAuthenticated,
  };
};