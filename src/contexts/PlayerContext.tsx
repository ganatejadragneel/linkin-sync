import React, { createContext, useContext, useState, useEffect } from 'react';
import { updateNowPlaying } from '../services/lyricService';
import { storageService } from '../services/storage.service';
import { spotifyDeviceManager } from '../utils/spotify-device-manager';

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
            id: currentTrack.id,
            name: currentTrack.name,
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
      const accessToken = storageService.getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');

      // Use device manager to ensure proper device targeting
      await spotifyDeviceManager.startPlaybackOnDevice(trackUri);

      // Get current playing track
      const playbackState = await spotifyDeviceManager.getCurrentPlayback();
      
      if (playbackState && playbackState.item) {
        setCurrentTrack(playbackState.item);
        setIsPlaying(playbackState.is_playing);
      }
    } catch (error) {
      console.error('Failed to play track:', error);
      throw error; // Re-throw to allow components to handle the error
    }
  };

  const pauseTrack = async () => {
    try {
      const accessToken = storageService.getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');

      await spotifyDeviceManager.pausePlayback();
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to pause track:', error);
      throw error;
    }
  };

  const resumeTrack = async () => {
    try {
      const accessToken = storageService.getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');

      await spotifyDeviceManager.startPlaybackOnDevice(); // Resume without URI
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to resume track:', error);
      throw error;
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