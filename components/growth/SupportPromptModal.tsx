"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { GrowthPopupSettings } from "@/lib/growth-settings";
import { getLocalAttemptedTestIds } from "@/lib/storage/student-practice-storage";

type SupportPromptModalProps = {
  completedAttempts?: number;
  settings: GrowthPopupSettings;
};

export function SupportPromptModal({
  completedAttempts: serverCompletedAttempts,
  settings,
}: SupportPromptModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, setEffectiveCount] = useState<number>(serverCompletedAttempts ?? 0);

  const defaultAmounts = settings.suggestedAmounts?.length
    ? settings.suggestedAmounts
    : [49, 99, 199, 499];
  const [selectedAmount, setSelectedAmount] = useState<number>(defaultAmounts[0] ?? 49);

  // Allow opening via custom event from any button on the site
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-growth-popup", handleOpen);
    return () => window.removeEventListener("open-growth-popup", handleOpen);
  }, []);

  useEffect(() => {
    // 0. Immediate preview mode for verification (?preview_growth=true or ?preview=growth)
    const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const isPreview = urlParams?.get("preview_growth") === "true" || urlParams?.get("preview") === "growth";
    if (isPreview) {
      setEffectiveCount(serverCompletedAttempts && serverCompletedAttempts > 0 ? serverCompletedAttempts : 5);
      setIsOpen(true);
      return;
    }

    // 1. Master enable check
    if (!settings.enabled) return;

    // 2. Resolve count: use server count if available, or check local completed attempts
    let count = serverCompletedAttempts ?? 0;
    if (count <= 0) {
      count = getLocalAttemptedTestIds().length;
    }

    // 3. Strict threshold check: Only candidates who completed 5 or more tests
    const threshold = settings.minCompletedTests ?? 5;
    if (count < threshold) return;

    // 4. Check if already supported
    const supportedAt = localStorage.getItem("varadhi_growth_supported_at");
    if (supportedAt) return;

    // 5. Check dismissal cooldown
    const dismissedAt = localStorage.getItem("varadhi_growth_dismissed_at");
    if (dismissedAt) {
      const cooldownMs = (settings.cooldownDays ?? 7) * 24 * 60 * 60 * 1000;
      const timePassed = Date.now() - parseInt(dismissedAt, 10);
      if (timePassed < cooldownMs) return;
    }

    // 6. Check appearance frequency
    const appearanceCount = parseInt(
      localStorage.getItem("varadhi_growth_appearance_count") || "0",
      10,
    );
    const maxAppearances = settings.maxAppearances ?? 3;
    if (maxAppearances > 0 && appearanceCount >= maxAppearances) return;

    // 7. Respectful trigger delay so user isn't startled on page paint
    const delayMs = Math.max(800, (settings.displayDelaySeconds ?? 2.5) * 1000);
    const timer = setTimeout(() => {
      setEffectiveCount(count);
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [serverCompletedAttempts, settings]);

  const handleDismiss = () => {
    const currentCount = parseInt(
      localStorage.getItem("varadhi_growth_appearance_count") || "0",
      10,
    );
    localStorage.setItem(
      "varadhi_growth_appearance_count",
      String(currentCount + 1),
    );
    localStorage.setItem("varadhi_growth_dismissed_at", String(Date.now()));
    setIsOpen(false);
  };

  const handleSupportClick = () => {
    localStorage.setItem("varadhi_growth_supported_at", String(Date.now()));
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Trigger Button: Open on button click */}
      {!isOpen && settings.enabled && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Support Varadhi Prep"
          className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white/95 px-3.5 py-2 text-xs font-black text-emerald-900 shadow-md shadow-emerald-950/10 backdrop-blur-md transition hover:bg-emerald-50 hover:border-emerald-400 hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6 cursor-pointer"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>🌱 Support Us</span>
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="growth-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] transition-opacity"
            onClick={handleDismiss}
          />

          {/* Dialog Card */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Top Header Accent Rule */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />

            <div className="p-5 sm:p-6">
              {/* Top Bar with Icon & Dismiss */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100/80 text-base">
                    🌱
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      100% Ad-Free • Community Supported
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDismiss}
                  aria-label="Close dialog"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Heading */}
              <h2
                id="growth-modal-title"
                className="mt-3.5 text-lg sm:text-xl font-black text-slate-900 tracking-tight"
              >
                {settings.headline || "Support Varadhi Prep"}
              </h2>

              {/* Body Message - Crisp & Clear, No unwanted text */}
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {settings.message && settings.message.length < 150
                  ? settings.message
                  : "All mock tests are free and ad-free. If this platform helps your preparation, consider a small voluntary contribution to keep it running for everyone."}
              </p>

              {/* Contribution Tier Buttons - "pop-up on the button" */}
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Contribution Amount
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {defaultAmounts.map((amt) => {
                    const isSelected = selectedAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setSelectedAmount(amt)}
                        className={`rounded-xl py-2 px-1 text-center text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                          isSelected
                            ? "border-2 border-[#059669] bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-[#059669]"
                            : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        ₹{amt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition text-center cursor-pointer"
                >
                  {settings.secondaryButtonText || "Maybe Later"}
                </button>

                <Link
                  href={`/help-us-to-grow?amount=${selectedAmount}`}
                  onClick={handleSupportClick}
                  className="rounded-xl bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-xs hover:shadow transition text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{settings.primaryButtonText || "Support Varadhi"} (₹{selectedAmount})</span>
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
