import { useState, useEffect, useCallback } from 'react';
import { spotifyDeviceManager } from '../utils/spotify-device-manager';
import { storageService } from '../services/storage.service';

interface DeviceStatus {
  isConnected: boolean;
  isActive: boolean;
  deviceName: string | null;
  error: string | null;
}

export function useSpotifyDeviceStatus() {
  const [status, setStatus] = useState<DeviceStatus>({
    isConnected: false,
    isActive: false,
    deviceName: null,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkDeviceStatus = useCallback(async () => {
    if (!storageService.getAccessToken()) {
      setStatus({
        isConnected: false,
        isActive: false,
        deviceName: null,
        error: 'Not authenticated',
      });
      return;
    }

    try {
      setIsLoading(true);
      const webAppDevice = await spotifyDeviceManager.getWebAppDevice();
      
      if (webAppDevice) {
        setStatus({
          isConnected: true,
          isActive: webAppDevice.is_active,
          deviceName: webAppDevice.name,
          error: null,
        });
      } else {
        setStatus({
          isConnected: false,
          isActive: false,
          deviceName: null,
          error: 'Device not found',
        });
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        isActive: false,
        deviceName: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activateDevice = useCallback(async () => {
    try {
      setIsLoading(true);
      const success = await spotifyDeviceManager.ensureWebAppIsActiveDevice();
      if (success) {
        await checkDeviceStatus(); // Refresh status after activation
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to activate device:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkDeviceStatus]);

  // Check status on mount and when authentication changes
  useEffect(() => {
    checkDeviceStatus();
  }, [checkDeviceStatus]);

  // Periodically check device status
  useEffect(() => {
    const interval = setInterval(checkDeviceStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkDeviceStatus]);

  return {
    status,
    isLoading,
    checkDeviceStatus,
    activateDevice,
  };
}