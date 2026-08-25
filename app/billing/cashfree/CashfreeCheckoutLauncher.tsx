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
};

export function CashfreeCheckoutLauncher({ mode, paymentSessionId, returnTo }: Props) {
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState("");
  const launchedRef = useRef(false);

  useEffect(() => {
    if (!scriptReady || launchedRef.current || !window.Cashfree) return;

    try {
      launchedRef.current = true;
      const checkout = window.Cashfree({ mode });
      void checkout.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });
    } catch {
      window.setTimeout(() => {
        setError("We could not open the secure payment page. Please try again.");
      }, 0);
    }
  }, [mode, paymentSessionId, scriptReady]);

  return (
    <>
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="afterInteractive"
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
              ? "Please try again from the Exam Pass page. If the issue continues, confirm that varadhiprep.in is whitelisted in Cashfree."
              : "Please wait while we open the secure payment page for your Exam Pass."}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={error ? "/dashboard/passes" : returnTo}
              className="inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
            >
              {error ? "Back to Exam Passes" : "Back"}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
