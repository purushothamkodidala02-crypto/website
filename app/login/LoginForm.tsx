"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { TurnstileChallenge } from "@/components/auth/TurnstileChallenge";
import { LongPendingNotice, PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { EMAIL_INPUT_PATTERN } from "@/lib/email-validation";
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
  const router = useRouter();
  const headingId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (email.trim() && password && nextPath) {
      try {
        router.prefetch(nextPath);
      } catch {}
    }
  }, [email, password, nextPath, router]);

  function confirmationRedirectUrl() {
    const redirectUrl = new URL("/login", window.location.origin);
    redirectUrl.searchParams.set("next", nextPath);
    redirectUrl.searchParams.set("confirmed", "1");
    return redirectUrl.toString();
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setNotice({ tone: "error", message: "Enter your registered email address." });
      emailRef.current?.focus();
      return;
    }
    if (!password) {
      setNotice({ tone: "error", message: "Enter your password." });
      passwordRef.current?.focus();
      return;
    }
    if (!captchaToken) {
      setNotice({
        tone: "error",
        message: "Please complete the security verification check below, then try again.",
      });
      return;
    }

    setLoading(true);
    setNeedsConfirmation(false);
    setUserNotFound(false);
    setNotice(null);

    // Log the attempt to PostHog so admins can see which email was used
    if (typeof window !== "undefined" && window.posthog) {
      window.posthog.capture("password_login_attempted", { email: normalizedEmail });
    }

    let result: LoginResult;
    try {
      result = await loginWithPassword({
        email: normalizedEmail,
        password,
        captchaToken,
        nextPath,
      });
    } catch {
      setCaptchaToken(null);
      setCaptchaResetKey((value) => value + 1);
      setNotice({
        tone: "error",
        message: "The login service did not respond. Refresh the page and try again.",
      });
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
      if (isNotFound || emailNotConfirmed) {
        emailRef.current?.focus();
      } else if (result.code === "invalid_credentials") {
        passwordRef.current?.focus();
      }
      return;
    }

    // Fast client transition preserves cache and avoids heavy cold reload on mobile
    try {
      router.replace(result.redirectTo);
      router.refresh();
    } catch {
      window.location.replace(result.redirectTo);
    }
  }

  async function resendConfirmation() {
    if (!email.trim()) {
      setNotice({ tone: "error", message: "Enter your email address first." });
      emailRef.current?.focus();
      return;
    }
    if (!captchaToken) {
      setNotice({
        tone: "error",
        message: "Wait for the security verification check to finish before resending.",
      });
      return;
    }

    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: confirmationRedirectUrl(),
        captchaToken,
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
    <section
      aria-labelledby={headingId}
      className="min-w-0 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">
          Varadhi Prep account
        </p>
        {nextPath !== "/" && (
          <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800">
            Resuming your selection
          </span>
        )}
      </div>
      <h1 id={headingId} className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
        Sign in to continue
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Continue instantly with Google, your password, or a six-digit email code.
      </p>

      <div className="mt-5">
        <GoogleSignInButton nextPath={nextPath} />
      </div>

      <div className="my-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">or use email</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Method Switcher */}
      <div
        role="group"
        aria-label="Email sign-in method"
        className="grid grid-cols-2 gap-1.5 rounded-2xl border border-slate-200 bg-slate-100/90 p-1"
      >
        <button
          type="button"
          onClick={() => {
            setLoginMethod("password");
            setNotice(null);
          }}
          aria-pressed={loginMethod === "password"}
          className={`min-h-10 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
            loginMethod === "password"
              ? "bg-white text-slate-950 shadow-xs"
              : "text-slate-600 hover:text-slate-950"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginMethod("otp");
            setNotice(null);
          }}
          aria-pressed={loginMethod === "otp"}
          aria-label="Sign in using a six-digit email code"
          className={`min-h-10 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
            loginMethod === "otp"
              ? "bg-white text-teal-900 shadow-xs"
              : "text-slate-600 hover:text-slate-950"
          }`}
        >
          6-digit email code
        </button>
      </div>

      {loginMethod === "otp" ? (
        <EmailOtpLoginForm
          nextPath={nextPath}
          email={email}
          onEmailChange={setEmail}
          onUsePassword={() => setLoginMethod("password")}
          embedded
        />
      ) : (
        <form onSubmit={handleLogin} aria-labelledby={headingId} className="mt-5 space-y-4 sm:space-y-5">
          <div>
            <label htmlFor="login_email" className="block text-sm font-bold text-slate-800">
              Email address
            </label>
            <input
              ref={emailRef}
              id="login_email"
              name="email"
              type="email"
              required
              autoComplete="username"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="none"
              enterKeyHint="next"
              pattern={EMAIL_INPUT_PATTERN}
              title="Please enter a valid email address"
              aria-invalid={notice?.tone === "error" && (userNotFound || !email.trim())}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (notice?.tone === "error") setNotice(null);
              }}
              placeholder="you@example.com"
              className="mt-2 w-full min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-900 placeholder:text-slate-400 transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 focus-visible:outline-none aria-[invalid=true]:border-red-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="current_password" className="text-sm font-bold text-slate-800">
                Password
              </label>
              <Link
                href={forgotPasswordHref}
                className="inline-flex min-h-8 items-center text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              ref={passwordRef}
              id="current_password"
              name="password"
              required
              maxLength={72}
              autoComplete="current-password"
              enterKeyHint="done"
              aria-invalid={notice?.tone === "error" && !userNotFound}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (notice?.tone === "error") setNotice(null);
              }}
              placeholder="Enter your password"
            />
          </div>

          <TurnstileChallenge onToken={setCaptchaToken} resetKey={captchaResetKey} />

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full min-h-12 rounded-xl bg-[#ea580c] px-4 py-3 text-sm sm:text-base font-bold text-white shadow-md shadow-orange-950/20 transition hover:bg-[#d94f08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea580c] disabled:cursor-wait disabled:opacity-60"
          >
            <PendingButtonContent pending={loading} pendingLabel="Signing in…">
              Sign in and continue
            </PendingButtonContent>
          </button>
          <LongPendingNotice pending={loading} />

          {notice && (
            <div
              role={notice.tone === "error" ? "alert" : "status"}
              aria-live="polite"
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${noticeStyles[notice.tone]}`}
            >
              <p>{notice.message}</p>
              {userNotFound && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-red-200/70 pt-2.5">
                  <span className="text-xs text-red-800">New to Varadhi Prep?</span>
                  <Link
                    href={`/register?email=${encodeURIComponent(email.trim().toLowerCase())}&next=${encodeURIComponent(nextPath)}`}
                    className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-teal-100 px-3 py-1.5 text-xs font-bold text-teal-800 transition hover:bg-teal-200"
                  >
                    Create free account &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

          {needsConfirmation && (
            <div>
              <button
                type="button"
                onClick={resendConfirmation}
                disabled={resending}
                aria-busy={resending}
                className="w-full min-h-11 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-bold text-teal-800 hover:bg-teal-100 disabled:opacity-50"
              >
                <PendingButtonContent pending={resending} pendingLabel="Requesting confirmation…">
                  Resend confirmation email
                </PendingButtonContent>
              </button>
              <LongPendingNotice pending={resending} />
            </div>
          )}
        </form>
      )}

      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="text-sm text-slate-600">
          New to Varadhi Prep?{" "}
          <Link href={registerHref} className="font-bold text-teal-700 hover:text-teal-800 hover:underline underline-offset-2">
            Create a free account
          </Link>
        </p>
        <p className="mt-1.5 text-xs leading-5 text-slate-500">
          Administrators can sign in on multiple devices at the same time; student accounts stay protected on one active device.
        </p>
      </div>
    </section>
  );
}
