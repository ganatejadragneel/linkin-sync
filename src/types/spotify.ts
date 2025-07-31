// Spotify API type definitions

export interface SpotifyArtist {
  id: string;
  name: string;
  type: string;
  uri: string;
  href: string;
  external_urls: {
    spotify: string;
  };
  images?: SpotifyImage[];
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  album_type: string;
  images: SpotifyImage[];
  release_date: string;
  total_tracks: number;
  uri: string;
  artists: SpotifyArtist[];
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  uri: string;
  track_number: number;
  explicit: boolean;
  preview_url: string | null;
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export interface SpotifyPlaybackState {
  device: SpotifyDevice;
  repeat_state: 'off' | 'track' | 'context';
  shuffle_state: boolean;
  context: {
    type: string;
    href: string;
    uri: string;
  } | null;
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: SpotifyTrack | null;
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
}

export interface SpotifyUserProfile {
  country: string;
  display_name: string;
  email: string;
  id: string;
  images: SpotifyImage[];
  product: string;
  type: string;
}

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

export interface SpotifyError {
  error: {
    status: number;
    message: string;
  };
}