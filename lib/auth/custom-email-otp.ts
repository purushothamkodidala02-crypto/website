import { createHmac, randomInt } from "node:crypto";

const BREVO_SEND_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

function setting(name: "BREVO_API_KEY" | "CUSTOM_OTP_PEPPER" | "TURNSTILE_SECRET_KEY") {
  const value = process.env[name];
  if (!value) throw new Error("Email OTP is being configured. Please use password login for now.");
  return value;
}

export function normalizeEmail(value: unknown) {
  const email = String(value ?? "").trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && email.length <= 254 ? email : null;
}

export function createSixDigitOtp() { return randomInt(0, 1_000_000).toString().padStart(6, "0"); }
export function hashOtp(value: string) { return createHmac("sha256", setting("CUSTOM_OTP_PEPPER")).update(value).digest("hex"); }
export function hashIp(value: string) { return createHmac("sha256", setting("CUSTOM_OTP_PEPPER")).update(value || "unknown").digest("hex"); }

export async function verifyTurnstile(token: string, ip: string) {
  const body = new URLSearchParams({ secret: setting("TURNSTILE_SECRET_KEY"), response: token, remoteip: ip });
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, cache: "no-store" });
  const payload = await response.json().catch(() => ({ success: false })) as { success?: boolean };
  return response.ok && payload.success === true;
}

export async function sendSixDigitOtp(email: string, otp: string) {
  const senderEmail = process.env.CUSTOM_OTP_FROM_EMAIL ?? "no-reply@varadhiprep.in";
  const senderName = process.env.CUSTOM_OTP_FROM_NAME ?? "Varadhi Prep";
  const response = await fetch(BREVO_SEND_EMAIL_URL, {
    method: "POST",
    cache: "no-store",
    headers: { accept: "application/json", "content-type": "application/json", "api-key": setting("BREVO_API_KEY") },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail }, to: [{ email }],
      subject: "Your Varadhi Prep sign-in code",
      textContent: `Your Varadhi Prep sign-in code is ${otp}. It expires in 10 minutes. Do not share this code.`,
      htmlContent: `<main style="font-family:Arial,sans-serif;color:#0f172a;max-width:560px;margin:0 auto;padding:24px"><h1 style="font-size:24px">Your Varadhi Prep sign-in code</h1><p>Use this six-digit code to sign in:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0f766e">${otp}</p><p>This code expires in 10 minutes. Do not share it with anyone.</p></main>`,
    }),
  });
  if (!response.ok) throw new Error("We could not send the email code. Please try again shortly.");
}
