import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/site/PublicHeader";
import { CashfreeContributionBox } from "@/components/growth/CashfreeContributionBox";
import { getCashfreeOrderStatus } from "@/lib/payments/cashfree";
import { getGrowthSettings } from "@/lib/growth-settings";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Help Us to Grow | Support Varadhi Prep",
  description:
    "Support Varadhi Prep to keep competitive mock tests free, reliable, and 100% ad-free. Review platform maintenance costs and contribute via Cashfree or UPI.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: absoluteUrl("/help-us-to-grow"),
  },
};

export default async function HelpUsToGrowPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; preview?: string; order_id?: string; amount?: string }>;
}) {
  const query = await searchParams;

  let isVerifiedPaid = false;
  let isPaymentCancelled = false;
  let verifiedAmount: number | null = null;

  // Real-time server verification: Only show Thank You if Cashfree actually marks order as PAID
  if (query.order_id) {
    try {
      const orderStatus = await getCashfreeOrderStatus(query.order_id);
      if (orderStatus.paid) {
        isVerifiedPaid = true;
        if (orderStatus.payload && "order_amount" in orderStatus.payload && orderStatus.payload.order_amount) {
          verifiedAmount = Number(orderStatus.payload.order_amount);
        }
      } else {
        // Order exists but is ACTIVE (abandoned/dropped), CANCELLED, or FAILED
        isPaymentCancelled = true;
      }
    } catch {
      // If unable to verify status or order does not exist
      isPaymentCancelled = true;
    }
  }

  const [settings, supabase] = await Promise.all([
    getGrowthSettings(),
    createClient(),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userPhone = "";
  let userName = "";
  let isAdmin = false;

  if (user) {
    userName = user.user_metadata?.full_name || user.user_metadata?.name || "";
    const { data: profile } = await supabase
      .from("profiles")
      .select("mobile, full_name, role")
      .eq("id", user.id)
      .maybeSingle();
    userPhone = profile?.mobile || "";
    if (profile?.full_name) userName = profile.full_name;
    if (profile?.role === "admin") isAdmin = true;
  }

  // Hide mode: If disabled and not previewing or returning from payment, regular candidates receive 404
  const isPreview = query.preview === "true" || isAdmin || isVerifiedPaid || isPaymentCancelled;
  if (!settings.enabled && !isPreview) {
    notFound();
  }

  const suggestedTiers = settings.suggestedAmounts?.length
    ? settings.suggestedAmounts
    : [49, 99, 199, 499];

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 antialiased">
      <PublicHeader />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        {/* Hide Mode Administrator Notice Banner */}
        {!settings.enabled && isAdmin && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold">Hide Mode Active (Admin Preview)</p>
              <p className="text-amber-800">
                This page is invisible to regular candidates and casual visitors. Only administrators can view this preview.
              </p>
            </div>
            <Link
              href="/admin/growth-settings"
              className="shrink-0 rounded-lg bg-amber-900 px-3 py-1.5 font-bold text-white hover:bg-amber-950 transition text-[11px]"
            >
              Configure in Admin →
            </Link>
          </div>
        )}

        {/* Notice 1: Thank You & Contribution Verified Banner (ONLY if payment is verified with Cashfree as PAID) */}
        {isVerifiedPaid && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-300 bg-emerald-50/90 p-5 sm:p-6 text-emerald-950 shadow-xs animate-in fade-in duration-300">
            <div className="flex items-start gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200/70 px-2.5 py-0.5 text-[11px] font-black text-emerald-900 uppercase tracking-wider">
                    ✓ Contribution Received • Verified
                  </span>
                  {query.order_id && (
                    <span className="text-[11px] text-emerald-800 font-mono">
                      Ref: {query.order_id}
                    </span>
                  )}
                </div>

                <h2 className="mt-2 text-lg sm:text-xl font-black text-emerald-950">
                  🎉 Thank You for Supporting Varadhi Prep{verifiedAmount ? ` (₹${verifiedAmount})` : ""}!
                </h2>

                <p className="mt-1 text-xs sm:text-sm text-emerald-900 leading-relaxed">
                  Your voluntary contribution has been successfully verified. It directly funds our high-speed cloud edge servers, database hosting, and bilingual question curation to keep mock tests open, fast, and 100% ad-free for all aspirants.
                </p>

                <p className="mt-2 text-xs font-semibold text-emerald-800">
                  We are deeply grateful for your support in building this community platform!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notice 2: Incomplete / Cancelled Notice (Light Green soothing theme) */}
        {isPaymentCancelled && (
          <div className="mb-6 rounded-2xl border border-emerald-200/90 bg-emerald-50/50 p-5 sm:p-6 text-emerald-950 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800 text-base">
                🌱
              </div>

              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                  Payment Incomplete
                </div>

                <h2 className="mt-2 text-base sm:text-lg font-black text-emerald-950 leading-snug">
                  No worries, contribution incomplete. Did the money get deducted from your bank or UPI?
                </h2>

                <p className="mt-1.5 text-xs sm:text-sm text-emerald-900/90 leading-relaxed">
                  If no money was deducted, feel free to try again below or continue practicing on Varadhi Prep! If an amount was deducted, your bank or UPI app will automatically reverse it back to your account within 2–3 business days.
                </p>

                {query.order_id && (
                  <p className="mt-3 pt-2.5 border-t border-emerald-200/70 text-[11px] sm:text-xs text-emerald-900">
                    Need assistance? Email{" "}
                    <a
                      href={`mailto:support@varadhiprep.in?subject=${encodeURIComponent(`Payment Support - Order ${query.order_id}`)}`}
                      className="font-bold underline text-emerald-950 hover:text-emerald-700"
                    >
                      support@varadhiprep.in
                    </a>{" "}
                    with Reference Order ID:{" "}
                    <code className="font-mono font-bold bg-emerald-100/90 px-1.5 py-0.5 rounded text-emerald-950">
                      {query.order_id}
                    </code>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header Section: Title, Subtitle & Value Statement */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#131921] leading-[1.15]">
            🚀 Contribute to Varadhi Prep
          </h1>
          <p className="mt-2.5 text-xl sm:text-2xl font-bold text-[#c45500]">
            Help Us to Grow
          </p>
          <p className="mt-3.5 text-base sm:text-lg font-medium text-[#0f1111] leading-snug">
            If you feel happy using Varadhi Prep and it has helped your exam preparation, help us grow and sustain this platform.
          </p>
        </div>

        {/* The Payment Area — Moved to Top */}
        <div className="max-w-xl mx-auto mb-12 sm:mb-14">
          <CashfreeContributionBox
            suggestedAmounts={suggestedTiers}
            defaultPhone={userPhone}
            defaultName={userName}
            initialAmount={query.amount ? parseInt(query.amount, 10) : undefined}
          />
        </div>

        {/* Where Your Contribution Goes — Clean Organic Cards */}
        <div className="max-w-4xl mx-auto mb-10 sm:mb-12">
          <div className="text-center mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#565959]">
              Where Your Contribution Goes
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#0f1111]">
              Every rupee contributed directly powers core server infrastructure and verified content quality.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cloud & Edge Servers */}
            <div className="rounded-2xl border border-slate-200 border-l-4 border-l-[#059669] bg-white p-5 shadow-xs hover:border-[#059669]/50 transition">
              <span className="inline-block rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                Servers & Speed
              </span>
              <p className="mt-2 text-sm sm:text-base font-bold text-[#0f1111]">
                Cloud & Edge Servers
              </p>
              <p className="mt-1 text-xs sm:text-sm text-[#565959] leading-relaxed">
                Ensures instant question loading, sub-50ms answer submission, and zero crashes during heavy exam traffic.
              </p>
            </div>

            {/* Managed Database */}
            <div className="rounded-2xl border border-slate-200 border-l-4 border-l-[#059669] bg-white p-5 shadow-xs hover:border-[#059669]/50 transition">
              <span className="inline-block rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                Secure Storage
              </span>
              <p className="mt-2 text-sm sm:text-base font-bold text-[#0f1111]">
                Managed Database Hosting
              </p>
              <p className="mt-1 text-xs sm:text-sm text-[#565959] leading-relaxed">
                Securely saves all your past attempts, detailed scorecard analytics, subject breakdowns, and bookmarks.
              </p>
            </div>

            {/* Bilingual Question Verification */}
            <div className="rounded-2xl border border-slate-200 border-l-4 border-l-[#059669] bg-white p-5 shadow-xs hover:border-[#059669]/50 transition">
              <span className="inline-block rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                Academic Quality
              </span>
              <p className="mt-2 text-sm sm:text-base font-bold text-[#0f1111]">
                Bilingual Question Verification
              </p>
              <p className="mt-1 text-xs sm:text-sm text-[#565959] leading-relaxed">
                Continuous drafting, translation, and auditing of syllabus-aligned Telugu & English questions against official keys.
              </p>
            </div>

            {/* Completely Ad-Free */}
            <div className="rounded-2xl border border-slate-200 border-l-4 border-l-[#059669] bg-white p-5 shadow-xs hover:border-[#059669]/50 transition">
              <span className="inline-block rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                No Commercial Ads
              </span>
              <p className="mt-2 text-sm sm:text-base font-bold text-[#0f1111]">
                Completely Ad-Free Experience
              </p>
              <p className="mt-1 text-xs sm:text-sm text-[#565959] leading-relaxed">
                Zero commercial banner ads, third-party promotional pop-ups, or video ads so you stay 100% focused on studying.
              </p>
            </div>
          </div>
        </div>

        {/* Human Story: Promise to Aspirants */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-[#d5d9d9] bg-white p-6 sm:p-8 shadow-xs mb-8 text-center sm:text-left">
          <h3 className="text-base font-bold text-[#0f1111] mb-2">
            Our Promise to Aspirants
          </h3>
          <p className="text-sm text-[#565959] leading-relaxed">
            We built Varadhi Prep so that competitive exam aspirants across Andhra Pradesh and Telangana can practice with high-quality, syllabus-aligned mock tests completely free — without expensive coaching fees or commercial paywalls.
          </p>
          <p className="mt-3 text-xs sm:text-sm text-[#565959] leading-relaxed">
            Running high-speed servers, saving thousands of test answers in real-time, and verifying bilingual questions against official keys every month requires real operational resources. We don&apos;t ask money from new or casual visitors. If you have been preparing with us and appreciate what we do, your voluntary contribution helps keep tests free and open for everyone.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center justify-center gap-4 pt-2 text-xs sm:text-sm font-bold">
          <Link href="/mock-tests" className="text-[#007185] hover:text-[#c45500] hover:underline">
            ← Back to Mock Tests
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/dashboard" className="text-[#007185] hover:text-[#c45500] hover:underline">
            View My Progress →
          </Link>
        </div>
      </main>
    </div>
  );
}
