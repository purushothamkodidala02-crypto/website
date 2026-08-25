import { getCashfreeOrderStatus } from "@/lib/payments/cashfree";
import { getPhonePeOrderStatus } from "@/lib/payments/phonepe";

type PaymentOrderRecord = {
  id: string;
  merchant_order_id: string;
  provider: string;
  status: string;
};

type PaymentAdminClient = {
  from: (table: string) => {
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: string) => unknown;
    };
  };
  rpc: (fn: string, params: Record<string, unknown>) => unknown;
};

export async function confirmPaymentOrder(
  admin: PaymentAdminClient,
  order: PaymentOrderRecord,
) {
  if (order.status === "paid") return "paid";

  if (order.provider === "cashfree") {
    const payment = await getCashfreeOrderStatus(order.merchant_order_id);
    if (payment.paid) {
      await admin
        .from("payment_orders")
        .update({
          status: "paid",
          provider_transaction_id: payment.transactionId,
          provider_payload: payment.payload,
          paid_at: new Date().toISOString(),
        })
        .eq("id", order.id);
      await admin.rpc("grant_payment_entitlement", { requested_order_id: order.id });
      return "paid";
    }
    if (payment.terminalFailure) {
      await admin
        .from("payment_orders")
        .update({ status: "failed", provider_payload: payment.payload })
        .eq("id", order.id);
      return "failed";
    }
    return order.status;
  }

  const payment = await getPhonePeOrderStatus(order.merchant_order_id);
  if (payment.paid) {
    await admin
      .from("payment_orders")
      .update({
        status: "paid",
        provider_transaction_id: payment.transactionId,
        provider_payload: payment.payload,
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id);
    await admin.rpc("grant_payment_entitlement", { requested_order_id: order.id });
    return "paid";
  }
  if (payment.terminalFailure) {
    await admin
      .from("payment_orders")
      .update({ status: "failed", provider_payload: payment.payload })
      .eq("id", order.id);
    return "failed";
  }
  return order.status;
}
