"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { TurnstileChallenge } from "@/components/auth/TurnstileChallenge";
import { LongPendingNotice, PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { loginWithPassword, type LoginResult } from "./actions";
import { EmailOtpLoginForm } from "./EmailOtpLoginForm";

type Notice = {
  tone: "error" | "success" | "info";
  message: string;
};

const noticeStyles = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
};

export function LoginForm({
  nextPath,
  initialMessage,
  initialError,
}: {
  nextPath: string;
  initialMessage?: string;
  initialError?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<Notice | null>(
    initialError
      ? { tone: "error", message: initialError }
      : initialMessage
        ? { tone: "success", message: initialMessage }
        : null,
  );
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const registerHref = `/register?next=${encodeURIComponent(nextPath)}`;
  const forgotPasswordHref = `/forgot-password?next=${encodeURIComponent(nextPath)}`;

  if (loginMethod === "otp") {
    return <EmailOtpLoginForm nextPath={nextPath} onUsePassword={() => setLoginMethod("password")} />;
  }

  function confirmationRedirectUrl() {
    const redirectUrl = new URL("/login", window.location.origin);
    redirectUrl.searchParams.set("next", nextPath);
    redirectUrl.searchParams.set("confirmed", "1");
    return redirectUrl.toString();
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setNeedsConfirmation(false);
    setUserNotFound(false);
    setNotice(null);
    const normalizedEmail = email.trim().toLowerCase();
    let result: LoginResult;
    try {
      result = await loginWithPassword({
        email: normalizedEmail,
        password,
        captchaToken: captchaToken ?? "",
        nextPath,
      });
    } catch {
      setCaptchaToken(null);
      setCaptchaResetKey((value) => value + 1);
      setNotice({ tone: "error", message: "The login service did not respond. Refresh the page and try again." });
      setLoading(false);
      return;
    }

    setCaptchaToken(null);
    setCaptchaResetKey((value) => value + 1);

    if (!result.success || !result.redirectTo) {
      const emailNotConfirmed = result.code === "email_not_confirmed";
      const isNotFound = result.code === "user_not_found";
      setNeedsConfirmation(emailNotConfirmed);
      setUserNotFound(isNotFound);
      setNotice({
        tone: emailNotConfirmed ? "info" : "error",
        message: result.message ?? "Sign-in could not be completed. Please try again.",
      });
      setLoading(false);
      return;
    }
    window.location.replace(result.redirectTo);
  }

  async function resendConfirmation() {
    if (!email.trim()) {
      setNotice({ tone: "error", message: "Enter your email address first." });
      return;
    }

    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: confirmationRedirectUrl(),
        captchaToken: captchaToken ?? undefined,
      },
    });

    setCaptchaToken(null);
    setCaptchaResetKey((value) => value + 1);

    setNotice(
      error
        ? {
            tone: "error",
            message:
              error.code === "over_email_send_rate_limit"
                ? "Please wait a few minutes before requesting another email."
                : "We could not resend the confirmation email. Please try again shortly.",
          }
        : {
            tone: "success",
            message: "A new confirmation email was requested. Check your inbox and spam folder.",
          },
    );
    setResending(false);
  }

  return (
    <section className="min-w-0 rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">
        Student login
      </p>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
        Sign in to continue
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Continue with Google, or use your registered email credentials.
      </p>
      <div className="mt-6">
        <GoogleSignInButton nextPath={nextPath} />
      </div>
      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">or use email</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <button type="button" onClick={() => setLoginMethod("otp")} className="w-full rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-800 hover:bg-teal-100">Sign in using a six-digit email code</button>
      <form onSubmit={handleLogin} className="mt-7 space-y-5">
        <label htmlFor="login_email" className="block text-sm font-bold text-slate-800">
          Email
          <input id="login_email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" />
        </label>
        <div>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="current_password" className="text-sm font-bold text-slate-800">
              Password
            </label>
            <Link
              href={forgotPasswordHref}
              className="text-xs font-bold text-teal-700 hover:text-teal-800"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="current_password" required maxLength={72} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
        </div>
        <TurnstileChallenge onToken={setCaptchaToken} resetKey={captchaResetKey} />
        <button type="submit" disabled={loading || !captchaToken} aria-busy={loading} className="w-full rounded-xl bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
          <PendingButtonContent pending={loading} pendingLabel="Signing in…">Sign in and continue</PendingButtonContent>
        </button>
        <LongPendingNotice pending={loading} />
        {notice && (
          <div
            aria-live="polite"
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${noticeStyles[notice.tone]}`}
          >
            <p>{notice.message}</p>
            {userNotFound && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-red-200/70 pt-2.5">
                <span className="text-xs text-red-800">
                  New to Varadhi Prep?
                </span>
                <Link
                  href={`/register?email=${encodeURIComponent(email.trim().toLowerCase())}&next=${encodeURIComponent(nextPath)}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 bg-teal-100 hover:bg-teal-200 px-3 py-1.5 rounded-lg transition"
                >
                  Create free account &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
        {needsConfirmation && (
          <div>
            <button type="button" onClick={resendConfirmation} disabled={resending || !captchaToken} aria-busy={resending} className="w-full rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-800 hover:bg-teal-100 disabled:opacity-50">
              <PendingButtonContent pending={resending} pendingLabel="Requesting confirmation…">Resend confirmation email</PendingButtonContent>
            </button>
            <LongPendingNotice pending={resending} />
          </div>
        )}
      </form>
      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="text-sm text-slate-600">
          New to Varadhi Prep?{" "}
          <Link href={registerHref} className="font-bold text-teal-700 hover:text-teal-800">
            Create a free account
          </Link>
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          After signing in, you will return to the mock test you selected.
        </p>
      </div>
    </section>
  );
}
