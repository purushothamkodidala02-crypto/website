"use client";

import { useState } from "react";
import Script from "next/script";
import { initiateCashfreeGrowthContribution } from "@/app/actions/growth-payment";

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
  suggestedAmounts?: number[];
  upiId?: string;
  upiName?: string;
  defaultPhone?: string;
  defaultName?: string;
  initialAmount?: number;
};

export function CashfreeContributionBox({
  suggestedAmounts = [49, 99, 199, 499],
  upiId = "",
  upiName = "",
  defaultPhone = "",
  defaultName = "",
  initialAmount,
}: Props) {
  const isInitialCustom = Boolean(
    initialAmount && initialAmount > 0 && !suggestedAmounts.includes(initialAmount)
  );
  const [selectedAmount, setSelectedAmount] = useState<number>(
    initialAmount && suggestedAmounts.includes(initialAmount)
      ? initialAmount
      : (suggestedAmounts[0] ?? 49)
  );
  const [customAmount, setCustomAmount] = useState<string>(
    isInitialCustom ? String(initialAmount) : ""
  );
  const [isCustom, setIsCustom] = useState(isInitialCustom);
  const [phone, setPhone] = useState(defaultPhone);
  const [name, setName] = useState(defaultName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setSdkReady] = useState(false);

  const effectiveAmount = isCustom
    ? parseInt(customAmount, 10) || 0
    : selectedAmount;

  async function handleCashfreePayment(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (effectiveAmount < 1) {
      setError("Please select or enter an amount of at least ₹1.");
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
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
        setError(res.error || "Could not launch Cashfree checkout. Please try again.");
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
      setError("An unexpected error occurred while launching payment. Please try again.");
      setLoading(false);
    }
  }

  // Only display direct UPI if an official UPI ID is specifically configured
  const showUpiFallback = Boolean(upiId && upiId.trim().length > 0);

  return (
    <>
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />

      <div className="rounded-2xl border border-[#d5d9d9] bg-white p-6 sm:p-7 shadow-xs">
        {/* Amount Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#565959]">
            Select Amount
          </label>
          <div className="mt-2.5 grid grid-cols-3 sm:grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`rounded-xl py-2.5 px-3 text-center text-sm transition cursor-pointer ${
                isCustom
                  ? "border-2 border-[#e77600] bg-[#fff8e7] text-[#0f1111] font-black shadow-xs ring-1 ring-[#e77600]"
                  : "border border-dashed border-[#d5d9d9] bg-white text-[#565959] hover:bg-[#f7fafa] hover:border-[#888c8c] font-semibold"
              }`}
            >
              Custom
            </button>

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
                  className={`rounded-xl py-2.5 px-3 text-center text-sm transition cursor-pointer ${
                    active
                      ? "border-2 border-[#e77600] bg-[#fff8e7] text-[#0f1111] font-black shadow-xs ring-1 ring-[#e77600]"
                      : "border border-[#d5d9d9] bg-white text-[#0f1111] hover:border-[#888c8c] hover:bg-[#f7fafa] font-semibold"
                  }`}
                >
                  ₹{amt}
                </button>
              );
            })}
          </div>

          {isCustom && (
            <div className="mt-3">
              <label
                htmlFor="custom-amt-input"
                className="block text-xs font-bold text-[#0f1111]"
              >
                Enter Custom Amount
              </label>
              <div className="relative mt-1 max-w-xs">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-bold text-[#565959]">
                  ₹
                </span>
                <input
                  id="custom-amt-input"
                  type="number"
                  min={1}
                  step={1}
                  placeholder="e.g. 1, 20, 50"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full rounded-xl border border-[#d5d9d9] py-2 pl-7 pr-3 text-sm font-bold text-[#0f1111] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-[#565959]">
                Minimum contribution is ₹1. Every rupee directly supports our platform.
              </p>
            </div>
          )}
        </div>

        {/* Payment Form */}
        <form onSubmit={handleCashfreePayment} className="mt-5 space-y-3.5 border-t border-slate-100 pt-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="contrib-phone"
              className="block text-xs font-bold text-[#0f1111]"
            >
              Mobile Number
            </label>
            <input
              id="contrib-phone"
              type="tel"
              required
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#d5d9d9] px-3.5 py-2.5 text-sm font-semibold text-[#0f1111] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="contrib-name"
              className="block text-xs font-bold text-[#0f1111]"
            >
              Your Name (Optional)
            </label>
            <input
              id="contrib-name"
              type="text"
              placeholder="Candidate name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#d5d9d9] px-3.5 py-2.5 text-sm font-semibold text-[#0f1111] focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || effectiveAmount < 1}
              className="w-full rounded-xl bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] text-white font-extrabold py-3.5 px-6 text-sm sm:text-base shadow-xs transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Processing Contribution…</span>
              ) : (
                <span>Contribute ₹{effectiveAmount}</span>
              )}
            </button>
            <p className="mt-2 text-center text-[11px] text-[#565959]">
              Secured 256-bit payment. Supports UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, and Net Banking.
            </p>
          </div>
        </form>

        {/* Optional Valid Direct UPI Fallback */}
        {showUpiFallback && (
          <div className="mt-5 rounded-xl border border-[#d5d9d9] bg-[#f8f9fa] p-3.5 text-xs">
            <p className="font-bold text-[#0f1111]">Alternate: Direct UPI Transfer</p>
            <p className="mt-0.5 text-[#0f1111] font-bold select-all">{upiId}</p>
            {upiName && <p className="text-[11px] text-[#565959]">Payee: {upiName}</p>}
          </div>
        )}
      </div>

      {/* Floating Loading / Rendering Card */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-[#c45500]">
              <svg
                className="h-6 w-6 animate-spin text-[#c45500]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              Preparing Your Contribution
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Securely setting up ₹{effectiveAmount} contribution…
            </p>
          </div>
        </div>
      )}
    </>
  );
}
