/**
 * Refactored Lyric Service using backend API service
 * Legacy service for backward compatibility - will be deprecated
 */

import { backendApiService } from './api';
import { NowPlaying, PlayHistory } from '../types';

/**
 * Send currently playing track to the backend
 * @deprecated Use backendApiService.updateNowPlaying() instead
 */
export const updateNowPlaying = async (track: {
  id: string;
  name: string;
  artist: string;
  album: string;
}): Promise<void> => {
  // Convert to backend SpotifyTrack format (the parameter is already in correct format)
  await backendApiService.updateNowPlaying(track);
};

/**
 * Get the currently playing track
 * @deprecated Use backendApiService.getNowPlaying() instead
 */
export const getNowPlaying = async (): Promise<NowPlaying | null> => {
  return await backendApiService.getNowPlaying();
};

/**
 * Send chat message to the lyrics assistant
 * @deprecated Use backendApiService.sendChatQuery() instead
 */
export const sendChatMessage = async (query: string): Promise<any> => {
  const response = await backendApiService.sendChatQuery({ query });
  return response;
};

/**
 * Get play history
 * @deprecated Use backendApiService.getPlayHistory() instead
 */
export const getPlayHistory = async (): Promise<PlayHistory[]> => {
  return await backendApiService.getPlayHistory();
};