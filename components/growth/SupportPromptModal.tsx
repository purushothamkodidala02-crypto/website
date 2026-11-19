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
  const [effectiveCount, setEffectiveCount] = useState<number>(serverCompletedAttempts ?? 0);

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

  if (!isOpen) return null;

  return (
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

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl transition-all">
        {/* Top Header Accent Rule - Emerald & Amber gradient aligned with Help Us to Grow */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />

        <div className="p-5 sm:p-7">
          {/* Top Bar with Badge & Dismiss */}
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Dedicated Learner
            </span>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close dialog"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
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
            className="mt-3 text-lg sm:text-xl font-black text-[#0f172a] leading-snug tracking-tight"
          >
            {settings.headline || "Support the Mission to Keep Quality Mock Tests Open & Free"}
          </h2>

          {/* Body Message */}
          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            {settings.message ||
              "We do not ask for money from new users or casual visitors. Every candidate is encouraged to explore, read syllabi, and practice freely. As a committed candidate who has been using our platform for a long time, you have experienced first-hand the academic and technical standard of Varadhi Prep. We bear monthly server, database, and bilingual question curation costs to keep all tests open, fast, and 100% ad-free."}
          </p>

          {/* Value Highlights Pill Chips */}
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-center">
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-emerald-800">100% Ad-Free</span>
              <span className="text-[10px] text-slate-500">Zero distractions</span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-200/80 px-1">
              <span className="text-[11px] font-bold text-emerald-800">Fast Servers</span>
              <span className="text-[10px] text-slate-500">Sub-50ms latency</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-emerald-800">Bilingual Tests</span>
              <span className="text-[10px] text-slate-500">Verified syllabus</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            If our platform has benefited your preparation, your voluntary contribution helps keep tests accessible for fellow candidates.
          </p>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition text-center"
            >
              {settings.secondaryButtonText || "Maybe Later"}
            </button>

            <Link
              href="/help-us-to-grow"
              onClick={handleSupportClick}
              className="rounded-xl bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-xs hover:shadow transition text-center flex items-center justify-center gap-1.5"
            >
              <span>{settings.primaryButtonText || "Support Varadhi"}</span>
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
  );
}
