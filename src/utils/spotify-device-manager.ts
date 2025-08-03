import { storageService } from '../services/storage.service';

interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

interface DevicesResponse {
  devices: SpotifyDevice[];
}

export class SpotifyDeviceManager {
  private static instance: SpotifyDeviceManager;

  static getInstance(): SpotifyDeviceManager {
    if (!SpotifyDeviceManager.instance) {
      SpotifyDeviceManager.instance = new SpotifyDeviceManager();
    }
    return SpotifyDeviceManager.instance;
  }

  private async makeSpotifyRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = storageService.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return response;
  }

  async getAvailableDevices(): Promise<SpotifyDevice[]> {
    try {
      const response = await this.makeSpotifyRequest('/me/player/devices');
      
      if (!response.ok) {
        throw new Error(`Failed to get devices: ${response.status}`);
      }

      const data: DevicesResponse = await response.json();
      return data.devices;
    } catch (error) {
      console.error('Error getting available devices:', error);
      throw error;
    }
  }

  async getWebAppDevice(): Promise<SpotifyDevice | null> {
    const devices = await this.getAvailableDevices();
    const webAppDeviceId = storageService.getDeviceId();
    
    if (!webAppDeviceId) {
      return null;
    }

    return devices.find(device => device.id === webAppDeviceId) || null;
  }

  async isWebAppDeviceActive(): Promise<boolean> {
    try {
      const webAppDevice = await this.getWebAppDevice();
      return webAppDevice?.is_active || false;
    } catch (error) {
      console.error('Error checking if webapp device is active:', error);
      return false;
    }
  }

  async transferPlaybackToWebApp(): Promise<boolean> {
    try {
      const webAppDeviceId = storageService.getDeviceId();
      
      if (!webAppDeviceId) {
        throw new Error('No webapp device ID available');
      }

      // Check if device exists and is available
      const webAppDevice = await this.getWebAppDevice();
      if (!webAppDevice) {
        throw new Error('Webapp device not found in available devices');
      }

      // If already active, no need to transfer
      if (webAppDevice.is_active) {
        return true;
      }

      // Transfer playback to webapp
      const response = await this.makeSpotifyRequest('/me/player', {
        method: 'PUT',
        body: JSON.stringify({
          device_ids: [webAppDeviceId],
          play: false // Don't start playing immediately
        })
      });

      if (response.status === 204) {
        // Success - 204 is expected for device transfer
        return true;
      } else if (response.status === 404) {
        // No active device to transfer from - this is okay
        return true;
      } else if (!response.ok) {
        throw new Error(`Failed to transfer playback: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error transferring playback to webapp:', error);
      return false;
    }
  }

  async ensureWebAppIsActiveDevice(): Promise<boolean> {
    try {
      const isActive = await this.isWebAppDeviceActive();
      
      if (isActive) {
        return true;
      }

      // Try to transfer playback to webapp
      return await this.transferPlaybackToWebApp();
    } catch (error) {
      console.error('Error ensuring webapp is active device:', error);
      return false;
    }
  }

  async startPlaybackOnDevice(uri?: string, position_ms: number = 0): Promise<void> {
    const webAppDeviceId = storageService.getDeviceId();
    
    if (!webAppDeviceId) {
      throw new Error('No webapp device available');
    }

    // Ensure webapp is the active device
    const isReady = await this.ensureWebAppIsActiveDevice();
    if (!isReady) {
      throw new Error('Could not activate webapp as playback device');
    }

    const body = uri ? {
      uris: [uri],
      position_ms,
    } : {};

    const response = await this.makeSpotifyRequest(`/me/player/play?device_id=${webAppDeviceId}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text();
      throw new Error(`Failed to start playback: ${response.status} - ${errorText}`);
    }
  }

  async getCurrentPlayback() {
    try {
      const response = await this.makeSpotifyRequest('/me/player');

      if (response.status === 204) {
        return null; // No active playback
      }

      if (!response.ok) {
        throw new Error(`Failed to get current playback: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting current playback:', error);
      throw error;
    }
  }

  async pausePlayback(): Promise<void> {
    const response = await this.makeSpotifyRequest('/me/player/pause', {
      method: 'PUT'
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to pause playback: ${response.status}`);
    }
  }

  async skipToNext(): Promise<void> {
    const response = await this.makeSpotifyRequest('/me/player/next', {
      method: 'POST'
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to skip to next: ${response.status}`);
    }
  }

  async skipToPrevious(): Promise<void> {
    const response = await this.makeSpotifyRequest('/me/player/previous', {
      method: 'POST'
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to skip to previous: ${response.status}`);
    }
  }

  async setVolume(volumePercent: number): Promise<void> {
    const response = await this.makeSpotifyRequest(`/me/player/volume?volume_percent=${volumePercent}`, {
      method: 'PUT'
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to set volume: ${response.status}`);
    }
  }
}

// Export singleton instance
export const spotifyDeviceManager = SpotifyDeviceManager.getInstance();