// Chat related type definitions

export interface ChatMessage {
  id: number | string;  // Handle both number and string for int64 compatibility
  user_email: string;
  username: string;
  text: string;
  created_at: string;
}

export interface ChatRequest {
  query: string;  // Only field backend expects
}

export interface ChatResponse {
  answer?: string;  // Backend returns 'answer' field
  response?: string;  // Fallback for compatibility
  error?: string;
}