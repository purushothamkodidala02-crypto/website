"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Cashfree?: (options: { mode: "production" | "sandbox" }) => {
      checkout: (options: { paymentSessionId: string; redirectTarget: "_self" }) => Promise<unknown> | void;
    };
  }
}

type Props = {
  mode: "production" | "sandbox";
  paymentSessionId: string;
  returnTo: string;
  nonce?: string;
};

function checkoutErrorMessage(result: unknown) {
  if (!result || typeof result !== "object" || !("error" in result)) return "";
  const error = (result as { error?: unknown }).error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "Cashfree could not open the secure payment page.";
}

export function CashfreeCheckoutLauncher({ mode, paymentSessionId, returnTo, nonce }: Props) {
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState("");
  const launchedRef = useRef(false);

  useEffect(() => {
    if (!scriptReady || launchedRef.current || !window.Cashfree) return;

    async function openCheckout() {
      launchedRef.current = true;
      try {
        const checkout = window.Cashfree?.({ mode });
        if (!checkout) throw new Error("Cashfree checkout did not initialise.");
        const result = await checkout.checkout({ paymentSessionId, redirectTarget: "_self" });
        const providerMessage = checkoutErrorMessage(result);
        if (providerMessage) setError(providerMessage);
      } catch {
        setError("We could not open the secure payment page. Please try again.");
      }
    }
    void openCheckout();
  }, [mode, paymentSessionId, scriptReady]);

  useEffect(() => {
    if (scriptReady || error) return;
    const timeout = window.setTimeout(() => {
      setError("The payment page is taking too long to load. Please try again.");
    }, 12000);
    return () => window.clearTimeout(timeout);
  }, [error, scriptReady]);

  return (
    <>
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="afterInteractive"
        nonce={nonce}
        onLoad={() => setScriptReady(true)}
        onError={() => setError("The payment page could not be loaded right now. Please try again.")}
      />
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <section className="w-full max-w-lg rounded-3xl border bg-white p-8 text-center shadow-sm">
          <p className={`text-xs font-black uppercase tracking-[0.14em] ${error ? "text-red-700" : "text-teal-700"}`}>
            {error ? "Payment page unavailable" : "Secure checkout"}
          </p>
          <h1 className="mt-3 text-3xl font-black">
            {error ? "We could not open Cashfree checkout." : "Opening Cashfree checkout..."}
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            {error
              ? "Please try again from the locked mock test or Purchases page. If the issue continues, confirm that varadhiprep.in is whitelisted in Cashfree."
              : "Please wait while we open the secure payment page for your exam series."}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={error ? "/dashboard/passes" : returnTo}
              className="inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
            >
              {error ? "Back to Purchases" : "Back"}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
