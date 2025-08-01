import { youtubeApiService } from './youtube.service';

// Mock storage service
jest.mock('../storage.service', () => ({
  storageService: {
    getYouTubeAccessToken: jest.fn(() => 'mock_token'),
    clearYouTubeAuthData: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('YouTubeApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(youtubeApiService).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof youtubeApiService.getUnifiedPlaylists).toBe('function');
    expect(typeof youtubeApiService.getUnifiedPlaylistTracks).toBe('function');
    expect(typeof youtubeApiService.getUnifiedArtists).toBe('function');
    expect(typeof youtubeApiService.convertToUnifiedPlaylist).toBe('function');
    expect(typeof youtubeApiService.convertToUnifiedTrack).toBe('function');
  });

  it('should convert YouTube playlist to unified format', () => {
    const mockYouTubePlaylist = {
      kind: 'youtube#playlist',
      etag: 'test-etag',
      id: 'PLtest123',
      snippet: {
        publishedAt: '2023-01-01T00:00:00Z',
        channelId: 'UC123',
        title: 'Test Playlist',
        description: 'A test playlist',
        thumbnails: {
          medium: { url: 'https://thumbnail.jpg', width: 320, height: 180 }
        },
        channelTitle: 'Test Channel'
      },
      contentDetails: {
        itemCount: 10
      },
      status: {
        privacyStatus: 'public' as const
      }
    };

    const unifiedPlaylist = youtubeApiService.convertToUnifiedPlaylist(mockYouTubePlaylist);

    expect(unifiedPlaylist).toEqual({
      id: 'PLtest123',
      name: 'Test Playlist',
      description: 'A test playlist',
      imageUrl: 'https://thumbnail.jpg',
      trackCount: 10,
      source: 'youtube',
      externalUrl: 'https://www.youtube.com/playlist?list=PLtest123',
      owner: 'Test Channel',
      isPublic: true,
      originalData: mockYouTubePlaylist
    });
  });

  it('should convert YouTube track to unified format', () => {
    const mockYouTubeItem = {
      kind: 'youtube#playlistItem',
      etag: 'test-etag',
      id: 'item123',
      snippet: {
        publishedAt: '2023-01-01T00:00:00Z',
        channelId: 'UC123',
        title: 'Test Song',
        description: '',
        thumbnails: {
          medium: { url: 'https://thumbnail.jpg', width: 320, height: 180 }
        },
        channelTitle: 'Test Channel',
        playlistId: 'PLtest123',
        position: 0,
        videoOwnerChannelTitle: 'Test Artist',
        resourceId: {
          kind: 'youtube#video',
          videoId: 'video123'
        }
      },
      contentDetails: {
        videoId: 'video123',
        startAt: '0s',
        endAt: '240s',
        note: '',
        videoPublishedAt: '2023-01-01T00:00:00Z'
      }
    };

    const unifiedTrack = youtubeApiService.convertToUnifiedTrack(mockYouTubeItem);

    expect(unifiedTrack).toEqual({
      id: 'video123',
      name: 'Test Song',
      artist: 'Test Artist',
      source: 'youtube',
      duration: 'Unknown',
      imageUrl: 'https://thumbnail.jpg',
      externalUrl: 'https://www.youtube.com/watch?v=video123',
      originalData: mockYouTubeItem
    });
  });
});