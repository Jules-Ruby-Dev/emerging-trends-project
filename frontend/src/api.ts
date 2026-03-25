/** REST API helpers for communicating with the FastAPI backend. */

import type { ChatResponse } from "./types";

// Use localhost:8000 for the backend API
const API_BASE = "http://localhost:8000";

export async function sendMessage(
  message: string,
  accessToken: string,
  sessionId?: string,
): Promise<ChatResponse> {
  const url = `${API_BASE}/chat`;
  const payload = { message, session_id: sessionId };

  console.log("sendMessage: POST", url, {
    payload,
    token: accessToken.substring(0, 10) + "...",
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    console.log("sendMessage: response status", res.status);

    if (!res.ok) {
      let err: { detail?: string };
      try {
        err = await res.json();
      } catch {
        err = { detail: `HTTP ${res.status}: ${res.statusText}` };
      }
      const errMsg =
        (err as { detail?: string }).detail ?? "Chat request failed.";
      console.error("sendMessage: error response", errMsg);
      throw new Error(errMsg);
    }

    const data = await res.json();
    console.log("sendMessage: parsed response", data);
    return data as ChatResponse;
  } catch (error: any) {
    console.error("sendMessage: fetch error", error);
    throw error;
  }
}
