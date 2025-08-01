import { useEffect, useState, useRef } from 'react';
import { Button } from "./ui/button";
import { FastForward, Pause, Play, Rewind, Volume2, VolumeX, Music } from 'lucide-react';
import { 
  pausePlayback, 
  startPlayback, 
  skipToNext, 
  skipToPrevious, 
  setVolume as setSpotifyVolume,
  getCurrentPlayback 
} from '../utils/spotify-playback';
import { updateNowPlaying } from '../services/lyricService';
import { useToast } from './ui/use-toast';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { Slider } from './ui/slider';

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

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    Spotify: any;
  }
}

export function PlayerBar() {
  const { currentTrack, playlist, isPlaying, setIsPlaying, playNext, playPrevious } = useMusicPlayer();
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isUpdatingBackend, setIsUpdatingBackend] = useState(false);
  const { toast } = useToast();
  
  // Player instances
  const [spotifyPlayer, setSpotifyPlayer] = useState<any>(null);
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const youtubePlayerRef = useRef<HTMLDivElement>(null);

  // Initialize YouTube Player API
  useEffect(() => {
    const initYouTubeAPI = () => {
      if (!window.YT) {
        console.log('Loading YouTube API...');
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.body.appendChild(script);

        window.onYouTubeIframeAPIReady = () => {
          console.log('YouTube API ready and loaded');
        };
      } else {
        console.log('YouTube API already available');
      }
    };

    initYouTubeAPI();
  }, []);

  // Initialize Spotify Player (if available)
  useEffect(() => {
    if (window.Spotify && !spotifyPlayer) {
      console.log('Initializing Spotify Web Playback SDK...');
      const player = new window.Spotify.Player({
        name: 'Linkin Sync Player',
        getOAuthToken: (cb: (token: string) => void) => {
          const token = localStorage.getItem('spotify_access_token');
          if (token) {
            console.log('Providing Spotify token');
            cb(token);
          } else {
            console.error('No Spotify token available');
          }
        },
        volume: volume
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Spotify player ready with Device ID', device_id);
        // Store device ID for API calls
        localStorage.setItem('spotify_device_id', device_id);
        setSpotifyPlayer(player);
      });

      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Spotify device has gone offline', device_id);
      });

      player.addListener('player_state_changed', (state: any) => {
        console.log('Spotify player state changed:', state);
        if (state && currentTrack?.source === 'spotify') {
          // Only update if we're playing a Spotify track
          setIsPlaying(!state.paused);
          setProgress(state.position);
          setDuration(state.duration);
        }
      });

      player.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Spotify initialization error:', message);
      });

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Spotify authentication error:', message);
      });

      player.addListener('account_error', ({ message }: { message: string }) => {
        console.error('Spotify account error:', message);
      });

      player.addListener('playback_error', ({ message }: { message: string }) => {
        console.error('Spotify playback error:', message);
      });

      player.connect();
    }
  }, [volume]);

  // Create YouTube player when needed
  const createYouTubePlayer = (videoId: string) => {
    console.log('Creating YouTube player for video:', videoId);
    console.log('Existing YouTube player:', !!youtubePlayer);
    console.log('YT API available:', !!window.YT);
    console.log('Player ref available:', !!youtubePlayerRef.current);

    if (youtubePlayer) {
      console.log('Loading video in existing player');
      youtubePlayer.loadVideoById(videoId);
      youtubePlayer.playVideo();
      return;
    }

    if (window.YT && window.YT.Player && youtubePlayerRef.current) {
      console.log('Creating new YouTube player');
      try {
        const player = new window.YT.Player(youtubePlayerRef.current, {
          height: '1',
          width: '1',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            cc_load_policy: 0,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            host: 'https://www.youtube-nocookie.com'
          },
          events: {
            onReady: (event: any) => {
              console.log('YouTube player ready, starting playback');
              setYoutubePlayer(event.target);
              event.target.setVolume(volume * 100);
              event.target.playVideo();
              setIsPlaying(true);
              
              // Update backend with current YouTube track
              if (currentTrack) {
                updateBackendWithTrack(currentTrack);
              }
            },
            onStateChange: (event: any) => {
              const state = event.data;
              console.log('YouTube player state changed:', state);
              setIsPlaying(state === window.YT.PlayerState.PLAYING);
              
              if (state === window.YT.PlayerState.ENDED) {
                playNext();
              }
            },
            onError: (event: any) => {
              console.error('YouTube player error:', event.data);
              let errorMessage = "Failed to load YouTube video";
              
              // Handle specific YouTube error codes
              switch (event.data) {
                case 2:
                  errorMessage = "Invalid video ID";
                  break;
                case 5:
                  errorMessage = "HTML5 player error";
                  break;
                case 100:
                  errorMessage = "Video not found or private";
                  break;
                case 101:
                case 150:
                  errorMessage = "Video cannot be played in embedded players - opening in new tab";
                  // Mark this video as failed for future attempts
                  if (currentTrack?.id) {
                    localStorage.setItem(`youtube_embed_failed_${currentTrack.id}`, 'true');
                  }
                  // Try opening in new tab as fallback
                  window.open(`https://www.youtube.com/watch?v=${currentTrack?.id}`, '_blank');
                  break;
                default:
                  errorMessage = `YouTube error code: ${event.data}`;
              }
              
              toast({
                title: "YouTube Playback Error",
                description: errorMessage,
                variant: "destructive",
              });
              
              // Try to play next track if available
              if (playlist.length > 1) {
                setTimeout(() => playNext(), 2000);
              }
            }
          }
        });
      } catch (error) {
        console.error('Failed to create YouTube player:', error);
      }
    } else {
      console.log('YouTube API not ready, waiting...');
      // Try again in 1 second
      setTimeout(() => createYouTubePlayer(videoId), 1000);
    }
  };

  const updatePlaybackState = async () => {
    try {
      const state = await getCurrentPlayback();
      
      // If we have a state and it differs from our current state, update
      if (state && JSON.stringify(state) !== JSON.stringify(playbackState)) {
        setPlaybackState(state);
        
        if (state?.device?.volume_percent) {
          setVolumeState(state.device.volume_percent / 100);
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

  // Function to send unified track to backend
  const updateBackendWithTrack = async (track: any) => {
    if (!track || isUpdatingBackend) return;
    
    try {
      setIsUpdatingBackend(true);
      
      // Format the track data for the backend
      const trackData = {
        id: track.id,
        name: track.name,
        artist: track.artist,
        album: track.album || track.artist // Use artist as album fallback for YouTube
      };
      
      // Send to backend
      await updateNowPlaying(trackData);
      console.log('Updated backend with track:', trackData);
    } catch (error) {
      console.error('Failed to update backend with track:', error);
    } finally {
      setIsUpdatingBackend(false);
    }
  };

  // Function to send currently playing track to backend (for Spotify fallback)
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

  // Also update backend whenever playbackState changes (only for non-unified tracks)
  useEffect(() => {
    if (playbackState?.item && !currentTrack) {
      // Only update with Spotify state if we don't have a unified track playing
      updateBackendWithCurrentTrack(playbackState);
    }
  }, [playbackState?.item?.id, currentTrack]);

  // Play a specific track based on its source
  const playTrack = async (track: any) => {
    console.log('PlayTrack called with:', track);
    try {
      // Stop any currently playing track from other sources
      if (track.source === 'spotify') {
        // Stop YouTube if playing
        if (youtubePlayer) {
          console.log('Stopping YouTube player');
          youtubePlayer.pauseVideo();
        }
        
        console.log('Playing Spotify track:', track.id);
        const trackUri = `spotify:track:${track.id}`;
        const deviceId = localStorage.getItem('spotify_device_id');
        
        try {
          // Use the API to start playback on our device
          const url = deviceId 
            ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
            : `https://api.spotify.com/v1/me/player/play`;
            
          const response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uris: [trackUri]
            })
          });
          console.log('Spotify play response:', response.status);
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Spotify play failed:', errorText);
          } else {
            // Update backend with Spotify track
            await updateBackendWithTrack(track);
          }
        } catch (error) {
          console.error('Spotify playback error:', error);
        }
      } else if (track.source === 'youtube') {
        // Stop Spotify if playing
        if (spotifyPlayer) {
          console.log('Stopping Spotify player');
          await spotifyPlayer.pause();
        }
        
        console.log('Playing YouTube track:', track.id);
        console.log('YouTube player available:', !!youtubePlayer);
        console.log('YouTube API available:', !!window.YT);
        
        // Check if we should try embedded playback or go directly to external
        const shouldTryEmbedded = !localStorage.getItem(`youtube_embed_failed_${track.id}`);
        
        if (shouldTryEmbedded) {
          if (youtubePlayer) {
            youtubePlayer.loadVideoById(track.id);
            youtubePlayer.playVideo();
            // Update backend with YouTube track
            await updateBackendWithTrack(track);
          } else {
            createYouTubePlayer(track.id);
          }
        } else {
          // This video previously failed to embed, open in new tab
          window.open(`https://www.youtube.com/watch?v=${track.id}`, '_blank');
          toast({
            title: "YouTube Video Opened",
            description: "Video opened in new tab due to embedding restrictions",
            variant: "default",
          });
          // Still update backend to show what was requested
          await updateBackendWithTrack(track);
        }
      } else {
        console.log('No suitable player found for track:', track);
        console.log('Spotify player:', !!spotifyPlayer);
        console.log('YouTube player:', !!youtubePlayer);
      }
    } catch (error) {
      console.error('Error playing track:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Playback Error",
        description: `Failed to play ${track.source} track: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handlePlayPause = async () => {
    console.log('HandlePlayPause called');
    console.log('Current track:', currentTrack);
    console.log('Is playing:', isPlaying);
    console.log('Spotify player:', !!spotifyPlayer);
    console.log('YouTube player:', !!youtubePlayer);

    try {
      if (currentTrack) {
        // Handle unified track playback
        if (currentTrack.source === 'spotify' && spotifyPlayer) {
          console.log('Toggling Spotify playback');
          if (isPlaying) {
            await spotifyPlayer.pause();
            setIsPlaying(false);
          } else {
            // For resume, we might need to use the API instead
            const deviceId = localStorage.getItem('spotify_device_id');
            const url = deviceId 
              ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
              : `https://api.spotify.com/v1/me/player/play`;
              
            const response = await fetch(url, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`,
                'Content-Type': 'application/json',
              }
            });
            
            if (response.ok) {
              setIsPlaying(true);
            } else {
              // Fallback to SDK resume
              await spotifyPlayer.resume();
            }
          }
        } else if (currentTrack.source === 'youtube' && youtubePlayer) {
          console.log('Toggling YouTube playback');
          if (isPlaying) {
            youtubePlayer.pauseVideo();
          } else {
            youtubePlayer.playVideo();
          }
        } else if (currentTrack.source === 'youtube' && !youtubePlayer) {
          console.log('No YouTube player, creating one');
          createYouTubePlayer(currentTrack.id);
        } else {
          console.log('No suitable player for current track');
        }
      } else if (playbackState?.is_playing) {
        // Fallback to Spotify-only mode
        console.log('Using Spotify fallback mode');
        await pausePlayback();
      } else if (playbackState?.item?.uri) {
        await startPlayback(playbackState.item.uri);
      }
      await updatePlaybackState();
    } catch (error) {
      console.error('Failed to toggle playback:', error);
      toast({
        title: "Playback Error",
        description: "Failed to control playback. Make sure you have an active device.",
        variant: "destructive",
      });
    }
  };

  const handleSkipNext = async () => {
    try {
      if (currentTrack && playlist.length > 0) {
        // Use unified playlist navigation
        playNext();
      } else {
        // Fallback to Spotify-only mode
        await skipToNext();
        setTimeout(updatePlaybackState, 500);
      }
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
      if (currentTrack && playlist.length > 0) {
        // Use unified playlist navigation
        playPrevious();
      } else {
        // Fallback to Spotify-only mode
        await skipToPrevious();
        setTimeout(updatePlaybackState, 500);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to skip to previous track",
        variant: "destructive",
      });
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolumeState(vol);
    
    try {
      if (currentTrack?.source === 'spotify' && spotifyPlayer) {
        spotifyPlayer.setVolume(vol);
      } else if (currentTrack?.source === 'youtube' && youtubePlayer) {
        youtubePlayer.setVolume(vol * 100);
      } else {
        // Fallback to Spotify API
        setSpotifyVolume(vol * 100);
      }
    } catch (error) {
      console.error('Failed to change volume:', error);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (currentTrack?.source === 'spotify' && spotifyPlayer) {
      spotifyPlayer.setVolume(newMuted ? 0 : volume);
    } else if (currentTrack?.source === 'youtube' && youtubePlayer) {
      if (newMuted) {
        youtubePlayer.mute();
      } else {
        youtubePlayer.unMute();
        youtubePlayer.setVolume(volume * 100);
      }
    }
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

  // Play current track when it changes
  useEffect(() => {
    if (currentTrack) {
      playTrack(currentTrack);
    }
  }, [currentTrack]);

  // Format time
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine which track to display - prioritize unified track
  const displayTrack = currentTrack || (playbackState?.item ? {
    id: playbackState.item.id,
    name: playbackState.item.name,
    artist: playbackState.item.artists.map(a => a.name).join(', '),
    imageUrl: playbackState.item.album.images[0]?.url || null,
    source: 'spotify' as const
  } : null);

  // Prioritize unified track data over Spotify fallback data
  const displayProgress = currentTrack ? progress : (playbackState?.progress_ms || 0);
  const displayDuration = currentTrack ? duration : (playbackState?.item?.duration_ms || 0);
  const displayIsPlaying = currentTrack ? isPlaying : (playbackState?.is_playing || false);
  
  console.log('Display state:', {
    hasCurrentTrack: !!currentTrack,
    currentTrackSource: currentTrack?.source,
    unifiedIsPlaying: isPlaying,
    spotifyIsPlaying: playbackState?.is_playing,
    finalDisplayIsPlaying: displayIsPlaying
  });

  if (!displayTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 text-zinc-100 p-4 z-50">
        {/* Hidden YouTube player */}
        <div ref={youtubePlayerRef} style={{ display: 'none' }}></div>
        <div className="flex justify-center items-center">
          <p className="text-zinc-400">Select a song to start playing</p>
        </div>
      </div>
    );
  }

  const progressPercentage = displayDuration > 0 ? (displayProgress / displayDuration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 text-zinc-100 p-4 z-50">
      {/* Hidden YouTube player */}
      <div 
        ref={youtubePlayerRef} 
        id="youtube-player-container" 
        style={{ 
          position: 'absolute', 
          top: '-1000px', 
          left: '-1000px',
          width: '1px',
          height: '1px'
        }}
      ></div>
      
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
          {/* Track Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-14 h-14 bg-zinc-800 rounded shadow-lg overflow-hidden flex-shrink-0">
              {displayTrack.imageUrl ? (
                <img
                  src={displayTrack.imageUrl}
                  alt="Track cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-zinc-400" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-zinc-100 truncate">
                {displayTrack.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="truncate">{displayTrack.artist}</span>
                {displayTrack.source === 'youtube' && (
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">YT</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${displayTrack.id}`, '_blank')}
                      className="h-4 w-4 p-0 text-zinc-400 hover:text-zinc-100"
                      title="Open in YouTube"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
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
              {displayIsPlaying ? (
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
          
          {/* Progress Time */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 min-w-0">
            <span className="w-10 text-right">{formatTime(displayProgress)}</span>
            <span>/</span>
            <span className="w-10">{formatTime(displayDuration)}</span>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-4 w-4 text-zinc-400" /> : <Volume2 className="h-4 w-4 text-zinc-400" />}
            </Button>
            <div className="w-20">
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}