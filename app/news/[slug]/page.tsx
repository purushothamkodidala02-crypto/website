import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandLockup } from "@/components/brand/VaradhiBrand";
import { absoluteUrl } from "@/lib/site";
import { getExamTeluguMetadata } from "@/lib/telugu-seo";

export const revalidate = 300;

const PRIMARY_SLUG = "telangana-police-constable-notification-2026";
const ALIAS_SLUGS = new Set([
  "telangana-police-constable-notification",
  "ts-police-constable-notification-2026",
  "tslprb-police-constable-notification-2026",
]);

export async function generateStaticParams() {
  return [
    { slug: PRIMARY_SLUG },
    { slug: "telangana-police-constable-notification" },
    { slug: "ts-police-constable-notification-2026" },
  ];
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== PRIMARY_SLUG && !ALIAS_SLUGS.has(slug)) {
    return { title: "News Not Found", robots: { index: false, follow: false } };
  }

  const teluguData = getExamTeluguMetadata("police-constable-free-mock-test", "Police Constable", "telangana");
  const title = "Telangana Police Constable Notification 2026";
  const description =
    "TSLPRB Telangana Police Constable Notification 2026 (Rc No. 189/Rect./Rect.2/2026) for 7,112 vacancies. Complete details on cadre-wise vacancies, syllabus, exam pattern, GO Ms 87 age limits, PMT/PET standards, salary & application process.";
  const canonical = absoluteUrl(`/news/${PRIMARY_SLUG}`);

  return {
    title,
    description,
    keywords: [
      ...(teluguData?.keywords ?? []),
      "Telangana Police Constable Notification 2026",
      "TS Police Constable Notification 2026 PDF",
      "TSLPRB Police Constable 7112 Vacancies",
      "Telangana Police Constable Syllabus 2026",
      "TS Police Constable PWT Exam Pattern",
      "TS Police Constable Age Limit GO Ms 87",
      "TS Police Constable PET PMT Standards",
      "TS Police Constable Salary Pay Scale",
      "తెలంగాణ పోలీస్ కానిస్టేబుల్ నోటిఫికేషన్ 2026",
      "తెలంగాణ కానిస్టేబుల్ 7112 పోస్టుల వివరాలు",
    ],
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: `${title} - 7,112 Vacancies, Syllabus & Pattern`,
      description,
      siteName: "Varadhi Prep",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Telangana Police Constable Notification 2026",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - 7,112 Vacancies, Syllabus & Pattern`,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function TelanganaPoliceNotificationPage({ params }: Props) {
  const { slug } = await params;
  if (slug !== PRIMARY_SLUG && !ALIAS_SLUGS.has(slug)) {
    notFound();
  }
  if (slug !== PRIMARY_SLUG) {
    permanentRedirect(`/news/${PRIMARY_SLUG}`);
  }

  const teluguData = getExamTeluguMetadata("police-constable-free-mock-test", "Police Constable", "telangana");
  const canonical = absoluteUrl(`/news/${PRIMARY_SLUG}`);

  const vacancies = teluguData?.schedule?.vacancies ?? [];
  const totalVacancies = teluguData?.schedule?.totalVacancies ?? 7112;
  const ageLimits = teluguData?.schedule?.ageLimits ?? [];
  const stages = teluguData?.pattern?.stages ?? [];
  const subjects = teluguData?.pattern?.subjects ?? [];
  const qualifyingMarks = teluguData?.pattern?.qualifyingMarks ?? [];
  const scheduleEvents = teluguData?.schedule?.events ?? [];
  const jobProfile = teluguData?.jobProfile;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: "Telangana Police Constable Notification 2026",
      description:
        "Official Telangana State Level Police Recruitment Board (TSLPRB) notification Rc No. 189/Rect./Rect.2/2026 for 7,112 posts with complete syllabus, post-wise vacancies, selection process, PMT/PET standards, and salary.",
      url: canonical,
      datePublished: "2026-07-29T10:00:00+05:30",
      dateModified: "2026-11-14T12:55:00+05:30",
      inLanguage: ["en-IN", "te-IN"],
      publisher: {
        "@type": "Organization",
        name: "Varadhi Prep",
        url: absoluteUrl("/"),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: "Telangana Police Constable (Civil & Allied) - 7,112 Posts",
      description:
        "Direct recruitment for 7,112 posts of Stipendiary Cadet Trainee (SCT) Police Constables (Civil, AR, SAR CPL, TSSP/TGSPF), Fire Fighters, and Warders in Telangana State.",
      identifier: {
        "@type": "PropertyValue",
        name: "TSLPRB",
        value: "Rc No. 189 / Rect. / Rect.2 / 2026",
      },
      datePosted: "2026-07-29",
      validThrough: "2026-12-31",
      employmentType: "FULL_TIME",
      hiringOrganization: {
        "@type": "Organization",
        name: "Telangana State Level Police Recruitment Board (TSLPRB)",
        sameAs: "https://www.tgprb.in",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressRegion: "Telangana",
          addressCountry: "IN",
        },
      },
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: {
          "@type": "QuantitativeValue",
          minValue: 24280,
          maxValue: 72850,
          unitText: "MONTH",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        ...(teluguData?.englishFaqs ?? []).map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Recruitment News", item: canonical },
        { "@type": "ListItem", position: 3, name: "Telangana Police Constable Notification 2026", item: canonical },
      ],
    },
  ];

  return (
    <main className="student-page min-h-screen bg-[#f8fafc] text-slate-800 w-full max-w-full overflow-x-hidden antialiased">
      <JsonLd data={jsonLd} />

      {/* Subtle Light Orange Top Line */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-300 via-amber-200 to-orange-300" />

      {/* Clean Light Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-2" aria-label="Varadhi Prep home">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="hidden sm:inline">Telangana Police Recruitment Updates 2026</span>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" title="Active Notification" />
          </div>
        </div>
      </header>

      {/* Hero Headline Section with Soft Light Tones */}
      <section className="border-b border-slate-200/70 bg-white">
        <div className="mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
          {/* Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs">
            <Link href="/" className="font-medium text-slate-500 hover:text-slate-800 transition">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-500">Recruitment News</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-orange-800">Telangana Police Constable Notification 2026</span>
          </nav>

          {/* Soft Pill Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-800">
              Official Notification
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
              TSLPRB Rc No. 189 / Rect. / Rect.2 / 2026
            </span>
            <span className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              7,112 Total Vacancies
            </span>
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              GO Ms No. 87 (+5 Years Age Relaxation)
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-center">
            <div className="lg:col-span-8">
              <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Telangana Police Constable Notification 2026
              </h1>
              <p className="mt-2 text-base sm:text-lg font-semibold text-orange-800/90">
                తెలంగాణ పోలీస్ కానిస్టేబుల్ 7,112 పోస్టుల అధికారిక నోటిఫికేషన్, సిలబస్, ఈవెంట్స్ &amp; ఎంపిక విధానం
              </p>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 max-w-4xl">
                The Telangana State Level Police Recruitment Board (TSLPRB) has officially published Notification Rc No. 189/Rect./Rect.2/2026 for 7,112 vacancies across SCT Police Constables (Civil, AR, SAR CPL, TSSP/TGSPF), Fire Fighters, and Prison Warders. Review the complete schedule, category-wise age relaxations under G.O. Ms No. 87, physical standards (PMT/PET), exam pattern, and Annexure-II syllabus below.
              </p>
            </div>

            {/* Soft Light Overview Card */}
            <div className="lg:col-span-4 rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50/40 via-white to-amber-50/30 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-800">Key Highlights</span>
                <span className="rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">Active</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Board:</span>
                  <strong className="text-slate-800 font-semibold">TSLPRB, Telangana</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Posts:</span>
                  <strong className="text-orange-800 font-bold text-sm">7,112 Posts</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">PWT Exam Date:</span>
                  <strong className="text-slate-800 font-semibold">20 Dec 2026 (Sunday)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Pay Scale:</span>
                  <strong className="text-slate-800 font-semibold">₹24,280 – ₹72,850</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Negative Mark:</span>
                  <strong className="text-rose-700 font-semibold">20% (-0.20 per wrong)</strong>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-orange-100">
                <a
                  href="#schedule"
                  className="block w-full text-center rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 font-semibold py-2 text-xs transition"
                >
                  View Important Dates &amp; Events &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* 6 Soft Light Metric Tiles */}
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-xl border border-orange-200/80 bg-orange-50/50 p-4 border-t-2 border-t-orange-400 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 block">Total Vacancies</span>
              <strong className="font-display mt-1 text-xl sm:text-2xl font-extrabold text-orange-950 block">7,112</strong>
              <span className="text-[11px] font-medium text-orange-700 block mt-0.5">Civil &amp; Allied Cadres</span>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 border-t-2 border-t-slate-400 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Scale of Pay</span>
              <strong className="font-display mt-1 text-sm sm:text-base font-bold text-slate-900 block">₹24,280 – ₹72,850</strong>
              <span className="text-[11px] font-medium text-slate-500 block mt-0.5">₹34k–₹39k In-Hand Gross</span>
            </div>

            <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 border-t-2 border-t-amber-400 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Prelims Date</span>
              <strong className="font-display mt-1 text-sm sm:text-base font-bold text-amber-950 block">20 Dec 2026</strong>
              <span className="text-[11px] font-medium text-amber-700 block mt-0.5">Forenoon 10 AM – 1 PM</span>
            </div>

            <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-4 border-t-2 border-t-rose-400 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">Negative Marking</span>
              <strong className="font-display mt-1 text-sm sm:text-base font-bold text-rose-950 block">20% (-0.20)</strong>
              <span className="text-[11px] font-medium text-rose-700 block mt-0.5">Per Wrong Answer</span>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 border-t-2 border-t-slate-400 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">General Age</span>
              <strong className="font-display mt-1 text-sm sm:text-base font-bold text-slate-900 block">18 – 27 Years</strong>
              <span className="text-[11px] font-medium text-slate-500 block mt-0.5">GO Ms 87 (+5 Years)</span>
            </div>

            <div className="rounded-xl border border-orange-200/80 bg-orange-50/50 p-4 border-t-2 border-t-orange-400 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 block">Qualification</span>
              <strong className="font-display mt-1 text-sm sm:text-base font-bold text-orange-950 block">10+2 Intermediate</strong>
              <span className="text-[11px] font-medium text-orange-700 block mt-0.5">State Board or Equiv.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Full-Screen Layout with Light Cement Surface */}
      <div className="mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">

          {/* Left Column (Primary Article Flow) - 8 Columns */}
          <article className="lg:col-span-8 space-y-7">

            {/* 1. Important Dates & Timeline Roadmap */}
            <section id="schedule" className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="border-l-3 border-orange-400 pl-3.5 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Official Schedule</span>
                <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
                  1. Important Dates &amp; Recruitment Schedule
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Chronological schedule of key events for TSLPRB Police Constable Recruitment 2026.
                </p>
              </div>

              {/* Light Roadmap Cards */}
              <div className="mt-6 space-y-3.5">
                {scheduleEvents.map((evt, idx) => (
                  <div
                    key={evt.title}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-200/70 bg-[#fafbfe] p-4 hover:border-orange-200 hover:bg-orange-50/30 transition"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-orange-200 bg-orange-50 text-orange-800 font-bold text-xs">
                        0{idx + 1}
                      </span>
                      <div>
                        <h3 className="font-display text-sm sm:text-base font-bold text-slate-900">
                          {evt.title}
                        </h3>
                        {evt.teluguTitle && (
                          <p className="text-xs font-medium text-orange-800 mt-0.5">
                            {evt.teluguTitle}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                          {evt.detail}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-4 sm:text-right shrink-0">
                      <span className="inline-block rounded-lg border border-orange-200/70 bg-white px-2.5 py-1 text-xs font-semibold text-orange-900">
                        {evt.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. 7,112 Cadre Vacancy Distribution */}
            <section id="vacancies" className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="border-l-3 border-orange-400 pl-3.5 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Post Matrix</span>
                <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
                  2. Cadre-Wise Vacancy Breakdown (Total 7,112 Posts)
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Official cadre distribution as sanctioned in TSLPRB Notification Rc No. 189/Rect./Rect.2/2026.
                </p>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-xs sm:text-sm border border-slate-200/80 divide-y divide-slate-200/80">
                  <thead className="bg-slate-50/80 font-bold text-slate-700">
                    <tr>
                      <th className="px-4 py-3 border-r border-slate-200/80">Code</th>
                      <th className="px-4 py-3 border-r border-slate-200/80">Cadre &amp; Post Name</th>
                      <th className="px-4 py-3 border-r border-slate-200/80">Department</th>
                      <th className="px-4 py-3 border-r border-slate-200/80">Eligibility</th>
                      <th className="px-4 py-3 text-right font-bold">Vacancies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {vacancies.map((v, idx) => {
                      const pct = Math.round((v.vacancies / totalVacancies) * 100);
                      return (
                        <tr key={v.postCode} className={idx % 2 === 1 ? "bg-slate-50/40" : "bg-white"}>
                          <td className="px-4 py-2.5 font-semibold border-r border-slate-200/80">
                            <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                              {v.postCode}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-slate-900 border-r border-slate-200/80">
                            {v.postName}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600 border-r border-slate-200/80">
                            {v.department}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600 border-r border-slate-200/80">
                            <span className="inline-block rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200/60">
                              {v.genderEligibility}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="font-bold text-slate-900 text-sm">
                              {v.vacancies.toLocaleString("en-IN")}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              ({pct}% of total)
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-orange-50/60 font-bold text-slate-900 border-t-2 border-orange-300">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right border-r border-orange-200/70 uppercase tracking-wider text-xs">
                        Total Notified Vacancies
                      </td>
                      <td className="px-4 py-3 text-right text-orange-950 text-base font-extrabold">
                        {totalVacancies.toLocaleString("en-IN")} Posts
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* 3. Application Fee Structure */}
            <section id="fees" className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="border-l-3 border-orange-400 pl-3.5 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Fee Details</span>
                <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
                  3. Application Fee Structure &amp; Concessions
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Prescribed examination fee for online registration via payment gateway.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-5 flex flex-col justify-between">
                  <div>
                    <span className="inline-block rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      General / OC &amp; BC
                    </span>
                    <p className="font-display mt-2 text-3xl font-extrabold text-slate-900">₹800</p>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                      For OC, BC, and EWS candidates belonging to the State of Telangana.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
                    Online Mode: UPI / Net Banking / Debit Card
                  </div>
                </div>

                <div className="rounded-xl border border-orange-200/80 bg-orange-50/30 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-block rounded-md border border-orange-200 bg-orange-100/80 text-orange-800 px-2 py-0.5 text-[11px] font-bold">
                        TS SC &amp; ST (50% Relief)
                      </span>
                    </div>
                    <p className="font-display mt-2 text-3xl font-extrabold text-orange-950">₹400</p>
                    <p className="mt-2 text-xs text-orange-800 leading-relaxed">
                      Concession rate for Scheduled Castes and Scheduled Tribes belonging to Telangana State.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-orange-200/60 text-[11px] text-orange-800 font-medium">
                    Must possess valid Telangana Caste Certificate
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-5 flex flex-col justify-between">
                  <div>
                    <span className="inline-block rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      All Other States
                    </span>
                    <p className="font-display mt-2 text-3xl font-extrabold text-slate-900">₹800</p>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                      Candidates belonging to States other than Telangana must pay full fee regardless of category.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
                    Treated under Open Competition (OC)
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Pay Scale & In-Hand Salary */}
            <section id="salary" className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="border-l-3 border-orange-400 pl-3.5 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Remuneration</span>
                <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
                  4. Pay Scale &amp; Monthly Salary Structure
                </h2>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="rounded-xl border border-slate-200/80 p-5 bg-slate-50/40">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Revised RPS Scale</span>
                  <p className="font-display mt-1 text-2xl font-bold text-slate-900">{jobProfile?.payScale ?? "₹24,280 – ₹72,850"}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Governed by Telangana State Revised Pay Rules. Basic salary begins at ₹24,280 with annual grade increments reaching up to ₹72,850.
                  </p>
                </div>
                <div className="rounded-xl border border-orange-200/80 p-5 bg-orange-50/30">
                  <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">Estimated Monthly Gross</span>
                  <p className="font-display mt-1 text-2xl font-bold text-orange-950">{jobProfile?.grossSalaryMonthly ?? "₹34,000 – ₹39,000 / month"}</p>
                  <p className="mt-2 text-xs leading-relaxed text-orange-800/90">
                    Includes Basic Pay + Dearness Allowance (DA) + House Rent Allowance (11% to 24% by city) + Medical &amp; Uniform Kit Allowance.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Eligibility Criteria & Age Limits */}
            <section id="eligibility" className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="border-l-3 border-orange-400 pl-3.5 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Eligibility</span>
                <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
                  5. Age Limits &amp; G.O. Ms No. 87 5-Year Age Relaxation
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Age benchmarked as of 1st July 2026. The Government of Telangana issued G.O. Ms No. 87 granting a 5-year upper age relaxation.
                </p>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[550px] text-left text-xs sm:text-sm border border-slate-200/80 divide-y divide-slate-200/80">
                  <thead className="bg-slate-50/80 font-bold text-slate-700">
                    <tr>
                      <th className="px-4 py-3 border-r border-slate-200/80">Category</th>
                      <th className="px-4 py-3 border-r border-slate-200/80">Permissible Age Range</th>
                      <th className="px-4 py-3">Statutory Basis &amp; Relaxation Rule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {ageLimits.map((a, idx) => (
                      <tr key={a.category} className={idx % 2 === 1 ? "bg-slate-50/40" : "bg-white"}>
                        <td className="px-4 py-3 font-semibold text-slate-900 border-r border-slate-200/80">{a.category}</td>
                        <td className="px-4 py-3 font-bold text-orange-900 border-r border-slate-200/80 whitespace-nowrap">{a.ageRange}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs leading-relaxed">{a.basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 text-xs text-slate-600 space-y-2 leading-relaxed">
                <p><strong>Educational Qualification:</strong> Must have passed Intermediate (10+2) or its equivalent recognized by the Telangana State Board of Intermediate Education as on 29th July 2026.</p>
                <p><strong>SC / ST Concession:</strong> Must have passed SSC (10th) and appeared for both 1st and 2nd year Intermediate examinations.</p>
              </div>
            </section>

            {/* 6. Selection Process Flow */}
            <section id="selection" className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="border-l-3 border-orange-400 pl-3.5 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Selection Stages</span>
                <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
                  6. 4-Stage Selection Procedure
                </h2>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stages.map((st, idx) => (
                  <div key={st} className="rounded-xl border border-slate-200/80 p-4.5 bg-slate-50/40 flex flex-col justify-between">
                    <div>
                      <span className="inline-flex rounded-md border border-orange-200 bg-orange-100/80 text-orange-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                        Stage {idx + 1}
                      </span>
                      <p className="mt-2.5 text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">{st}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. PMT & PET Physical Standards */}
            <section id="physical" className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="border-l-3 border-orange-400 pl-3.5 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Physical Tests</span>
                <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
                  7. Physical Measurements (PMT) &amp; Physical Efficiency (PET)
                </h2>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="rounded-xl border border-slate-200/80 overflow-hidden bg-white">
                  <div className="bg-slate-50/90 px-4 py-3 font-bold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-200/70">
                    Physical Measurement Standards (PMT)
                  </div>
                  <div className="p-4 space-y-3.5 text-xs sm:text-sm text-slate-600">
                    <div className="border-b border-slate-100 pb-3">
                      <strong className="block text-slate-900 font-bold">Men (General, BC, SC):</strong>
                      <p className="text-xs text-slate-500 mt-0.5">Height: Minimum 167.6 cms</p>
                      <p className="text-xs text-slate-500">Chest: Minimum 86.3 cms (5 cms minimum expansion)</p>
                    </div>
                    <div className="border-b border-slate-100 pb-3">
                      <strong className="block text-slate-900 font-bold">Men (ST &amp; Agency Aboriginal Tribes):</strong>
                      <p className="text-xs text-slate-500 mt-0.5">Height: Minimum 160.0 cms</p>
                      <p className="text-xs text-slate-500">Chest: Minimum 80.0 cms (3 cms expansion)</p>
                    </div>
                    <div className="border-b border-slate-100 pb-3">
                      <strong className="block text-slate-900 font-bold">Women (General, BC, SC):</strong>
                      <p className="text-xs text-slate-500 mt-0.5">Height: Minimum 152.5 cms</p>
                    </div>
                    <div>
                      <strong className="block text-slate-900 font-bold">Women (ST &amp; Agency Aboriginal Tribes):</strong>
                      <p className="text-xs text-slate-500 mt-0.5">Height: Minimum 150.0 cms</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/80 overflow-hidden bg-white">
                  <div className="bg-slate-50/90 px-4 py-3 font-bold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-200/70">
                    Physical Efficiency Test Events (PET)
                  </div>
                  <div className="p-4 space-y-3.5 text-xs sm:text-sm text-slate-600">
                    <div className="border-b border-slate-100 pb-3">
                      <strong className="block text-slate-900 font-bold">1600 Meters Run (Men Candidates):</strong>
                      <p className="text-xs text-slate-500 mt-0.5">Max Time: 7 Minutes 15 Seconds (Mandatory Qualifying Event)</p>
                    </div>
                    <div className="border-b border-slate-100 pb-3">
                      <strong className="block text-slate-900 font-bold">800 Meters Run (Women Candidates):</strong>
                      <p className="text-xs text-slate-500 mt-0.5">Max Time: 5 Minutes 20 Seconds (Mandatory Qualifying Event)</p>
                    </div>
                    <div className="border-b border-slate-100 pb-3">
                      <strong className="block text-slate-900 font-bold">Long Jump:</strong>
                      <p className="text-xs text-slate-500 mt-0.5">Men: Minimum 4.00 Meters | Women: Minimum 2.50 Meters</p>
                    </div>
                    <div>
                      <strong className="block text-slate-900 font-bold">Shot Put:</strong>
                      <p className="text-xs text-slate-500 mt-0.5">Men (7.26 Kg): Min 6.00 Meters | Women (4 Kg): Min 4.00 Meters</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. Exam Pattern & Qualifying Marks */}
            <section id="pattern" className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="border-l-3 border-orange-400 pl-3.5 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Exam Scheme</span>
                <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
                  8. Written Examination Pattern &amp; Qualifying Marks
                </h2>
              </div>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/50">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Questions</span>
                  <strong className="mt-1 text-lg font-bold text-slate-900 block">200 Qs</strong>
                </div>
                <div className="rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/50">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Marks</span>
                  <strong className="mt-1 text-lg font-bold text-slate-900 block">200 Marks</strong>
                </div>
                <div className="rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/50">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Duration</span>
                  <strong className="mt-1 text-lg font-bold text-slate-900 block">3 Hours</strong>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3.5">
                  <span className="text-[10px] font-bold uppercase text-rose-800 block">Negative Marking</span>
                  <strong className="mt-1 text-lg font-bold text-rose-950 block">20% (-0.20)</strong>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200/80 overflow-hidden">
                <div className="bg-slate-50/90 px-4 py-2.5 font-bold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-200/70">
                  Category Minimum Qualifying Marks
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-center bg-white">
                  {qualifyingMarks.map((qm) => (
                    <div key={qm.category} className="rounded-lg border border-slate-200/80 p-3.5 bg-slate-50/40">
                      <span className="text-xs font-semibold text-slate-600 block">{qm.category}</span>
                      <strong className="text-lg font-bold text-slate-900 block mt-1">{qm.pwtPercentage}</strong>
                      <span className="text-[11px] text-orange-800 font-semibold block">{qm.pwtMarks}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 9. Annexure-II Syllabus */}
            <section id="syllabus" className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="border-l-3 border-orange-400 pl-3.5 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Annexure-II Curriculum</span>
                <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
                  9. Complete Subject-wise Syllabus (PWT &amp; FWE)
                </h2>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((sub, idx) => (
                  <div key={sub.name} className="rounded-xl border border-slate-200/80 p-4.5 bg-slate-50/30 hover:border-orange-200 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="grid h-6 w-6 place-items-center rounded-md border border-orange-200 bg-orange-50 text-xs font-bold text-orange-800">
                          {idx + 1}
                        </span>
                        <h3 className="font-display text-sm font-bold text-slate-900">{sub.name}</h3>
                      </div>
                      <span className="text-[11px] font-medium text-orange-800 block mt-1">{sub.teluguName}</span>
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                        {sub.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 10. Step-by-Step Online Application Guide */}
            <section id="how-to-apply" className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="border-l-3 border-orange-400 pl-3.5 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Application Steps</span>
                <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
                  10. Step-by-Step Online Application Process
                </h2>
              </div>

              <div className="mt-6 space-y-3 text-xs sm:text-sm text-slate-600">
                <div className="flex gap-3.5 p-3 rounded-xl border border-slate-200/70 bg-slate-50/40">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-orange-200 bg-orange-50 text-orange-800 font-bold text-xs">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Portal Access:</strong>
                    <p className="text-slate-500 mt-0.5">Navigate to the official TSLPRB portal at <strong>www.tgprb.in</strong>.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 p-3 rounded-xl border border-slate-200/70 bg-slate-50/40">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-orange-200 bg-orange-50 text-orange-800 font-bold text-xs">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Mobile Registration &amp; User ID:</strong>
                    <p className="text-slate-500 mt-0.5">Use your primary active mobile phone number to authenticate via OTP.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 p-3 rounded-xl border border-slate-200/70 bg-slate-50/40">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-orange-200 bg-orange-50 text-orange-800 font-bold text-xs">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Online Fee Payment:</strong>
                    <p className="text-slate-500 mt-0.5">Pay ₹800 (for OC/BC) or ₹400 (for TS SC/ST) online using Net Banking, UPI, or Debit card.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 p-3 rounded-xl border border-slate-200/70 bg-slate-50/40">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-orange-200 bg-orange-50 text-orange-800 font-bold text-xs">
                    4
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Part-I Application Submission:</strong>
                    <p className="text-slate-500 mt-0.5">Fill academic qualifications, post cadre preferences, and upload photo/signature.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 p-3 rounded-xl border border-slate-200/70 bg-slate-50/40">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-orange-200 bg-orange-50 text-orange-800 font-bold text-xs">
                    5
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Download Acknowledgment:</strong>
                    <p className="text-slate-500 mt-0.5">Save and print your completed application PDF with the unique Reference Number.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 11. Police Duties & Hierarchy */}
            <section id="duties" className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="border-l-3 border-orange-400 pl-3.5 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Career &amp; Duties</span>
                <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
                  11. Police Constable Responsibilities &amp; Promotion Ladder
                </h2>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-3">
                  <strong className="block text-slate-900 font-bold text-sm">Key Station Responsibilities:</strong>
                  {jobProfile?.duties.map((d) => (
                    <div key={d.title} className="rounded-lg border border-slate-200/70 p-3.5 bg-slate-50/40">
                      <span className="font-semibold text-slate-900 block">{d.title}</span>
                      {d.teluguTitle && <span className="text-[11px] font-medium text-orange-800 block mt-0.5">{d.teluguTitle}</span>}
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">{d.description}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <strong className="block text-slate-900 font-bold text-sm mb-3">Police Career Advancement:</strong>
                  <div className="rounded-xl border border-slate-200/70 p-4 bg-slate-50/40 space-y-3 text-xs sm:text-sm">
                    {(jobProfile?.careerGrowth ?? []).map((step, idx) => (
                      <div key={step} className="flex items-center gap-3">
                        <span className="grid h-6 w-6 place-items-center rounded-full border border-orange-200 bg-orange-100 text-orange-800 font-bold text-xs shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 12. Bilingual FAQs */}
            <section id="faqs" className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="border-l-3 border-orange-400 pl-3.5 border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">FAQs</span>
                <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
                  12. Frequently Asked Questions (English &amp; Telugu)
                </h2>
              </div>

              <div className="mt-6 space-y-3.5">
                {(teluguData?.englishFaqs ?? []).map((faq, idx) => {
                  const teluguFaq = teluguData?.teluguFaqs?.[idx];
                  return (
                    <div key={faq.question} className="rounded-xl border border-slate-200/70 p-4 bg-slate-50/30">
                      <h3 className="font-display text-sm sm:text-base font-bold text-slate-900">
                        {faq.question}
                      </h3>
                      {teluguFaq && (
                        <p className="mt-1 text-xs font-medium text-orange-800">
                          {teluguFaq.question}
                        </p>
                      )}
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                      {teluguFaq && (
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed font-telugu">
                          {teluguFaq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

          </article>

          {/* Right Column (Desktop Sticky Quick Action & Chapter Navigator) - 4 Columns */}
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">

            {/* Quick Chapter Navigator Sidebar */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900">
                  Jump to Chapter
                </h3>
                <span className="rounded-md border border-orange-200 bg-orange-50 text-orange-800 px-2 py-0.5 text-[10px] font-bold">12 Chapters</span>
              </div>
              <div className="mt-3 flex flex-col gap-1 text-xs font-medium text-slate-600">
                <a href="#schedule" className="rounded-lg px-3 py-1.5 hover:bg-orange-50/60 hover:text-orange-900 transition flex items-center justify-between">
                  <span>1. Important Dates &amp; Timeline</span>
                  <span className="text-slate-300">&rarr;</span>
                </a>
                <a href="#vacancies" className="rounded-lg px-3 py-1.5 hover:bg-orange-50/60 hover:text-orange-900 transition flex items-center justify-between">
                  <span>2. 7,112 Cadre Vacancies</span>
                  <span className="text-slate-300">&rarr;</span>
                </a>
                <a href="#fees" className="rounded-lg px-3 py-1.5 hover:bg-orange-50/60 hover:text-orange-900 transition flex items-center justify-between">
                  <span>3. Application Fees</span>
                  <span className="text-slate-300">&rarr;</span>
                </a>
                <a href="#salary" className="rounded-lg px-3 py-1.5 hover:bg-orange-50/60 hover:text-orange-900 transition flex items-center justify-between">
                  <span>4. Pay Scale &amp; Salary</span>
                  <span className="text-slate-300">&rarr;</span>
                </a>
                <a href="#eligibility" className="rounded-lg px-3 py-1.5 hover:bg-orange-50/60 hover:text-orange-900 transition flex items-center justify-between">
                  <span>5. Age Limits &amp; GO 87</span>
                  <span className="text-slate-300">&rarr;</span>
                </a>
                <a href="#selection" className="rounded-lg px-3 py-1.5 hover:bg-orange-50/60 hover:text-orange-900 transition flex items-center justify-between">
                  <span>6. 4-Stage Selection Procedure</span>
                  <span className="text-slate-300">&rarr;</span>
                </a>
                <a href="#physical" className="rounded-lg px-3 py-1.5 hover:bg-orange-50/60 hover:text-orange-900 transition flex items-center justify-between">
                  <span>7. PMT &amp; PET Physical Events</span>
                  <span className="text-slate-300">&rarr;</span>
                </a>
                <a href="#pattern" className="rounded-lg px-3 py-1.5 hover:bg-orange-50/60 hover:text-orange-900 transition flex items-center justify-between">
                  <span>8. Written Exam Pattern</span>
                  <span className="text-slate-300">&rarr;</span>
                </a>
                <a href="#syllabus" className="rounded-lg px-3 py-1.5 hover:bg-orange-50/60 hover:text-orange-900 transition flex items-center justify-between">
                  <span>9. Annexure-II Syllabus</span>
                  <span className="text-slate-300">&rarr;</span>
                </a>
                <a href="#how-to-apply" className="rounded-lg px-3 py-1.5 hover:bg-orange-50/60 hover:text-orange-900 transition flex items-center justify-between">
                  <span>10. How to Apply Online</span>
                  <span className="text-slate-300">&rarr;</span>
                </a>
                <a href="#duties" className="rounded-lg px-3 py-1.5 hover:bg-orange-50/60 hover:text-orange-900 transition flex items-center justify-between">
                  <span>11. Police Hierarchy &amp; Duties</span>
                  <span className="text-slate-300">&rarr;</span>
                </a>
                <a href="#faqs" className="rounded-lg px-3 py-1.5 hover:bg-orange-50/60 hover:text-orange-900 transition flex items-center justify-between">
                  <span>12. Bilingual FAQs</span>
                  <span className="text-slate-300">&rarr;</span>
                </a>
              </div>
            </div>

            {/* Official Portal Reference Card */}
            <div className="rounded-2xl border border-orange-200/80 bg-orange-50/30 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800 block">
                Official Verification
              </span>
              <h4 className="font-display mt-1 text-sm font-bold text-slate-900">
                TSLPRB Official Recruitment Portal
              </h4>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Candidate registrations, hall ticket downloads, and key objection windows are conducted exclusively on the official recruitment website.
              </p>
              <div className="mt-4">
                <a
                  href="https://www.tgprb.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 font-semibold py-2 text-xs transition"
                >
                  Visit tgprb.in Portal &rarr;
                </a>
              </div>
            </div>

            {/* Key Examination Reminder Box */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-xs text-slate-500 space-y-2">
              <strong className="block text-slate-800 font-semibold text-sm">Critical Candidate Notes:</strong>
              <p>&bull; <strong>Negative Marking:</strong> 20% mark (0.20) is deducted per wrong answer in the PWT.</p>
              <p>&bull; <strong>1600m Run:</strong> Mandatory qualifying event for Men candidates (7 mins 15 secs).</p>
              <p>&bull; <strong>800m Run:</strong> Mandatory qualifying event for Women candidates (5 mins 20 secs).</p>
              <p>&bull; <strong>Age Relief:</strong> G.O. Ms No. 87 provides +5 years across all categories.</p>
            </div>

          </aside>

        </div>
      </div>

      {/* Modern Wide Footer */}
      <footer className="mt-16 border-t border-slate-200/70 bg-white py-10 text-center text-xs text-slate-500">
        <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-10">
          <p className="font-semibold text-slate-800 text-sm">Varadhi Prep &bull; Examination Information &amp; Preparation Portal</p>
          <p className="mt-1 text-slate-500">
            Data sourced from official TSLPRB Notification Rc No. 189 / Rect. / Rect.2 / 2026. Official website:{" "}
            <a href="https://www.tgprb.in" target="_blank" rel="noopener noreferrer" className="text-orange-800 underline font-medium">
              www.tgprb.in
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
