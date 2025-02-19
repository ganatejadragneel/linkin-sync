// src/components/player-bar.tsx
import { useEffect, useState } from 'react';
import { Button } from "./ui/button";
import { FastForward, Pause, Play, Rewind, Volume2 } from 'lucide-react';
import { 
  pausePlayback, 
  startPlayback, 
  skipToNext, 
  skipToPrevious, 
  setVolume,
  getCurrentPlayback 
} from '../utils/spotify-playback';
import { useToast } from './ui/use-toast';

interface PlaybackState {
  is_playing: boolean;
  item?: {
    name: string;
    artists: Array<{ name: string }>;
    album: {
      images: Array<{ url: string }>;
    };
    duration_ms: number;
    uri: string;
  };
  progress_ms: number;
  device?: {
    volume_percent: number;
  };
}

export function PlayerBar() {
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);
  const [volume, setVolumeState] = useState(50);
  const { toast } = useToast();

  const updatePlaybackState = async () => {
    try {
      const state = await getCurrentPlayback();
      setPlaybackState(state);
      if (state?.device?.volume_percent) {
        setVolumeState(state.device.volume_percent);
      }
    } catch (error) {
      console.error('Failed to get playback state:', error);
    }
  };

  useEffect(() => {
    updatePlaybackState();
    // Update more frequently (every 500ms) to ensure smoother state updates
    const interval = setInterval(updatePlaybackState, 500);
    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = async () => {
    try {
      if (playbackState?.is_playing) {
        await pausePlayback();
      } else if (playbackState?.item?.uri) {
        await startPlayback(playbackState.item.uri);
      }
      await updatePlaybackState();
    } catch (error) {
      console.error('Failed to toggle playback:', error);
      toast({
        title: "Playback Error",
        description: "Failed to control playback. Make sure you have an active Spotify device.",
        variant: "destructive",
      });
    }
  };

  const handleSkipNext = async () => {
    try {
      await skipToNext();
      await updatePlaybackState();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to skip to next track",
        variant: "destructive",
      });
    }
  };

  const handleSkipPrevious = async () => {
    try {
      await skipToPrevious();
      await updatePlaybackState();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to skip to previous track",
        variant: "destructive",
      });
    }
  };

  const handleVolumeChange = async (value: number[]) => {
    try {
      const newVolume = value[0];
      setVolumeState(newVolume);
      await setVolume(newVolume);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change volume",
        variant: "destructive",
      });
    }
  };

  if (!playbackState?.item) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 text-zinc-100 p-4 z-50">
        <div className="flex justify-center items-center">
          <p className="text-zinc-400">No track playing</p>
        </div>
      </div>
    );
  }

  const progressPercentage = (playbackState.progress_ms / playbackState.item.duration_ms) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 text-zinc-100 p-4 z-50">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-3xl mb-4">
          <div className="relative w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-200"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between w-full max-w-3xl">
          <div className="flex items-center space-x-4">
            <img
              src={playbackState.item.album.images[0]?.url || "/placeholder.svg"}
              alt="Album cover"
              className="w-14 h-14 rounded shadow-lg"
            />
            <div>
              <h3 className="font-semibold text-zinc-100">
                {playbackState.item.name}
              </h3>
              <p className="text-sm text-zinc-400">
                {playbackState.item.artists.map(a => a.name).join(', ')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSkipPrevious}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              <Rewind className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handlePlayPause}
              className="text-zinc-100 hover:text-zinc-100 hover:bg-zinc-800 h-10 w-10 rounded-full"
            >
              {playbackState.is_playing ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSkipNext}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              <FastForward className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-zinc-400" />
            <div className="relative w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-zinc-400 transition-all duration-200"
                style={{ width: `${volume}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange([parseInt(e.target.value)])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}