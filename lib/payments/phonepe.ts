type PhonePeOrder = {
  merchantOrderId: string;
  amount: number;
  redirectUrl: string;
  message: string;
};

type PhonePeResponse = Record<string, unknown>;

const API_BASE = (process.env.PHONEPE_API_BASE_URL ?? "https://api.phonepe.com/apis/pg").replace(/\/$/, "");
const AUTH_URL = process.env.PHONEPE_AUTH_URL ?? "https://api.phonepe.com/apis/identity-manager/v1/oauth/token";

function required(name: "PHONEPE_CLIENT_ID" | "PHONEPE_CLIENT_SECRET" | "PHONEPE_CLIENT_VERSION") {
  const value = process.env[name];
  if (!value) throw new Error("PhonePe payments are not configured yet. Please try again later.");
  return value;
}

async function accessToken() {
  const body = new URLSearchParams({
    client_id: required("PHONEPE_CLIENT_ID"),
    client_secret: required("PHONEPE_CLIENT_SECRET"),
    client_version: required("PHONEPE_CLIENT_VERSION"),
    grant_type: "client_credentials",
  });
  const response = await fetch(AUTH_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
  const payload = await response.json().catch(() => ({})) as PhonePeResponse;
  if (!response.ok || typeof payload.access_token !== "string") throw new Error("PhonePe could not start the payment. Please try again.");
  return payload.access_token;
}

async function phonePeFetch(path: string, init: RequestInit = {}) {
  const token = await accessToken();
  return fetch(`${API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `O-Bearer ${token}`, ...(init.headers ?? {}) },
  });
}

export async function createPhonePeCheckout(order: PhonePeOrder) {
  const response = await phonePeFetch("/checkout/v2/pay", {
    method: "POST",
    body: JSON.stringify({
      merchantOrderId: order.merchantOrderId,
      amount: order.amount,
      expireAfter: 1800,
      metaInfo: { udf1: order.merchantOrderId },
      paymentFlow: { type: "PG_CHECKOUT", message: order.message, merchantUrls: { redirectUrl: order.redirectUrl } },
    }),
  });
  const payload = await response.json().catch(() => ({})) as PhonePeResponse;
  const redirectUrl = payload.redirectUrl ?? (payload.data as PhonePeResponse | undefined)?.redirectUrl;
  if (!response.ok || typeof redirectUrl !== "string") throw new Error("PhonePe could not open the payment page. Please try again.");
  return { redirectUrl, providerOrderId: String(payload.orderId ?? (payload.data as PhonePeResponse | undefined)?.orderId ?? "") || null, payload };
}

export async function getPhonePeOrderStatus(merchantOrderId: string) {
  const response = await phonePeFetch(`/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status`);
  const payload = await response.json().catch(() => ({})) as PhonePeResponse;
  if (!response.ok) throw new Error("We could not confirm this PhonePe payment yet.");
  const state = String(payload.state ?? (payload.data as PhonePeResponse | undefined)?.state ?? payload.status ?? "").toUpperCase();
  const transactionId = String(payload.transactionId ?? (payload.data as PhonePeResponse | undefined)?.transactionId ?? "") || null;
  return { paid: ["COMPLETED", "SUCCESS", "PAYMENT_SUCCESS"].includes(state), terminalFailure: ["FAILED", "CANCELLED", "EXPIRED"].includes(state), state, transactionId, payload };
}
