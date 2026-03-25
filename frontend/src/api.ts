/** REST API helpers for communicating with the FastAPI backend. */

import type { ChatResponse, Personality } from "./types";

// Use localhost:8000 for the backend API
const API_BASE = "http://localhost:8000";

export interface HistorySession {
  session_id: string;
  title: string;
  preview: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface HistoryDetail {
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
}

export async function sendMessage(
  message: string,
  accessToken: string,
  sessionId?: string,
  personalityId?: string,
): Promise<ChatResponse> {
  // Chris Part
  // const url = `${API_BASE}/chat`;
  // const payload: any = { message, session_id: sessionId };
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

  // Add personality if provided
  if (personalityId) {
    payload.personality_id = personalityId;
  }

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

export async function getHistorySessions(
  accessToken: string,
  limit: number = 50,
): Promise<HistorySession[]> {
  const url = `${API_BASE}/history/sessions?limit=${limit}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch history: ${res.statusText}`);
    }

    const data = await res.json();
    return data as HistorySession[];
  } catch (error) {
    console.error("getHistorySessions: error", error);
    throw error;
  }
}

export async function getSessionDetail(
  sessionId: string,
  accessToken: string,
): Promise<HistoryDetail> {
  const url = `${API_BASE}/history/${sessionId}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch session: ${res.statusText}`);
    }

    const data = await res.json();
    return data as HistoryDetail;
  } catch (error) {
    console.error("getSessionDetail: error", error);
    throw error;
  }
}

export async function deleteSession(
  sessionId: string,
  accessToken: string,
): Promise<void> {
  const url = `${API_BASE}/history/${sessionId}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to delete session: ${res.statusText}`);
    }
  } catch (error) {
    console.error("deleteSession: error", error);
    throw error;
  }
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
