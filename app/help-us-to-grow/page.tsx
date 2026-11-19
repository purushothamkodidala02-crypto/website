import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/site/PublicHeader";
import { CopyUpiButton } from "@/components/growth/CopyUpiButton";
import { getGrowthSettings } from "@/lib/growth-settings";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Help Us to Grow | Transparency & Website Maintenance | Varadhi Prep",
  description:
    "Learn about our mission to keep high-quality competitive mock examinations open and ad-free. Review our actual operational and server infrastructure costs, and how active candidates can support our growth.",
  alternates: {
    canonical: absoluteUrl("/help-us-to-grow"),
  },
  openGraph: {
    title: "Help Us to Grow - Varadhi Prep Operational Transparency",
    description:
      "Operational transparency, infrastructure costs, and candidate-supported growth for free, ad-free competitive mock tests.",
    url: absoluteUrl("/help-us-to-grow"),
    siteName: "Varadhi Prep",
  },
};

export default async function HelpUsToGrowPage() {
  const settings = await getGrowthSettings();

  const costBreakdowns = [
    {
      category: "High-Concurrency Cloud & Edge Delivery",
      description:
        "During major notification releases and exam countdowns, thousands of aspirants attempt timed mock tests simultaneously. We utilize enterprise-grade global edge compute to ensure sub-50ms latency, zero server crashes, and instant response auto-saving on every question answer.",
      impact: "Zero downtime during peak exam hours and real-time timer sync across devices.",
    },
    {
      category: "Dedicated Database & Submission Storage",
      description:
        "Every completed attempt involves storing hundreds of granular question responses, score calculations, bookmark syncs, and comprehensive performance analytics. Managed cloud PostgreSQL databases ensure secure, encrypted, and isolated student records.",
      impact: "Instant result generation, reliable history tracking, and strict candidate data privacy.",
    },
    {
      category: "Bilingual Question Curation & Academic Auditing",
      description:
        "Syllabus structures across APPSC, TGPSC, and Police Boards frequently evolve. Our subject matter team continuously researches official notification standards, cross-verifies questions against official gazette answer keys, and author explanations in both Telugu and English.",
      impact: "High academic accuracy with zero erroneous questions or misleading options.",
    },
    {
      category: "Strict Zero-Commercial-Ad Policy",
      description:
        "Unlike standard educational portals, Varadhi Prep refuses to run third-party display advertisements, video pop-ups, or affiliate link traps. We believe serious civil service and police aspirants need complete concentration without intrusive ad networks.",
      impact: "Distraction-free learning environment and zero commercial data selling.",
    },
  ];

  const suggestedTiers = settings.suggestedAmounts?.length
    ? settings.suggestedAmounts
    : [50, 100, 250, 500];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] antialiased">
      {/* Top News Header Rule */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#0055a2] via-[#0055a2] to-[#fb8916]" />

      <PublicHeader />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <li>
              <Link href="/" className="hover:text-[#0055a2] transition">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-400">/</li>
            <li className="text-slate-900 font-bold" aria-current="page">
              Help Us to Grow
            </li>
          </ol>
        </nav>

        {/* Editorial Broadsheet Header */}
        <header className="border-b border-[#cde7f7] pb-6 sm:pb-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0055a2]">
            Institutional Transparency & Sustainability
          </p>
          <h1 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-[#0f172a] leading-tight">
            Help Us Keep Quality Mock Tests Open, Accessible & Ad-Free
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-700 leading-relaxed">
            Varadhi Prep was created to provide genuine, rigorous, and syllabus-aligned examination prep
            for government job aspirants across Andhra Pradesh and Telangana. Here is an honest account
            of what it takes to maintain this platform and why we rely on candidate support.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 border-t border-[#e2e8f0] pt-3">
            <span>Published by Editorial & Operations Desk</span>
            <span aria-hidden="true">•</span>
            <span>Non-Profit Sustainability Initiative</span>
            <span aria-hidden="true">•</span>
            <span>Applicable to APPSC, TGPSC & Police Prep</span>
          </div>
        </header>

        {/* Core Principles Callout */}
        <section className="my-8 rounded-2xl border border-[#cde7f7] bg-[#eaf4fa]/70 p-5 sm:p-6 text-slate-800">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0055a2]">
            Our Policy on Asking for Support
          </h2>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-700">
            <strong>We do not ask for money from new users or casual visitors.</strong> Every candidate is
            encouraged to explore, read syllabi, and practice freely. We only approach committed candidates
            who have completed <strong>five or more full-length mock tests</strong> and have experienced
            first-hand the academic and technical standard of our platform.
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Even then, contributions remain 100% voluntary. If you are experiencing financial hardship,
            your mock tests will never be locked.
          </p>
        </section>

        {/* Detailed Cost Breakdown Section */}
        <section className="my-10 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0f172a]">
              The Costs Required to Maintain This Platform
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Running a real-time assessment portal requires substantial ongoing technical and academic resources.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            {costBreakdowns.map((cost, idx) => (
              <article
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs hover:border-[#cde7f7] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">
                    {idx + 1}. {cost.category}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {cost.description}
                </p>
                <div className="mt-3.5 border-t border-slate-100 pt-3 flex items-start gap-2 text-xs text-slate-600">
                  <span className="font-bold text-[#0055a2] shrink-0">Direct Benefit:</span>
                  <span>{cost.impact}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Voluntary Contribution Section */}
        <section className="my-12 rounded-3xl border-2 border-[#0055a2]/20 bg-white p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-[#0055a2]/10 px-3 py-1 text-xs font-bold text-[#0055a2]">
              Direct Candidate Support
            </span>
            <h2 className="mt-3 text-xl sm:text-2xl font-black text-[#0f172a]">
              Support Varadhi Prep via UPI
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed">
              If Varadhi Prep has helped you prepare for your target competitive exam, consider making a
              modest voluntary contribution. Every rupee goes directly to operational server hosting and
              bilingual question bank development.
            </p>
          </div>

          {/* Suggested Amounts */}
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Suggested Contribution Tiers
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2.5 sm:gap-3">
              {suggestedTiers.map((amt) => (
                <div
                  key={amt}
                  className="rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-2.5 text-center"
                >
                  <p className="text-base sm:text-lg font-black text-[#0f172a]">₹{amt}</p>
                  <p className="text-[11px] font-medium text-slate-500">Voluntary</p>
                </div>
              ))}
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-center">
                <p className="text-base sm:text-lg font-black text-[#0055a2]">Custom</p>
                <p className="text-[11px] font-medium text-slate-500">Any Amount</p>
              </div>
            </div>
          </div>

          {/* Payment & UPI Block */}
          <div className="mt-7 rounded-2xl border border-[#cde7f7] bg-[#eaf4fa]/50 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Official UPI ID
                </p>
                <p className="mt-1 text-lg sm:text-xl font-black tracking-wide text-[#0f172a] select-all">
                  {settings.upiId || "support@varadhiprep.in"}
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  Payee: {settings.upiName || "Varadhi Prep"}
                </p>
              </div>
              <div className="shrink-0">
                <CopyUpiButton upiId={settings.upiId || "support@varadhiprep.in"} />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500 border-t border-slate-200/80 pt-3">
              You can scan or enter this UPI ID in any standard UPI application (Google Pay, PhonePe, Paytm, BHIM, or Banking Apps).
            </p>
          </div>
        </section>

        {/* Accountability & Questions FAQ */}
        <section className="my-10 space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-[#0f172a]">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            <details className="group rounded-xl border border-slate-200 bg-white p-4.5 sm:p-5">
              <summary className="cursor-pointer list-none font-bold text-sm sm:text-base text-slate-900 flex items-center justify-between">
                <span>Will my mock tests be blocked if I do not contribute?</span>
                <span className="text-[#0055a2] font-black group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                No. Mock tests on Varadhi Prep remain completely accessible. Our support request is strictly
                voluntary for candidates who have practiced extensively and wish to support our mission for
                other aspirants.
              </p>
            </details>

            <details className="group rounded-xl border border-slate-200 bg-white p-4.5 sm:p-5">
              <summary className="cursor-pointer list-none font-bold text-sm sm:text-base text-slate-900 flex items-center justify-between">
                <span>Why don&apos;t you simply place advertisements on the website?</span>
                <span className="text-[#0055a2] font-black group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Commercial ad networks slow down page loading times, drain mobile data, and flash banners
                that break mental focus during timed tests. We prioritize clean, respectful test environments
                over ad revenue.
              </p>
            </details>

            <details className="group rounded-xl border border-slate-200 bg-white p-4.5 sm:p-5">
              <summary className="cursor-pointer list-none font-bold text-sm sm:text-base text-slate-900 flex items-center justify-between">
                <span>How can I reach out if I have questions or need assistance?</span>
                <span className="text-[#0055a2] font-black group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                You can write to us directly at{" "}
                <a href="mailto:support@varadhiprep.in" className="font-bold text-[#0055a2] underline">
                  support@varadhiprep.in
                </a>
                . We respond promptly to all academic, technical, and platform inquiries.
              </p>
            </details>
          </div>
        </section>

        {/* Back Link Footer */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
          <Link
            href="/mock-tests"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0055a2] hover:underline"
          >
            ← Back to Mock Tests
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition"
          >
            Go to My Progress
          </Link>
        </div>
      </main>
    </div>
  );
}
