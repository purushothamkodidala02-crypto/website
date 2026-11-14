import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolvePublicPermanentRedirect } from "@/lib/public-redirect";

function buildContentSecurityPolicy(nonce?: string) {
  const isDevelopment = process.env.NODE_ENV === "development";
  let supabaseOrigin = "https://*.supabase.co";
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      supabaseOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
    }
  } catch {
    // Keep fallback
  }

  const scriptPolicy = nonce
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://sdk.cashfree.com https://accounts.google.com https://us-assets.i.posthog.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net${isDevelopment ? " 'unsafe-eval'" : ""}`
    : `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://sdk.cashfree.com https://accounts.google.com https://us-assets.i.posthog.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net${isDevelopment ? " 'unsafe-eval'" : ""}`;

  return [
    "default-src 'self'",
    scriptPolicy,
    "style-src 'self' 'unsafe-inline' https://accounts.google.com",
    `img-src 'self' data: blob: ${supabaseOrigin} https://www.googletagmanager.com https://*.google-analytics.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.g.doubleclick.net https://*.google.com`,
    "font-src 'self' data:",
    `connect-src 'self' ${supabaseOrigin} https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com https://static.cloudflareinsights.com https://accounts.google.com https://api.cashfree.com https://sandbox.cashfree.com https://payments.cashfree.com https://us.i.posthog.com https://www.googletagmanager.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://stats.g.doubleclick.net https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://api.cashfree.com https://sandbox.cashfree.com https://payments.cashfree.com",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    "frame-src https://challenges.cloudflare.com https://accounts.google.com https://api.cashfree.com https://sandbox.cashfree.com https://payments.cashfree.com https://googleads.g.doubleclick.net https://*.googlesyndication.com",
    ...(!isDevelopment ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

const BLOCKED_BOT_REGEX =
  /\b(bytespider|petalbot|gptbot|claudebot|anthropic-ai|semrushbot|ahrefsbot|dotbot|mj12bot|ccbot|amazonbot|dataforseobool|dataforseobot|megaindex|blexbot|screaming frog|zoominfobot|turnitin|cohere-ai|yandexbot|seekport|serpstat)\b/i;

const SUSPICIOUS_PATH_REGEX =
  /\.(php|env|git|asp|aspx|jsp|cgi|bak|sql|config|yml|yaml)$|wp-(login|admin|content|includes)|\/(phpmyadmin|pma|adminer|alfa|setup|actuator)/i;

export async function proxy(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  if (BLOCKED_BOT_REGEX.test(userAgent)) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  }

  if (SUSPICIOUS_PATH_REGEX.test(request.nextUrl.pathname)) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  }

  const permanentDestination = await resolvePublicPermanentRedirect(request);
  if (permanentDestination === "not-found") {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }
  if (permanentDestination && permanentDestination.href !== request.nextUrl.href) {
    return NextResponse.redirect(permanentDestination, 308);
  }

  const needsNonce = request.nextUrl.pathname.startsWith("/billing/cashfree");
  const nonce = needsNonce ? btoa(crypto.randomUUID()) : undefined;
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  if (nonce) requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);

  // Attempt pages are live assessment runs that require fresh authentication cookies
  const isExamAttemptRoute = request.nextUrl.pathname.includes("/attempt");

  // Anonymous public catalogue traffic and auth handler routes do not need Supabase Auth round-trip
  if (
    !isExamAttemptRoute &&
    (request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname.startsWith("/auth/") ||
      request.nextUrl.pathname.startsWith("/mock-tests") ||
      request.nextUrl.pathname.startsWith("/terms-and-conditions") ||
      request.nextUrl.pathname.startsWith("/privacy-policy") ||
      request.nextUrl.pathname.startsWith("/refunds-and-cancellations") ||
      request.nextUrl.pathname.startsWith("/support"))
  ) {
    return response;
  }

  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token"));

  // Fast-path redirect for unauthenticated dashboard or attempt access
  if ((request.nextUrl.pathname.startsWith("/dashboard") || isExamAttemptRoute) && !hasAuthCookie) {
    const loginUrl = new URL("/login", request.url);
    const search = request.nextUrl.search;
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${search}`);
    const redirectResponse = NextResponse.redirect(loginUrl, 307);
    redirectResponse.headers.set("Content-Security-Policy", contentSecurityPolicy);
    return redirectResponse;
  }

  // Public auth pages do not need Supabase getUser() round-trip in middleware
  const isPublicAuthPage =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/register" ||
    request.nextUrl.pathname === "/forgot-password" ||
    request.nextUrl.pathname === "/reset-password";

  if (isPublicAuthPage) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          requestHeaders.set("cookie", request.headers.get("cookie") ?? "");
          response = NextResponse.next({
            request: { headers: requestHeaders },
          });
          response.headers.set("Content-Security-Policy", contentSecurityPolicy);
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export { proxy as middleware };
export default proxy;

export const config = {
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|ads.txt|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|ico)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
