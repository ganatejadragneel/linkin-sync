// YouTube Music API service

import { BaseApiService } from './base.service';
import { storageService } from '../storage.service';
import {
  YouTubePlaylist,
  YouTubePlaylistsResponse,
  YouTubePlaylistItem,
  YouTubePlaylistItemsResponse,
  YouTubeLikedVideo,
  YouTubeLikedVideosResponse,
  UnifiedPlaylist,
  UnifiedTrack,
  UnifiedArtist,
} from '../../types';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

class YouTubeApiService extends BaseApiService {
  private likedVideosCache: {
    data: YouTubeLikedVideo[];
    timestamp: number;
    isComplete: boolean;
  } | null = null;
  
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes (increased for rate limiting)
  private readonly MAX_BACKGROUND_BATCHES = 10; // Reduced from 20 to 10 for rate limiting
  private readonly BATCH_DELAY = 250; // Increased delay between requests (ms)
  private readonly MAX_LIKED_VIDEOS_FOR_SEARCH = 500; // Performance limit for search operations
  private readonly INITIAL_BATCH_SIZE = 50; // First batch size for immediate results
  private readonly PLAYLIST_SAMPLE_SIZE = 10; // Number of videos to sample for playlist music detection
  private readonly MUSIC_PLAYLIST_THRESHOLD = 0.6; // 60% of sampled videos must be music
  private readonly MAX_PLAYLISTS_TO_CHECK = 20; // Limit playlist checking for performance
  private readonly PLAYLIST_CHECK_DELAY = 100; // Delay between playlist checks (ms)
  private playlistMusicCache = new Map<string, boolean>(); // Cache playlist music status
  private ongoingLikedVideosFetch: Promise<YouTubeLikedVideosResponse> | null = null;

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

  // Get user's liked videos
  async getLikedVideos(maxResults = 50, pageToken?: string): Promise<YouTubeLikedVideosResponse> {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      myRating: 'like',
      maxResults: maxResults.toString(),
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    console.log('YouTube API: Requesting liked videos with params:', params.toString());
    const response = await this.get<YouTubeLikedVideosResponse>(`/videos?${params}`);
    console.log('YouTube API: Liked videos response:', response.data);
    return response.data;
  }

  // Get all user liked videos (with pagination)
  async getAllLikedVideos(): Promise<YouTubeLikedVideosResponse> {
    const allVideos: YouTubeLikedVideo[] = [];
    let nextPageToken: string | undefined;

    do {
      const response = await this.getLikedVideos(50, nextPageToken);
      allVideos.push(...response.items);
      nextPageToken = response.nextPageToken;
    } while (nextPageToken);

    const firstResponse = await this.getLikedVideos(50);
    return {
      ...firstResponse,
      items: allVideos,
    };
  }

  // Get cached liked videos if available and not expired
  private getCachedLikedVideos(): YouTubeLikedVideo[] | null {
    if (!this.likedVideosCache) return null;
    
    const now = Date.now();
    const isExpired = now - this.likedVideosCache.timestamp > this.CACHE_DURATION;
    
    if (isExpired) {
      this.likedVideosCache = null;
      return null;
    }
    
    return this.likedVideosCache.data;
  }

  // Update cache with new videos
  private updateCache(videos: YouTubeLikedVideo[], isComplete = false): void {
    if (!this.likedVideosCache) {
      this.likedVideosCache = {
        data: videos,
        timestamp: Date.now(),
        isComplete,
      };
    } else {
      // Merge with existing cache, avoiding duplicates
      const existingIds = new Set(this.likedVideosCache.data.map(v => v.id));
      const newVideos = videos.filter(v => !existingIds.has(v.id));
      
      this.likedVideosCache.data = [...this.likedVideosCache.data, ...newVideos];
      this.likedVideosCache.isComplete = isComplete;
      this.likedVideosCache.timestamp = Date.now();
    }
  }

