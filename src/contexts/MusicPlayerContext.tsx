import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UnifiedTrack } from '../types';
import { spotifyDeviceManager } from '../utils/spotify-device-manager';
import { storageService } from '../services/storage.service';

interface MusicPlayerContextType {
  currentTrack: UnifiedTrack | null;
  playlist: UnifiedTrack[];
  isPlaying: boolean;
  setCurrentTrack: (track: UnifiedTrack) => void;
  setPlaylist: (tracks: UnifiedTrack[]) => void;
  setIsPlaying: (playing: boolean) => void;
  playTrack: (track: UnifiedTrack, trackList?: UnifiedTrack[]) => void;
  playNext: () => void;
  playPrevious: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<UnifiedTrack | null>(null);
  const [playlist, setPlaylist] = useState<UnifiedTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const playTrack = async (track: UnifiedTrack, trackList?: UnifiedTrack[]) => {
    try {
      setCurrentTrack(track);
      if (trackList) {
        setPlaylist(trackList);
      }
      
      // Only handle Spotify tracks for now, YouTube requires different handling
      if (track.source === 'spotify') {
        const accessToken = storageService.getAccessToken();
        if (!accessToken) {
          throw new Error('Not authenticated with Spotify');
        }

        // Convert track to Spotify URI format if needed
        let trackUri = '';
        if (track.originalData && track.originalData.uri) {
          trackUri = track.originalData.uri;
        } else {
          // Fallback: construct URI from track ID
          trackUri = `spotify:track:${track.id}`;
        }

        await spotifyDeviceManager.startPlaybackOnDevice(trackUri);
        setIsPlaying(true);
      } else {
        // For YouTube tracks, just set the state - actual playback would need YouTube integration
        console.log('YouTube playback not yet implemented through device manager');
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to play track:', error);
      // Don't update playing state if playback failed
      throw error;
    }
  };

  const playNext = async () => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
    
    if (playlist[nextIndex]) {
      await playTrack(playlist[nextIndex]);
    }
  };

  const playPrevious = async () => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    
    if (playlist[previousIndex]) {
      await playTrack(playlist[previousIndex]);
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        playlist,
        isPlaying,
        setCurrentTrack,
        setPlaylist,
        setIsPlaying,
        playTrack,
        playNext,
        playPrevious,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}