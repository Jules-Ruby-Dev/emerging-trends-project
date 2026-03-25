/** REST API helpers for communicating with the FastAPI backend. */

import type { ChatResponse } from "./types";

// In Docker: use http://backend:8000
// In dev: use /api (with Vite proxy)
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export async function sendMessage(
  message: string,
  accessToken: string,
  sessionId?: string,
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ message, session_id: sessionId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(
      (err as { detail: string }).detail ?? "Chat request failed.",
    );
  }

  return res.json() as Promise<ChatResponse>;
}
