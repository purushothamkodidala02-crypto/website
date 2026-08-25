"use client";

import { useState } from "react";
import { PendingSubmitButton } from "@/components/feedback/PendingSubmitButton";
import { beginExamPassCheckout } from "./actions";

export function BuyExamPassForm({
  productId,
  price,
  returnTo,
}: {
  productId: string;
  price: number;
  returnTo: string;
}) {
  const [showReferral, setShowReferral] = useState(false);

  return (
    <form action={beginExamPassCheckout} className="mt-5">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="return_to" value={returnTo} />
      {showReferral ? (
        <label className="mb-3 block text-xs font-bold text-slate-600">
          Referral code
          <input
            name="referral_code"
            maxLength={40}
            className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase"
            placeholder="Optional code"
          />
        </label>
      ) : (
        <button
          type="button"
          onClick={() => setShowReferral(true)}
          className="mb-3 text-xs font-bold text-teal-700 underline"
        >
          Have a referral code?
        </button>
      )}
      <PendingSubmitButton
        pendingLabel="Opening secure checkout..."
        className="w-full rounded-xl bg-teal-300 px-4 py-3 text-sm font-black text-slate-950 hover:bg-teal-200 disabled:cursor-wait disabled:opacity-70"
      >
        Unlock for ₹{price.toFixed(0)}
      </PendingSubmitButton>
    </form>
  );
}
