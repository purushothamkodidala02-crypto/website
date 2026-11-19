import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/site/PublicHeader";
import { CashfreeContributionBox } from "@/components/growth/CashfreeContributionBox";
import { getGrowthSettings } from "@/lib/growth-settings";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Help Us to Grow | Support Varadhi Prep",
  description:
    "Support Varadhi Prep to keep competitive mock tests free, reliable, and 100% ad-free. Review platform maintenance costs and contribute via Cashfree or UPI.",
  alternates: {
    canonical: absoluteUrl("/help-us-to-grow"),
  },
};

export default async function HelpUsToGrowPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const query = await searchParams;
  const isThankYou = query.status === "thank_you";

  const [settings, supabase] = await Promise.all([
    getGrowthSettings(),
    createClient(),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userPhone = "";
  let userName = "";

  if (user) {
    userName = user.user_metadata?.full_name || user.user_metadata?.name || "";
    const { data: profile } = await supabase
      .from("profiles")
      .select("mobile, full_name")
      .eq("id", user.id)
      .maybeSingle();
    userPhone = profile?.mobile || "";
    if (profile?.full_name) userName = profile.full_name;
  }

  const suggestedTiers = settings.suggestedAmounts?.length
    ? settings.suggestedAmounts
    : [50, 100, 250, 500];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] antialiased">
      {/* Top Accent Rule */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#0055a2] via-[#0055a2] to-[#fb8916]" />

      <PublicHeader />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Thank You Banner (if redirected after payment) */}
        {isThankYou && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            <h2 className="text-base font-black">Thank You for Your Support!</h2>
            <p className="mt-1 text-xs sm:text-sm text-emerald-800">
              Your contribution directly powers our cloud servers and question verification. We are grateful for your help in keeping Varadhi Prep open to all aspirants.
            </p>
          </div>
        )}

        {/* Simplified, Clean Header — No excessive top clutter */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f172a]">
            Help Us to Grow
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Varadhi Prep provides free, high-standard mock exams for competitive aspirants across Andhra Pradesh and Telangana. We bear monthly server, database, and bilingual question curation costs to keep the platform fast, accurate, and 100% ad-free.
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            We do not ask for money from new users or casual visitors. Every candidate is encouraged to explore, read syllabi, and practice freely. We only approach committed candidates who are using our platform for a long time and have experienced first-hand the academic and technical standard of our platform.
          </p>
        </div>

        {/* Direct Cashfree Contribution Box */}
        <section>
          <CashfreeContributionBox
            suggestedAmounts={suggestedTiers}
            upiId={settings.upiId || "support@varadhiprep.in"}
            upiName={settings.upiName || "Varadhi Prep"}
            defaultPhone={userPhone}
            defaultName={userName}
          />
        </section>

        {/* Maintenance Costs Summary */}
        <section className="rounded-2xl border border-[#cde7f7] bg-white p-5 sm:p-6 shadow-2xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0055a2]">
            Where Your Contribution Goes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs text-slate-700">
            <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3.5">
              <p className="font-bold text-slate-900">Cloud & Edge Servers</p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Ensures instant response saving, sub-50ms latency, and zero crashes during heavy exam traffic.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3.5">
              <p className="font-bold text-slate-900">Managed Database Hosting</p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Securely retains test history, comprehensive analytics, and student bookmarks.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3.5">
              <p className="font-bold text-slate-900">Bilingual Question Verification</p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Continuous updating of syllabus-aligned Telugu & English questions against official commission keys.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3.5">
              <p className="font-bold text-slate-900">100% Ad-Free Guarantee</p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Zero third-party commercial banners or video pop-ups to ensure focused preparation.
              </p>
            </div>
          </div>
        </section>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-2 text-xs font-semibold text-slate-600">
          <Link href="/mock-tests" className="text-[#0055a2] hover:underline font-bold">
            ← Back to Mock Tests
          </Link>
          <Link href="/dashboard" className="text-slate-800 hover:underline">
            View My Progress →
          </Link>
        </div>
      </main>
    </div>
  );
}
