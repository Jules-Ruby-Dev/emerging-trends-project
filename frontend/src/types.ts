/** Shared TypeScript types used across the frontend. */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  session_id: string;
  personality_id: string;
}

export interface Personality {
  id: string;
  name: string;
  description: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
}

export interface ApiError {
  detail: string;
}
