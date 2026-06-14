import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  // Refresh the Supabase session so it doesn't expire mid-visit
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: do not add code between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect all /{locale}/dashboard routes
  if (/^\/(he|en)\/dashboard/.test(pathname) && !user) {
    const locale = pathname.startsWith("/en") ? "en" : "he";
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  // Run next-intl middleware (handles locale detection / redirects)
  const intlResponse = intlMiddleware(request);

  // Copy any refreshed session cookies onto the intl response.
  // Must forward ALL cookie attributes (path, sameSite, secure, httpOnly,
  // maxAge, etc.) — dropping them causes the browser client to receive a
  // malformed session cookie and silently fail on every authenticated write.
  supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    intlResponse.cookies.set(name, value, options);
  });

  return intlResponse;
}

export const config = {
  matcher: ["/((?!_next|_vercel|api|.*\\..*).*)"],
};
