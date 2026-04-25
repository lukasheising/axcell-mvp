import { createClient } from "@supabase/supabase-js";
import {
  serializeSupabaseSession,
  SUPABASE_SESSION_COOKIE,
  SUPABASE_STORAGE_KEY,
} from "./supabase-session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const isBrowser = typeof window !== "undefined";

function setSessionCookie(value: string) {
  document.cookie = `${SUPABASE_SESSION_COOKIE}=${serializeSupabaseSession(
    value
  )}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
}

function clearSessionCookie() {
  document.cookie = `${SUPABASE_SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

const sessionStorage = {
  getItem(key: string) {
    if (!isBrowser) {
      return null;
    }

    const value = window.localStorage.getItem(key);

    if (key === SUPABASE_STORAGE_KEY && value) {
      setSessionCookie(value);
    }

    return value;
  },
  setItem(key: string, value: string) {
    if (!isBrowser) {
      return;
    }

    window.localStorage.setItem(key, value);

    if (key === SUPABASE_STORAGE_KEY) {
      setSessionCookie(value);
    }
  },
  removeItem(key: string) {
    if (!isBrowser) {
      return;
    }

    window.localStorage.removeItem(key);

    if (key === SUPABASE_STORAGE_KEY) {
      clearSessionCookie();
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
    storageKey: SUPABASE_STORAGE_KEY,
    storage: sessionStorage,
  },
});
