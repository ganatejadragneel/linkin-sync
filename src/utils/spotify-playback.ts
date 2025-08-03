import { storageService } from '../services/storage.service';
import { spotifyDeviceManager } from './spotify-device-manager';

export const startPlayback = async (uri?: string, position_ms: number = 0) => {
    try {
      const accessToken = storageService.getAccessToken();
      
      if (!accessToken) {
        throw new Error('No access token');
      }
  
      // Use the device manager for consistent device targeting
      await spotifyDeviceManager.startPlaybackOnDevice(uri, position_ms);
    } catch (error) {
      console.error('Playback error:', error);
      throw error;
    }
  };
  
  export const pausePlayback = async () => {
    try {
      const accessToken = storageService.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token');
      }
  
      await spotifyDeviceManager.pausePlayback();
    } catch (error) {
      console.error('Pause error:', error);
      throw error;
    }
  };
  
  export const skipToNext = async () => {
    try {
      const accessToken = storageService.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token');
      }
  
      await spotifyDeviceManager.skipToNext();
    } catch (error) {
      console.error('Skip next error:', error);
      throw error;
    }
  };
  
  export const skipToPrevious = async () => {
    try {
      const accessToken = storageService.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token');
      }
  
      await spotifyDeviceManager.skipToPrevious();
    } catch (error) {
      console.error('Skip previous error:', error);
      throw error;
    }
  };
  
  export const setVolume = async (volumePercent: number) => {
    try {
      const accessToken = storageService.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token');
      }
  
      await spotifyDeviceManager.setVolume(volumePercent);
    } catch (error) {
      console.error('Set volume error:', error);
      throw error;
    }
  };
  
  export const getCurrentPlayback = async () => {
    try {
      const accessToken = storageService.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token');
      }
  
      return await spotifyDeviceManager.getCurrentPlayback();
    } catch (error) {
      console.error('Get playback error:', error);
      throw error;
    }
  };