  // Get liked videos with background batch loading and caching
  async getAllLikedVideosWithCaching(): Promise<{
    videos: YouTubeLikedVideo[];
    isComplete: boolean;
    isFromCache: boolean;
  }> {
    // Check cache first
    const cachedVideos = this.getCachedLikedVideos();
    if (cachedVideos && this.likedVideosCache?.isComplete) {
      console.log('YouTube API: Returning complete cached liked videos');
      return {
        videos: cachedVideos,
        isComplete: true,
        isFromCache: true,
      };
    }

    // If we have partial cache, return it while fetching complete data
    if (cachedVideos && cachedVideos.length > 0) {
      console.log('YouTube API: Returning partial cached liked videos while fetching more');
      
      // Start background fetch if not already ongoing
      if (!this.ongoingLikedVideosFetch) {
        this.startBackgroundLikedVideosFetch();
      }
      
      return {
        videos: cachedVideos,
        isComplete: false,
        isFromCache: true,
      };
    }

    // No cache, fetch first batch synchronously
    console.log('YouTube API: No cache, fetching first batch of liked videos');
    try {
      const firstBatch = await this.getLikedVideos(this.INITIAL_BATCH_SIZE);
      const filteredVideos = firstBatch.items.filter(video => this.isMusicContent(video));
      
      // Update cache with first batch
      this.updateCache(filteredVideos, !firstBatch.nextPageToken);
      
      // Start background fetch for remaining pages if needed
      if (firstBatch.nextPageToken) {
        this.startBackgroundLikedVideosFetch(firstBatch.nextPageToken);
      }
      
      return {
        videos: filteredVideos,
        isComplete: !firstBatch.nextPageToken,
        isFromCache: false,
      };
    } catch (error) {
      console.error('YouTube API: Failed to fetch liked videos:', error);
      throw error;
    }
  }

  // Start background fetch for remaining liked videos
  private startBackgroundLikedVideosFetch(startPageToken?: string): void {
    if (this.ongoingLikedVideosFetch) {
      return; // Already fetching
    }

    this.ongoingLikedVideosFetch = this.fetchRemainingLikedVideos(startPageToken)
      .finally(() => {
        this.ongoingLikedVideosFetch = null;
      });
  }

  // Get liked videos optimized for search operations (limited count for performance)
  async getLikedVideosForSearch(): Promise<YouTubeLikedVideo[]> {
    try {
      const cachedResult = await this.getAllLikedVideosWithCaching();
      
      // Return up to MAX_LIKED_VIDEOS_FOR_SEARCH for performance
      const searchVideos = cachedResult.videos.slice(0, this.MAX_LIKED_VIDEOS_FOR_SEARCH);
      
      console.log(`YouTube API: Returning ${searchVideos.length} liked videos for search (from ${cachedResult.videos.length} total)`);
      return searchVideos;
    } catch (error) {
      console.error('YouTube API: Failed to get liked videos for search:', error);
      return [];
    }
  }

  // Fetch remaining liked videos in background
  private async fetchRemainingLikedVideos(startPageToken?: string): Promise<YouTubeLikedVideosResponse> {
    console.log('YouTube API: Starting background fetch of remaining liked videos');
    
    const allVideos: YouTubeLikedVideo[] = [];
    let nextPageToken: string | undefined = startPageToken;
    let batchCount = 0;

    try {
      while (nextPageToken && batchCount < this.MAX_BACKGROUND_BATCHES) { // Conservative limit for rate limiting
        const response = await this.getLikedVideos(50, nextPageToken);
        const filteredVideos = response.items.filter(video => this.isMusicContent(video));
        
        allVideos.push(...filteredVideos);
        
        // Update cache with each batch
        this.updateCache(filteredVideos, !response.nextPageToken);
        
        nextPageToken = response.nextPageToken;
        batchCount++;
        
        // Add delay between requests to respect API rate limits
        if (nextPageToken) {
          await new Promise(resolve => setTimeout(resolve, this.BATCH_DELAY));
        }
      }

      // Mark cache as complete
      if (this.likedVideosCache) {
        this.likedVideosCache.isComplete = true;
      }
      
      console.log(`YouTube API: Background fetch completed. Total batches: ${batchCount}, Total videos: ${allVideos.length}`);
      
      const firstResponse = await this.getLikedVideos(50);
      return {
        ...firstResponse,
        items: allVideos,
      };
    } catch (error) {
      console.error('YouTube API: Background fetch failed:', error);
      throw error;
    }
  }

