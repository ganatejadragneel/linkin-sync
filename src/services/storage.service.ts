// Storage service abstraction for localStorage operations

import { STORAGE_KEYS } from '../constants';
import { SpotifyUserProfile } from '../types';

class StorageService {
  // Generic methods
  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  }

  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return null;
    }
  }

  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage:`, error);
    }
  }

  // Auth related methods
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  getCodeVerifier(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);
  }

  setCodeVerifier(verifier: string): void {
    localStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, verifier);
  }

  // User related methods
  getUserProfile(): SpotifyUserProfile | null {
    return this.getItem<SpotifyUserProfile>(STORAGE_KEYS.USER_PROFILE);
  }

  setUserProfile(profile: SpotifyUserProfile): void {
    this.setItem(STORAGE_KEYS.USER_PROFILE, profile);
  }

  // Device related methods
  getDeviceId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  }

  setDeviceId(deviceId: string): void {
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  }

  // YouTube Auth methods
  getYouTubeAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.YOUTUBE_ACCESS_TOKEN);
  }

  setYouTubeAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.YOUTUBE_ACCESS_TOKEN, token);
  }

  getYouTubeRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.YOUTUBE_REFRESH_TOKEN);
  }

  setYouTubeRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.YOUTUBE_REFRESH_TOKEN, token);
  }

  getYouTubeCodeVerifier(): string | null {
    return localStorage.getItem(STORAGE_KEYS.YOUTUBE_CODE_VERIFIER);
  }

  setYouTubeCodeVerifier(verifier: string): void {
    localStorage.setItem(STORAGE_KEYS.YOUTUBE_CODE_VERIFIER, verifier);
  }

  // Clear methods
  clearAuthData(): void {
    this.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    this.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    this.removeItem(STORAGE_KEYS.USER_PROFILE);
    this.removeItem(STORAGE_KEYS.CODE_VERIFIER);
  }

  clearYouTubeAuthData(): void {
    this.removeItem(STORAGE_KEYS.YOUTUBE_ACCESS_TOKEN);
    this.removeItem(STORAGE_KEYS.YOUTUBE_REFRESH_TOKEN);
    this.removeItem(STORAGE_KEYS.YOUTUBE_CODE_VERIFIER);
    this.removeItem(STORAGE_KEYS.YOUTUBE_USER_PROFILE);
  }

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.removeItem(key);
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  isYouTubeAuthenticated(): boolean {
    return !!this.getYouTubeAccessToken();
  }
}

// Export singleton instance
export const storageService = new StorageService();