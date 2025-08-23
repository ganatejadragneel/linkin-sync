# LinkinSync Frontend

LinkinSync is a modern music streaming and social platform built with React, Typescript, and Tailwind CSS. The application integrates with Spotify for music playback and features a real-time chat system and AI-powered lyrics analysis.

## Features

- **Spotify Integration**: Stream music directly from your Spotify account
- **Global Chat**: Connect with other users in real-time
- **Lyric Analysis**: Ask questions about song lyrics and get AI-powered answers
- **Music Player**: Full-featured music player with playback controls
- **Dynamic UI**: Responsive, modern interface with dark mode

## Tech Stack

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Spotify Web Playback SDK**: For music streaming
- **Context API**: For state management
- **Shadcn UI**: For UI components

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Spotify Premium account
- Spotify Developer Application
- Backend server running (see backend repository)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd linkin-sync
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id
   REACT_APP_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
   ```

4. Start the development server
   ```bash
   npm start
   # or
   yarn start
   ```

5. The application will be available at http://localhost:3000

### Spotify Setup

1. Create a Spotify Developer Application at [developer.spotify.com](https://developer.spotify.com/dashboard/)
2. Add `http://localhost:3000/callback` as a Redirect URI in your Spotify app settings
3. Copy your Client ID and Client Secret to the `.env` file

## Usage Guide

### Authentication

1. When you first open the application, click the "Login with Spotify" button
2. You'll be redirected to Spotify's authentication page
3. After granting access, you'll be redirected back to the application

### Playing Music

1. Browse featured content, artists, or playlists
2. Click on an album to view its tracks
3. Click the play button next to a track to start playback
4. Use the player bar at the bottom to control playback

### Using the Chat Features

#### Global Chat
1. Click the "Global Chat" button in the bottom left
2. Type your message and press Enter or click Send
3. Your message will be visible to all users

#### Lyrics Assistant
1. Start playing a song
2. Click the "Lyric Chat" button in the bottom left
3. Ask questions about the lyrics of the currently playing song
4. The AI will analyze the lyrics and provide responses

### Navigation

- Use the sidebar to navigate between different sections
- Featured: Discover new music and trending content
- About: Learn more about the application
- Artists: Browse featured artists
- Playlists: View and manage playlists

## Component Structure

- `App.tsx`: Main application component
- `components/`: UI components
  - `player-bar.tsx`: Music player controls
  - `lyric-chatbot.tsx`: AI-powered lyrics analysis
  - `global-chat.tsx`: Real-time chat functionality
  - `header.tsx`: Application header
  - `sidebar.tsx`: Navigation sidebar
  - `main-content.tsx`: Primary content area
  - UI components in `ui/` folder

## State Management

- `AuthContext.tsx`: Manages authentication state
- `PlayerContext.tsx`: Manages music player state

## API Integration

- `services/lyricService.ts`: Communicates with the backend API for lyrics analysis
- `utils/spotify-auth.ts`: Handles Spotify authentication
- `utils/spotify-playback.ts`: Controls Spotify playback

## Building for Production

```bash
npm run build
# or
yarn build
```

This will create a production-ready build in the `build` directory.

## Troubleshooting

- **Spotify Playback Issues**: Make sure you have an active Spotify Premium account and an active device
- **Chat Connection Issues**: Verify that the backend server is running
- **Authentication Errors**: Check your Spotify Developer credentials and redirect URI
- **Missing Lyrics**: Some songs may not have lyrics available on Genius

## License

[MIT License](LICENSE)
