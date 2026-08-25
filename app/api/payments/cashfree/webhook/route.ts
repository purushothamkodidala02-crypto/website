import { confirmPaymentOrder } from "@/lib/payments/confirm-order";
import { verifyCashfreeWebhookSignature } from "@/lib/payments/cashfree";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");

  if (!verifyCashfreeWebhookSignature(rawBody, signature, timestamp)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const body = JSON.parse(rawBody || "{}") as Record<string, unknown>;
  const merchantOrderId = String(
    body?.order_id ??
      (body?.data as Record<string, unknown> | undefined)?.order_id ??
      ((body?.data as Record<string, unknown> | undefined)?.order as Record<string, unknown> | undefined)?.order_id ??
      "",
  );

  if (!merchantOrderId || merchantOrderId.length > 100) {
    return Response.json({ ok: true });
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("payment_orders")
    .select("id, merchant_order_id, provider, status")
    .eq("merchant_order_id", merchantOrderId)
    .maybeSingle();

  if (!order) {
    return Response.json({ ok: true });
  }

  try {
    await confirmPaymentOrder(admin, order);
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }

  return Response.json({ ok: true });
}
