"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  submitDynamicSurvey,
  getActiveCampaigns,
  type DynamicSurveyData,
} from "@/app/actions/surveys";
import type {
  SurveySettings,
  SurveyThemeColor,
  SurveyTargetRoutes,
  SurveyAudienceCriteria,
} from "@/lib/surveys/survey-settings";
import { recordGrowthInteractionAction } from "@/app/actions/growth-tracking";

interface UniversalCampaignHostProps {
  campaigns?: DynamicSurveyData[];
  completedAttempts?: number;
  userCreatedAt?: string | null;
  isLoggedIn?: boolean;
}

const THEME_STYLES: Record<
  SurveyThemeColor,
  {
    iconBg: string;
    badge: string;
    button: string;
    border: string;
    accent: string;
    ring: string;
    pillActive: string;
  }
> = {
  teal: {
    iconBg: "bg-teal-50 border border-teal-200/80 text-teal-800",
    badge: "bg-teal-50 text-teal-800 border-teal-200/80",
    button: "bg-teal-700 hover:bg-teal-800 text-white",
    border: "border-teal-200",
    accent: "text-teal-700",
    ring: "focus:ring-teal-400",
    pillActive: "bg-teal-700 text-white border-teal-700",
  },
  emerald: {
    iconBg: "bg-emerald-50 border border-emerald-200/80 text-emerald-800",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    button: "bg-emerald-700 hover:bg-emerald-800 text-white",
    border: "border-emerald-200",
    accent: "text-emerald-700",
    ring: "focus:ring-emerald-400",
    pillActive: "bg-emerald-700 text-white border-emerald-700",
  },
  rose: {
    iconBg: "bg-rose-50 border border-rose-200/80 text-rose-800",
    badge: "bg-rose-50 text-rose-800 border-rose-200/80",
    button: "bg-rose-600 hover:bg-rose-700 text-white",
    border: "border-rose-200",
    accent: "text-rose-600",
    ring: "focus:ring-rose-400",
    pillActive: "bg-rose-600 text-white border-rose-600",
  },
  blue: {
    iconBg: "bg-blue-50 border border-blue-200/80 text-blue-800",
    badge: "bg-blue-50 text-blue-800 border-blue-200/80",
    button: "bg-blue-700 hover:bg-blue-800 text-white",
    border: "border-blue-200",
    accent: "text-blue-700",
    ring: "focus:ring-blue-400",
    pillActive: "bg-blue-700 text-white border-blue-700",
  },
  amber: {
    iconBg: "bg-amber-50 border border-amber-200/80 text-amber-900",
    badge: "bg-amber-50 text-amber-900 border-amber-200/80",
    button: "bg-amber-600 hover:bg-amber-700 text-white",
    border: "border-amber-200",
    accent: "text-amber-800",
    ring: "focus:ring-amber-400",
    pillActive: "bg-amber-600 text-white border-amber-600",
  },
  indigo: {
    iconBg: "bg-indigo-50 border border-indigo-200/80 text-indigo-900",
    badge: "bg-indigo-50 text-indigo-900 border-indigo-200/80",
    button: "bg-indigo-700 hover:bg-indigo-800 text-white",
    border: "border-indigo-200",
    accent: "text-indigo-700",
    ring: "focus:ring-indigo-400",
    pillActive: "bg-indigo-700 text-white border-indigo-700",
  },
};

function matchesRoute(routes?: SurveyTargetRoutes, pathname: string = "/"): boolean {
  if (!routes) return true;
  if (routes.all) return true;
  if (routes.home && (pathname === "/" || pathname === "")) return true;
  if (routes.testReview && pathname.includes("/attempts/")) return true;
  if (routes.dashboard && (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))) {
    // If we are on test review, prioritize testReview setting
    if (pathname.includes("/attempts/")) {
      return !!routes.testReview;
    }
    return true;
  }
  if (routes.mockTests && pathname.startsWith("/mock-tests")) return true;
  if (routes.exams && pathname.startsWith("/exams")) return true;
  if (routes.customPath && routes.customPath.trim() !== "") {
    if (pathname === routes.customPath.trim() || pathname.startsWith(routes.customPath.trim())) {
      return true;
    }
  }
  return false;
}

