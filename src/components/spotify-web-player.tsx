import { useEffect, useState } from 'react';
import { storageService } from '../services/storage.service';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export function useSpotifyPlayer() {
  const [player, setPlayer] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Linkin Sync Web Player',
        getOAuthToken: (cb: (token: string) => void) => {
          const token = storageService.getAccessToken();
          if (token) {
            cb(token);
          }
        },
        volume: 0.5
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        storageService.setDeviceId(device_id);
        setIsReady(true);
      });

      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
        setIsReady(false);
      });

      player.addListener('initialization_error', ({ message }: { message: string }) => {
        setError('Failed to initialize: ' + message);
      });

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        setError('Failed to authenticate: ' + message);
      });

      player.addListener('account_error', ({ message }: { message: string }) => {
        setError('Failed to validate Spotify account: ' + message);
      });

      player.connect().then((success: boolean) => {
        if (!success) {
          setError('Failed to connect to Spotify');
        }
      });

      setPlayer(player);
    };
  }, []);

  return { player, isReady, error };
}