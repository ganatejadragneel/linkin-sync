# LinkinSync - AI Music Discovery Platform

## Project Overview

LinkinSync is a comprehensive music discovery and streaming platform that combines AI-powered lyric chat with unified music streaming from Spotify and YouTube Music. The platform allows users to interact with an AI assistant to discover music, search their libraries, and seamlessly play tracks across multiple services.

## Repository Structure

This is a monorepo containing two main components:

### 1. Frontend (React TypeScript SPA)
- **Location**: `/linkin-sync/` (current directory)
- **Technology**: React 18, TypeScript, Tailwind CSS
- **Build System**: Create React App with custom configurations
- **State Management**: React Context API
- **UI Components**: Custom component library with shadcn/ui

### 2. Backend (Go API Server)
- **Location**: `../backend/` (sibling directory)
- **Technology**: Go with Gin web framework
- **Database**: SQLite with GORM
- **Authentication**: OAuth 2.0 (Spotify & YouTube)
- **External APIs**: Spotify Web API, YouTube Data API v3

## Core Features

### 🎵 Unified Music Streaming
- **Spotify Integration**: Full playlist access, liked songs, playback control
- **YouTube Music Integration**: Playlists, liked videos (music-filtered), search
- **Cross-Platform Player**: Unified playback interface supporting both services
- **Smart Filtering**: Only music content shown from YouTube (filters out podcasts, tutorials, etc.)

### 🤖 AI-Powered Music Discovery
- **Lyric Chat**: AI assistant for music discovery and recommendations
- **Song Request Feature**: Ask for songs in natural language, searches user's libraries
- **Intelligent Search**: Searches both Spotify and YouTube libraries simultaneously
- **Context-Aware**: Understands music preferences and provides personalized suggestions

### 📱 Advanced Playlist Management
- **Unified Playlists**: View playlists from both services in one interface
- **Liked Content Priority**: Spotify Liked Songs and YouTube Liked Videos always at top
- **Music-Only Filtering**: YouTube playlists are filtered to show only music content
- **Real-time Updates**: Dynamic playlist updates and track loading

## Technical Architecture

