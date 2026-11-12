import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";
import { createClient } from "@/lib/supabase/server";
import { clearActiveSessionToken, verifyActiveSession } from "@/lib/auth/single-session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Student Login",
  robots: { index: false, follow: true },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[];
    confirmed?: string | string[];
    reset?: string | string[];
    oauth_error?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const requestedPath = typeof params.next === "string" ? params.next : undefined;
  const nextPath =
    requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
      ? requestedPath
      : "/";

  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

  if (hasAuthCookie && params.confirmed !== "1" && params.reset !== "1") {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const activeCheck = await verifyActiveSession(supabase, user.id);
      if (!activeCheck.valid) {
        // Displaced session from another device: clear stale session token so login form renders immediately
        await clearActiveSessionToken();
      } else {
        if (activeCheck.role === "admin") {
          const { data: assurance } =
            await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          redirect(assurance?.currentLevel === "aal2" ? "/admin" : "/admin-mfa");
        }
        redirect(nextPath);
      }
    }
  }
  const initialMessage =
    params.reset === "1"
      ? "Password updated. Sign in with your new password to continue."
      : params.confirmed === "1"
      ? "Email confirmed. Sign in to continue to your mock test."
      : undefined;
  const initialError = params.oauth_error === "1"
    ? "Google sign-in could not be completed. Please try again or use email sign-in."
    : undefined;

  return (
    <main className="student-page min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden">
      <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
      <link rel="preconnect" href="https://eauomwkwaxqpvzogdltq.supabase.co" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://eauomwkwaxqpvzogdltq.supabase.co" />
      <PublicHeader compact />
      <div className="mx-auto grid max-w-5xl gap-5 py-5 pl-[max(0.875rem,env(safe-area-inset-left,0px))] pr-[max(0.875rem,env(safe-area-inset-right,0px))] sm:gap-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14 md:grid-cols-[0.86fr_1.14fr] md:items-start">
        <aside className="order-2 md:order-1 min-w-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0a2922] via-[#0e3a30] to-[#144d40] p-5 sm:p-7 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900/40 md:sticky md:top-24">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-200">
            Welcome back
          </p>
          <h2 className="mt-2.5 text-2xl sm:text-3xl font-black tracking-tight">
            Continue your preparation.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-200/90">
            Sign in once to pick up your timed tests, detailed solutions, and
            subject analytics right where you left off.
          </p>
          <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-teal-50/95">
            <li className="flex items-start gap-2.5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-300" aria-hidden="true" />
              <span>Resume saved exam timers and question progress seamlessly</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-300" aria-hidden="true" />
              <span>Review bilingual answers, accuracy, and mistake bookmarked notes</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-300" aria-hidden="true" />
              <span>Quick sign-in with Google, password, or a 6-digit email code</span>
            </li>
          </ul>
          <Link
            href="/mock-tests"
            className="mt-6 inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-sm font-bold text-teal-100 ring-1 ring-white/15 transition hover:bg-white/15 hover:text-white"
          >
            Browse available tests →
          </Link>
        </aside>
        <div className="order-1 md:order-2 min-w-0">
          <LoginForm nextPath={nextPath} initialMessage={initialMessage} initialError={initialError} />
        </div>
      </div>
    </main>
  );
}
