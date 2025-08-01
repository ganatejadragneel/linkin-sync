// YouTube OAuth 2.0 authentication utility

import { YOUTUBE_OAUTH_URL, YOUTUBE_TOKEN_URL } from '../constants';
import { storageService } from '../services/storage.service';
import { YouTubeTokenResponse } from '../types';

// YouTube OAuth uses traditional authorization code flow (not PKCE)

// YouTube OAuth configuration
const YOUTUBE_CLIENT_ID = process.env.REACT_APP_YOUTUBE_CLIENT_ID;
const YOUTUBE_CLIENT_SECRET = process.env.REACT_APP_YOUTUBE_CLIENT_SECRET;
const YOUTUBE_REDIRECT_URI = process.env.REACT_APP_YOUTUBE_REDIRECT_URI || `${window.location.origin}/youtube-callback`;
const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl'
].join(' ');

export class YouTubeAuth {
  private static instance: YouTubeAuth;

  public static getInstance(): YouTubeAuth {
    if (!YouTubeAuth.instance) {
      YouTubeAuth.instance = new YouTubeAuth();
    }
    return YouTubeAuth.instance;
  }

  // Start the OAuth flow
  async initiateAuth(): Promise<void> {
    if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
      throw new Error('YouTube Client ID and Secret not configured. Please set REACT_APP_YOUTUBE_CLIENT_ID and REACT_APP_YOUTUBE_CLIENT_SECRET in your environment variables.');
    }

    // For Google OAuth with client secret, we don't use PKCE
    const params = new URLSearchParams({
      client_id: YOUTUBE_CLIENT_ID,
      redirect_uri: YOUTUBE_REDIRECT_URI,
      response_type: 'code',
      scope: YOUTUBE_SCOPES,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `${YOUTUBE_OAUTH_URL}?${params.toString()}`;
    window.location.href = authUrl;
  }

  // Handle the OAuth callback
  async handleCallback(code: string): Promise<YouTubeTokenResponse> {
    if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
      throw new Error('YouTube Client ID and Secret not configured');
    }

    const tokenData = {
      client_id: YOUTUBE_CLIENT_ID,
      client_secret: YOUTUBE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: YOUTUBE_REDIRECT_URI,
    };

    console.log('YouTube token exchange request:', {
      url: YOUTUBE_TOKEN_URL,
      clientId: YOUTUBE_CLIENT_ID,
      redirectUri: YOUTUBE_REDIRECT_URI,
      hasCode: !!code,
      hasClientSecret: !!YOUTUBE_CLIENT_SECRET
    });

    const response = await fetch(YOUTUBE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube token exchange error:', errorData);
      throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
    }

    const tokenResponse: YouTubeTokenResponse = await response.json();

    // Store tokens
    storageService.setYouTubeAccessToken(tokenResponse.access_token);
    if (tokenResponse.refresh_token) {
      storageService.setYouTubeRefreshToken(tokenResponse.refresh_token);
    }

    // No code verifier to clean up in traditional OAuth flow

    return tokenResponse;
  }

  // Refresh access token
  async refreshToken(): Promise<YouTubeTokenResponse> {
    if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
      throw new Error('YouTube Client ID and Secret not configured');
    }

    const refreshToken = storageService.getYouTubeRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available. Please re-authenticate.');
    }

    const tokenData = {
      client_id: YOUTUBE_CLIENT_ID,
      client_secret: YOUTUBE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };

    const response = await fetch(YOUTUBE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // If refresh token is invalid, clear auth data
      if (errorData.error === 'invalid_grant') {
        storageService.clearYouTubeAuthData();
        throw new Error('Refresh token expired. Please log in again.');
      }
      
      throw new Error(`Token refresh failed: ${errorData.error_description || errorData.error}`);
    }

    const tokenResponse: YouTubeTokenResponse = await response.json();

    // Update stored access token
    storageService.setYouTubeAccessToken(tokenResponse.access_token);
    
    // Update refresh token if provided
    if (tokenResponse.refresh_token) {
      storageService.setYouTubeRefreshToken(tokenResponse.refresh_token);
    }

    return tokenResponse;
  }

  // Logout
  logout(): void {
    storageService.clearYouTubeAuthData();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return storageService.isYouTubeAuthenticated();
  }
}

// Export singleton instance
export const youtubeAuth = YouTubeAuth.getInstance();