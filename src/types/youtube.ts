// YouTube Music API type definitions

export interface YouTubeImage {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeChannel {
  id: string;
  title: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default?: YouTubeImage;
    medium?: YouTubeImage;
    high?: YouTubeImage;
    standard?: YouTubeImage;
    maxres?: YouTubeImage;
  };
  channelId: string;
  channelTitle: string;
  duration: string;
  publishedAt: string;
}

export interface YouTubePlaylist {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default?: YouTubeImage;
      medium?: YouTubeImage;
      high?: YouTubeImage;
      standard?: YouTubeImage;
      maxres?: YouTubeImage;
    };
    channelTitle: string;
    tags?: string[];
    defaultLanguage?: string;
    localized?: {
      title: string;
      description: string;
    };
  };
  status?: {
    privacyStatus: 'public' | 'private' | 'unlisted';
  };
  contentDetails?: {
    itemCount: number;
  };
}

export interface YouTubePlaylistItem {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default?: YouTubeImage;
      medium?: YouTubeImage;
      high?: YouTubeImage;
      standard?: YouTubeImage;
      maxres?: YouTubeImage;
    };
    channelTitle: string;
    playlistId: string;
    position: number;
    resourceId: {
      kind: string;
      videoId: string;
    };
    videoOwnerChannelTitle?: string;
    videoOwnerChannelId?: string;
  };
  contentDetails?: {
    videoId: string;
    startAt?: string;
    endAt?: string;
    note?: string;
    videoPublishedAt: string;
  };
}

export interface YouTubePlaylistsResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubePlaylist[];
}

export interface YouTubePlaylistItemsResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubePlaylistItem[];
}

export interface YouTubeTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export interface YouTubeError {
  error: {
    code: number;
    message: string;
    errors: Array<{
      domain: string;
      reason: string;
      message: string;
    }>;
  };
}

// Unified playlist interface that works with both Spotify and YouTube
export interface UnifiedPlaylist {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  trackCount: number;
  owner: string;
  source: 'spotify' | 'youtube';
  isPublic: boolean;
  isCollaborative?: boolean;
  externalUrl: string;
  originalData: any; // Store original data for source-specific operations
}

export interface UnifiedTrack {
  id: string;
  name: string;
  artist: string;
  album?: string;
  duration: string;
  imageUrl: string | null;
  source: 'spotify' | 'youtube';
  externalUrl: string;
  originalData: any; // Store original data for source-specific operations
}

export interface YouTubeLikedVideo {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default?: YouTubeImage;
      medium?: YouTubeImage;
      high?: YouTubeImage;
      standard?: YouTubeImage;
      maxres?: YouTubeImage;
    };
    channelTitle: string;
    categoryId?: string;
    liveBroadcastContent?: string;
    localized?: {
      title: string;
      description: string;
    };
  };
  contentDetails?: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    contentRating: any;
    projection: string;
  };
}

export interface YouTubeLikedVideosResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeLikedVideo[];
}

export interface UnifiedArtist {
  id: string;
  name: string;
  imageUrl: string | null;
  followers?: number;
  popularity?: number;
  genres?: string[];
  source: 'spotify' | 'youtube';
  externalUrl: string;
  originalData: any;
}