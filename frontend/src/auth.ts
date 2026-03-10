/**
 * Supabase-based authentication.
 * The Supabase client handles JWT storage in localStorage automatically.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { AuthResponse } from "./types";

const API_BASE = "/api";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const LOCAL_TOKEN_KEY = "aria_dev_access_token";
const LOCAL_USER_ID_KEY = "aria_dev_user_id";

let _client: SupabaseClient | null = null;

function isConfiguredValue(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim();
  if (!v) return false;
  return !v.includes("<") && !v.includes(">");
}

function useSupabaseAuth(): boolean {
  return isConfiguredValue(SUPABASE_URL) && isConfiguredValue(SUPABASE_ANON_KEY);
}

function saveLocalSession(auth: AuthResponse): void {
  localStorage.setItem(LOCAL_TOKEN_KEY, auth.access_token);
  localStorage.setItem(LOCAL_USER_ID_KEY, auth.user_id);
}

function clearLocalSession(): void {
  localStorage.removeItem(LOCAL_TOKEN_KEY);
  localStorage.removeItem(LOCAL_USER_ID_KEY);
}

async function postAuth(path: "signin" | "signup", email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Authentication failed." }));
    throw new Error((err as { detail?: string }).detail ?? "Authentication failed.");
  }

  return res.json() as Promise<AuthResponse>;
}

function getClient(): SupabaseClient {
  if (!useSupabaseAuth()) {
    throw new Error("Supabase is not configured.");
  }
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  if (!useSupabaseAuth()) {
    const auth = await postAuth("signup", email, password);
    saveLocalSession(auth);
    return auth;
  }

  const { data, error } = await getClient().auth.signUp({ email, password });
  if (error || !data.session || !data.user) {
    throw new Error(error?.message ?? "Sign-up failed.");
  }
  return {
    access_token: data.session.access_token,
    token_type: "bearer",
    user_id: data.user.id,
  };
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  if (!useSupabaseAuth()) {
    const auth = await postAuth("signin", email, password);
    saveLocalSession(auth);
    return auth;
  }

  const { data, error } = await getClient().auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) {
    throw new Error(error?.message ?? "Sign-in failed.");
  }
  return {
    access_token: data.session.access_token,
    token_type: "bearer",
    user_id: data.user.id,
  };
}

export async function signOut(): Promise<void> {
  if (!useSupabaseAuth()) {
    clearLocalSession();
    return;
  }
  await getClient().auth.signOut();
}

export async function getSession(): Promise<{ access_token: string; user_id: string } | null> {
  if (!useSupabaseAuth()) {
    const access_token = localStorage.getItem(LOCAL_TOKEN_KEY);
    const user_id = localStorage.getItem(LOCAL_USER_ID_KEY);
    if (!access_token || !user_id) return null;
    return { access_token, user_id };
  }

  const { data } = await getClient().auth.getSession();
  if (!data.session) return null;
  return {
    access_token: data.session.access_token,
    user_id: data.session.user.id,
  };
}
