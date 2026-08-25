import { createHmac, timingSafeEqual } from "node:crypto";

type CashfreeOrder = {
  merchantOrderId: string;
  amountInr: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  note: string;
};

type CashfreeResponse = Record<string, unknown>;

const API_VERSION = "2025-01-01";

function getCashfreeEnvironment() {
  const configured = (process.env.CASHFREE_ENV ?? "").trim().toLowerCase();
  if (configured === "sandbox" || configured === "test") return "sandbox";
  return "production";
}

function apiBaseUrl() {
  return getCashfreeEnvironment() === "sandbox"
    ? "https://sandbox.cashfree.com/pg"
    : "https://api.cashfree.com/pg";
}

function required(name: "CASHFREE_APP_ID" | "CASHFREE_SECRET_KEY") {
  const value = process.env[name];
  if (!value) {
    throw new Error("Cashfree payments are not configured yet. Please try again later.");
  }
  return value;
}

function cashfreeHeaders() {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-api-version": API_VERSION,
    "x-client-id": required("CASHFREE_APP_ID"),
    "x-client-secret": required("CASHFREE_SECRET_KEY"),
  };
}

function toDigits(value: string | undefined | null) {
  return (value ?? "").replace(/\D+/g, "");
}

function normalisePhone(phone: string) {
  const digits = toDigits(phone);
  if (digits.length >= 10) return digits.slice(-10);
  return "9999999999";
}

function payloadState(payload: CashfreeResponse) {
  return String(payload.order_status ?? payload.payment_status ?? "").toUpperCase();
}

export function getCashfreeCheckoutMode() {
  return getCashfreeEnvironment();
}

export async function createCashfreeOrder(order: CashfreeOrder) {
  const response = await fetch(`${apiBaseUrl()}/orders`, {
    method: "POST",
    headers: cashfreeHeaders(),
    cache: "no-store",
    body: JSON.stringify({
      order_id: order.merchantOrderId,
      order_amount: Number(order.amountInr.toFixed(2)),
      order_currency: "INR",
      customer_details: {
        customer_id: order.customerId,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: normalisePhone(order.customerPhone),
      },
      order_meta: {
        return_url: order.returnUrl,
      },
      order_note: order.note,
    }),
  });

  const payload = await response.json().catch(() => ({})) as CashfreeResponse;
  const paymentSessionId = String(payload.payment_session_id ?? "");
  const cfOrderId = String(payload.cf_order_id ?? "") || null;
  const orderId = String(payload.order_id ?? order.merchantOrderId) || order.merchantOrderId;

  if (!response.ok || !paymentSessionId) {
    throw new Error("Cashfree could not open the payment page. Please try again.");
  }

  return {
    paymentSessionId,
    providerOrderId: cfOrderId,
    merchantOrderId: orderId,
    payload,
  };
}

export async function getCashfreeOrderStatus(merchantOrderId: string) {
  const response = await fetch(`${apiBaseUrl()}/orders/${encodeURIComponent(merchantOrderId)}`, {
    headers: cashfreeHeaders(),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({})) as CashfreeResponse;
  if (!response.ok) {
    throw new Error("We could not confirm this Cashfree payment yet.");
  }

  const state = payloadState(payload);
  const transactionId =
    String(
      payload.cf_payment_id ??
        payload.cf_order_id ??
        (Array.isArray(payload.payments) ? payload.payments[0] : null) ??
        "",
    ) || null;

  return {
    paid: state === "PAID",
    terminalFailure: ["FAILED", "CANCELLED", "EXPIRED", "TERMINATED"].includes(state),
    state,
    transactionId,
    payload,
  };
}

export function verifyCashfreeWebhookSignature(rawBody: string, signature: string | null, timestamp: string | null) {
  if (!signature || !timestamp) return false;
  const secret = process.env.CASHFREE_WEBHOOK_SECRET ?? process.env.CASHFREE_SECRET_KEY;
  if (!secret) return false;
  const expected = Buffer.from(
    createHmac("sha256", secret).update(`${timestamp}${rawBody}`).digest("base64"),
  ).toString();
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
