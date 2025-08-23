// Chat related type definitions

export interface ChatMessage {
  id: number | string;  // Handle both number and string for int64 compatibility
  user_email: string;
  username: string;
  text: string;
  created_at: string;
}

export interface ChatRequest {
  query: string;  // Only field backend expects
}

export interface ChatResponse {
  answer?: string;  // Backend returns 'answer' field
  response?: string;  // Fallback for compatibility
  error?: string;
  type?: string;  // "text" | "song_request" | "mood_recommendation"
  song_query?: SongQuery;  // Only present when type is "song_request"
  mood_analysis?: MoodAnalysis;  // Present when mood is detected
  recommendations?: MoodRecommendations;  // Present when type is "mood_recommendation"
}

export interface SongQuery {
  query: string;  // The song name or search query
  artist?: string;  // Optional artist name
}

export interface MoodAnalysis {
  primary_mood: string;  // Main emotion detected
  mood_score: number;    // Confidence score 0-1
  emotion_tags: string[];  // Related emotions/themes
}

export interface MoodRecommendations {
  from_library: MoodBasedRecommendation[];  // Songs from user's playlists (5)
  suggested: MoodBasedRecommendation[];     // General suggestions (10)
}

export interface MoodBasedRecommendation {
  track: {
    id: string;
    name: string;
    artist: string;
    album?: string;
    source: 'spotify' | 'youtube';
    preview_url?: string;
    external_url?: string;
    duration?: number;
    image_url?: string;
  };
  match_reason?: string;  // Why this song matches the mood
  mood_score: number;     // How well it matches (0-1)
}