### Frontend Architecture

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, cards, etc.)
│   ├── main-content.tsx # Main dashboard and search results
│   ├── playlists.tsx    # Playlist grid view
│   ├── player-bar.tsx   # Bottom music player
│   ├── lyric-chatbot.tsx # AI chat interface
│   └── unified-playlist-detail.tsx # Playlist track viewer
├── services/            # API and external service integrations
│   ├── api/             # API service classes
│   │   ├── spotify.service.ts    # Spotify Web API wrapper
│   │   ├── youtube.service.ts    # YouTube Data API wrapper
│   │   └── base.service.ts       # Shared HTTP client
│   └── storage.service.ts        # Local storage management
├── hooks/               # Custom React hooks
│   ├── useUnifiedPlaylists.ts    # Unified playlist data fetching
│   ├── useUnifiedArtists.ts      # Artist data aggregation
│   └── useErrorHandler.ts        # Global error handling
├── contexts/            # React Context providers
│   └── MusicPlayerContext.tsx    # Global music player state
├── types/               # TypeScript type definitions
│   ├── spotify.ts       # Spotify API types
│   ├── youtube.ts       # YouTube API types
│   └── chat.ts          # Chat and AI response types
├── utils/               # Utility functions
│   ├── spotify-auth.ts  # Spotify OAuth flow
│   └── youtube-auth.ts  # YouTube OAuth flow
└── constants.ts         # API endpoints and configuration
```

### Backend Architecture

```
backend/
├── server/
│   ├── handlers/        # HTTP request handlers
│   │   ├── lyrics_handler.go     # AI chat and song requests
│   │   ├── spotify_handler.go    # Spotify proxy endpoints
│   │   └── youtube_handler.go    # YouTube proxy endpoints
│   ├── models/          # Data models and database schemas
│   │   ├── chat.go      # Chat message and response structures
│   │   ├── spotify.go   # Spotify data models
│   │   └── user.go      # User and session management
│   ├── services/        # Business logic services
│   │   ├── ai_service.go        # AI integration (OpenAI/Anthropic)
│   │   ├── spotify_service.go   # Spotify API integration
│   │   └── youtube_service.go   # YouTube API integration
│   └── middleware/      # HTTP middleware
│       ├── cors.go      # Cross-origin resource sharing
│       └── auth.go      # Authentication middleware
├── database/            # Database migrations and setup
└── config/              # Configuration management
```

## API Integration Details

### Spotify Web API Integration
- **Authentication**: OAuth 2.0 with PKCE flow
- **Scopes**: `user-read-private`, `user-read-email`, `playlist-read-private`, `playlist-read-collaborative`, `user-library-read`, `user-read-playback-state`, `user-modify-playback-state`
- **Endpoints Used**:
  - `/me` - User profile
  - `/me/playlists` - User playlists
  - `/me/tracks` - Liked songs
  - `/playlists/{id}/tracks` - Playlist tracks
  - `/search` - Music search
  - `/me/player` - Playback control

### YouTube Data API v3 Integration
- **Authentication**: OAuth 2.0 traditional flow
- **Scopes**: `youtube.readonly`, `youtube.force-ssl`
- **Endpoints Used**:
  - `/playlists` - User playlists
  - `/playlistItems` - Playlist videos
  - `/videos?myRating=like` - Liked videos
  - `/search` - Video search
- **Music Filtering**: Advanced content filtering to show only music videos

## Advanced Features

### Smart Music Filtering System
```typescript
// YouTube content is filtered using sophisticated logic:
isMusicContent(video): boolean {
  // Positive indicators
  const musicChannelKeywords = ['vevo', 'official', 'music', 'records', 'entertainment'];
  const titleMusicKeywords = ['official video', 'music video', 'lyrics', 'acoustic', 'live'];
  const musicPatterns = [/\s-\s/, /\(official\)/i, /\[official\]/i];
  
  // Negative filters
  const nonMusicKeywords = ['podcast', 'interview', 'reaction', 'review', 'tutorial', 'gameplay'];
  
  return (hasMusic || titleHasMusic || hasPatternMatch) && !isNonMusic;
}
```

### Song Request Processing
```typescript
// AI-powered song request detection and processing
interface ChatResponse {
  answer: string;
  error?: string;
  type?: 'text' | 'song_request';
  song_query?: {
    query: string;
    artist?: string;
  };
}
```

### Playlist-Level Intelligence
- **Sampling**: Each YouTube playlist is analyzed by sampling 10 videos
- **Threshold**: Requires ≥60% music content to be shown
- **Caching**: Results cached to avoid repeated API calls
- **Performance**: Limited to 20 playlists for optimal performance

### Advanced Caching Strategy
```typescript
// YouTube Liked Videos Caching
interface CacheEntry {
  data: YouTubeLikedVideo[];
  timestamp: number;
  isComplete: boolean;
}

// Progressive Loading
getAllLikedVideosWithCaching(): Promise<{
  videos: YouTubeLikedVideo[];
  isComplete: boolean;
  isFromCache: boolean;
}>
```

## State Management

### Global Player State
```typescript
interface MusicPlayerContextType {
  currentTrack: UnifiedTrack | null;
  isPlaying: boolean;
  playlist: UnifiedTrack[];
  currentIndex: number;
  playTrack: (track: UnifiedTrack, playlist?: UnifiedTrack[]) => Promise<void>;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
}
```

### Unified Data Types
```typescript
interface UnifiedPlaylist {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  trackCount: number;
  owner: string;
  source: 'spotify' | 'youtube';
  isPublic: boolean;
  externalUrl: string;
  originalData: any; // Source-specific data
}

interface UnifiedTrack {
  id: string;
  name: string;
  artist: string;
  album?: string;
  duration: string;
  imageUrl: string | null;
  source: 'spotify' | 'youtube';
  externalUrl: string;
  originalData: any;
}
```

## Performance Optimizations

### Rate Limiting & API Efficiency
- **YouTube API**: Conservative rate limiting with 250ms delays between requests
- **Spotify API**: Automatic token refresh with retry logic
- **Caching**: 15-minute cache for YouTube liked videos
- **Batch Processing**: Efficient pagination with background loading

### UI Performance
- **Virtual Playlists**: Liked content stored in memory for instant access
- **Progressive Loading**: Show partial results while fetching more
- **Error Boundaries**: Graceful degradation when services fail
- **Optimistic Updates**: Immediate UI feedback for user actions

## Development Setup

### Environment Variables
```bash
# Frontend (.env)
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id
REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
REACT_APP_YOUTUBE_CLIENT_ID=your_youtube_client_id
REACT_APP_YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
REACT_APP_YOUTUBE_REDIRECT_URI=http://localhost:3000/youtube-callback
REACT_APP_API_BASE_URL=http://localhost:8080

# Backend (.env)
OPENAI_API_KEY=your_openai_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
```

### Build Commands
```bash
# Frontend
npm install
npm start          # Development server (port 3000)
npm run build      # Production build
npm test           # Run tests

