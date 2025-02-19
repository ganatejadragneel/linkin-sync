export const startPlayback = async (uri?: string, position_ms: number = 0) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token');
      }
  
      // Get current playback state first to check for active device
      const currentPlayback = await getCurrentPlayback();
      if (!currentPlayback?.device?.id) {
        throw new Error('No active Spotify device found. Please open Spotify on any device.');
      }
  
      const body = uri ? {
        uris: [uri],
        position_ms
      } : undefined;
  
      const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined
      });
  
      if (response.status === 404) {
        throw new Error('No active device found');
      }
  
      if (!response.ok) {
        throw new Error('Failed to start playback');
      }
    } catch (error) {
      console.error('Playback error:', error);
      throw error;
    }
  };
  
  export const pausePlayback = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token');
      }
  
      const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to pause playback');
      }
    } catch (error) {
      console.error('Pause error:', error);
      throw error;
    }
  };
  
  export const skipToNext = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token');
      }
  
      const response = await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to skip to next track');
      }
    } catch (error) {
      console.error('Skip next error:', error);
      throw error;
    }
  };
  
  export const skipToPrevious = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token');
      }
  
      const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to skip to previous track');
      }
    } catch (error) {
      console.error('Skip previous error:', error);
      throw error;
    }
  };
  
  export const setVolume = async (volumePercent: number) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token');
      }
  
      const response = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volumePercent}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to set volume');
      }
    } catch (error) {
      console.error('Set volume error:', error);
      throw error;
    }
  };
  
  export const getCurrentPlayback = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token');
      }
  
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      if (response.status === 204) {
        return null; // No active playback
      }
  
      if (!response.ok) {
        throw new Error('Failed to get current playback');
      }
  
      return response.json();
    } catch (error) {
      console.error('Get playback error:', error);
      throw error;
    }
  };