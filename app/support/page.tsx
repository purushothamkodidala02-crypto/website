import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import { CopyEmailButton } from "@/components/site/CopyEmailButton";
import { absoluteUrl } from "@/lib/site";

const supportEmail = "support@varadhiprep.in";
const supportDescription =
  "Contact Varadhi Prep support for fast assistance with student accounts, online mock tests, test attempts, score reviews, and exam series payments.";

export const metadata: Metadata = {
  title: "Contact Support",
  description: supportDescription,
  alternates: { canonical: "/support" },
  openGraph: {
    type: "website",
    url: "/support",
    title: "Contact Varadhi Prep Support",
    description: supportDescription,
    siteName: "Varadhi Prep",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Varadhi Prep support" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Varadhi Prep Support",
    description: supportDescription,
    images: ["/opengraph-image"],
  },
};

export default function SupportPage() {
  const subject = encodeURIComponent("Varadhi Prep support request");
  const mailtoUrl = `mailto:${supportEmail}?subject=${subject}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${supportEmail}&su=${subject}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Varadhi Prep Support",
      description: supportDescription,
      url: absoluteUrl("/support"),
      mainEntity: {
        "@type": "Organization",
        name: "Varadhi Prep",
        url: absoluteUrl("/"),
        email: supportEmail,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: supportEmail,
          availableLanguage: ["English", "Telugu"],
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Support", item: absoluteUrl("/support") },
      ],
    },
  ];

  return (
    <main className="student-page min-h-[100dvh] bg-[#f6faf8] text-[#132621] w-full max-w-full overflow-x-hidden flex flex-col">
      <JsonLd data={jsonLd} />
      <PublicHeader compact />

      {/* Full-width Responsive Container across Mobile, Tablet, and Desktop */}
      <div className="w-full flex-1 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 space-y-6 sm:space-y-8">
        
        {/* Full-Width Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-xl shadow-slate-950/5">
          <div className="bg-gradient-to-br from-cyan-50 via-teal-50 to-white px-6 py-8 sm:px-10 sm:py-12 lg:px-12">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-teal-800">
                <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
                Varadhi Prep support
              </span>
              <span className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                Official Help Desk
              </span>
            </div>

            <h1 className="font-display mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              How can we help?
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
              Contact us for help with your account, mock tests, attempts, payments or results. We are dedicated to providing swift assistance for your competitive exam preparation.
            </p>

            {/* Quick Feature Badges */}
            <div className="mt-6 flex flex-wrap gap-2.5 sm:gap-4 text-xs font-bold text-slate-700">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-teal-100 bg-white/80 px-3 py-1.5 shadow-2xs">
                ⚡ Typical reply within 24 hours
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-teal-100 bg-white/80 px-3 py-1.5 shadow-2xs">
                🌐 English &amp; Telugu Assistance
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-teal-100 bg-white/80 px-3 py-1.5 shadow-2xs">
                🛡️ Direct Student Support
              </span>
            </div>
          </div>
        </section>

        {/* 2-Column Responsive Desktop & Tablet Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Main Action Column (7 Cols on Desktop) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Primary Email Card */}
            <div className="overflow-hidden rounded-3xl border border-cyan-100 bg-white p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-950/5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-black uppercase tracking-wider text-teal-700">Official support email</p>
                <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800">
                  Monitored Daily
                </span>
              </div>

              <a
                href={mailtoUrl}
                className="mt-3 block break-all text-2xl sm:text-3xl font-black text-teal-800 hover:text-teal-900 transition"
              >
                {supportEmail}
              </a>

              <p className="mt-2 text-xs sm:text-sm text-slate-500">
                Click the address or choose one of the quick actions below to send your query directly.
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
                <a
                  href={mailtoUrl}
                  className="inline-flex items-center justify-center rounded-xl bg-[#0a2922] px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#11382f] active:scale-[0.98]"
                >
                  Open email app
                </a>
                <a
                  href={gmailUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 px-5 py-3.5 text-sm font-black text-cyan-900 transition hover:bg-cyan-100 active:scale-[0.98]"
                >
                  Open Gmail
                </a>
                <CopyEmailButton email={supportEmail} />
              </div>

              <p className="mt-5 text-xs sm:text-sm leading-6 text-slate-500">
                If no email app is configured on your device, use Open Gmail or copy the address shown above.
              </p>

              {/* Tips for Fast Resolution */}
              <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50/40 p-4 sm:p-5">
                <p className="text-xs font-black uppercase tracking-wide text-teal-900">Tips for fastest resolution</p>
                <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-700 font-bold">•</span>
                    <span>Include your registered phone number or email address.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-700 font-bold">•</span>
                    <span>Mention the mock test or exam paper title if reporting an exam issue.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-700 font-bold">•</span>
                    <span>For payment inquiries, attach your Cashfree payment ID or transaction reference.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Assistance Categories Grid */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">What we can help with</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Common areas where our support team assists candidates:
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-teal-50/40 hover:border-teal-200">
                  <div className="flex items-center gap-2 text-teal-800">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-100 text-xs font-black">📝</span>
                    <h3 className="text-sm font-bold text-slate-900">Mock Tests &amp; Attempts</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    Test progress auto-save, timer issues, submitting test papers, or reviewing detailed answer explanations.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-teal-50/40 hover:border-teal-200">
                  <div className="flex items-center gap-2 text-teal-800">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-100 text-xs font-black">🔐</span>
                    <h3 className="text-sm font-bold text-slate-900">Account &amp; Login</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    Google sign-in, mobile OTP login, single-device session access, and candidate profile management.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-teal-50/40 hover:border-teal-200">
                  <div className="flex items-center gap-2 text-teal-800">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-100 text-xs font-black">💳</span>
                    <h3 className="text-sm font-bold text-slate-900">Payments &amp; Access</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    Instant activation of paid series, transaction confirmation, and payment receipt assistance.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-teal-50/40 hover:border-teal-200">
                  <div className="flex items-center gap-2 text-teal-800">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-100 text-xs font-black">🚩</span>
                    <h3 className="text-sm font-bold text-slate-900">Question Feedback</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    Syllabus queries, error reporting in questions or keys, and Telugu/English translation feedback.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar / Info Column (5 Cols on Desktop) */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            
            {/* Working Hours Card */}
            <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50/60 via-white to-slate-50 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Operating Hours &amp; SLA</h2>
              <div className="mt-4 space-y-3.5 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-teal-700">🕒</span>
                  <div>
                    <strong className="block text-slate-950 font-bold">Monday – Saturday</strong>
                    <span className="text-xs text-slate-500">9:00 AM – 7:00 PM IST</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-teal-700">📅</span>
                  <div>
                    <strong className="block text-slate-950 font-bold">Sundays &amp; Holidays</strong>
                    <span className="text-xs text-slate-500">Monitored for urgent exam test-taking issues</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-teal-700">⚡</span>
                  <div>
                    <strong className="block text-slate-950 font-bold">Average Response Time</strong>
                    <span className="text-xs text-slate-500">Within 24 hours on working days</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-teal-700">🗣️</span>
                  <div>
                    <strong className="block text-slate-950 font-bold">Available Languages</strong>
                    <span className="text-xs text-slate-500">English and Telugu (తెలుగు)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Policies Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Policies &amp; Terms</h2>
              <p className="mt-1 text-xs text-slate-500">
                Review official terms, privacy practices, and candidate protections:
              </p>

              <div className="mt-4 divide-y divide-slate-100 text-sm">
                <Link
                  href="/terms-and-conditions"
                  className="flex items-center justify-between py-3 font-bold text-teal-800 hover:text-teal-950 group"
                >
                  <span>Terms and Conditions</span>
                  <span className="text-slate-400 group-hover:text-teal-700 transition">→</span>
                </Link>
                <Link
                  href="/privacy-policy"
                  className="flex items-center justify-between py-3 font-bold text-teal-800 hover:text-teal-950 group"
                >
                  <span>Privacy Policy</span>
                  <span className="text-slate-400 group-hover:text-teal-700 transition">→</span>
                </Link>
                <Link
                  href="/refunds-and-cancellations"
                  className="flex items-center justify-between py-3 font-bold text-teal-800 hover:text-teal-950 group"
                >
                  <span>Refunds and Cancellations</span>
                  <span className="text-slate-400 group-hover:text-teal-700 transition">→</span>
                </Link>
              </div>
            </div>

            {/* Navigation Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-6 sm:p-7">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">Quick Navigation</h2>
              <div className="mt-3 flex flex-col gap-2.5">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-900 transition"
                >
                  ← Back to Varadhi Prep
                </Link>
                <Link
                  href="/mock-tests"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-900 transition"
                >
                  Explore Mock Tests →
                </Link>
              </div>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}