# Backend
go mod tidy
go run main.go     # Development server (port 8080)
go build           # Production build
```

## Security Considerations

### Authentication Flow
- **PKCE**: Spotify uses PKCE for enhanced security
- **Token Refresh**: Automatic token refresh with secure storage
- **CORS**: Properly configured cross-origin policies
- **Environment Variables**: All secrets in environment variables

### Data Privacy
- **Local Storage**: Tokens stored securely in browser localStorage
- **No Persistence**: No user data stored on backend (stateless)
- **Minimal Scopes**: Only required OAuth scopes requested

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API service testing
- **E2E Tests**: User flow testing (planned)

### Backend Testing
- **Unit Tests**: Service and handler testing
- **API Tests**: Endpoint testing with test database
- **Mock Services**: External API mocking for reliable tests

## Deployment Architecture

### Frontend Deployment
- **Platform**: Vercel/Netlify for static hosting
- **Build**: React production build with optimizations
- **CDN**: Global content delivery for assets

### Backend Deployment
- **Platform**: Railway/Heroku/DigitalOcean
- **Database**: SQLite for simplicity (PostgreSQL for production)
- **Monitoring**: Structured logging and error tracking

## Key Implementation Insights

### Song Request Feature
The song request feature is a sophisticated system that:
1. **Detects Intent**: Uses pattern matching to identify song requests in chat
2. **Extracts Information**: Parses song name and artist from natural language
3. **Searches Libraries**: Prioritizes user's playlists over general search
4. **Fuzzy Matching**: Implements fuzzy string matching for flexible search
5. **Mixed Results**: Combines Spotify and YouTube results intelligently

### Music-Only YouTube Experience
A unique challenge was filtering YouTube's vast content to show only music:
- **Multi-layer Filtering**: Channel analysis, title patterns, content categorization
- **Playlist Intelligence**: Samples videos to determine if playlist is music-focused
- **Performance Balance**: Aggressive filtering while maintaining API efficiency
- **User Experience**: Seamless music discovery without non-music distractions

### Cross-Platform Consistency
Maintaining consistent UX across different music services required:
- **Unified Data Models**: Common interfaces for different API responses
- **Error Handling**: Graceful degradation when services are unavailable
- **Visual Consistency**: Similar UI treatment for Spotify and YouTube content
- **Feature Parity**: Ensuring core features work across both platforms

## Future Development

### Planned Features
- **Offline Support**: Cache frequently accessed playlists
- **Social Features**: Playlist sharing and collaborative discovery
- **Advanced AI**: More sophisticated music recommendations
- **Mobile App**: React Native implementation
- **Analytics**: User behavior insights and music trends

### Technical Debt
- **Error Handling**: Enhance error boundary implementation
- **Testing Coverage**: Increase test coverage to >80%
- **Performance**: Implement virtual scrolling for large playlists
- **Accessibility**: Full WCAG 2.1 compliance

## Troubleshooting Guide

### Common Issues

**"Failed to Load Tracks [object Object]"**
- **Cause**: Liked playlists missing cached data or invalid API responses
- **Solution**: Refresh playlists or check OAuth token validity

**YouTube Quota Exceeded**
- **Cause**: Too many API requests to YouTube Data API
- **Solution**: Implemented aggressive caching and rate limiting

**Spotify Token Expired**
- **Cause**: Access token expired and refresh failed
- **Solution**: Automatic token refresh with fallback to re-authentication

**No Music Playlists Showing**
- **Cause**: All playlists filtered out due to strict music filtering
- **Solution**: Adjust `MUSIC_PLAYLIST_THRESHOLD` or review filtering logic

## Code Quality Standards

### TypeScript Standards
- **Strict Mode**: Full TypeScript strict mode enabled
- **Type Safety**: No `any` types in production code (except API responses)
- **Interface Design**: Comprehensive type definitions for all data structures

### React Best Practices
- **Hooks**: Custom hooks for complex state logic
- **Context**: Minimal context usage to avoid performance issues
- **Components**: Small, focused components with clear responsibilities
- **Error Boundaries**: Proper error handling at component level

### API Design
- **RESTful**: Following REST conventions for all endpoints
- **Error Responses**: Consistent error response format
- **Documentation**: Comprehensive API documentation
- **Versioning**: API versioning strategy for future updates

This documentation provides complete context for understanding the LinkinSync codebase, its architecture, and implementation details. Use this as a reference for development, debugging, and extending the platform's capabilities.