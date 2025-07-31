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
import { updateNowPlaying } from '../services/lyricService';
import { useToast } from './ui/use-toast';

interface PlaybackState {
  is_playing: boolean;
  item?: {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
      name: string;
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
  const [isUpdatingBackend, setIsUpdatingBackend] = useState(false);
  const { toast } = useToast();

  const updatePlaybackState = async () => {
    try {
      const state = await getCurrentPlayback();
      
      // If we have a state and it differs from our current state, update
      if (state && JSON.stringify(state) !== JSON.stringify(playbackState)) {
        setPlaybackState(state);
        
        if (state?.device?.volume_percent) {
          setVolumeState(state.device.volume_percent);
        }
        
        // If there's a track playing, update our backend
        if (state?.item) {
          await updateBackendWithCurrentTrack(state);
        }
      }
    } catch (error) {
      console.error('Failed to get playback state:', error);
    }
  };

  // Function to send currently playing track to backend
  const updateBackendWithCurrentTrack = async (state: PlaybackState) => {
    // Only update if we have a track and we're not already updating
    if (state?.item && !isUpdatingBackend) {
      try {
        setIsUpdatingBackend(true);
        
        // Format the track data for the backend (SpotifyTrack model)
        const trackData = {
          id: state.item.id,
          name: state.item.name,
          artist: state.item.artists[0].name,
          album: state.item.album.name
        };
        
        // Send to backend
        await updateNowPlaying(trackData);
        console.log('Updated backend with current track:', trackData);
      } catch (error) {
        console.error('Failed to update backend with current track:', error);
      } finally {
        setIsUpdatingBackend(false);
      }
    }
  };

  useEffect(() => {
    updatePlaybackState();
    // Update more frequently (every 2 seconds) to ensure smoother state updates
    const interval = setInterval(updatePlaybackState, 2000);
    return () => clearInterval(interval);
  }, []);

  // Also update backend whenever playbackState changes
  useEffect(() => {
    if (playbackState?.item) {
      updateBackendWithCurrentTrack(playbackState);
    }
  }, [playbackState?.item?.id]);

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
      // Add a small delay before updating to give Spotify time to change tracks
      setTimeout(updatePlaybackState, 500);
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
      // Add a small delay before updating to give Spotify time to change tracks
      setTimeout(updatePlaybackState, 500);
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