import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateNowPlaying } from '../services/lyricService';

interface PlayerContextType {
  currentTrack: any;
  isPlaying: boolean;
  playTrack: (trackUri: string) => Promise<void>;
  pauseTrack: () => Promise<void>;
  resumeTrack: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // When the current track changes, update our backend
  useEffect(() => {
    if (currentTrack) {
      const updateBackendWithTrack = async () => {
        try {
          const trackData = {
            track_id: currentTrack.id,
            track_name: currentTrack.name,
            artist: currentTrack.artists[0].name,
            album: currentTrack.album.name
          };
          
          await updateNowPlaying(trackData);
          console.log('Updated backend with track from PlayerContext:', trackData);
        } catch (error) {
          console.error('Failed to update backend with track from PlayerContext:', error);
        }
      };
      
      updateBackendWithTrack();
    }
  }, [currentTrack]);

  const playTrack = async (trackUri: string) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('Not authenticated');

      // Start playback using Spotify API
      await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [trackUri]
        })
      });

      // Get current playing track
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.status === 200) {
        const data = await response.json();
        setCurrentTrack(data.item);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  const pauseTrack = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('Not authenticated');

      await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to pause track:', error);
    }
  };

  const resumeTrack = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('Not authenticated');

      await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to resume track:', error);
    }
  };

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      playTrack,
      pauseTrack,
      resumeTrack
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};