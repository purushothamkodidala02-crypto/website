import { getPhonePeOrderStatus } from "@/lib/payments/phonepe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** PhonePe notifications are treated only as a signal. We independently ask PhonePe
 * for the order status before granting any access, so a forged notification cannot unlock a pass. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const merchantOrderId = String(body?.merchantOrderId ?? body?.orderId ?? "");
  if (!merchantOrderId || merchantOrderId.length > 100) return Response.json({ ok: true });
  const admin = createAdminClient();
  const { data: order } = await admin.from("payment_orders").select("id, merchant_order_id, status").eq("merchant_order_id", merchantOrderId).maybeSingle();
  if (!order || order.status === "paid") return Response.json({ ok: true });
  try { const payment = await getPhonePeOrderStatus(order.merchant_order_id); if (payment.paid) { await admin.from("payment_orders").update({ status: "paid", provider_transaction_id: payment.transactionId, provider_payload: payment.payload, paid_at: new Date().toISOString() }).eq("id", order.id); await admin.rpc("grant_payment_entitlement", { requested_order_id: order.id }); } else if (payment.terminalFailure) await admin.from("payment_orders").update({ status: "failed", provider_payload: payment.payload }).eq("id", order.id); } catch { return Response.json({ ok: false }, { status: 503 }); }
  return Response.json({ ok: true });
}
