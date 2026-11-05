"use client";

import { useState } from "react";
import { PendingSubmitButton } from "@/components/feedback/PendingSubmitButton";
import { beginExamPassCheckout } from "./actions";

export function BuyExamPassForm({
  productId,
  price,
  returnTo,
  phone = "",
  buttonLabel = "Buy Exam Series",
  pendingLabel = "Opening secure checkout...",
}: {
  productId: string;
  price: number;
  returnTo: string;
  phone?: string;
  buttonLabel?: string;
  pendingLabel?: string;
}) {
  const [showReferral, setShowReferral] = useState(false);

  return (
    <form action={beginExamPassCheckout} className="mt-5">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="return_to" value={returnTo} />
      <label className="mb-3 block text-xs font-semibold text-slate-700">
        Mobile number for payment
        <input
          name="customer_phone"
          type="tel"
          required
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={13}
          defaultValue={phone}
          className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          placeholder="10-digit Indian mobile number"
        />
      </label>
      {showReferral ? (
        <label className="mb-3 block text-xs font-semibold text-slate-700">
          Referral code
          <input
            name="referral_code"
            maxLength={40}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm uppercase text-slate-900 shadow-2xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Optional code"
          />
        </label>
      ) : (
        <button
          type="button"
          onClick={() => setShowReferral(true)}
          className="mb-3 text-xs font-semibold text-teal-800 underline hover:text-teal-950 transition"
        >
          Have a referral code?
        </button>
      )}
      <PendingSubmitButton
        pendingLabel={pendingLabel}
        className="w-full rounded-xl bg-teal-800 hover:bg-teal-900 text-white px-4 py-3 text-sm font-semibold shadow-xs transition hover:shadow active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
      >
        {buttonLabel} · ₹{price.toFixed(0)}
      </PendingSubmitButton>
    </form>
  );
}
