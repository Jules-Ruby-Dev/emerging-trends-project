/**
 * Supabase-based authentication.
 * The Supabase client handles JWT storage in localStorage automatically.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { AuthResponse } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
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
  await getClient().auth.signOut();
}

export async function getSession(): Promise<{ access_token: string; user_id: string } | null> {
  const { data } = await getClient().auth.getSession();
  if (!data.session) return null;
  return {
    access_token: data.session.access_token,
    user_id: data.session.user.id,
  };
}
