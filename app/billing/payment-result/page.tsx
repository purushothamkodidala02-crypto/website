import Link from "next/link";
import { redirect } from "next/navigation";
import { getPhonePeOrderStatus } from "@/lib/payments/phonepe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function safePath(value: string | undefined) { return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard/passes"; }

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ order?: string; return_to?: string }> }) {
  const query = await searchParams; const returnTo = safePath(query.return_to);
  if (!query.order || !/^[0-9a-f-]{36}$/i.test(query.order)) redirect("/dashboard/passes?payment_error=invalid_order");
  const session = await createClient(); const { data: { user } } = await session.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/billing/payment-result?order=${query.order}&return_to=${returnTo}`)}`);
  const admin = createAdminClient();
  const { data: order } = await admin.from("payment_orders").select("id, user_id, merchant_order_id, status").eq("id", query.order).eq("user_id", user.id).maybeSingle();
  if (!order) redirect("/dashboard/passes?payment_error=invalid_order");
  let status = order.status;
  if (status !== "paid") {
    try { const phonepe = await getPhonePeOrderStatus(order.merchant_order_id); if (phonepe.paid) { await admin.from("payment_orders").update({ status: "paid", provider_transaction_id: phonepe.transactionId, provider_payload: phonepe.payload, paid_at: new Date().toISOString() }).eq("id", order.id); await admin.rpc("grant_payment_entitlement", { requested_order_id: order.id }); status = "paid"; } else if (phonepe.terminalFailure) { await admin.from("payment_orders").update({ status: "failed", provider_payload: phonepe.payload }).eq("id", order.id); status = "failed"; } } catch { /* Keep pending: PhonePe may still be processing. */ }
  }
  const success = status === "paid";
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-5"><section className="w-full max-w-lg rounded-3xl border bg-white p-8 text-center shadow-sm"><p className={`text-xs font-black uppercase tracking-[0.14em] ${success ? "text-emerald-700" : status === "failed" ? "text-red-700" : "text-amber-700"}`}>{success ? "Payment successful" : status === "failed" ? "Payment not completed" : "Payment processing"}</p><h1 className="mt-3 text-3xl font-black">{success ? "Your Exam Pass is active." : status === "failed" ? "We could not confirm payment." : "We are confirming your payment."}</h1><p className="mt-4 leading-7 text-slate-600">{success ? "You can now start the paid mock tests covered by this pass." : "PhonePe can take a moment to confirm a payment. Refresh this page shortly if you have completed payment."}</p><Link href={success ? returnTo : "/dashboard/passes"} className="mt-7 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">{success ? "Continue" : "View Exam Passes"}</Link></section></main>;
}
