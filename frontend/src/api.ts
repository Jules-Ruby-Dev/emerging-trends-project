/** REST API helpers for communicating with the FastAPI backend. */

import type { ChatResponse, Personality } from "./types";

const API_BASE = "/api";

export async function sendMessage(
  message: string,
  accessToken: string,
  sessionId?: string,
  personalityId?: string,
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      personality_id: personalityId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error((err as { detail: string }).detail ?? "Chat request failed.");
  }

  return res.json() as Promise<ChatResponse>;
}

export async function getPersonalities(): Promise<Personality[]> {
  const res = await fetch(`${API_BASE}/personalities`, {
    method: "GET",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error((err as { detail: string }).detail ?? "Unable to load personalities.");
  }

  return res.json() as Promise<Personality[]>;
}
