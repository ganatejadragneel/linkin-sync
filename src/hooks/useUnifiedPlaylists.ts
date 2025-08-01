// Unified hook for managing playlists from both Spotify and YouTube Music

import { useState, useEffect, useCallback } from 'react';
import { spotifyApiService } from '../services/api/spotify.service';
import { youtubeApiService } from '../services/api/youtube.service';
import { storageService } from '../services/storage.service';
import { useErrorHandler } from './useErrorHandler';
import { UnifiedPlaylist, SpotifyPlaylist } from '../types';

interface UseUnifiedPlaylistsResult {
  playlists: UnifiedPlaylist[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isSpotifyAuthenticated: boolean;
  isYouTubeAuthenticated: boolean;
  hasAnyAuthentication: boolean;
}

export const useUnifiedPlaylists = (): UseUnifiedPlaylistsResult => {
  const [playlists, setPlaylists] = useState<UnifiedPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  const isSpotifyAuthenticated = storageService.isAuthenticated();
  const isYouTubeAuthenticated = storageService.isYouTubeAuthenticated();
  const hasAnyAuthentication = isSpotifyAuthenticated || isYouTubeAuthenticated;

  // Convert Spotify playlist to unified format
  const convertSpotifyToUnified = (spotifyPlaylist: SpotifyPlaylist): UnifiedPlaylist => {
    const getSpotifyImageUrl = (): string | null => {
      if (spotifyPlaylist.images && spotifyPlaylist.images.length > 0) {
        return spotifyPlaylist.images[spotifyPlaylist.images.length - 1]?.url || 
               spotifyPlaylist.images[0]?.url || 
               null;
      }
      return null;
    };

    return {
      id: spotifyPlaylist.id,
      name: spotifyPlaylist.name,
      description: spotifyPlaylist.description,
      imageUrl: getSpotifyImageUrl(),
      trackCount: spotifyPlaylist.tracks.total,
      owner: spotifyPlaylist.owner.display_name,
      source: 'spotify',
      isPublic: spotifyPlaylist.public,
      isCollaborative: spotifyPlaylist.collaborative,
      externalUrl: spotifyPlaylist.external_urls.spotify,
      originalData: spotifyPlaylist,
    };
  };

  const fetchPlaylists = useCallback(async () => {
    if (!hasAnyAuthentication) {
      setPlaylists([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const promises: Promise<UnifiedPlaylist[]>[] = [];

      // Fetch Spotify playlists if authenticated
      if (isSpotifyAuthenticated) {
        const spotifyPromise = spotifyApiService
          .getAllUserPlaylists()
          .then(response => response.items.map(convertSpotifyToUnified))
          .catch(error => {
            console.error('Failed to fetch Spotify playlists:', error);
            handleError(error, { 
              defaultMessage: 'Failed to load Spotify playlists',
              showToast: false 
            });
            return [];
          });
        promises.push(spotifyPromise);
      }

      // Fetch YouTube Music playlists if authenticated
      if (isYouTubeAuthenticated) {
        console.log('YouTube Music is authenticated, fetching playlists...');
        const youtubePromise = youtubeApiService
          .getUnifiedPlaylists()
          .then(playlists => {
            console.log('YouTube Music playlists fetched:', playlists.length, 'playlists');
            return playlists;
          })
          .catch(error => {
            console.error('Failed to fetch YouTube playlists:', error);
            handleError(error, { 
              defaultMessage: 'Failed to load YouTube Music playlists',
              showToast: false 
            });
            return [];
          });
        promises.push(youtubePromise);
      }

      // Wait for all requests to complete
      const results = await Promise.all(promises);
      
      // Combine all playlists
      const allPlaylists = results.flat();
      
      // Sort by name for consistent ordering
      allPlaylists.sort((a, b) => a.name.localeCompare(b.name));
      
      setPlaylists(allPlaylists);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load playlists';
      setError(errorMessage);
      handleError(error, { 
        defaultMessage: errorMessage,
        showToast: false 
      });
    } finally {
      setLoading(false);
    }
  }, [hasAnyAuthentication, isSpotifyAuthenticated, isYouTubeAuthenticated, handleError]);

  const refetch = useCallback(async () => {
    await fetchPlaylists();
  }, [fetchPlaylists]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  return {
    playlists,
    loading,
    error,
    refetch,
    isSpotifyAuthenticated,
    isYouTubeAuthenticated,
    hasAnyAuthentication,
  };
};