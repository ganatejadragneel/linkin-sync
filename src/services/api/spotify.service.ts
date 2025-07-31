// Spotify API service

import { BaseApiService } from './base.service';
import { SPOTIFY_API_BASE_URL, SPOTIFY_ENDPOINTS } from '../../constants';
import { storageService } from '../storage.service';
import {
  SpotifyPlaybackState,
  SpotifyUserProfile,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyTrack,
  SpotifyPlaylist,
  SpotifyPlaylistsResponse,
  SpotifyFeaturedPlaylistsResponse,
  SpotifyPlaylistTracksResponse,
  SpotifyTopArtistsResponse,
  SpotifyRecentlyPlayedResponse,
} from '../../types';

class SpotifyApiService extends BaseApiService {
  constructor() {
    super(SPOTIFY_API_BASE_URL);
  }

  // Override request to add auth header
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const accessToken = storageService.getAccessToken();
    
    if (!accessToken) {
      throw new Error('Not authenticated. Please log in.');
    }

    const authHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    };

    try {
      return await super.request<T>(endpoint, {
        ...options,
        headers: authHeaders,
      });
    } catch (error: any) {
      // Handle token expiration
      if (error.code === '401') {
        storageService.clearAuthData();
        throw new Error('Session expired. Please log in again.');
      }
      throw error;
    }
  }

  // User endpoints
  async getCurrentUser(): Promise<SpotifyUserProfile> {
    const response = await this.get<SpotifyUserProfile>(SPOTIFY_ENDPOINTS.ME);
    return response.data;
  }

  // Player endpoints
  async getPlaybackState(): Promise<SpotifyPlaybackState | null> {
    try {
      const response = await this.get<SpotifyPlaybackState>(SPOTIFY_ENDPOINTS.PLAYER);
      return response.data;
    } catch (error: any) {
      if (error.code === '204') {
        return null; // No active device
      }
      throw error;
    }
  }

  async play(deviceId?: string, contextUri?: string, uris?: string[]): Promise<void> {
    const body: any = {};
    if (contextUri) body.context_uri = contextUri;
    if (uris) body.uris = uris;

    const queryParams = deviceId ? `?device_id=${deviceId}` : '';
    await this.put(`${SPOTIFY_ENDPOINTS.PLAYER_PLAY}${queryParams}`, body);
  }

  async pause(deviceId?: string): Promise<void> {
    const queryParams = deviceId ? `?device_id=${deviceId}` : '';
    await this.put(`${SPOTIFY_ENDPOINTS.PLAYER_PAUSE}${queryParams}`);
  }

  async skipToNext(deviceId?: string): Promise<void> {
    const queryParams = deviceId ? `?device_id=${deviceId}` : '';
    await this.post(`${SPOTIFY_ENDPOINTS.PLAYER_NEXT}${queryParams}`);
  }

  async skipToPrevious(deviceId?: string): Promise<void> {
    const queryParams = deviceId ? `?device_id=${deviceId}` : '';
    await this.post(`${SPOTIFY_ENDPOINTS.PLAYER_PREVIOUS}${queryParams}`);
  }

  async setVolume(volumePercent: number, deviceId?: string): Promise<void> {
    const queryParams = `?volume_percent=${volumePercent}${deviceId ? `&device_id=${deviceId}` : ''}`;
    await this.put(`${SPOTIFY_ENDPOINTS.PLAYER_VOLUME}${queryParams}`);
  }

  async seek(positionMs: number, deviceId?: string): Promise<void> {
    const queryParams = `?position_ms=${positionMs}${deviceId ? `&device_id=${deviceId}` : ''}`;
    await this.put(`${SPOTIFY_ENDPOINTS.PLAYER_SEEK}${queryParams}`);
  }

  async setShuffle(state: boolean, deviceId?: string): Promise<void> {
    const queryParams = `?state=${state}${deviceId ? `&device_id=${deviceId}` : ''}`;
    await this.put(`${SPOTIFY_ENDPOINTS.PLAYER_SHUFFLE}${queryParams}`);
  }

  async setRepeat(state: 'off' | 'track' | 'context', deviceId?: string): Promise<void> {
    const queryParams = `?state=${state}${deviceId ? `&device_id=${deviceId}` : ''}`;
    await this.put(`${SPOTIFY_ENDPOINTS.PLAYER_REPEAT}${queryParams}`);
  }

  // Content endpoints
  async getAlbum(albumId: string): Promise<SpotifyAlbum> {
    const response = await this.get<SpotifyAlbum>(`${SPOTIFY_ENDPOINTS.ALBUMS}/${albumId}`);
    return response.data;
  }

  async searchArtists(query: string, limit = 1): Promise<SpotifyArtist[]> {
    const encodedQuery = encodeURIComponent(query);
    const response = await this.get<any>(
      `${SPOTIFY_ENDPOINTS.SEARCH}?q=${encodedQuery}&type=artist&limit=${limit}`
    );
    return response.data.artists.items;
  }

  async getTrack(trackId: string): Promise<SpotifyTrack> {
    const response = await this.get<SpotifyTrack>(`/tracks/${trackId}`);
    return response.data;
  }

  // Playlist endpoints
  async getUserPlaylists(limit = 50, offset = 0): Promise<SpotifyPlaylistsResponse> {
    const response = await this.get<SpotifyPlaylistsResponse>(
      `/me/playlists?limit=${limit}&offset=${offset}`
    );
    return response.data;
  }

  async getAllUserPlaylists(): Promise<SpotifyPlaylistsResponse> {
    const firstBatch = await this.getUserPlaylists(50, 0);
    
    // If there are more playlists, fetch them all
    if (firstBatch.total > 50) {
      const allPlaylists = [...firstBatch.items];
      const totalPages = Math.ceil(firstBatch.total / 50);
      
      const remainingRequests = [];
      for (let page = 1; page < totalPages; page++) {
        remainingRequests.push(this.getUserPlaylists(50, page * 50));
      }
      
      const remainingBatches = await Promise.all(remainingRequests);
      remainingBatches.forEach(batch => {
        allPlaylists.push(...batch.items);
      });
      
      return {
        ...firstBatch,
        items: allPlaylists,
      };
    }
    
    return firstBatch;
  }

  // Featured content endpoints
  async getFeaturedPlaylists(limit = 3, offset = 0, country = 'US'): Promise<SpotifyFeaturedPlaylistsResponse> {
    const response = await this.get<SpotifyFeaturedPlaylistsResponse>(
      `/browse/featured-playlists?limit=${limit}&offset=${offset}&country=${country}`
    );
    return response.data;
  }

  async getTopTracksPlaylist(): Promise<SpotifyPlaylist> {
    // Use the Global Top 50 playlist as a source for trending tracks
    const response = await this.get<SpotifyPlaylist>('/playlists/37i9dQZEVXbNG2KDcFcKOF');
    return response.data;
  }

  async getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
    const response = await this.get<SpotifyPlaylist>(`/playlists/${playlistId}`);
    return response.data;
  }

  async getPlaylistTracks(playlistId: string, limit = 9, offset = 0): Promise<SpotifyPlaylistTracksResponse> {
    const response = await this.get<SpotifyPlaylistTracksResponse>(
      `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&fields=items(track(id,name,artists,album,duration_ms,external_urls,popularity))`
    );
    return response.data;
  }

  // Top content endpoints
  async getTopArtists(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'short_term', limit = 10): Promise<SpotifyTopArtistsResponse> {
    const response = await this.get<SpotifyTopArtistsResponse>(
      `/me/top/artists?time_range=${timeRange}&limit=${limit}`
    );
    return response.data;
  }

  async getRecentlyPlayedTracks(limit = 50): Promise<SpotifyRecentlyPlayedResponse> {
    const response = await this.get<SpotifyRecentlyPlayedResponse>(
      `/me/player/recently-played?limit=${limit}`
    );
    return response.data;
  }
}

// Export singleton instance
export const spotifyApiService = new SpotifyApiService();