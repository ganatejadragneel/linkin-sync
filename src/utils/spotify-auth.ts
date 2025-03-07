// src/utils/spotify-auth.ts

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
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
    
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new Error('Missing client ID or redirect URI');
    }

    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store code verifier for later use
    localStorage.setItem('code_verifier', codeVerifier);

    const scope = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing';
    const authUrl = new URL("https://accounts.spotify.com/authorize");

    const params = {
      response_type: 'code',
      client_id: clientId,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
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
    const codeVerifier = localStorage.getItem('code_verifier');

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
    const accessToken = localStorage.getItem('access_token');
    
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_profile');
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