function matchesCriteria(
  criteria: SurveyAudienceCriteria | undefined,
  context: { completedAttempts: number; userCreatedAt?: string | null; isLoggedIn: boolean }
): boolean {
  if (!criteria) return true;

  // 1. Auth check
  if (criteria.requireAuth && !context.isLoggedIn) {
    return false;
  }

  // 2. Mock Test Count condition
  const tests = context.completedAttempts;
  switch (criteria.testCondition) {
    case "zero_tests":
      if (tests !== 0) return false;
      break;
    case "one_to_four":
      if (tests < 1 || tests > 4) return false;
      break;
    case "five_plus":
      if (tests < 5) return false;
      break;
    case "custom_range":
      if (criteria.minTests !== undefined && tests < criteria.minTests) return false;
      if (criteria.maxTests !== undefined && tests > criteria.maxTests) return false;
      break;
    case "any":
    default:
      break;
  }

  // 3. Registration Date condition
  if (criteria.registrationCondition && criteria.registrationCondition !== "all") {
    if (context.userCreatedAt) {
      const regTime = new Date(context.userCreatedAt).getTime();
      const now = Date.now();
      if (criteria.registrationCondition === "last_7_days") {
        if (now - regTime > 7 * 86400000) return false;
      } else if (criteria.registrationCondition === "last_30_days") {
        if (now - regTime > 30 * 86400000) return false;
      } else if (criteria.registrationCondition === "registered_after" && criteria.registeredAfterDate) {
        const after = new Date(criteria.registeredAfterDate).getTime();
        if (regTime < after) return false;
      } else if (criteria.registrationCondition === "registered_before" && criteria.registeredBeforeDate) {
        const before = new Date(criteria.registeredBeforeDate).getTime();
        if (regTime > before) return false;
      }
    }
  }

  return true;
}

