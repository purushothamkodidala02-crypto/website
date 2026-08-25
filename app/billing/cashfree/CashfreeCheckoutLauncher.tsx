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
  const [isOpening, setIsOpening] = useState(false);
  const launchedRef = useRef(false);
  const launchTimeoutRef = useRef<number | null>(null);

  async function openCheckout() {
    if (!scriptReady || launchedRef.current || !window.Cashfree) return;
    launchedRef.current = true;
    setError("");
    setIsOpening(true);
    launchTimeoutRef.current = window.setTimeout(() => {
      setError("Cashfree did not open. Please try again, or return to the mock test and start a fresh purchase.");
      launchedRef.current = false;
      setIsOpening(false);
    }, 8000);
    try {
      const checkout = window.Cashfree({ mode });
      const result = await checkout.checkout({ paymentSessionId, redirectTarget: "_self" });
      const providerMessage = checkoutErrorMessage(result);
      if (providerMessage) {
        if (launchTimeoutRef.current) window.clearTimeout(launchTimeoutRef.current);
        setError(providerMessage);
        launchedRef.current = false;
      }
    } catch {
      if (launchTimeoutRef.current) window.clearTimeout(launchTimeoutRef.current);
      setError("We could not open the secure payment page. Please try again.");
      launchedRef.current = false;
    } finally {
      setIsOpening(false);
    }
  }

  useEffect(() => {
    if (scriptReady || error) return;
    const timeout = window.setTimeout(() => {
      setError("The payment page is taking too long to load. Please try again.");
    }, 12000);
    return () => window.clearTimeout(timeout);
  }, [error, scriptReady]);

  useEffect(() => () => {
    if (launchTimeoutRef.current) window.clearTimeout(launchTimeoutRef.current);
  }, []);

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
        <section aria-busy={isOpening} className="w-full max-w-lg rounded-3xl border bg-white p-8 text-center shadow-sm">
          <p className={`text-xs font-black uppercase tracking-[0.14em] ${error ? "text-red-700" : "text-teal-700"}`}>
            {error ? "Payment page unavailable" : scriptReady ? "Secure checkout ready" : "Secure checkout"}
          </p>
          <h1 className="mt-3 text-3xl font-black">
            {error ? "We could not open Cashfree checkout." : scriptReady ? "Continue to secure payment" : "Preparing secure checkout..."}
          </h1>
          <p aria-live="polite" className="mt-4 leading-7 text-slate-600">
            {error
              ? "Please try again from the locked mock test or Purchases page. If the issue continues, confirm that varadhiprep.in is whitelisted in Cashfree."
              : scriptReady
                ? "Select the button below to open the Cashfree payment page for your exam series."
                : "Please wait while we prepare the secure payment page for your exam series."}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {(scriptReady || error) && (
              <button
                type="button"
                onClick={openCheckout}
                disabled={!scriptReady || isOpening}
                className="inline-flex min-w-52 items-center justify-center rounded-xl bg-teal-600 px-5 py-3 text-sm font-black text-white hover:bg-teal-700 disabled:cursor-wait disabled:opacity-70"
              >
                {isOpening ? "Opening secure payment..." : error ? "Try secure payment again" : "Continue to Cashfree"}
              </button>
            )}
            <Link
              href={returnTo}
              className="inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
            >
              Back to mock test
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
