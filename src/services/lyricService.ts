/**
 * Service to interact with the lyrics analysis backend
 */

const BACKEND_URL = 'http://localhost:8080'; // Change to your backend URL

/**
 * Send currently playing track to the backend
 */
export const updateNowPlaying = async (track: {
  track_id: string;
  track_name: string;
  artist: string;
  album: string;
}): Promise<void> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/now-playing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(track),
    });

    if (!response.ok) {
      throw new Error(`Failed to update now playing: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating now playing:', error);
    throw error;
  }
};

/**
 * Get the currently playing track
 */
export const getNowPlaying = async (): Promise<any> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/now-playing`);
    
    if (response.status === 404) {
      return null; // No song is currently playing
    }
    
    if (!response.ok) {
      throw new Error(`Failed to get now playing: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting now playing:', error);
    throw error;
  }
};

/**
 * Send chat message to the lyrics assistant
 */
export const sendChatMessage = async (query: string): Promise<any> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send chat message: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Get play history
 */
export const getPlayHistory = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/history`);
    
    if (!response.ok) {
      throw new Error(`Failed to get play history: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting play history:', error);
    throw error;
  }
};