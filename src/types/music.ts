// Music and playback related type definitions

export interface NowPlaying {
  track_id: string;
  track_name: string;
  artist: string;
  album: string;
  source?: string;  // Optional, 'spotify' or 'youtube'
  lyrics?: string;  // Optional, populated by backend
  updated_at?: string;  // Optional, ISO date string
}

export interface PlayHistory {
  track_id: string;
  track_name: string;
  artist: string;
  album: string;
  source?: string;  // Optional, 'spotify' or 'youtube'
  played_at: string;  // ISO date string from backend time.Time
}

export interface Artist {
  id: number;
  name: string;
  imageUrl: string;
  debutYear: string;
  shortInfo: string;
  genres: string[];
  biography: string;
  achievements: string[];
  popularAlbums: {
    name: string;
    year: string;
  }[];
}

export interface ArtistWithImage extends Artist {
  spotifyImageUrl?: string | null;
  imageLoading?: boolean;
}