export function UniversalCampaignHost({
  campaigns: propCampaigns,
  completedAttempts = 0,
  userCreatedAt = null,
  isLoggedIn = false,
}: UniversalCampaignHostProps) {
  const pathname = usePathname();
  const [campaigns, setCampaigns] = useState<DynamicSurveyData[]>(propCampaigns || []);
  const [activeCampaign, setActiveCampaign] = useState<DynamicSurveyData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic user context from props or local storage
  const [effectiveAttempts, setEffectiveAttempts] = useState<number>(completedAttempts);
  const [effectiveCreatedAt, setEffectiveCreatedAt] = useState<string | null>(userCreatedAt);
  const [effectiveLoggedIn, setEffectiveLoggedIn] = useState<boolean>(isLoggedIn);

  useEffect(() => {
    if (completedAttempts > 0) {
      setEffectiveAttempts(completedAttempts);
      if (typeof window !== "undefined") {
        localStorage.setItem("varadhi_user_completed_tests", String(completedAttempts));
      }
    } else if (typeof window !== "undefined") {
      const cached = localStorage.getItem("varadhi_user_completed_tests");
      if (cached) {
        setEffectiveAttempts(parseInt(cached, 10));
      }
    }

    if (userCreatedAt) {
      setEffectiveCreatedAt(userCreatedAt);
      if (typeof window !== "undefined") {
        localStorage.setItem("varadhi_user_created_at", userCreatedAt);
      }
    } else if (typeof window !== "undefined") {
      const cached = localStorage.getItem("varadhi_user_created_at");
      if (cached) {
        setEffectiveCreatedAt(cached);
      }
    }

    if (isLoggedIn) {
      setEffectiveLoggedIn(true);
    } else if (typeof window !== "undefined") {
      // Check auth cookie presence
      const hasAuthCookie = document.cookie.includes("sb-") || document.cookie.includes("auth");
      if (hasAuthCookie) setEffectiveLoggedIn(true);
    }
  }, [completedAttempts, userCreatedAt, isLoggedIn]);

  // Survey answering state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [respondentName, setRespondentName] = useState("");
  const [respondentPhone, setRespondentPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Growth support custom amount state
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Fetch active campaigns if not provided
  useEffect(() => {
    if (!propCampaigns || propCampaigns.length === 0) {
      getActiveCampaigns().then((data) => {
        if (data && data.length > 0) {
          setCampaigns(data);
        }
      });
    } else {
      setCampaigns(propCampaigns);
    }
  }, [propCampaigns]);

  // Context bundle
  const candidateContext = useMemo(
    () => ({
      completedAttempts: effectiveAttempts,
      userCreatedAt: effectiveCreatedAt,
      isLoggedIn: effectiveLoggedIn,
    }),
    [effectiveAttempts, effectiveCreatedAt, effectiveLoggedIn]
  );

  // Find eligible campaign
  useEffect(() => {
    // CRITICAL SAFETY RULE: Never interrupt students during active mock test attempt or in admin panels
    if (!pathname || pathname.includes("/attempt") || pathname.startsWith("/admin")) {
      setIsOpen(false);
      return;
    }

    if (!campaigns || campaigns.length === 0) return;

    let selected: DynamicSurveyData | null = null;

    for (const c of campaigns) {
      if (!c.is_active) continue;

      const s = c.settings as SurveySettings | undefined;

      // 1. Placement Check: If page_only, skip in-app popup
      if (s?.displayMode === "page_only") continue;

      // 2. Active Date Range Check
      if (s?.startDate) {
        const start = new Date(s.startDate).getTime();
        if (!isNaN(start) && Date.now() < start) continue;
      }
      if (s?.expiryDate) {
        const exp = new Date(s.expiryDate).getTime();
        if (!isNaN(exp) && Date.now() > exp) continue;
      }

      // 3. Route Check
      if (!matchesRoute(s?.targetRoutes, pathname)) continue;

      // 4. Criteria Check (Mock tests count, Registration date, Auth)
      if (!matchesCriteria(s?.criteria, candidateContext)) continue;

      // 5. Cooldown & LocalStorage Frequency Rules
      const completedKey = `varadhi_campaign_completed_${c.id}`;
      const dismissedKey = `varadhi_campaign_dismissed_${c.id}`;
      const countKey = `varadhi_campaign_appearance_count_${c.id}`;

      if (typeof window !== "undefined") {
        const isCompleted = localStorage.getItem(completedKey);
        if (isCompleted && !s?.reappearIfSubmitted) continue;

        const appearances = parseInt(localStorage.getItem(countKey) || "0", 10);
        const maxAppearances = s?.maxSkipAppearances ?? 3;
        if (appearances >= maxAppearances) continue;

        const dismissedAtStr = localStorage.getItem(dismissedKey);
        if (dismissedAtStr) {
          const dismissedAt = parseInt(dismissedAtStr, 10);
          const cooldownDays = s?.cooldownDays ?? 3;
          const cooldownMs = cooldownDays * 86400000;
          if (Date.now() - dismissedAt < cooldownMs) continue;
        }
      }

      // If we reach here, this campaign is eligible!
      selected = c;
      break;
    }

    if (!selected) {
      setActiveCampaign(null);
      setIsOpen(false);
      return;
    }

    setActiveCampaign(selected);

    // Set delay timer
    const s = selected.settings as SurveySettings | undefined;
    const delaySeconds = s?.triggerDelaySeconds ?? 2.5;
    const delayMs = Math.max(500, delaySeconds * 1000);

    const timer = setTimeout(() => {
      setIsOpen(true);
      // Track impression in localStorage
      if (typeof window !== "undefined") {
        const countKey = `varadhi_campaign_appearance_count_${selected!.id}`;
        const currentCount = parseInt(localStorage.getItem(countKey) || "0", 10);
        localStorage.setItem(countKey, String(currentCount + 1));
      }

      // Record interaction if growth support form
      if (s?.formType === "growth_support") {
        void recordGrowthInteractionAction({
          eventType: "view",
          buttonLabel: "Impression",
          pagePath: pathname,
          metadata: { campaignId: selected!.id, campaignTitle: selected!.title },
        });
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [campaigns, pathname, candidateContext]);

  // Handle Dismissal / Maybe Later
  const handleDismiss = useCallback(() => {
    if (!activeCampaign) return;
    const dismissedKey = `varadhi_campaign_dismissed_${activeCampaign.id}`;
    if (typeof window !== "undefined") {
      localStorage.setItem(dismissedKey, String(Date.now()));
    }

    const s = activeCampaign.settings as SurveySettings | undefined;
    if (s?.formType === "growth_support") {
      void recordGrowthInteractionAction({
        eventType: "dismiss",
        buttonLabel: s.contribution?.secondaryButtonText || "Maybe Later",
        pagePath: pathname,
        metadata: { campaignId: activeCampaign.id },
      });
    }

    setIsOpen(false);
  }, [activeCampaign, pathname]);

  // Handle Growth CTA Click
  const handleSupportClick = useCallback(() => {
    if (!activeCampaign) return;
    const s = activeCampaign.settings as SurveySettings | undefined;
    const amount =
      selectedAmount || (customAmount ? parseInt(customAmount, 10) : 99);

    void recordGrowthInteractionAction({
      eventType: "click_support",
      buttonLabel: s?.contribution?.primaryButtonText || "Support Varadhi",
      amount,
      pagePath: pathname,
      metadata: { campaignId: activeCampaign.id },
    });

    if (typeof window !== "undefined") {
      localStorage.setItem(`varadhi_campaign_completed_${activeCampaign.id}`, "true");
    }
  }, [activeCampaign, selectedAmount, customAmount, pathname]);

  // Handle Survey Submission
  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCampaign) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const s = activeCampaign.settings as SurveySettings | undefined;

    // Validate required questions
    for (const q of activeCampaign.questions || []) {
      if (q.is_required && (!answers[q.id] || answers[q.id].trim() === "")) {
        setErrorMsg("Please answer all required questions before submitting.");
        setIsSubmitting(false);
        return;
      }
    }

    // Validate phone if required
    if (s?.requirePhone === "required" && !respondentPhone.trim()) {
      setErrorMsg("Please provide your phone number.");
      setIsSubmitting(false);
      return;
    }

    const respondentInfo = {
      name: respondentName.trim() || undefined,
      contact: respondentPhone.trim() || undefined,
    };

    const res = await submitDynamicSurvey(activeCampaign.id, answers, respondentInfo);
    setIsSubmitting(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setIsSuccess(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(`varadhi_campaign_completed_${activeCampaign.id}`, "true");
      }
      setTimeout(() => {
        setIsOpen(false);
      }, 2500);
    }
  };

  const handleCopyUpi = (upiId: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  if (!isOpen || !activeCampaign) return null;

  const settings = (activeCampaign.settings || {}) as SurveySettings;
  const formType = settings.formType || "survey";
  const appIcon = settings.appIcon || (formType === "growth_support" ? "💖" : formType === "announcement" ? "📢" : "📝");
  const theme = THEME_STYLES[settings.themeColor || "teal"] || THEME_STYLES.teal;
  const badgeText = settings.badgeText || (formType === "growth_support" ? "Help Us Grow" : formType === "announcement" ? "Notice" : "Student Feedback");
  const contribution = settings.contribution || {};

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all">
        {/* Top Accent Gradient Line */}
        <div className={`h-1.5 w-full bg-linear-to-r ${settings.themeColor === "rose" ? "from-rose-500 via-pink-500 to-amber-500" : settings.themeColor === "amber" ? "from-amber-500 via-orange-500 to-rose-500" : settings.themeColor === "blue" ? "from-blue-600 via-indigo-500 to-teal-500" : "from-teal-600 via-emerald-500 to-amber-500"}`} />

        {/* Modal Header with Visual App Icon & Badge */}
        <div className="flex items-start justify-between gap-3 p-5 sm:p-6 pb-2">
          <div className="flex items-center gap-3">
            {/* Visual App Icon Squircle */}
            <div
              className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center text-2xl shadow-xs transition transform hover:scale-105 ${theme.iconBg}`}
            >
              {appIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${theme.badge}`}
                >
                  {badgeText}
                </span>
              </div>
              <h3 className="mt-1 text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                {activeCampaign.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Subtitle / Description */}
        {activeCampaign.description && (
          <p className="px-5 sm:px-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
            {activeCampaign.description}
          </p>
        )}

        {/* Form Body Based on Form Type */}
        <div className="p-5 sm:p-6 pt-3">
          {formType === "growth_support" ? (
            /* 1. GROWTH SUPPORT POP-UP */
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {contribution.message ||
                    "All mock tests on Varadhi Prep are completely free and ad-free. If this platform helps your preparation, consider a small voluntary contribution to keep it running for everyone."}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1">🛡️ 100% Ad-Free</span>
                  <span className="flex items-center gap-1">⚡ Fast Cloud Servers</span>
                  <span className="flex items-center gap-1">🎯 Telugu Aspirants</span>
                </div>
              </div>

              {/* Preset Contribution Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Choose a Voluntary Contribution:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(contribution.suggestedAmounts || [49, 99, 199, 499]).map((amt) => {
                    const isSelected = selectedAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount("");
                        }}
                        className={`rounded-xl py-2 px-1 text-center font-bold text-xs sm:text-sm border transition active:scale-95 ${
                          isSelected
                            ? theme.pillActive
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        ₹{amt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* UPI Quick Details if configured */}
              {contribution.upiId && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                  <span className="text-slate-500 font-medium">
                    UPI ID:{" "}
                    <span className="font-mono font-bold text-slate-800">
                      {contribution.upiId}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyUpi(contribution.upiId!)}
                    className="text-xs font-bold text-teal-700 hover:underline"
                  >
                    {copiedUpi ? "✓ Copied" : "Copy UPI"}
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <Link
                  href={`/help-us-to-grow?amount=${
                    selectedAmount || (customAmount ? parseInt(customAmount, 10) : 99)
                  }`}
                  onClick={handleSupportClick}
                  className={`flex-1 rounded-xl py-3 px-4 text-center text-xs sm:text-sm font-black shadow-xs transition active:scale-95 ${theme.button}`}
                >
                  {contribution.primaryButtonText || "Support Varadhi"} &rarr;
                </Link>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  {contribution.secondaryButtonText || "Maybe Later"}
                </button>
              </div>
            </div>
          ) : formType === "announcement" ? (
            /* 2. ANNOUNCEMENT POP-UP */
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {activeCampaign.description ||
                  "Check out the latest mock tests, syllabus updates, and preparation features on Varadhi Prep."}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <Link
                  href="/mock-tests"
                  onClick={handleDismiss}
                  className={`rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 ${theme.button}`}
                >
                  Explore Mock Tests &rarr;
                </Link>
              </div>
            </div>
          ) : (
            /* 3. DYNAMIC SURVEY FORM */
            <form onSubmit={handleSurveySubmit} className="space-y-4">
              {isSuccess ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center text-emerald-900 animate-in fade-in">
                  <span className="text-3xl">🎉</span>
                  <h4 className="mt-2 text-base font-bold">Thank You for Your Feedback!</h4>
                  <p className="mt-1 text-xs text-emerald-700">
                    Your suggestions directly shape future mock tests and study material.
                  </p>
                </div>
              ) : (
                <>
                  {errorMsg && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
                      {errorMsg}
                    </div>
                  )}

                  {/* Question list */}
                  <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                    {(activeCampaign.questions || []).map((q, idx) => (
                      <div
                        key={q.id}
                        className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-2xs space-y-2"
                      >
                        <label className="block text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                          <span className="text-slate-400 mr-1.5 font-mono">#{idx + 1}</span>
                          {q.question_text}
                          {q.is_required && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        {q.question_type === "radio" && q.options && q.options.length > 0 ? (
                          <div className="grid gap-1.5 pt-1">
                            {q.options.map((opt) => (
                              <label
                                key={opt}
                                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs font-semibold cursor-pointer transition ${
                                  answers[q.id] === opt
                                    ? `${theme.badge} border-current`
                                    : "border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`q_${q.id}`}
                                  value={opt}
                                  checked={answers[q.id] === opt}
                                  onChange={() =>
                                    setAnswers((prev) => ({ ...prev, [q.id]: opt }))
                                  }
                                  className="accent-slate-900"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : q.question_type === "textarea" ? (
                          <textarea
                            rows={2}
                            value={answers[q.id] || ""}
                            onChange={(e) =>
                              setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                            }
                            placeholder="Your answer or suggestions..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={answers[q.id] || ""}
                            onChange={(e) =>
                              setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                            }
                            placeholder="Your answer..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                          />
                        )}
                      </div>
                    ))}

                    {/* Optional/Required Contact Info */}
                    {settings.requirePhone !== "none" && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Your Name (Optional)"
                          value={respondentName}
                          onChange={(e) => setRespondentName(e.target.value)}
                          className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                        />
                        <input
                          type="tel"
                          placeholder={`Phone ${settings.requirePhone === "required" ? "(Required)" : "(Optional)"}`}
                          value={respondentPhone}
                          onChange={(e) => setRespondentPhone(e.target.value)}
                          className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Skip For Now
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`rounded-xl px-5 py-2.5 text-xs sm:text-sm font-black shadow-xs transition active:scale-95 disabled:opacity-60 ${theme.button}`}
                    >
                      {isSubmitting ? "Submitting…" : "Submit Feedback &rarr;"}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
