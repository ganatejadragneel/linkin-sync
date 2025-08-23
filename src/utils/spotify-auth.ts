// src/utils/spotify-auth.ts

import { storageService } from '../services/storage.service';

// Generate a random string for code verifier
export const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

// Generate code challenge from verifier
export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return base64encode(digest);
};

// Base64 encode
const base64encode = (input: ArrayBuffer): string => {
  const uint8Array = new Uint8Array(input);
  return btoa(Array.from(uint8Array, byte => String.fromCharCode(byte)).join(''))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

// Login function
export const initiateSpotifyLogin = async () => {
  try {
    // Clear any existing auth data
    storageService.clearAuthData();
    
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new Error('Missing client ID or redirect URI');
    }

    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store code verifier for later use
    storageService.setCodeVerifier(codeVerifier);

    const scope = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative user-top-read user-library-read';
    const authUrl = new URL("https://accounts.spotify.com/authorize");

    const params = {
      response_type: 'code',
      client_id: clientId,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
      show_dialog: 'true',
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  } catch (error) {
    console.error('Login initiation error:', error);
    throw error;
  }
};

// Get token from code
export const getAccessToken = async (code: string): Promise<any> => {
  try {
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_REDIRECT_URI;
    const codeVerifier = storageService.getCodeVerifier();

    if (!clientId || !redirectUri || !codeVerifier) {
      throw new Error('Missing required authentication parameters');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      throw new Error('Token request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get access token error:', error);
    throw error;
  }
};

// Refresh access token
export const refreshSpotifyToken = async (): Promise<any> => {
  try {
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const refreshToken = storageService.getRefreshToken();

    console.log('Refresh token function called. Client ID:', !!clientId, 'Refresh Token:', !!refreshToken);

    if (!clientId || !refreshToken) {
      throw new Error('Missing required parameters for token refresh');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // If refresh token is invalid, clear auth data
      if (errorData.error === 'invalid_grant') {
        storageService.clearAuthData();
        throw new Error('Refresh token expired. Please log in again.');
      }
      
      throw new Error(`Token refresh failed: ${errorData.error_description || errorData.error}`);
    }

    const data = await response.json();
    
    // Update stored access token
    storageService.setAccessToken(data.access_token);
    
    // Update refresh token if provided
    if (data.refresh_token) {
      storageService.setRefreshToken(data.refresh_token);
    }
    
    return data;
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (accessToken: string): Promise<any> => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

// Get album details
export const getAlbumDetails = async (albumId: string): Promise<any> => {
  try {
    const accessToken = storageService.getAccessToken();
    
    if (!accessToken) {
      throw new Error('Not authenticated. Please log in.');
    }

    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 401) {
      // Token expired or invalid
      storageService.clearAuthData();
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch album details: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Get album details error:', error);
    throw error;
  }
};

// Search for artists and get their images
export const searchArtist = async (artistName: string): Promise<any> => {
  try {
    const accessToken = storageService.getAccessToken();
    
    if (!accessToken) {
      throw new Error('Not authenticated. Please log in.');
    }

    const encodedArtistName = encodeURIComponent(artistName);
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodedArtistName}&type=artist&limit=1`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 401) {
      // Token expired or invalid
      storageService.clearAuthData();
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      throw new Error(`Failed to search artist: ${response.statusText}`);
    }

    const data = await response.json();
    return data.artists.items[0] || null;
  } catch (error) {
    console.error('Search artist error:', error);
    throw error;
  }
};

// Get artist image URL
export const getArtistImage = async (artistName: string): Promise<string | null> => {
  try {
    console.log(`Fetching image for artist: ${artistName}`);
    const artist = await searchArtist(artistName);
    
    if (artist && artist.images && artist.images.length > 0) {
      // Return the highest quality image (first one is usually the largest)
      const imageUrl = artist.images[0].url;
      console.log(`Found image for ${artistName}: ${imageUrl}`);
      return imageUrl;
    }
    
    console.log(`No images found for ${artistName}`);
    return null;
  } catch (error) {
    console.error(`Get artist image error for ${artistName}:`, error);
    return null;
  }
};