import { createClient, type Session } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import {
  parseSupabaseSession,
  serializeSupabaseSession,
  supabaseSessionCookieOptions,
  SUPABASE_SESSION_COOKIE,
} from "./lib/supabase-session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const protectedRoutes = [
  "/",
  "/settings",
  "/knowledge",
  "/new-request",
  "/price-estimator",
  "/conversations",
  "/cases",
];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some(
    (route) =>
      pathname === route || (route !== "/" && pathname.startsWith(`${route}/`))
  );
}

async function getValidSession(session: Session | null) {
  if (!session?.access_token) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data } = await supabase.auth.getUser(session.access_token);

  if (data.user) {
    return session;
  }

  if (!session.refresh_token) {
    return null;
  }

  const { data: refreshed } = await supabase.auth.refreshSession({
    refresh_token: session.refresh_token,
  });

  return refreshed.session;
}

function setSessionCookie(response: NextResponse, session: Session) {
  response.cookies.set({
    ...supabaseSessionCookieOptions,
    name: SUPABASE_SESSION_COOKIE,
    value: serializeSupabaseSession(JSON.stringify(session)),
  });
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    ...supabaseSessionCookieOptions,
    name: SUPABASE_SESSION_COOKIE,
    value: "",
    maxAge: 0,
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = parseSupabaseSession(
    request.cookies.get(SUPABASE_SESSION_COOKIE)?.value
  );
  const validSession = await getValidSession(session);

  if (pathname === "/login" && validSession) {
    const response = NextResponse.redirect(new URL("/", request.url));
    setSessionCookie(response, validSession);
    return response;
  }

  if (isProtectedRoute(pathname) && !validSession) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    clearSessionCookie(response);
    return response;
  }

  const response = NextResponse.next();

  if (validSession) {
    setSessionCookie(response, validSession);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/settings",
    "/settings/:path*",
    "/knowledge",
    "/knowledge/:path*",
    "/new-request",
    "/new-request/:path*",
    "/price-estimator",
    "/price-estimator/:path*",
    "/conversations",
    "/conversations/:path*",
    "/cases",
    "/cases/:path*",
  ],
};
