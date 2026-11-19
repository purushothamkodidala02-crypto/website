"use client";

import { useState } from "react";
import Script from "next/script";
import { initiateCashfreeGrowthContribution } from "@/app/actions/growth-payment";
import { CopyUpiButton } from "@/components/growth/CopyUpiButton";

declare global {
  interface Window {
    Cashfree?: (options: { mode: "production" | "sandbox" }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget: "_self";
      }) => Promise<unknown> | void;
    };
  }
}

type Props = {
  suggestedAmounts: number[];
  upiId: string;
  upiName: string;
  defaultPhone?: string;
  defaultName?: string;
};

export function CashfreeContributionBox({
  suggestedAmounts,
  upiId,
  upiName,
  defaultPhone = "",
  defaultName = "",
}: Props) {
  const [selectedAmount, setSelectedAmount] = useState<number>(
    suggestedAmounts[1] ?? 100,
  );
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [phone, setPhone] = useState(defaultPhone);
  const [name, setName] = useState(defaultName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  const effectiveAmount = isCustom
    ? parseInt(customAmount, 10) || 0
    : selectedAmount;

  async function handleCashfreePayment(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (effectiveAmount < 10) {
      setError("Please select or enter an amount of at least ₹10.");
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number for Cashfree payment verification.");
      return;
    }

    setLoading(true);
    try {
      const res = await initiateCashfreeGrowthContribution(
        effectiveAmount,
        cleanPhone,
        name,
      );

      if (!res.success || !res.paymentSessionId) {
        setError(res.error || "Could not launch Cashfree checkout. Please try direct UPI below.");
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined" && window.Cashfree) {
        const cashfree = window.Cashfree({
          mode: res.mode ?? "production",
        });
        await cashfree.checkout({
          paymentSessionId: res.paymentSessionId,
          redirectTarget: "_self",
        });
      } else {
        setError("Cashfree payment component is still loading. Please try again in a moment.");
        setLoading(false);
      }
    } catch {
      setError("An unexpected error occurred while launching payment. Please try again or use direct UPI below.");
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />

      <div className="rounded-2xl border border-[#cde7f7] bg-white p-5 sm:p-7 shadow-xs">
        {/* Amount Selector */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0055a2]">
            Select Contribution Amount
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5 sm:gap-3">
            {suggestedAmounts.map((amt) => {
              const active = !isCustom && selectedAmount === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setIsCustom(false);
                  }}
                  className={`rounded-xl px-4 py-2.5 text-sm sm:text-base font-black transition ${
                    active
                      ? "border-2 border-[#0055a2] bg-[#0055a2] text-white shadow-xs"
                      : "border border-slate-200 bg-[#f8fafc] text-slate-800 hover:border-slate-300"
                  }`}
                >
                  ₹{amt}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`rounded-xl px-4 py-2.5 text-sm sm:text-base font-black transition ${
                isCustom
                  ? "border-2 border-[#0055a2] bg-[#0055a2] text-white shadow-xs"
                  : "border border-dashed border-slate-300 bg-white text-[#0055a2] hover:bg-slate-50"
              }`}
            >
              Custom
            </button>
          </div>

          {isCustom && (
            <div className="mt-3 max-w-xs">
              <label
                htmlFor="custom-amt-input"
                className="block text-xs font-bold text-slate-700"
              >
                Enter Amount (₹)
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-bold text-slate-500">
                  ₹
                </span>
                <input
                  id="custom-amt-input"
                  type="number"
                  min={10}
                  step={10}
                  placeholder="200"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 pl-7 pr-3 text-sm font-bold text-slate-900 focus:border-[#0055a2] focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Payment Form */}
        <form onSubmit={handleCashfreePayment} className="mt-6 space-y-4 border-t border-slate-100 pt-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs sm:text-sm font-semibold text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="contrib-phone"
                className="block text-xs font-bold text-slate-700"
              >
                Mobile Number (Required for Cashfree)
              </label>
              <input
                id="contrib-phone"
                type="tel"
                required
                placeholder="10-digit mobile"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#0055a2] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="contrib-name"
                className="block text-xs font-bold text-slate-700"
              >
                Your Name (Optional)
              </label>
              <input
                id="contrib-name"
                type="text"
                placeholder="Candidate name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900 focus:border-[#0055a2] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || effectiveAmount < 10}
              className="w-full sm:w-auto rounded-xl bg-[#0055a2] px-7 py-3 text-sm sm:text-base font-bold text-white shadow-xs hover:bg-[#004382] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Connecting to Cashfree…</span>
                </>
              ) : (
                <span>Contribute ₹{effectiveAmount} with Cashfree</span>
              )}
            </button>
            <p className="mt-2 text-[11px] text-slate-500">
              Secured by Cashfree Payments. Supports UPI (Google Pay, PhonePe, Paytm, BHIM), Debit/Credit Cards, and Net Banking.
            </p>
          </div>
        </form>

        {/* Direct UPI Fallback */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-[#f8fafc] p-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-bold text-slate-700">Alternate: Direct UPI Transfer</p>
              <p className="mt-0.5 text-slate-900 font-extrabold select-all">{upiId}</p>
              <p className="text-[11px] text-slate-500">Payee: {upiName}</p>
            </div>
            <div className="shrink-0">
              <CopyUpiButton upiId={upiId} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
