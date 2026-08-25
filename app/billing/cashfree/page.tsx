import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { CashfreeCheckoutLauncher } from "./CashfreeCheckoutLauncher";
import { getCashfreeCheckoutMode } from "@/lib/payments/cashfree";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function safePath(value: string | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard/passes";
}

export default async function CashfreeCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; session?: string; return_to?: string }>;
}) {
  const query = await searchParams;
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const returnTo = safePath(query.return_to);
  if (!query.order || !/^[0-9a-f-]{36}$/i.test(query.order) || !query.session) {
    redirect("/dashboard/passes?payment_error=invalid_order");
  }

  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/billing/cashfree?order=${query.order}&session=${query.session}&return_to=${returnTo}`)}`);
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("payment_orders")
    .select("id, user_id, provider, status")
    .eq("id", query.order)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order || order.provider !== "cashfree") {
    redirect("/dashboard/passes?payment_error=invalid_order");
  }

  if (order.status === "paid") {
    redirect(`${returnTo}?payment=success`);
  }

  return (
    <CashfreeCheckoutLauncher
      mode={getCashfreeCheckoutMode()}
      paymentSessionId={query.session}
      returnTo={returnTo}
      nonce={nonce}
    />
  );
}