  // Generic music filtering for all YouTube video types
  isMusicContent(video: YouTubeLikedVideo | YouTubePlaylistItem | any): boolean {
    // Extract data from different video types
    let title = '';
    let channel = '';
    let description = '';
    
    if (video.snippet) {
      title = video.snippet.title?.toLowerCase() || '';
      channel = video.snippet.channelTitle?.toLowerCase() || '';
      description = video.snippet.description?.toLowerCase() || '';
    }
    
    // Check for music indicators in channel name
    const musicChannelKeywords = ['vevo', 'official', 'music', 'records', 'entertainment'];
    const hasMusic = musicChannelKeywords.some(keyword => channel.includes(keyword));
    
    // Filter out obvious non-music content
    const nonMusicKeywords = ['podcast', 'interview', 'reaction', 'review', 'tutorial', 'gameplay', 'vlog', 'news', 'talk show', 'documentary', 'trailer', 'comedy', 'animation'];
    const isNonMusic = nonMusicKeywords.some(keyword => 
      title.includes(keyword) || description.includes(keyword)
    );
    
    // Additional music indicators in title
    const titleMusicKeywords = ['official video', 'music video', 'lyrics', 'acoustic', 'live', 'cover', 'remix', 'instrumental', 'feat.', 'ft.'];
    const titleHasMusic = titleMusicKeywords.some(keyword => title.includes(keyword));
    
    // Check for common music-related patterns in title
    const musicPatterns = [
      /\s-\s/, // Artist - Song pattern
      /\|.*music/i, // | ...music
      /\(official\)/i, // (official)
      /\[official\]/i, // [official]
    ];
    const hasPatternMatch = musicPatterns.some(pattern => pattern.test(video.snippet?.title || ''));
    
    return (hasMusic || titleHasMusic || hasPatternMatch) && !isNonMusic;
  }

  // Check if a playlist is music-focused by sampling videos (with caching)
  async isMusicPlaylist(playlistId: string): Promise<boolean> {
    // Check cache first
    if (this.playlistMusicCache.has(playlistId)) {
      const cached = this.playlistMusicCache.get(playlistId)!;
      console.log(`YouTube API: Using cached result for playlist ${playlistId}: ${cached ? 'MUSIC' : 'NON-MUSIC'}`);
      return cached;
    }

    try {
      console.log(`YouTube API: Checking if playlist ${playlistId} is music-focused...`);
      
      // Sample a small number of videos from the playlist
      const response = await this.getPlaylistItems(playlistId, this.PLAYLIST_SAMPLE_SIZE);
      
      if (!response.items || response.items.length === 0) {
        console.log(`YouTube API: Playlist ${playlistId} is empty, excluding`);
        this.playlistMusicCache.set(playlistId, false);
        return false;
      }

      // Filter to valid videos (not deleted)
      const validVideos = response.items.filter(item => 
        item.snippet?.resourceId?.videoId && item.snippet?.title
      );

      if (validVideos.length === 0) {
        console.log(`YouTube API: Playlist ${playlistId} has no valid videos, excluding`);
        this.playlistMusicCache.set(playlistId, false);
        return false;
      }

      // Count how many are music videos
      const musicVideos = validVideos.filter(video => this.isMusicContent(video));
      const musicRatio = musicVideos.length / validVideos.length;

      console.log(`YouTube API: Playlist ${playlistId} - ${musicVideos.length}/${validVideos.length} videos are music (${Math.round(musicRatio * 100)}%)`);

      // Require at least the threshold percentage to be music
      const isMusicPlaylist = musicRatio >= this.MUSIC_PLAYLIST_THRESHOLD;
      console.log(`YouTube API: Playlist ${playlistId} is ${isMusicPlaylist ? 'MUSIC' : 'NON-MUSIC'} playlist`);
      
      // Cache the result
      this.playlistMusicCache.set(playlistId, isMusicPlaylist);
      
      return isMusicPlaylist;
    } catch (error) {
      console.error(`YouTube API: Failed to check playlist ${playlistId} content:`, error);
      // If we can't check, assume it's not music to be safe
      this.playlistMusicCache.set(playlistId, false);
      return false;
    }
  }

  // Clear playlist music cache (useful for testing or when playlists change)
  clearPlaylistMusicCache(): void {
    console.log('YouTube API: Clearing playlist music cache');
    this.playlistMusicCache.clear();
  }

