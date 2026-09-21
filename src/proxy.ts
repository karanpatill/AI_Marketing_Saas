import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh user session if exists
  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isOnboardingPage = request.nextUrl.pathname.startsWith("/onboarding");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

  // Redirect to login if user is not authenticated and trying to access protected paths
  if (!user && (isDashboardPage || isOnboardingPage)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if logged-in user is trying to access the login/auth page
  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Pages that need a session check, plus API routes so an expired access token is
     * refreshed before requireAuth() runs (see commit 64aaedc). Static assets are skipped.
     */
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/auth",
    "/api/:path*",
  ],
};
