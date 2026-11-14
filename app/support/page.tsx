import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand/VaradhiBrand";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import { CopyEmailButton } from "@/components/site/CopyEmailButton";
import { absoluteUrl } from "@/lib/site";

const supportEmail = "support@varadhiprep.in";
const supportDescription =
  "Contact Varadhi Prep support for fast assistance with student accounts, online mock tests, test attempts, score reviews, and exam preparation.";

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
  const subject = encodeURIComponent("Varadhi Prep candidate support request");
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
    <main className="student-page min-h-screen bg-[#f6faf8] text-[#132621] w-full max-w-full overflow-x-hidden flex flex-col">
      <JsonLd data={jsonLd} />
      <PublicHeader compact />

      {/* Hero Section Matching Mock Tests & Home Header */}
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-[#f1f5f9] via-[#f5f8fc] to-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-900">
              <svg className="h-3.5 w-3.5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Candidate Support
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              Official Help Desk
            </span>
          </div>

          <h1 className="font-display mt-3.5 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            How can we help you prepare?
          </h1>
          <p className="mt-3.5 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
            Reach out to our support team for assistance with online mock tests, test attempts, candidate accounts, or answer reviews. We are committed to supporting your competitive examination preparation across Telangana and Andhra Pradesh.
          </p>

          {/* Clean Feature Badges with Professional SVG Icons */}
          <div className="mt-6 flex flex-wrap gap-2.5 sm:gap-3.5 text-xs font-semibold text-slate-700">
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 shadow-2xs">
              <svg className="h-4 w-4 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
              </svg>
              Response within 24 hours
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 shadow-2xs">
              <svg className="h-4 w-4 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5c0 3.784-1.127 7.23-3.056 9.873" />
              </svg>
              English &amp; Telugu (తెలుగు) Assistance
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 shadow-2xs">
              <svg className="h-4 w-4 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Official Candidate Desk
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="w-full flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Main Action Column (7 Cols on Desktop) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Primary Email Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Official Support Channel</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-900 border border-teal-200/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                  Monitored Daily
                </span>
              </div>

              <a
                href={mailtoUrl}
                className="mt-3.5 block break-all font-display text-2xl sm:text-3xl font-bold text-teal-800 hover:text-teal-950 transition"
              >
                {supportEmail}
              </a>

              <p className="mt-2 text-xs sm:text-sm text-slate-500">
                Click the email address above or choose an action below to send your query directly.
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
                <a
                  href={mailtoUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-900 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition active:scale-[0.98]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Open email app
                </a>
                <a
                  href={gmailUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs transition active:scale-[0.98]"
                >
                  <svg className="h-4 w-4 text-red-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                  </svg>
                  Open Gmail
                </a>
                <CopyEmailButton email={supportEmail} />
              </div>

              {/* Guidelines for Quick Resolution */}
              <div className="mt-7 rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800">Guidelines for fastest resolution</p>
                <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <svg className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Include your registered email address or mobile number.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Mention the exam name, paper title, or subject test if reporting an exam-taking issue.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>For question feedback or corrections, specify the question number and paper name.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Assistance Categories Grid Matching Varadhi Platform Features */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-lg font-bold text-slate-900">What we can help with</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Common support areas for competitive exam candidates:
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200/90 bg-white p-4 transition-all duration-200 hover:border-teal-400 hover:shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-teal-100 bg-teal-50 text-teal-800">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Mock Tests &amp; Attempts</h3>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                    CBT exam timer, test progress auto-saving, paper submission, or resuming active practice tests.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/90 bg-white p-4 transition-all duration-200 hover:border-teal-400 hover:shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-teal-100 bg-teal-50 text-teal-800">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Account &amp; Sign-In</h3>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                    Google account login, six-digit email verification codes, password resets, and single-device access.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/90 bg-white p-4 transition-all duration-200 hover:border-teal-400 hover:shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-teal-100 bg-teal-50 text-teal-800">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Question Feedback</h3>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                    Reporting question discrepancies, answer key clarification, and Telugu / English translation review.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/90 bg-white p-4 transition-all duration-200 hover:border-teal-400 hover:shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-teal-100 bg-teal-50 text-teal-800">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Scorecards &amp; Analysis</h3>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                    Reviewing marks, negative marking calculations, bookmarked questions, and private mistake reviews.
                  </p>
                </div>

                <div className="sm:col-span-2 rounded-xl border border-teal-200/90 bg-teal-50/30 p-4 transition-all duration-200 hover:border-teal-400 hover:shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 place-items-center rounded-lg border border-teal-200 bg-teal-100/80 text-teal-900">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-950">Official Recruitment, Syllabus &amp; PET Standards</h3>
                        <p className="text-[11px] text-teal-800 font-semibold">TSLPRB · TGPSC · APPSC Standards</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-teal-100 border border-teal-200 px-2.5 py-0.5 text-[10px] font-bold text-teal-950 shrink-0">
                      Verified Data
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                    Guidance on official recruitment notifications (e.g. TG Police Rc No. 189/2026), 7,112 cadre vacancies, GO Ms 87 5-year age relaxations, physical measurement &amp; efficiency test (PET) standards, and syllabus topics.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-teal-800">
                    <Link
                      href="/mock-tests/telangana/police-constable-free-mock-test"
                      className="rounded-lg bg-teal-800 text-white px-2.5 py-1 hover:bg-teal-900 transition"
                    >
                      Official Exam Guide →
                    </Link>
                    <Link
                      href="/mock-tests/telangana/police-constable-free-mock-test#physical-standards"
                      className="rounded-lg bg-white border border-teal-200 px-2.5 py-1 hover:bg-teal-50 transition"
                    >
                      Police PET Standards →
                    </Link>
                    <Link
                      href="/mock-tests/telangana/police-constable-free-mock-test#exam-schedule"
                      className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 hover:bg-slate-50 text-slate-700 transition"
                    >
                      7,112 Vacancy Breakdown →
                    </Link>
                    <Link
                      href="/mock-tests/telangana/police-constable-free-mock-test#age-limits"
                      className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 hover:bg-slate-50 text-slate-700 transition"
                    >
                      Age Limits (GO 87) →
                    </Link>
                    <Link
                      href="/mock-tests#exam-guides"
                      className="rounded-lg bg-white border border-teal-200 px-2.5 py-1 hover:bg-teal-50 transition"
                    >
                      All Exam Guides →
                    </Link>
                    <Link
                      href="/mock-tests"
                      className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 hover:bg-slate-50 text-slate-700 transition"
                    >
                      Exam Directory →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar / Info Column (5 Cols on Desktop) */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            
            {/* Operating Hours Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
              <h2 className="font-display text-base font-bold text-slate-900">Support Hours &amp; Response</h2>
              <div className="mt-4 space-y-3.5 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                  </svg>
                  <div>
                    <strong className="block text-slate-900 font-bold text-xs sm:text-sm">Monday – Saturday</strong>
                    <span className="text-xs text-slate-500">9:00 AM – 7:00 PM IST</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <div>
                    <strong className="block text-slate-900 font-bold text-xs sm:text-sm">Sundays &amp; Holidays</strong>
                    <span className="text-xs text-slate-500">Monitored for active mock-test exam issues</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <strong className="block text-slate-900 font-bold text-xs sm:text-sm">Average Response Time</strong>
                    <span className="text-xs text-slate-500">Within 24 hours on working days</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <div>
                    <strong className="block text-slate-900 font-bold text-xs sm:text-sm">Available Languages</strong>
                    <span className="text-xs text-slate-500">English and Telugu (తెలుగు)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Policies Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
              <h2 className="font-display text-base font-bold text-slate-900">Policies &amp; Guidelines</h2>
              <p className="mt-1 text-xs text-slate-500">
                Official terms, candidate protections, and platform guidelines:
              </p>

              <div className="mt-3.5 divide-y divide-slate-100 text-xs sm:text-sm">
                <Link
                  href="/terms-and-conditions"
                  className="flex items-center justify-between py-2.5 font-bold text-teal-800 hover:text-teal-950 group transition"
                >
                  <span>Terms and Conditions</span>
                  <span className="text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition" aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/privacy-policy"
                  className="flex items-center justify-between py-2.5 font-bold text-teal-800 hover:text-teal-950 group transition"
                >
                  <span>Privacy Policy</span>
                  <span className="text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition" aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/refunds-and-cancellations"
                  className="flex items-center justify-between py-2.5 font-bold text-teal-800 hover:text-teal-950 group transition"
                >
                  <span>Refunds and Cancellations</span>
                  <span className="text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Popular Exam Series Links Matching Home Page */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
              <h2 className="font-display text-base font-bold text-slate-900">Target State Exams &amp; Guides</h2>
              <p className="mt-1 text-xs text-slate-500">
                Direct access to syllabus mock tests &amp; physical standards:
              </p>
              <div className="mt-3.5 flex flex-col gap-2.5 text-xs sm:text-sm">
                <div className="rounded-xl border border-teal-200/90 bg-teal-50/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-950">TG Police Constable</span>
                    <span className="rounded-full bg-teal-100 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-900">7,112 Posts</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-teal-800">
                    <Link href="/mock-tests/telangana/police-constable-free-mock-test#physical-standards" className="hover:underline">
                      PET Standards →
                    </Link>
                    <span className="text-slate-300">•</span>
                    <Link href="/mock-tests/telangana/police-constable-free-mock-test#exam-schedule" className="hover:underline">
                      Vacancies →
                    </Link>
                    <span className="text-slate-300">•</span>
                    <Link href="/mock-tests/telangana/police-constable-free-mock-test" className="hover:underline">
                      Mock Tests →
                    </Link>
                  </div>
                </div>

                <Link
                  href="/mock-tests/telangana/tg-tet-2026"
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5 font-bold text-slate-700 hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-950 transition"
                >
                  <span>TG TET 2026 Practice Papers</span>
                  <span className="text-teal-700" aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/mock-tests/telangana"
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5 font-bold text-slate-700 hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-950 transition"
                >
                  <span>Telangana Competitive Exams (TGPSC)</span>
                  <span className="text-teal-700" aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/mock-tests/andhra-pradesh"
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5 font-bold text-slate-700 hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-950 transition"
                >
                  <span>Andhra Pradesh Exams (APPSC)</span>
                  <span className="text-teal-700" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

          </div>

        </section>
      </div>

      {/* Grounded, Professional Footer Matching Home Page */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-900 text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <BrandMark className="h-9 w-9 text-white" />
              <div>
                <p className="font-display text-base font-bold text-white">Varadhi Prep</p>
                <p className="text-xs text-slate-400">TG &amp; AP State Competitive Exams Mock Tests</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Syllabus-aligned computer-based mock tests for competitive exam aspirants across Telangana and Andhra Pradesh. Practice for TGPRB Police Constable, TSPSC, APPSC, and TET.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              © {new Date().getFullYear()} Varadhi Prep. All rights reserved.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Quick links</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link href="/mock-tests/telangana/police-constable-free-mock-test" className="hover:text-white transition">Police Constable</Link>
              <Link href="/mock-tests/telangana/police-constable-free-mock-test#physical-standards" className="hover:text-white transition">Police PET Standards</Link>
              <Link href="/mock-tests/telangana/police-constable-free-mock-test#exam-schedule" className="hover:text-white transition">Police 7,112 Vacancies</Link>
              <Link href="/mock-tests/telangana/tg-tet-2026" className="hover:text-white transition">TG TET 2026</Link>
              <Link href="/mock-tests/telangana" className="hover:text-white transition">Telangana Exams</Link>
              <Link href="/mock-tests/andhra-pradesh" className="hover:text-white transition">Andhra Pradesh Exams</Link>
              <Link href="/support" className="hover:text-white transition">Support</Link>
              <Link href="/login" className="hover:text-white transition">Sign in</Link>
              <Link href="/register" className="hover:text-white transition">Create account</Link>
              <Link href="/privacy-policy" className="hover:text-white transition">Privacy</Link>
              <Link href="/terms-and-conditions" className="hover:text-white transition">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