  // Convert YouTube liked video to unified track format
  convertLikedVideoToUnifiedTrack(youtubeVideo: YouTubeLikedVideo): UnifiedTrack {
    const getThumbnailUrl = (): string | null => {
      const thumbnails = youtubeVideo.snippet?.thumbnails;
      if (!thumbnails) return null;
      
      return thumbnails.high?.url || 
             thumbnails.medium?.url || 
             thumbnails.default?.url || 
             null;
    };

    return {
      id: youtubeVideo.id,
      name: youtubeVideo.snippet?.title || 'Untitled Video',
      artist: youtubeVideo.snippet?.channelTitle || 'Unknown Artist',
      duration: youtubeVideo.contentDetails?.duration || 'Unknown',
      imageUrl: getThumbnailUrl(),
      source: 'youtube',
      externalUrl: `https://www.youtube.com/watch?v=${youtubeVideo.id}`,
      originalData: { ...youtubeVideo, playlistName: 'Liked Videos' },
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

  // Get unified playlists (music playlists only)
  async getUnifiedPlaylists(): Promise<UnifiedPlaylist[]> {
    try {
      console.log('YouTube API: Starting to fetch user playlists...');
      const response = await this.getAllUserPlaylists();
      console.log(`YouTube API: Found ${response.items.length} total playlists, filtering for music content...`);
      
      const musicPlaylists: UnifiedPlaylist[] = [];
      
      // Limit number of playlists to check for performance (prioritize most recent)
      const playlistsToCheck = response.items.slice(0, this.MAX_PLAYLISTS_TO_CHECK);
      console.log(`YouTube API: Checking first ${playlistsToCheck.length} playlists for music content (limited for performance)`);
      
      // Check each playlist for music content
      for (const playlist of playlistsToCheck) {
        try {
          // Skip empty playlists
          if (!playlist.contentDetails?.itemCount || playlist.contentDetails.itemCount === 0) {
            console.log(`YouTube API: Skipping empty playlist: ${playlist.snippet?.title}`);
            continue;
          }

          // Check if playlist contains music
          const isMusicPlaylist = await this.isMusicPlaylist(playlist.id);
          
          if (isMusicPlaylist) {
            const unifiedPlaylist = this.convertToUnifiedPlaylist(playlist);
            musicPlaylists.push(unifiedPlaylist);
            console.log(`YouTube API: ✅ Added music playlist: ${playlist.snippet?.title}`);
          } else {
            console.log(`YouTube API: ❌ Filtered out non-music playlist: ${playlist.snippet?.title}`);
          }
          
          // Add delay to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, this.PLAYLIST_CHECK_DELAY));
        } catch (error) {
          console.error(`YouTube API: Error checking playlist ${playlist.snippet?.title}:`, error);
          // Skip this playlist if we can't determine its content
        }
      }
      
      console.log(`YouTube API: Returning ${musicPlaylists.length} music playlists out of ${playlistsToCheck.length} checked (${response.items.length} total)`);
      return musicPlaylists;
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
        // Filter out deleted videos AND non-music content
        return item.snippet?.resourceId?.videoId && this.isMusicContent(item);
      });
      console.log('YouTube API: Filtered items count (music only):', filteredItems.length);
      
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

  // Search for YouTube Music tracks
  async searchTracks(query: string, limit = 20): Promise<UnifiedTrack[]> {
    try {
      const params = new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults: limit.toString(),
      });

      console.log('YouTube API: Searching for tracks with query:', query);
      const response = await this.get<any>(`/search?${params}`);
      console.log('YouTube API: Search response:', response.data);

      // Convert search results to unified tracks (using consistent music filtering)
      const tracks: UnifiedTrack[] = response.data.items
        .filter((item: any) => {
          // Use the same music filtering logic as everywhere else
          return this.isMusicContent(item);
        })
        .map((item: any) => ({
          id: item.id.videoId,
          name: item.snippet?.title || 'Untitled',
          artist: item.snippet?.channelTitle || 'Unknown Artist',
          duration: 'Unknown', // Search API doesn't provide duration
          imageUrl: item.snippet?.thumbnails?.high?.url || 
                   item.snippet?.thumbnails?.medium?.url || 
                   item.snippet?.thumbnails?.default?.url || 
                   null,
          source: 'youtube' as const,
          externalUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          originalData: item,
        }));

      return tracks;
    } catch (error) {
      console.error('Failed to search YouTube tracks:', error);
      throw error;
    }
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