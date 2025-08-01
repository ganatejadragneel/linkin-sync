// API related constants

// Backend API
export const BACKEND_API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

export const BACKEND_ENDPOINTS = {
  NOW_PLAYING: '/api/now-playing',
  PLAY_HISTORY: '/api/history',
  CHAT: '/api/chat',
  GLOBAL_CHAT: '/api/messages',
} as const;

// Spotify API
export const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
export const SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com';

export const SPOTIFY_ENDPOINTS = {
  // Auth
  AUTHORIZE: `${SPOTIFY_ACCOUNTS_URL}/authorize`,
  TOKEN: `${SPOTIFY_ACCOUNTS_URL}/api/token`,
  
  // User
  ME: '/me',
  
  // Player
  PLAYER: '/me/player',
  PLAYER_PLAY: '/me/player/play',
  PLAYER_PAUSE: '/me/player/pause',
  PLAYER_NEXT: '/me/player/next',
  PLAYER_PREVIOUS: '/me/player/previous',
  PLAYER_VOLUME: '/me/player/volume',
  PLAYER_SEEK: '/me/player/seek',
  PLAYER_SHUFFLE: '/me/player/shuffle',
  PLAYER_REPEAT: '/me/player/repeat',
  
  // Content
  ALBUMS: '/albums',
  SEARCH: '/search',
} as const;

// YouTube API
export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
export const YOUTUBE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const YOUTUBE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export const YOUTUBE_ENDPOINTS = {
  PLAYLISTS: '/playlists',
  PLAYLIST_ITEMS: '/playlistItems',
  CHANNELS: '/channels',
} as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;