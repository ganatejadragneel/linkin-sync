import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { UnifiedTrack } from '../types';

interface IntegratedMusicPlayerProps {
  currentTrack: UnifiedTrack | null;
  playlist: UnifiedTrack[];
  onTrackChange: (track: UnifiedTrack) => void;
  className?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    Spotify: any;
  }
}

export function IntegratedMusicPlayer({ 
  currentTrack, 
  playlist, 
  onTrackChange, 
  className = '' 
}: IntegratedMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // Player instances
  const [spotifyPlayer, setSpotifyPlayer] = useState<any>(null);
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const youtubePlayerRef = useRef<HTMLDivElement>(null);

  // Initialize YouTube Player API
  useEffect(() => {
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready');
      };
    }
  }, []);

  // Initialize Spotify Player (if available)
  useEffect(() => {
    if (window.Spotify && !spotifyPlayer) {
      const player = new window.Spotify.Player({
        name: 'Linkin Sync Integrated Player',
        getOAuthToken: (cb: (token: string) => void) => {
          const token = localStorage.getItem('spotify_access_token');
          if (token) cb(token);
        },
        volume: volume
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Spotify player ready with Device ID', device_id);
        setSpotifyPlayer(player);
      });

      player.addListener('player_state_changed', (state: any) => {
        if (state) {
          setIsPlaying(!state.paused);
          setProgress(state.position);
          setDuration(state.duration);
        }
      });

      player.connect();
    }
  }, [volume]);

  // Create YouTube player when needed
  const createYouTubePlayer = (videoId: string) => {
    if (youtubePlayer) {
      youtubePlayer.loadVideoById(videoId);
      return;
    }

    if (window.YT && youtubePlayerRef.current) {
      const player = new window.YT.Player(youtubePlayerRef.current, {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: (event: any) => {
            console.log('YouTube player ready');
            setYoutubePlayer(event.target);
            event.target.setVolume(volume * 100);
          },
          onStateChange: (event: any) => {
            const state = event.data;
            setIsPlaying(state === window.YT.PlayerState.PLAYING);
            
            if (state === window.YT.PlayerState.ENDED) {
              handleNext();
            }
          }
        }
      });
    }
  };

  // Play/Pause functionality
  const togglePlayPause = async () => {
    if (!currentTrack) return;

    try {
      if (currentTrack.source === 'spotify' && spotifyPlayer) {
        // Make sure YouTube is paused
        if (youtubePlayer) {
          youtubePlayer.pauseVideo();
        }
        
        if (isPlaying) {
          await spotifyPlayer.pause();
        } else {
          await spotifyPlayer.resume();
        }
      } else if (currentTrack.source === 'youtube' && youtubePlayer) {
        // Make sure Spotify is paused
        if (spotifyPlayer) {
          try {
            await spotifyPlayer.pause();
          } catch (e) {
            console.error('Error pausing Spotify:', e);
          }
        }
        
        if (isPlaying) {
          youtubePlayer.pauseVideo();
        } else {
          youtubePlayer.playVideo();
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  // Play a specific track
  const playTrack = async (track: UnifiedTrack) => {
    try {
      // Stop any currently playing track from the other source
      if (track.source === 'spotify') {
        // Stop YouTube if playing
        if (youtubePlayer) {
          youtubePlayer.pauseVideo();
        }
        
        if (spotifyPlayer) {
          await spotifyPlayer.pause(); // Stop any current playback
          // For Spotify, we need the track URI
          const trackUri = `spotify:track:${track.id}`;
          await fetch(`https://api.spotify.com/v1/me/player/play`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uris: [trackUri]
            })
          });
        }
      } else if (track.source === 'youtube') {
        // Stop Spotify if playing
        if (spotifyPlayer) {
          try {
            await spotifyPlayer.pause();
          } catch (e) {
            console.error('Error pausing Spotify:', e);
          }
        }
        
        if (youtubePlayer) {
          youtubePlayer.loadVideoById(track.id);
        } else {
          createYouTubePlayer(track.id);
        }
      }
      
      onTrackChange(track);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  // Navigate to previous track
  const handlePrevious = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    playTrack(playlist[previousIndex]);
  };

  // Navigate to next track
  const handleNext = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
    playTrack(playlist[nextIndex]);
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    
    if (spotifyPlayer) {
      spotifyPlayer.setVolume(vol);
    }
    
    if (youtubePlayer) {
      youtubePlayer.setVolume(vol * 100);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (spotifyPlayer) {
      spotifyPlayer.setVolume(newMuted ? 0 : volume);
    }
    
    if (youtubePlayer) {
      if (newMuted) {
        youtubePlayer.mute();
      } else {
        youtubePlayer.unMute();
        youtubePlayer.setVolume(volume * 100);
      }
    }
  };

  // Format time
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-update progress for YouTube
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentTrack?.source === 'youtube' && youtubePlayer) {
      interval = setInterval(() => {
        const currentTime = youtubePlayer.getCurrentTime() * 1000;
        const totalDuration = youtubePlayer.getDuration() * 1000;
        setProgress(currentTime);
        setDuration(totalDuration);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTrack, youtubePlayer]);

  // Handle track source changes
  useEffect(() => {
    // Reset playing state when track changes to ensure proper player state
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
  }, [currentTrack?.id]);

  if (!currentTrack) {
    return (
      <div className={`bg-card border-t border-border p-3 ${className}`}>
        <div className="flex items-center justify-center text-muted-foreground text-sm">
          Select a song to start playing
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border-t border-border p-3 ${className}`}>
      {/* Hidden YouTube player */}
      <div ref={youtubePlayerRef} style={{ display: 'none' }}></div>
      
      <div className="flex items-center gap-3">
        {/* Track Info */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-10 h-10 bg-accent/10 rounded-md overflow-hidden flex-shrink-0 shadow-sm">
            {currentTrack.imageUrl ? (
              <img 
                src={currentTrack.imageUrl} 
                alt={currentTrack.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
                <Play className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-primary truncate text-sm leading-tight">{currentTrack.name}</div>
            <div className="text-xs text-muted-foreground truncate">{currentTrack.artist}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handlePrevious} className="h-8 w-8 p-0 hover:bg-accent/80">
            <SkipBack className="w-3.5 h-3.5" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={togglePlayPause} className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleNext} className="h-8 w-8 p-0 hover:bg-accent/80">
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <span className="text-xs text-muted-foreground w-8 text-right font-mono">
            {formatTime(progress)}
          </span>
          <div className="flex-1">
            <Slider
              value={[progress]}
              max={duration}
              step={1000}
              className="w-full h-1"
              disabled={!duration}
            />
          </div>
          <span className="text-xs text-muted-foreground w-8 font-mono">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={toggleMute} className="h-8 w-8 p-0 hover:bg-accent/80">
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </Button>
          <div className="w-16">
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-full h-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}