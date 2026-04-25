import type { Session } from "@supabase/supabase-js";

export const SUPABASE_SESSION_COOKIE = "axcell-supabase-session";
export const SUPABASE_STORAGE_KEY = "axcell-supabase-auth-token";

export const supabaseSessionCookieOptions = {
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export function serializeSupabaseSession(value: string) {
  return encodeURIComponent(value);
}

export function deserializeSupabaseSession(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseSupabaseSession(value: string | undefined): Session | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(deserializeSupabaseSession(value));

    if (parsed && typeof parsed.access_token === "string") {
      return parsed as Session;
    }
  } catch {
    return null;
  }

  return null;
}
