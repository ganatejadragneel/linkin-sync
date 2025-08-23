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

      // Fetch Spotify playlists and liked songs if authenticated
      if (isSpotifyAuthenticated) {
        const spotifyPromise = Promise.allSettled([
          spotifyApiService.getAllUserPlaylists(),
          spotifyApiService.getAllSavedTracks()
        ])
          .then(([playlistsResult, savedTracksResult]) => {
            const playlists: UnifiedPlaylist[] = [];
            
            // Handle playlists result
            if (playlistsResult.status === 'fulfilled') {
              playlists.push(...playlistsResult.value.items.map(convertSpotifyToUnified));
            } else {
              console.error('Failed to fetch Spotify playlists:', playlistsResult.reason);
              handleError(playlistsResult.reason, { 
                defaultMessage: 'Failed to load Spotify playlists',
                showToast: false 
              });
            }
            
            // Handle saved tracks result
            if (savedTracksResult.status === 'fulfilled' && savedTracksResult.value.items.length > 0) {
              const likedSongsPlaylist: UnifiedPlaylist = {
                id: 'spotify-liked-songs',
                name: 'Liked Songs',
                description: 'Your liked songs on Spotify',
                imageUrl: null, // Spotify doesn't provide image for liked songs
                trackCount: savedTracksResult.value.total,
                owner: 'You',
                source: 'spotify',
                isPublic: false,
                isCollaborative: false,
                externalUrl: 'https://open.spotify.com/collection/tracks',
                originalData: { isLikedSongs: true, savedTracks: savedTracksResult.value.items },
              };
              playlists.unshift(likedSongsPlaylist); // Add at the beginning for priority
            } else if (savedTracksResult.status === 'rejected') {
              console.error('Failed to fetch Spotify saved tracks:', savedTracksResult.reason);
              // Don't show error for saved tracks - just continue without them
              // This could happen if user doesn't have the new scope yet
            }
            
            return playlists;
          })
          .catch(error => {
            console.error('Unexpected error in Spotify data fetching:', error);
            handleError(error, { 
              defaultMessage: 'Failed to load Spotify data',
              showToast: false 
            });
            return [];
          });
        promises.push(spotifyPromise);
      }

      // Fetch YouTube Music playlists and liked videos if authenticated
      if (isYouTubeAuthenticated) {
        console.log('YouTube Music is authenticated, fetching playlists and liked videos...');
        const youtubePromise = Promise.allSettled([
          youtubeApiService.getUnifiedPlaylists(),
          youtubeApiService.getLikedVideosForSearch()
        ])
          .then(([playlistsResult, likedVideosResult]) => {
            const playlists: UnifiedPlaylist[] = [];
            
            // Handle playlists result
            if (playlistsResult.status === 'fulfilled') {
              playlists.push(...playlistsResult.value);
              console.log('YouTube Music playlists fetched:', playlistsResult.value.length, 'playlists');
            } else {
              console.error('Failed to fetch YouTube playlists:', playlistsResult.reason);
              handleError(playlistsResult.reason, { 
                defaultMessage: 'Failed to load YouTube Music playlists',
                showToast: false 
              });
            }
            
            // Handle liked videos result
            if (likedVideosResult.status === 'fulfilled' && likedVideosResult.value.length > 0) {
              const likedVideosPlaylist: UnifiedPlaylist = {
                id: 'youtube-liked-videos',
                name: 'Liked Videos',
                description: 'Your liked videos on YouTube',
                imageUrl: null, // YouTube doesn't provide image for liked videos
                trackCount: likedVideosResult.value.length,
                owner: 'You',
                source: 'youtube',
                isPublic: false,
                isCollaborative: false,
                externalUrl: 'https://www.youtube.com/playlist?list=LL',
                originalData: { 
                  isLikedVideos: true, 
                  likedVideos: likedVideosResult.value,
                  isComplete: true, // Search optimized version is always complete within limit
                  isFromCache: false
                },
              };
              playlists.unshift(likedVideosPlaylist); // Add at the beginning for priority
              console.log('YouTube liked videos fetched:', likedVideosResult.value.length, 'videos');
            } else if (likedVideosResult.status === 'rejected') {
              console.error('Failed to fetch YouTube liked videos:', likedVideosResult.reason);
              // Don't show error for liked videos - just continue without them
              // This could happen if user doesn't have the required scope or quota exceeded
            }
            
            return playlists;
          })
          .catch(error => {
            console.error('Unexpected error in YouTube data fetching:', error);
            handleError(error, { 
              defaultMessage: 'Failed to load YouTube data',
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
      
      // Separate liked playlists from regular playlists
      const likedPlaylists = allPlaylists.filter(playlist => 
        playlist.id === 'spotify-liked-songs' || playlist.id === 'youtube-liked-videos'
      );
      const regularPlaylists = allPlaylists.filter(playlist => 
        playlist.id !== 'spotify-liked-songs' && playlist.id !== 'youtube-liked-videos'
      );
      
      // Sort regular playlists by name
      regularPlaylists.sort((a, b) => a.name.localeCompare(b.name));
      
      // Sort liked playlists with consistent order: Spotify first, then YouTube
      likedPlaylists.sort((a, b) => {
        if (a.id === 'spotify-liked-songs') return -1;
        if (b.id === 'spotify-liked-songs') return 1;
        return 0;
      });
      
      // Combine: liked playlists first, then regular playlists
      const finalPlaylists = [...likedPlaylists, ...regularPlaylists];
      
      console.log(`Playlist ordering: ${likedPlaylists.length} liked playlists first, then ${regularPlaylists.length} regular playlists`);
      setPlaylists(finalPlaylists);
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