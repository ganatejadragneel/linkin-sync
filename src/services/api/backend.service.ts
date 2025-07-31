// Backend API service

import { BaseApiService } from './base.service';
import { BACKEND_API_BASE_URL, BACKEND_ENDPOINTS } from '../../constants';
import {
  NowPlaying,
  PlayHistory,
  ChatMessage,
  ChatRequest,
  ChatResponse,
} from '../../types';

class BackendApiService extends BaseApiService {
  constructor() {
    super(BACKEND_API_BASE_URL);
  }

  // Now Playing endpoints  
  async updateNowPlaying(track: { id: string; name: string; artist: string; album: string }): Promise<void> {
    await this.post(BACKEND_ENDPOINTS.NOW_PLAYING, track);
  }

  async getNowPlaying(): Promise<NowPlaying | null> {
    try {
      const response = await this.get<NowPlaying>(BACKEND_ENDPOINTS.NOW_PLAYING);
      return response.data;
    } catch (error: any) {
      if (error.code === '404') {
        return null;
      }
      throw error;
    }
  }

  // Play History endpoints
  async getPlayHistory(): Promise<PlayHistory[]> {
    const response = await this.get<PlayHistory[]>(BACKEND_ENDPOINTS.PLAY_HISTORY);
    return response.data;
  }

  // Chat endpoints
  async sendChatQuery(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.post<ChatResponse>(BACKEND_ENDPOINTS.CHAT, request);
    return response.data;
  }

  // Global Chat endpoints
  async getGlobalChatMessages(): Promise<ChatMessage[]> {
    const response = await this.get<ChatMessage[]>(BACKEND_ENDPOINTS.GLOBAL_CHAT);
    return response.data;
  }

  async sendGlobalChatMessage(message: {
    user_email: string;
    username: string;
    text: string;
  }): Promise<ChatMessage> {
    const response = await this.post<ChatMessage>(BACKEND_ENDPOINTS.GLOBAL_CHAT, message);
    return response.data;
  }
}

// Export singleton instance
export const backendApiService = new BackendApiService();