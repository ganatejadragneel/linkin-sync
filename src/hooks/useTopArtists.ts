// Custom hook for fetching user's top artists

import { useState, useEffect } from 'react';
import { spotifyApiService } from '../services/api';
import { SpotifyArtist } from '../types';
import { useErrorHandler } from './useErrorHandler';
import { storageService } from '../services/storage.service';

export const useTopArtists = () => {
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();
  
  const isAuthenticated = storageService.isAuthenticated();

  const fetchTopArtists = async () => {
    if (!isAuthenticated) {
      setError('Please log in to view your top artists');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching top artists...');
      
      // Try the official top artists endpoint first
      try {
        const response = await spotifyApiService.getTopArtists('short_term', 10);
        console.log('Top artists response:', response);
        setTopArtists(response.items);
        return;
      } catch (topArtistsError) {
        console.log('Top artists endpoint failed, trying fallback...', topArtistsError);
        
        // Fallback: Use recently played tracks to determine top artists
        const recentlyPlayed = await spotifyApiService.getRecentlyPlayedTracks(50);
        console.log('Recently played response:', recentlyPlayed);
        
        // Count artist occurrences
        const artistCounts = new Map<string, { artist: SpotifyArtist; count: number }>();
        
        recentlyPlayed.items.forEach(item => {
          item.track.artists.forEach(artist => {
            if (artistCounts.has(artist.id)) {
              artistCounts.get(artist.id)!.count++;
            } else {
              artistCounts.set(artist.id, { artist, count: 1 });
            }
          });
        });
        
        // Sort by count and take top 10
        const topArtistsByCount = Array.from(artistCounts.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
          .map(item => item.artist);
        
        console.log('Top artists from recently played:', topArtistsByCount);
        setTopArtists(topArtistsByCount);
      }
    } catch (err) {
      console.error('All top artists methods failed:', err);
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
    fetchTopArtists();
  }, [isAuthenticated]);

  return {
    topArtists,
    loading,
    error,
    refetch: fetchTopArtists,
    isAuthenticated,
  };
};