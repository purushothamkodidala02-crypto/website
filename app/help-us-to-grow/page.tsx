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

  // Real-time server verification: Only show Thank You if Cashfree actually marks order as PAID
  if (query.order_id) {
    try {
      const orderStatus = await getCashfreeOrderStatus(query.order_id);
      if (orderStatus.paid) {
        isVerifiedPaid = true;
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

        {/* Thank You Banner (ONLY if payment is verified with Cashfree as PAID) */}
        {isVerifiedPaid && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            <h2 className="text-base font-black">Thank You for Your Support!</h2>
            <p className="mt-1 text-xs sm:text-sm text-emerald-800">
              Your contribution directly powers our cloud servers and bilingual question verification. We are grateful for your help in keeping Varadhi Prep open to all aspirants.
            </p>
          </div>
        )}

        {/* Cancelled / Incomplete Notice (Option 3 with Money Debited Reassurance) */}
        {isPaymentCancelled && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 text-xs sm:text-sm">
            <div>
              <p className="font-bold text-sm sm:text-base text-amber-900">
                No Worries! Contribution Incomplete
              </p>
              <p className="mt-1 text-amber-800 leading-relaxed">
                It looks like the checkout was closed or cancelled before completion. If no money was deducted, feel free to try again below or continue preparing on Varadhi Prep!
              </p>
            </div>

            {/* In case money was debited from bank / UPI */}
            <div className="mt-3.5 pt-3 border-t border-amber-200/80 text-[11px] sm:text-xs text-amber-900 leading-relaxed">
              <p className="font-semibold text-amber-950">
                Did money get deducted from your bank or UPI?
              </p>
              <p className="mt-0.5 text-amber-800">
                Don&apos;t worry! When an interrupted payment occurs, your bank or UPI network automatically reverses the amount back to your account within 2–3 business days.
              </p>
              {query.order_id && (
                <p className="mt-1.5 text-amber-900">
                  If the amount is not reversed, or if you need assistance, please email{" "}
                  <a
                    href={`mailto:support@varadhiprep.in?subject=${encodeURIComponent(`Payment Support - Order ${query.order_id}`)}`}
                    className="font-bold underline text-amber-950 hover:text-amber-800"
                  >
                    support@varadhiprep.in
                  </a>{" "}
                  with your Reference Order ID:{" "}
                  <code className="font-mono font-bold bg-amber-100/90 px-1.5 py-0.5 rounded text-amber-950">
                    {query.order_id}
                  </code>
                </p>
              )}
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
