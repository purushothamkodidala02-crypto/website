"use client";

import { useState } from "react";
import { TurnstileChallenge } from "@/components/auth/TurnstileChallenge";
import { LongPendingNotice, PendingButtonContent } from "@/components/feedback/LoadingSpinner";

type Notice = { tone: "error" | "success"; message: string };

async function postOtp(path: string, body: Record<string, string>) {
  const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => ({})) as { message?: string; redirectUrl?: string };
  return { ok: response.ok, ...payload };
}

export function EmailOtpLoginForm({ nextPath, onUsePassword }: { nextPath: string; onUsePassword: () => void }) {
  const [email, setEmail] = useState(""); const [code, setCode] = useState(""); const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false); const [verifying, setVerifying] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null); const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function requestCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !captchaToken) return;
    setSending(true); setNotice(null);
    const result = await postOtp("/api/auth/email-otp/request", { email: normalizedEmail, captchaToken });
    setCaptchaToken(null); setCaptchaResetKey((value) => value + 1); setSending(false);
    if (!result.ok) { setNotice({ tone: "error", message: result.message ?? "We could not send a code right now. Please try again." }); return; }
    setEmail(normalizedEmail); setSent(true); setNotice({ tone: "success", message: "If this email belongs to a confirmed Varadhi Prep account, a six-digit code has been sent." });
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!/^\d{6}$/.test(code)) { setNotice({ tone: "error", message: "Enter the six-digit code from your email." }); return; }
    setVerifying(true); setNotice(null);
    const result = await postOtp("/api/auth/email-otp/verify", { email, code, nextPath });
    setVerifying(false);
    if (!result.ok || !result.redirectUrl) { setNotice({ tone: "error", message: result.message ?? "That code is invalid or has expired." }); return; }
    window.location.assign(result.redirectUrl);
  }

  return <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">Email code sign-in</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Sign in with a six-digit code</h2><p className="mt-3 text-sm leading-6 text-slate-600">A secure six-digit code will be sent to your confirmed, registered email address. If you recently created an account, confirm your email first.</p>
    {!sent ? <form onSubmit={requestCode} className="mt-7 space-y-5"><label htmlFor="otp_email" className="block text-sm font-bold text-slate-800">Registered email address<input id="otp_email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label><TurnstileChallenge onToken={setCaptchaToken} resetKey={captchaResetKey} /><button type="submit" disabled={sending || !captchaToken} aria-busy={sending} className="w-full rounded-xl bg-slate-950 px-4 py-3 font-bold text-white disabled:cursor-wait disabled:opacity-50"><PendingButtonContent pending={sending} pendingLabel="Sending code…">Send sign-in code</PendingButtonContent></button><LongPendingNotice pending={sending} /></form> : <form onSubmit={verifyCode} className="mt-7 space-y-5"><label htmlFor="otp_code" className="block text-sm font-bold text-slate-800">Six-digit sign-in code<input id="otp_code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" className="mt-2 w-full rounded-xl border px-4 py-3 text-center font-mono text-xl font-bold tracking-[0.45em]" /></label><button type="submit" disabled={verifying || code.length !== 6} aria-busy={verifying} className="w-full rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:cursor-wait disabled:opacity-50"><PendingButtonContent pending={verifying} pendingLabel="Verifying code…">Verify and sign in</PendingButtonContent></button><LongPendingNotice pending={verifying} /><div className="border-t pt-5"><TurnstileChallenge onToken={setCaptchaToken} resetKey={captchaResetKey} /><button type="button" onClick={() => { setSent(false); setCode(""); setNotice(null); }} disabled={sending} className="mt-4 w-full rounded-xl border px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-50">Change email address</button></div></form>}
    {notice && <p aria-live="polite" className={`mt-5 rounded-xl border px-4 py-3 text-sm font-medium ${notice.tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{notice.message}</p>}
    {sent && <form onSubmit={requestCode} className="mt-4"><button type="submit" disabled={sending || !captchaToken} aria-busy={sending} className="w-full text-sm font-bold text-teal-700 disabled:opacity-50"><PendingButtonContent pending={sending} pendingLabel="Sending new code…">Resend code</PendingButtonContent></button></form>}
    <button type="button" onClick={onUsePassword} className="mt-6 w-full border-t border-slate-100 pt-5 text-sm font-bold text-teal-700 hover:text-teal-800">Sign in with password</button>
  </section>;
}
