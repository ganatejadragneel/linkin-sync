// YouTube Music API service

import { BaseApiService } from './base.service';
import { storageService } from '../storage.service';
import {
  YouTubePlaylist,
  YouTubePlaylistsResponse,
  YouTubePlaylistItem,
  YouTubePlaylistItemsResponse,
  UnifiedPlaylist,
  UnifiedTrack,
  UnifiedArtist,
} from '../../types';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

class YouTubeApiService extends BaseApiService {
  constructor() {
    super(YOUTUBE_API_BASE_URL);
  }

  // Override request to add auth header
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const accessToken = storageService.getYouTubeAccessToken();
    
    if (!accessToken) {
      throw new Error('Not authenticated with YouTube. Please log in.');
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
        storageService.clearYouTubeAuthData();
        throw new Error('YouTube session expired. Please log in again.');
      }
      throw error;
    }
  }

  // Get user's playlists
  async getUserPlaylists(maxResults = 50, pageToken?: string): Promise<YouTubePlaylistsResponse> {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails,status',
      mine: 'true',
      maxResults: maxResults.toString(),
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    console.log('YouTube API: Requesting playlists with params:', params.toString());
    const response = await this.get<YouTubePlaylistsResponse>(`/playlists?${params}`);
    console.log('YouTube API: Playlists response status:', response.status);
    console.log('YouTube API: Playlists response data:', response.data);
    return response.data;
  }

  // Get all user playlists (with pagination)
  async getAllUserPlaylists(): Promise<YouTubePlaylistsResponse> {
    const allPlaylists: YouTubePlaylist[] = [];
    let nextPageToken: string | undefined;

    do {
      const response = await this.getUserPlaylists(50, nextPageToken);
      allPlaylists.push(...response.items);
      nextPageToken = response.nextPageToken;
    } while (nextPageToken);

    const firstResponse = await this.getUserPlaylists(50);
    return {
      ...firstResponse,
      items: allPlaylists,
    };
  }

  // Get playlist items (videos)
  async getPlaylistItems(playlistId: string, maxResults = 50, pageToken?: string): Promise<YouTubePlaylistItemsResponse> {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: maxResults.toString(),
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    console.log('YouTube API: Requesting playlist items with params:', params.toString());
    const response = await this.get<YouTubePlaylistItemsResponse>(`/playlistItems?${params}`);
    console.log('YouTube API: Playlist items response:', response.data);
    return response.data;
  }

  // Get all playlist items (with pagination)
  async getAllPlaylistItems(playlistId: string): Promise<YouTubePlaylistItemsResponse> {
    const allItems: YouTubePlaylistItem[] = [];
    let nextPageToken: string | undefined;

    do {
      const response = await this.getPlaylistItems(playlistId, 50, nextPageToken);
      allItems.push(...response.items);
      nextPageToken = response.nextPageToken;
    } while (nextPageToken);

    const firstResponse = await this.getPlaylistItems(playlistId, 50);
    return {
      ...firstResponse,
      items: allItems,
    };
  }

  // Convert YouTube playlist to unified format
  convertToUnifiedPlaylist(youtubePlaylist: YouTubePlaylist): UnifiedPlaylist {
    const getThumbnailUrl = (): string | null => {
      const thumbnails = youtubePlaylist.snippet?.thumbnails;
      if (!thumbnails) return null;
      
      return thumbnails.high?.url || 
             thumbnails.medium?.url || 
             thumbnails.default?.url || 
             null;
    };

    return {
      id: youtubePlaylist.id,
      name: youtubePlaylist.snippet?.title || 'Untitled Playlist',
      description: youtubePlaylist.snippet?.description || null,
      imageUrl: getThumbnailUrl(),
      trackCount: youtubePlaylist.contentDetails?.itemCount || 0,
      owner: youtubePlaylist.snippet?.channelTitle || 'Unknown',
      source: 'youtube',
      isPublic: youtubePlaylist.status?.privacyStatus === 'public',
      externalUrl: `https://www.youtube.com/playlist?list=${youtubePlaylist.id}`,
      originalData: youtubePlaylist,
    };
  }

  // Convert YouTube playlist item to unified track format
  convertToUnifiedTrack(youtubeItem: YouTubePlaylistItem): UnifiedTrack {
    const getThumbnailUrl = (): string | null => {
      const thumbnails = youtubeItem.snippet?.thumbnails;
      if (!thumbnails) return null;
      
      return thumbnails.high?.url || 
             thumbnails.medium?.url || 
             thumbnails.default?.url || 
             null;
    };

    const videoId = youtubeItem.snippet?.resourceId?.videoId || youtubeItem.contentDetails?.videoId || '';

    return {
      id: videoId,
      name: youtubeItem.snippet?.title || 'Untitled Video',
      artist: youtubeItem.snippet?.videoOwnerChannelTitle || youtubeItem.snippet?.channelTitle || 'Unknown Artist',
      duration: 'Unknown', // YouTube API doesn't provide duration in playlist items
      imageUrl: getThumbnailUrl(),
      source: 'youtube',
      externalUrl: `https://www.youtube.com/watch?v=${videoId}`,
      originalData: youtubeItem,
    };
  }

  // Get unified playlists
  async getUnifiedPlaylists(): Promise<UnifiedPlaylist[]> {
    try {
      console.log('YouTube API: Starting to fetch user playlists...');
      const response = await this.getAllUserPlaylists();
      console.log('YouTube API: Raw playlists response:', response);
      const unifiedPlaylists = response.items.map(playlist => this.convertToUnifiedPlaylist(playlist));
      console.log('YouTube API: Converted to unified playlists:', unifiedPlaylists);
      return unifiedPlaylists;
    } catch (error) {
      console.error('Failed to fetch YouTube playlists:', error);
      throw error;
    }
  }

  // Get unified tracks for a playlist
  async getUnifiedPlaylistTracks(playlistId: string): Promise<UnifiedTrack[]> {
    try {
      console.log('YouTube API: Fetching tracks for playlist:', playlistId);
      const response = await this.getAllPlaylistItems(playlistId);
      console.log('YouTube API: Raw playlist items response:', response);
      console.log('YouTube API: Number of items:', response.items.length);
      
      const filteredItems = response.items.filter(item => {
        console.log('YouTube API: Processing item:', item);
        return item.snippet?.resourceId?.videoId; // Filter out deleted videos
      });
      console.log('YouTube API: Filtered items count:', filteredItems.length);
      
      const unifiedTracks = filteredItems.map(item => this.convertToUnifiedTrack(item));
      console.log('YouTube API: Converted tracks:', unifiedTracks);
      
      return unifiedTracks;
    } catch (error) {
      console.error('Failed to fetch YouTube playlist tracks:', error);
      throw error;
    }
  }

  // Convert YouTube channel to unified artist format
  convertChannelToUnifiedArtist(channel: any): UnifiedArtist {
    const getThumbnailUrl = (): string | null => {
      const thumbnails = channel.snippet?.thumbnails;
      if (!thumbnails) return null;
      
      return thumbnails.high?.url || 
             thumbnails.medium?.url || 
             thumbnails.default?.url || 
             null;
    };

    return {
      id: channel.id,
      name: channel.snippet?.title || 'Unknown Artist',
      imageUrl: getThumbnailUrl(),
      followers: channel.statistics?.subscriberCount ? parseInt(channel.statistics.subscriberCount) : undefined,
      popularity: channel.statistics?.viewCount ? Math.min(100, Math.floor(parseInt(channel.statistics.viewCount) / 10000000)) : undefined,
      genres: [], // YouTube doesn't provide genre data for channels
      source: 'youtube',
      externalUrl: `https://www.youtube.com/channel/${channel.id}`,
      originalData: channel,
    };
  }

  // Get unified artists from user's playlists (extracting unique channels)
  async getUnifiedArtists(): Promise<UnifiedArtist[]> {
    try {
      console.log('YouTube API: Fetching artists from playlists...');
      
      // Get all user playlists
      const playlistsResponse = await this.getAllUserPlaylists();
      console.log('YouTube API: Found playlists:', playlistsResponse.items.length);
      
      // Collect unique channel IDs from playlist tracks
      const channelIds = new Set<string>();
      const channelNames = new Map<string, string>();
      
      for (const playlist of playlistsResponse.items.slice(0, 5)) { // Limit to first 5 playlists for performance
        try {
          const tracks = await this.getUnifiedPlaylistTracks(playlist.id);
          tracks.forEach(track => {
            const channelId = track.originalData?.snippet?.channelId;
            const channelTitle = track.originalData?.snippet?.channelTitle;
            if (channelId && channelTitle) {
              channelIds.add(channelId);
              channelNames.set(channelId, channelTitle);
            }
          });
        } catch (error) {
          console.error(`Failed to fetch tracks for playlist ${playlist.id}:`, error);
        }
      }

      console.log('YouTube API: Found unique channels:', channelIds.size);
      
      // Convert to unified artists (simplified version since we can't get full channel data easily)
      const artists: UnifiedArtist[] = Array.from(channelIds).slice(0, 10).map(channelId => ({
        id: channelId,
        name: channelNames.get(channelId) || 'Unknown Artist',
        imageUrl: null, // Would need separate API call to get channel thumbnails
        source: 'youtube' as const,
        externalUrl: `https://www.youtube.com/channel/${channelId}`,
        originalData: { channelId }
      }));

      console.log('YouTube API: Converted to unified artists:', artists);
      return artists;
    } catch (error) {
      console.error('Failed to fetch YouTube artists:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const youtubeApiService = new YouTubeApiService();