"use server";

import { createCashfreeOrder, getCashfreeCheckoutMode } from "@/lib/payments/cashfree";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/site";

export type GrowthPaymentResult = {
  success: boolean;
  paymentSessionId?: string;
  orderId?: string;
  mode?: "production" | "sandbox";
  error?: string;
};

export async function initiateCashfreeGrowthContribution(
  amountInr: number,
  phone: string,
  name?: string,
): Promise<GrowthPaymentResult> {
  try {
    if (!Number.isFinite(amountInr) || amountInr < 10) {
      return { success: false, error: "Please enter a valid contribution of at least ₹10." };
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      return { success: false, error: "Please enter a valid 10-digit mobile number for Cashfree verification." };
    }

    // Try to get authenticated user if present
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const merchantOrderId = `VPGROW_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const customerId = user?.id || `GUEST_${cleanPhone.slice(-6)}_${Date.now().toString().slice(-4)}`;
    const customerEmail = user?.email || "contribute@varadhiprep.in";
    const customerName = name?.trim() || user?.user_metadata?.full_name || "Varadhi Supporter";

    const returnUrl = absoluteUrl(`/help-us-to-grow?status=thank_you&order_id=${merchantOrderId}`);

    const result = await createCashfreeOrder({
      merchantOrderId,
      amountInr,
      customerId,
      customerName,
      customerEmail,
      customerPhone: cleanPhone,
      returnUrl,
      note: "Voluntary Contribution to Varadhi Prep",
    });

    return {
      success: true,
      paymentSessionId: result.paymentSessionId,
      orderId: result.merchantOrderId,
      mode: getCashfreeCheckoutMode(),
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Cashfree could not open the payment page. Please try again or use direct UPI below.";
    return { success: false, error: message };
  }
}
