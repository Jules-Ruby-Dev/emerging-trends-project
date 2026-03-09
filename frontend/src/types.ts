/** Shared TypeScript types used across the frontend. */

export interface ChatMessage {
  role: "user" | "aria";
  content: string;
}

export interface ChatResponse {
  reply: string;
  session_id: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
}

export interface ApiError {
  detail: string;
}
