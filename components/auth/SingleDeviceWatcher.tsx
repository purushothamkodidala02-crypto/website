"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { checkActiveSessionStatus } from "@/app/actions/session-status";
import { createClient } from "@/lib/supabase/client";
import { clearLocalPracticeStorage } from "@/lib/storage/student-practice-storage";

export function SingleDeviceWatcher() {
  const [displaced, setDisplaced] = useState(false);
  const isCheckingRef = useRef(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    const verify = async () => {
      if (isCheckingRef.current || hasTriggeredRef.current || !mounted) return;
      isCheckingRef.current = true;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          isCheckingRef.current = false;
          return;
        }

        const res = await checkActiveSessionStatus();
        if (mounted && res.authenticated && !res.valid && res.reason === "displaced_by_another_device") {
          // Double-check after a brief grace delay to eliminate transient cookie-sync race conditions
          await new Promise((resolve) => setTimeout(resolve, 2500));
          const confirmed = await checkActiveSessionStatus();
          if (mounted && confirmed.authenticated && !confirmed.valid && confirmed.reason === "displaced_by_another_device") {
            hasTriggeredRef.current = true;
            setDisplaced(true);
            try {
              clearLocalPracticeStorage();
              await supabase.auth.signOut({ scope: "local" });
            } catch {
              // Ignore
            }
          }
        }
      } catch {
        // Ignore transient network errors
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Check periodically every 60 seconds and debounced when tab becomes active
    const interval = window.setInterval(() => void verify(), 60000);
    let visibilityTimer: ReturnType<typeof setTimeout> | undefined;
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (visibilityTimer) clearTimeout(visibilityTimer);
        visibilityTimer = setTimeout(() => {
          void verify();
        }, 3000);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      if (visibilityTimer) clearTimeout(visibilityTimer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  if (!displaced) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="displaced-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-5 backdrop-blur-sm"
    >
      <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-50/50">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
          Single device active
        </p>
        <h2 id="displaced-title" className="mt-2 text-2xl font-black text-slate-950">
          Signed In on Another Device
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your Varadhi Prep account was signed in on another device (such as your mobile phone). To protect your account and test integrity, this session has been closed.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl bg-teal-800 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-900"
          >
            Sign in on this device
          </Link>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
