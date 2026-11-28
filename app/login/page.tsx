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
      ? "Account updated. Sign in below to continue."
      : params.confirmed === "1"
      ? "Email confirmed. Sign in below to continue to your mock test."
      : undefined;
  const initialError = params.oauth_error === "1"
    ? "Sign-in could not be completed. Please try again."
    : undefined;

  return (
    <main className="student-page min-h-screen bg-[#f6faf8] w-full max-w-full overflow-x-hidden">
      <link rel="preconnect" href="https://accounts.google.com" />
      <link rel="dns-prefetch" href="https://accounts.google.com" />
      <link rel="preconnect" href="https://eauomwkwaxqpvzogdltq.supabase.co" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://eauomwkwaxqpvzogdltq.supabase.co" />
      <PublicHeader compact />
      <div className="mx-auto grid max-w-5xl gap-5 py-5 pl-[max(0.875rem,env(safe-area-inset-left,0px))] pr-[max(0.875rem,env(safe-area-inset-right,0px))] sm:gap-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14 md:grid-cols-[0.9fr_1.1fr] md:items-start">
        <aside className="order-2 md:order-1 min-w-0 rounded-2xl sm:rounded-3xl border border-[#cfe2db] bg-gradient-to-br from-[#ebf4f1] via-[#f5faf8] to-[#edf6f3] p-5 sm:p-7 text-[#132621] shadow-2xs md:sticky md:top-24">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0f766e]">
            Varadhi Prep · Free Mock Tests
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-[#132621]">
            Practice smarter for TG &amp; AP exams.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#4b635c]">
            Attempt syllabus-aligned tests, analyze detailed explanations, and track topic-wise accuracy — 100% free and ad-free.
          </p>
          <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-[#1e3a33]">
            <li className="flex items-start gap-2.5 rounded-xl border border-[#dceae5] bg-white/85 px-3.5 py-2.5 shadow-2xs">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#0f766e]" aria-hidden="true" />
              <span>Saved exam timers and question progress across every attempt</span>
            </li>
            <li className="flex items-start gap-2.5 rounded-xl border border-[#dceae5] bg-white/85 px-3.5 py-2.5 shadow-2xs">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#0f766e]" aria-hidden="true" />
              <span>Bilingual English &amp; Telugu papers with clear solutions</span>
            </li>
            <li className="flex items-start gap-2.5 rounded-xl border border-[#dceae5] bg-white/85 px-3.5 py-2.5 shadow-2xs">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#0f766e]" aria-hidden="true" />
              <span>Personal Mistake Book &amp; Bookmarks synced automatically</span>
            </li>
          </ul>
          <Link
            href="/mock-tests"
            className="mt-6 inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#cfe2db] bg-white px-4 py-2 text-sm font-bold text-[#0f766e] shadow-2xs transition hover:border-[#0f766e]/40 hover:bg-[#f0fdfa]"
          >
            Explore mock tests →
          </Link>
        </aside>
        <div className="order-1 md:order-2 min-w-0">
          <LoginForm nextPath={nextPath} initialMessage={initialMessage} initialError={initialError} />
        </div>
      </div>
    </main>
  );
}
