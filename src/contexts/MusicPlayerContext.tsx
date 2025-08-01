import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UnifiedTrack } from '../types';

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

  const playTrack = (track: UnifiedTrack, trackList?: UnifiedTrack[]) => {
    setCurrentTrack(track);
    if (trackList) {
      setPlaylist(trackList);
    }
    setIsPlaying(true);
  };

  const playNext = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
    
    if (playlist[nextIndex]) {
      setCurrentTrack(playlist[nextIndex]);
    }
  };

  const playPrevious = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    
    if (playlist[previousIndex]) {
      setCurrentTrack(playlist[previousIndex]);
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