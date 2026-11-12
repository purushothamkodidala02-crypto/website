"use client";

import { useRef, useState } from "react";
import { TurnstileChallenge } from "@/components/auth/TurnstileChallenge";
import { LongPendingNotice, PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { EMAIL_INPUT_PATTERN, validateRegistrationEmail } from "@/lib/email-validation";

type Notice = { tone: "error" | "success"; message: string };

async function postOtp(path: string, body: Record<string, string>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    redirectUrl?: string;
  };
  return { ok: response.ok, ...payload };
}

export function EmailOtpLoginForm({
  nextPath,
  onUsePassword,
  email: controlledEmail,
  onEmailChange,
  embedded = false,
}: {
  nextPath: string;
  onUsePassword: () => void;
  email?: string;
  onEmailChange?: (value: string) => void;
  embedded?: boolean;
}) {
  const [internalEmail, setInternalEmail] = useState("");
  const email = controlledEmail ?? internalEmail;
  const setEmailValue = (value: string) => {
    setInternalEmail(value);
    onEmailChange?.(value);
  };

  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  async function requestCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailValidation = validateRegistrationEmail(email);
    if (!emailValidation.isValid) {
      setNotice({
        tone: "error",
        message: emailValidation.error ?? "Enter a valid email address.",
      });
      emailRef.current?.focus();
      return;
    }
    const normalizedEmail = emailValidation.normalized;
    if (!captchaToken) {
      setNotice({
        tone: "error",
        message: "Please wait for security verification above to complete, then request your code.",
      });
      return;
    }
    setSending(true);
    setNotice(null);

    // Log the attempt to PostHog so admins can see which email was used
    if (typeof window !== "undefined" && window.posthog) {
      window.posthog.capture("otp_requested", { email: normalizedEmail });
    }

    const result = await postOtp("/api/auth/email-otp/request", {
      email: normalizedEmail,
      captchaToken,
    });
    setCaptchaToken(null);
    setCaptchaResetKey((value) => value + 1);
    setSending(false);
    if (!result.ok) {
      setNotice({
        tone: "error",
        message: result.message ?? "We could not send a code right now. Please try again.",
      });
      emailRef.current?.focus();
      return;
    }
    setEmailValue(normalizedEmail);
    setSent(true);
    setShowResend(false);
    setNotice({
      tone: "success",
      message:
        "If this email belongs to a confirmed Varadhi Prep account, a six-digit code has been sent.",
    });
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setNotice({ tone: "error", message: "Enter the six-digit code from your email." });
      codeRef.current?.focus();
      return;
    }
    setVerifying(true);
    setNotice(null);
    const result = await postOtp("/api/auth/email-otp/verify", { email, code, nextPath });
    if (!result.ok || !result.redirectUrl) {
      setVerifying(false);
      setNotice({
        tone: "error",
        message: result.message ?? "That code is invalid or has expired.",
      });
      codeRef.current?.focus();
      return;
    }
    window.location.assign(result.redirectUrl);
  }

  const content = (
    <>
      {!embedded && (
        <>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">
            Email code sign-in
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Sign in with a six-digit code
          </h2>
        </>
      )}
      <p className={`${embedded ? "mt-4" : "mt-3"} text-sm leading-6 text-slate-600`}>
        We will email a temporary six-digit sign-in code to your confirmed, registered address.
      </p>

      {!sent ? (
        <form onSubmit={requestCode} aria-label="Sign in with a six-digit email code" className="mt-5 space-y-4 sm:space-y-5">
          <div>
            <label htmlFor="otp_email" className="block text-sm font-bold text-slate-800">
              Registered email address
            </label>
            <input
              ref={emailRef}
              id="otp_email"
              name="email"
              type="email"
              required
              autoComplete="username"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="none"
              enterKeyHint="done"
              pattern={EMAIL_INPUT_PATTERN}
              title="Please enter a valid email address"
              aria-invalid={notice?.tone === "error"}
              value={email}
              onChange={(event) => {
                setEmailValue(event.target.value);
                if (notice?.tone === "error") setNotice(null);
              }}
              placeholder="you@example.com"
              className="mt-2 w-full min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-900 placeholder:text-slate-400 transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 focus-visible:outline-none aria-[invalid=true]:border-red-500"
            />
          </div>
          <TurnstileChallenge onToken={setCaptchaToken} resetKey={captchaResetKey} />
          <button
            type="submit"
            disabled={sending}
            aria-busy={sending}
            className="w-full min-h-12 rounded-xl bg-[#ea580c] px-4 py-3 text-sm sm:text-base font-bold text-white shadow-md shadow-orange-950/20 transition hover:bg-[#d94f08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea580c] disabled:cursor-wait disabled:opacity-60"
          >
            <PendingButtonContent pending={sending} pendingLabel="Sending code…">
              Send sign-in code
            </PendingButtonContent>
          </button>
          <LongPendingNotice pending={sending} />
        </form>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-teal-200 bg-teal-50/70 px-3.5 py-2.5 text-xs">
            <span className="min-w-0 truncate font-semibold text-teal-950">
              Sending to <strong className="font-black">{email}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setCode("");
                setNotice(null);
                setShowResend(false);
              }}
              disabled={sending || verifying}
              className="shrink-0 font-bold text-teal-800 underline underline-offset-2 hover:text-teal-950"
            >
              Change email
            </button>
          </div>

          <form onSubmit={verifyCode} aria-label="Verify six-digit email code" className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="otp_code" className="block text-sm font-bold text-slate-800">
                Six-digit sign-in code
              </label>
              <input
                ref={codeRef}
                id="otp_code"
                name="otp_code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                enterKeyHint="done"
                spellCheck={false}
                pattern="[0-9]{6}"
                maxLength={6}
                required
                aria-invalid={notice?.tone === "error"}
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                  if (notice?.tone === "error") setNotice(null);
                }}
                placeholder="123456"
                className="mt-2 w-full min-h-13 rounded-xl border border-slate-300 bg-white px-4 py-3 text-center font-mono text-xl font-bold tracking-[0.45em] text-slate-900 transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 focus-visible:outline-none aria-[invalid=true]:border-red-500"
              />
            </div>
            <button
              type="submit"
              disabled={verifying}
              aria-busy={verifying}
              className="w-full min-h-12 rounded-xl bg-teal-700 px-4 py-3 text-sm sm:text-base font-bold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-60"
            >
              <PendingButtonContent pending={verifying} pendingLabel="Verifying code…">
                Verify and sign in
              </PendingButtonContent>
            </button>
            <LongPendingNotice pending={verifying} />
          </form>

          <div className="border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setShowResend((prev) => !prev)}
                aria-expanded={showResend}
                className="min-h-8 font-bold text-teal-700 hover:text-teal-800"
              >
                {showResend ? "Hide resend" : "Didn't receive code? Resend"}
              </button>
            </div>

            {showResend && (
              <form onSubmit={requestCode} className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-700">Complete verification to resend code:</p>
                <TurnstileChallenge onToken={setCaptchaToken} resetKey={captchaResetKey} />
                <button
                  type="submit"
                  disabled={sending}
                  aria-busy={sending}
                  className="w-full min-h-11 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-60"
                >
                  <PendingButtonContent pending={sending} pendingLabel="Sending new code…">
                    Resend sign-in code
                  </PendingButtonContent>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {notice && (
        <div
          role={notice.tone === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
            notice.tone === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.message}
        </div>
      )}

      {!embedded && (
        <button
          type="button"
          onClick={onUsePassword}
          className="mt-6 w-full min-h-10 border-t border-slate-100 pt-5 text-sm font-bold text-teal-700 hover:text-teal-800"
        >
          Sign in with password
        </button>
      )}
    </>
  );

  if (embedded) return content;

  return (
    <section className="min-w-0 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 shadow-sm">
      {content}
    </section>
  );
}
