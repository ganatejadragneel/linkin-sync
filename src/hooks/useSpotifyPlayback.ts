// Custom hook for Spotify playback functionality

import { useState, useCallback, useEffect } from 'react';
import { spotifyApiService } from '../services/api';
import { SpotifyPlaybackState } from '../types';
import { useErrorHandler } from './useErrorHandler';
import { usePolling } from './usePolling';
import { POLLING_INTERVALS } from '../constants';

interface UseSpotifyPlaybackOptions {
  enablePolling?: boolean;
  pollingInterval?: number;
}

export const useSpotifyPlayback = (options: UseSpotifyPlaybackOptions = {}) => {
  const {
    enablePolling = true,
    pollingInterval = POLLING_INTERVALS.PLAYBACK_STATE,
  } = options;

  const [playbackState, setPlaybackState] = useState<SpotifyPlaybackState | null>(null);
  const [loading, setLoading] = useState(false);
  const { handleError } = useErrorHandler();

  // Fetch playback state
  const fetchPlaybackState = useCallback(async () => {
    try {
      const state = await spotifyApiService.getPlaybackState();
      setPlaybackState(state);
    } catch (error) {
      handleError(error, { showToast: false });
    }
  }, [handleError]);

  // Polling for playback state
  usePolling(fetchPlaybackState, {
    interval: pollingInterval,
    enabled: enablePolling,
    immediate: true,
  });

  // Playback controls
  const play = useCallback(async (deviceId?: string) => {
    setLoading(true);
    try {
      await spotifyApiService.play(deviceId);
      // Fetch updated state after a short delay
      setTimeout(fetchPlaybackState, POLLING_INTERVALS.PLAYBACK_INIT_DELAY);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [fetchPlaybackState, handleError]);

  const pause = useCallback(async (deviceId?: string) => {
    setLoading(true);
    try {
      await spotifyApiService.pause(deviceId);
      setTimeout(fetchPlaybackState, POLLING_INTERVALS.PLAYBACK_INIT_DELAY);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [fetchPlaybackState, handleError]);

  const skipToNext = useCallback(async (deviceId?: string) => {
    setLoading(true);
    try {
      await spotifyApiService.skipToNext(deviceId);
      setTimeout(fetchPlaybackState, POLLING_INTERVALS.PLAYBACK_INIT_DELAY);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [fetchPlaybackState, handleError]);

  const skipToPrevious = useCallback(async (deviceId?: string) => {
    setLoading(true);
    try {
      await spotifyApiService.skipToPrevious(deviceId);
      setTimeout(fetchPlaybackState, POLLING_INTERVALS.PLAYBACK_INIT_DELAY);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [fetchPlaybackState, handleError]);

  const setVolume = useCallback(async (volume: number, deviceId?: string) => {
    try {
      await spotifyApiService.setVolume(volume, deviceId);
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const seek = useCallback(async (positionMs: number, deviceId?: string) => {
    try {
      await spotifyApiService.seek(positionMs, deviceId);
      setTimeout(fetchPlaybackState, POLLING_INTERVALS.PLAYBACK_INIT_DELAY);
    } catch (error) {
      handleError(error);
    }
  }, [fetchPlaybackState, handleError]);

  const setShuffle = useCallback(async (state: boolean, deviceId?: string) => {
    try {
      await spotifyApiService.setShuffle(state, deviceId);
      setTimeout(fetchPlaybackState, POLLING_INTERVALS.PLAYBACK_INIT_DELAY);
    } catch (error) {
      handleError(error);
    }
  }, [fetchPlaybackState, handleError]);

  const setRepeat = useCallback(async (
    state: 'off' | 'track' | 'context',
    deviceId?: string
  ) => {
    try {
      await spotifyApiService.setRepeat(state, deviceId);
      setTimeout(fetchPlaybackState, POLLING_INTERVALS.PLAYBACK_INIT_DELAY);
    } catch (error) {
      handleError(error);
    }
  }, [fetchPlaybackState, handleError]);

  return {
    playbackState,
    loading,
    isPlaying: playbackState?.is_playing || false,
    currentTrack: playbackState?.item || null,
    // Controls
    play,
    pause,
    skipToNext,
    skipToPrevious,
    setVolume,
    seek,
    setShuffle,
    setRepeat,
    // Utilities
    fetchPlaybackState,
  };
};