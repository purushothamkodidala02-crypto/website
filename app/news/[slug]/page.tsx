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
      dateModified: "2026-11-14T12:15:00+05:30",
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
    <main className="student-page min-h-screen bg-[#edf0f4] text-slate-900 w-full max-w-full overflow-x-hidden antialiased">
      <JsonLd data={jsonLd} />

      {/* Top Accent Gradient Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

      {/* Editorial Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-[#d8dee6] bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="Varadhi Prep home">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
            <span className="hidden md:inline text-slate-500">Official Board:</span>
            <a
              href="https://www.tgprb.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 font-bold text-orange-900 hover:bg-orange-100 transition shadow-2xs"
            >
              <span>tgprb.in Portal</span>
              <span aria-hidden="true" className="text-[11px]">&rarr;</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Headline Section with Proportional Cement & Orange Surfaces */}
      <section className="border-b border-[#d8dee6] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs">
            <Link href="/" className="font-semibold text-slate-500 hover:text-slate-800 transition">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-500">Recruitment News</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-orange-700">Telangana Police Constable Notification 2026</span>
          </nav>

          {/* Badges Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-orange-600 px-3 py-1 text-xs font-bold text-white shadow-2xs">
              TSLPRB Official Recruitment
            </span>
            <span className="rounded-md border border-[#d2d8e2] bg-[#f1f4f8] px-3 py-1 text-xs font-semibold text-slate-700">
              Rc No. 189 / Rect. / Rect.2 / 2026
            </span>
            <span className="rounded-md border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-900">
              7,112 Cadre Posts
            </span>
          </div>

          {/* Primary Page Title */}
          <h1 className="font-display mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
            Telangana Police Constable Notification 2026
          </h1>
          <p className="mt-2 text-sm sm:text-base font-semibold text-orange-900">
            తెలంగాణ పోలీస్ కానిస్టేబుల్ 7,112 పోస్టుల అధికారిక నోటిఫికేషన్, సిలబస్, ఈవెంట్స్ &amp; ఎంపిక విధానం
          </p>

          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600">
            The Telangana State Level Police Recruitment Board (TSLPRB) has officially published the recruitment notification (Rc No. 189/Rect./Rect.2/2026) for 7,112 vacancies of Police Constables (Civil, AR, SAR CPL, TSSP/TGSPF), Fire Fighters, and Prison Warders. Review the complete schedule, category-wise age relaxations under G.O. Ms No. 87, physical measurements, exam pattern, and Annexure-II curriculum below.
          </p>

          {/* 6-Card Highlights Station */}
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-3.5 border-t-3 border-t-orange-600 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 block">Total Vacancies</span>
              <strong className="font-display mt-1 text-lg sm:text-xl font-extrabold text-orange-950 block">7,112</strong>
              <span className="text-[11px] text-orange-700 block mt-0.5">Civil &amp; Allied</span>
            </div>

            <div className="rounded-xl border border-[#d2d8e2] bg-[#f4f7fa] p-3.5 border-t-3 border-t-slate-700 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Pay Scale</span>
              <strong className="font-display mt-1 text-xs sm:text-sm font-bold text-slate-950 block">₹24,280 – ₹72,850</strong>
              <span className="text-[11px] text-slate-600 block mt-0.5">₹34k–₹39k In-Hand</span>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 border-t-3 border-t-amber-500 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">PWT Exam Date</span>
              <strong className="font-display mt-1 text-xs sm:text-sm font-bold text-amber-950 block">20 Dec 2026</strong>
              <span className="text-[11px] text-amber-800 block mt-0.5">Sunday (Forenoon)</span>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 border-t-3 border-t-rose-600 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">Negative Marking</span>
              <strong className="font-display mt-1 text-sm sm:text-base font-bold text-rose-950 block">20% (-0.20)</strong>
              <span className="text-[11px] text-rose-700 block mt-0.5">Per wrong answer</span>
            </div>

            <div className="rounded-xl border border-[#d2d8e2] bg-[#f4f7fa] p-3.5 border-t-3 border-t-slate-700 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">General Age</span>
              <strong className="font-display mt-1 text-xs sm:text-sm font-bold text-slate-950 block">18 – 27 Yrs</strong>
              <span className="text-[11px] text-slate-600 block mt-0.5">GO Ms 87 (+5 yrs)</span>
            </div>

            <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-3.5 border-t-3 border-t-orange-600 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 block">Qualification</span>
              <strong className="font-display mt-1 text-xs sm:text-sm font-bold text-orange-950 block">10+2 Pass</strong>
              <span className="text-[11px] text-orange-700 block mt-0.5">Intermediate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Article Content Body */}
      <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-8">

        {/* Proportional Table of Contents / Quick Jump Navigator */}
        <section aria-label="Table of contents" className="rounded-2xl border border-[#d2d8e2] bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e2e7ee] pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Quick Index</span>
              <h2 className="font-display text-base sm:text-lg font-bold text-slate-950">Table of Contents</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">12 Chapters</span>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-semibold text-slate-700">
            <a href="#schedule" className="flex items-center justify-between rounded-xl border border-[#e2e7ee] bg-[#f8fafc] px-3.5 py-2.5 hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-950 transition">
              <span>1. Important Dates &amp; Timeline</span>
              <span className="text-orange-600">&rarr;</span>
            </a>
            <a href="#vacancies" className="flex items-center justify-between rounded-xl border border-[#e2e7ee] bg-[#f8fafc] px-3.5 py-2.5 hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-950 transition">
              <span>2. 7,112 Cadre Vacancies</span>
              <span className="text-orange-600">&rarr;</span>
            </a>
            <a href="#fees" className="flex items-center justify-between rounded-xl border border-[#e2e7ee] bg-[#f8fafc] px-3.5 py-2.5 hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-950 transition">
              <span>3. Application Fees</span>
              <span className="text-orange-600">&rarr;</span>
            </a>
            <a href="#salary" className="flex items-center justify-between rounded-xl border border-[#e2e7ee] bg-[#f8fafc] px-3.5 py-2.5 hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-950 transition">
              <span>4. Pay Scale &amp; Salary</span>
              <span className="text-orange-600">&rarr;</span>
            </a>
            <a href="#eligibility" className="flex items-center justify-between rounded-xl border border-[#e2e7ee] bg-[#f8fafc] px-3.5 py-2.5 hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-950 transition">
              <span>5. Age Limits &amp; GO 87</span>
              <span className="text-orange-600">&rarr;</span>
            </a>
            <a href="#selection" className="flex items-center justify-between rounded-xl border border-[#e2e7ee] bg-[#f8fafc] px-3.5 py-2.5 hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-950 transition">
              <span>6. 4-Stage Selection Mode</span>
              <span className="text-orange-600">&rarr;</span>
            </a>
            <a href="#physical" className="flex items-center justify-between rounded-xl border border-[#e2e7ee] bg-[#f8fafc] px-3.5 py-2.5 hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-950 transition">
              <span>7. PMT &amp; PET Standards</span>
              <span className="text-orange-600">&rarr;</span>
            </a>
            <a href="#pattern" className="flex items-center justify-between rounded-xl border border-[#e2e7ee] bg-[#f8fafc] px-3.5 py-2.5 hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-950 transition">
              <span>8. Exam Pattern &amp; Cutoffs</span>
              <span className="text-orange-600">&rarr;</span>
            </a>
            <a href="#syllabus" className="flex items-center justify-between rounded-xl border border-[#e2e7ee] bg-[#f8fafc] px-3.5 py-2.5 hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-950 transition">
              <span>9. Annexure-II Syllabus</span>
              <span className="text-orange-600">&rarr;</span>
            </a>
            <a href="#how-to-apply" className="flex items-center justify-between rounded-xl border border-[#e2e7ee] bg-[#f8fafc] px-3.5 py-2.5 hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-950 transition">
              <span>10. How to Apply Online</span>
              <span className="text-orange-600">&rarr;</span>
            </a>
            <a href="#duties" className="flex items-center justify-between rounded-xl border border-[#e2e7ee] bg-[#f8fafc] px-3.5 py-2.5 hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-950 transition">
              <span>11. Police Hierarchy &amp; Duties</span>
              <span className="text-orange-600">&rarr;</span>
            </a>
            <a href="#faqs" className="flex items-center justify-between rounded-xl border border-[#e2e7ee] bg-[#f8fafc] px-3.5 py-2.5 hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-950 transition">
              <span>12. Bilingual FAQs</span>
              <span className="text-orange-600">&rarr;</span>
            </a>
          </div>
        </section>

        {/* 1. Important Dates & Timeline */}
        <section id="schedule" className="scroll-mt-24 rounded-2xl border border-[#d2d8e2] bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-l-4 border-orange-500 pl-3 border-b border-[#e2e7ee] pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Official Schedule</span>
            <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-950">
              1. Important Dates &amp; Timeline
            </h2>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-xs sm:text-sm border border-[#d2d8e2] divide-y divide-[#d2d8e2]">
              <thead className="bg-[#eef2f6] font-bold text-slate-800">
                <tr>
                  <th className="px-4 py-3 border-r border-[#d2d8e2]">Event / Activity</th>
                  <th className="px-4 py-3 border-r border-[#d2d8e2] whitespace-nowrap">Timeline</th>
                  <th className="px-4 py-3">Official Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e7ee] text-slate-800">
                {scheduleEvents.map((evt, idx) => (
                  <tr key={evt.title} className={idx % 2 === 1 ? "bg-[#f9fafb]" : "bg-white"}>
                    <td className="px-4 py-3 font-semibold text-slate-950 border-r border-[#d2d8e2]">
                      <div>{evt.title}</div>
                      {evt.teluguTitle && <div className="text-[11px] text-orange-800 font-normal mt-0.5">{evt.teluguTitle}</div>}
                    </td>
                    <td className="px-4 py-3 font-bold text-orange-900 border-r border-[#d2d8e2] whitespace-nowrap">
                      {evt.date}
                    </td>
                    <td className="px-4 py-3 text-slate-600 leading-relaxed text-xs">
                      {evt.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Vacancy Details */}
        <section id="vacancies" className="scroll-mt-24 rounded-2xl border border-[#d2d8e2] bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-l-4 border-orange-500 pl-3 border-b border-[#e2e7ee] pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Cadre Distribution</span>
            <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-950">
              2. Telangana Police Constable Vacancy 2026 (7,112 Posts)
            </h2>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[550px] text-left text-xs sm:text-sm border border-[#d2d8e2] divide-y divide-[#d2d8e2]">
              <thead className="bg-[#eef2f6] font-bold text-slate-800">
                <tr>
                  <th className="px-3.5 py-3 border-r border-[#d2d8e2]">Post Code</th>
                  <th className="px-3.5 py-3 border-r border-[#d2d8e2]">Post Name</th>
                  <th className="px-3.5 py-3 border-r border-[#d2d8e2]">Department</th>
                  <th className="px-3.5 py-3 border-r border-[#d2d8e2]">Eligibility</th>
                  <th className="px-3.5 py-3 text-right">Vacancies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e7ee] text-slate-800">
                {vacancies.map((v, idx) => (
                  <tr key={v.postCode} className={idx % 2 === 1 ? "bg-[#f9fafb]" : "bg-white"}>
                    <td className="px-3.5 py-3 font-bold border-r border-[#d2d8e2]">
                      <span className="inline-block rounded-md bg-[#eef1f5] px-2 py-0.5 text-xs text-slate-800">
                        {v.postCode}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 font-semibold text-slate-950 border-r border-[#d2d8e2]">{v.postName}</td>
                    <td className="px-3.5 py-3 text-slate-600 border-r border-[#d2d8e2]">{v.department}</td>
                    <td className="px-3.5 py-3 text-slate-600 border-r border-[#d2d8e2]">{v.genderEligibility}</td>
                    <td className="px-3.5 py-3 font-bold text-slate-950 text-right">{v.vacancies.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-orange-50 font-bold text-slate-950 border-t-2 border-orange-400">
                <tr>
                  <td colSpan={4} className="px-3.5 py-3 text-right border-r border-orange-200 uppercase tracking-wider text-xs">
                    Total Notified Posts
                  </td>
                  <td className="px-3.5 py-3 text-right text-orange-950 text-base font-extrabold">
                    {totalVacancies.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* 3. Application Fees & Mode */}
        <section id="fees" className="scroll-mt-24 rounded-2xl border border-[#d2d8e2] bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-l-4 border-orange-500 pl-3 border-b border-[#e2e7ee] pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Payment Breakdown</span>
            <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-950">
              3. Application Fee Structure
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="rounded-xl border border-[#d2d8e2] bg-[#f8fafc] p-4">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">OC &amp; BC Candidates</span>
              <p className="font-display mt-1 text-2xl font-extrabold text-slate-950">₹800</p>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Applicable to Open Competition (OC) and Backward Classes (BC) candidates belonging to Telangana.
              </p>
            </div>
            <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-4">
              <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">SC &amp; ST Candidates</span>
              <p className="font-display mt-1 text-2xl font-extrabold text-orange-950">₹400</p>
              <p className="mt-2 text-xs text-orange-800 leading-relaxed">
                Applicable to Scheduled Castes (SC) and Scheduled Tribes (ST) candidates residing in Telangana.
              </p>
            </div>
            <div className="rounded-xl border border-[#d2d8e2] bg-[#f8fafc] p-4">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">All Other States</span>
              <p className="font-display mt-1 text-2xl font-extrabold text-slate-950">₹800</p>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Candidates of all categories belonging to States other than Telangana must pay the full fee.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Salary & Pay Scale */}
        <section id="salary" className="scroll-mt-24 rounded-2xl border border-[#d2d8e2] bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-l-4 border-orange-500 pl-3 border-b border-[#e2e7ee] pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Remuneration</span>
            <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-950">
              4. Salary &amp; Pay Scale for Telangana Police Constables
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="rounded-xl border border-[#d2d8e2] p-4 bg-[#f8fafc]">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Revised Pay Scale</span>
              <p className="font-display mt-1 text-xl font-bold text-slate-950">{jobProfile?.payScale ?? "₹24,280 – ₹72,850"}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Governed by Telangana State Revised Pay Rules. Basic pay starts at ₹24,280 with annual increments up to ₹72,850.
              </p>
            </div>
            <div className="rounded-xl border border-orange-200 p-4 bg-orange-50/70">
              <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">Monthly In-Hand Gross</span>
              <p className="font-display mt-1 text-xl font-bold text-orange-950">{jobProfile?.grossSalaryMonthly ?? "₹34,000 – ₹39,000 / month"}</p>
              <p className="mt-2 text-xs leading-relaxed text-orange-900">
                Monthly gross includes Basic Pay, Dearness Allowance (DA), House Rent Allowance (11% to 24%), Medical Allowance, and Uniform Allowances.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Eligibility & Age Limits */}
        <section id="eligibility" className="scroll-mt-24 rounded-2xl border border-[#d2d8e2] bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-l-4 border-orange-500 pl-3 border-b border-[#e2e7ee] pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Age &amp; Qualification</span>
            <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-950">
              5. Eligibility Criteria &amp; Age Limit (GO Ms No. 87)
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Age is calculated as of 1st July 2026. G.O. Ms No. 87 grants a 5-year general upper age relaxation.
            </p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[550px] text-left text-xs sm:text-sm border border-[#d2d8e2] divide-y divide-[#d2d8e2]">
              <thead className="bg-[#eef2f6] font-bold text-slate-800">
                <tr>
                  <th className="px-3.5 py-3 border-r border-[#d2d8e2]">Category</th>
                  <th className="px-3.5 py-3 border-r border-[#d2d8e2]">Eligible Age Range</th>
                  <th className="px-3.5 py-3">Statutory Basis &amp; Relaxation Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e7ee] text-slate-800">
                {ageLimits.map((a, idx) => (
                  <tr key={a.category} className={idx % 2 === 1 ? "bg-[#f9fafb]" : "bg-white"}>
                    <td className="px-3.5 py-3 font-semibold text-slate-950 border-r border-[#d2d8e2]">{a.category}</td>
                    <td className="px-3.5 py-3 font-bold text-orange-900 border-r border-[#d2d8e2]">{a.ageRange}</td>
                    <td className="px-3.5 py-3 text-slate-600">{a.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-xl border border-[#d2d8e2] bg-[#f8fafc] p-4 text-xs text-slate-700 space-y-1.5 leading-relaxed">
            <p><strong>Educational Qualification:</strong> Intermediate (10+2) or equivalent recognized by State Government as on 29th July 2026.</p>
            <p><strong>SC / ST Concession:</strong> Must have passed SSC (10th) and appeared for 1st and 2nd year Intermediate exams.</p>
          </div>
        </section>

        {/* 6. Selection Process */}
        <section id="selection" className="scroll-mt-24 rounded-2xl border border-[#d2d8e2] bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-l-4 border-orange-500 pl-3 border-b border-[#e2e7ee] pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Selection Flow</span>
            <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-950">
              6. 4-Stage Selection Procedure
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stages.map((st, idx) => (
              <div key={st} className="rounded-xl border border-[#d2d8e2] p-4 bg-[#f8fafc] flex flex-col justify-between">
                <div>
                  <span className="inline-flex rounded-md bg-orange-100 border border-orange-200 px-2 py-0.5 text-[10px] font-bold text-orange-950">
                    Stage {idx + 1}
                  </span>
                  <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">{st}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. PMT & PET Physical Standards */}
        <section id="physical" className="scroll-mt-24 rounded-2xl border border-[#d2d8e2] bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-l-4 border-orange-500 pl-3 border-b border-[#e2e7ee] pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Annexure-I Physical Standards</span>
            <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-950">
              7. Physical Measurement Test (PMT) &amp; Physical Efficiency Test (PET)
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-[#d2d8e2] overflow-hidden">
              <div className="bg-[#eef2f6] px-4 py-2.5 font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-[#d2d8e2]">
                Physical Measurements (PMT)
              </div>
              <div className="p-4 space-y-3 text-xs sm:text-sm text-slate-700 bg-white">
                <div className="border-b border-[#eef2f6] pb-2.5">
                  <strong className="block text-slate-900 font-bold">Men (General, BC, SC):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">Height: Minimum 167.6 cms</p>
                  <p className="text-xs text-slate-600">Chest: Minimum 86.3 cms (5 cms expansion)</p>
                </div>
                <div className="border-b border-[#eef2f6] pb-2.5">
                  <strong className="block text-slate-900 font-bold">Men (ST &amp; Agency Aboriginals):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">Height: Minimum 160.0 cms</p>
                  <p className="text-xs text-slate-600">Chest: Minimum 80.0 cms (3 cms expansion)</p>
                </div>
                <div className="border-b border-[#eef2f6] pb-2.5">
                  <strong className="block text-slate-900 font-bold">Women (General, BC, SC):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">Height: Minimum 152.5 cms</p>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold">Women (ST &amp; Agency Aboriginals):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">Height: Minimum 150.0 cms</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#d2d8e2] overflow-hidden">
              <div className="bg-[#eef2f6] px-4 py-2.5 font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-[#d2d8e2]">
                Physical Efficiency Events (PET)
              </div>
              <div className="p-4 space-y-3 text-xs sm:text-sm text-slate-700 bg-white">
                <div className="border-b border-[#eef2f6] pb-2.5">
                  <strong className="block text-slate-900 font-bold">1600 Meters Run (Men):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">Time: 7 Minutes 15 Seconds (Mandatory qualifying)</p>
                </div>
                <div className="border-b border-[#eef2f6] pb-2.5">
                  <strong className="block text-slate-900 font-bold">800 Meters Run (Women):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">Time: 5 Minutes 20 Seconds (Mandatory qualifying)</p>
                </div>
                <div className="border-b border-[#eef2f6] pb-2.5">
                  <strong className="block text-slate-900 font-bold">Long Jump:</strong>
                  <p className="text-xs text-slate-600 mt-0.5">Men: Minimum 4.00 Meters | Women: 2.50 Meters</p>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold">Shot Put:</strong>
                  <p className="text-xs text-slate-600 mt-0.5">Men (7.26 Kg): Minimum 6.00 Meters | Women (4 Kg): 4.00 Meters</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Written Examination Pattern (PWT & FWE) */}
        <section id="pattern" className="scroll-mt-24 rounded-2xl border border-[#d2d8e2] bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-l-4 border-orange-500 pl-3 border-b border-[#e2e7ee] pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Examination Scheme</span>
            <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-950">
              8. Written Examination Pattern &amp; Qualifying Marks
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-xl border border-[#d2d8e2] p-3 bg-[#f8fafc]">
              <span className="text-[10px] font-bold uppercase text-slate-600 block">Questions</span>
              <strong className="mt-1 text-base sm:text-lg font-bold text-slate-950 block">200 Qs</strong>
            </div>
            <div className="rounded-xl border border-[#d2d8e2] p-3 bg-[#f8fafc]">
              <span className="text-[10px] font-bold uppercase text-slate-600 block">Marks</span>
              <strong className="mt-1 text-base sm:text-lg font-bold text-slate-950 block">200 Marks</strong>
            </div>
            <div className="rounded-xl border border-[#d2d8e2] p-3 bg-[#f8fafc]">
              <span className="text-[10px] font-bold uppercase text-slate-600 block">Duration</span>
              <strong className="mt-1 text-base sm:text-lg font-bold text-slate-950 block">3 Hours</strong>
            </div>
            <div className="rounded-xl border border-rose-200 p-3 bg-rose-50/60">
              <span className="text-[10px] font-bold uppercase text-rose-800 block">Negative Marking</span>
              <strong className="mt-1 text-base sm:text-lg font-bold text-rose-950 block">20% (-0.20)</strong>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[#d2d8e2] overflow-hidden">
            <div className="bg-[#eef2f6] px-4 py-2.5 font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-[#d2d8e2]">
              Category Minimum Qualifying Marks
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-center bg-white">
              {qualifyingMarks.map((qm) => (
                <div key={qm.category} className="rounded-lg border border-[#d2d8e2] p-3 bg-[#f8fafc]">
                  <span className="text-xs font-semibold text-slate-600 block">{qm.category}</span>
                  <strong className="text-lg font-bold text-slate-950 block mt-1">{qm.pwtPercentage}</strong>
                  <span className="text-[11px] text-orange-800 font-semibold block">{qm.pwtMarks}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Annexure-II Syllabus */}
        <section id="syllabus" className="scroll-mt-24 rounded-2xl border border-[#d2d8e2] bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-l-4 border-orange-500 pl-3 border-b border-[#e2e7ee] pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Annexure-II Curriculum</span>
            <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-950">
              9. Complete Subject-wise Syllabus (PWT &amp; FWE)
            </h2>
          </div>

          <div className="mt-5 space-y-3.5">
            {subjects.map((sub, idx) => (
              <div key={sub.name} className="rounded-xl border border-[#d2d8e2] p-4 bg-[#f8fafc]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-orange-100 border border-orange-200 text-xs font-bold text-orange-950">
                      {idx + 1}
                    </span>
                    <h3 className="font-display text-sm sm:text-base font-bold text-slate-950">{sub.name}</h3>
                  </div>
                  <span className="text-xs font-semibold text-orange-800">{sub.teluguName}</span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                  {sub.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 10. How to Apply Online at tgprb.in */}
        <section id="how-to-apply" className="scroll-mt-24 rounded-2xl border border-[#d2d8e2] bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-l-4 border-orange-500 pl-3 border-b border-[#e2e7ee] pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Application Instructions</span>
            <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-950">
              10. How to Apply Online for Telangana Police Constable 2026
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Follow these official steps to register on the TSLPRB portal (www.tgprb.in).
            </p>
          </div>

          <div className="mt-5 space-y-3 text-xs sm:text-sm text-slate-700">
            <div className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-600 text-white font-bold text-xs">
                1
              </span>
              <div>
                <strong className="text-slate-900 block font-semibold">Visit the Official TSLPRB Website:</strong>
                <p className="text-slate-600 mt-0.5">Go to <a href="https://www.tgprb.in" target="_blank" rel="noopener noreferrer" className="text-orange-700 font-semibold underline">www.tgprb.in</a> and click on the Police Constable recruitment link.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-600 text-white font-bold text-xs">
                2
              </span>
              <div>
                <strong className="text-slate-900 block font-semibold">Register with Active Mobile Number:</strong>
                <p className="text-slate-600 mt-0.5">Your mobile number serves as your User ID. Verify OTP and complete candidate registration.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-600 text-white font-bold text-xs">
                3
              </span>
              <div>
                <strong className="text-slate-900 block font-semibold">Pay the Application Fee:</strong>
                <p className="text-slate-600 mt-0.5">Pay ₹800 (for OC/BC) or ₹400 (for TS SC/ST) online using Net Banking, UPI, or Debit/Credit card.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-600 text-white font-bold text-xs">
                4
              </span>
              <div>
                <strong className="text-slate-900 block font-semibold">Fill Part-I Application Form:</strong>
                <p className="text-slate-600 mt-0.5">Enter personal details, educational qualifications, post preferences, and upload photo and signature.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-600 text-white font-bold text-xs">
                5
              </span>
              <div>
                <strong className="text-slate-900 block font-semibold">Download &amp; Print Confirmation:</strong>
                <p className="text-slate-600 mt-0.5">Download the PDF copy of your submitted application for future reference during document verification.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[#e2e7ee] pt-4 text-center">
            <a
              href="https://www.tgprb.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-orange-700 transition"
            >
              <span>Visit Official TSLPRB Portal (tgprb.in)</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </section>

        {/* 11. Duties & Responsibilities */}
        <section id="duties" className="scroll-mt-24 rounded-2xl border border-[#d2d8e2] bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-l-4 border-orange-500 pl-3 border-b border-[#e2e7ee] pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Service Roles</span>
            <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-950">
              11. Police Constable Responsibilities &amp; Hierarchy
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="space-y-3">
              <strong className="block text-slate-900 font-bold text-sm">Key Duties:</strong>
              {jobProfile?.duties.map((d) => (
                <div key={d.title} className="rounded-lg border border-[#d2d8e2] p-3 bg-[#f8fafc]">
                  <span className="font-bold text-slate-950 block">{d.title}</span>
                  {d.teluguTitle && <span className="text-[11px] font-semibold text-orange-800 block mt-0.5">{d.teluguTitle}</span>}
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{d.description}</p>
                </div>
              ))}
            </div>

            <div>
              <strong className="block text-slate-900 font-bold text-sm mb-3">Police Promotion Hierarchy:</strong>
              <div className="rounded-xl border border-[#d2d8e2] p-4 bg-[#f8fafc] space-y-3 text-xs sm:text-sm">
                {(jobProfile?.careerGrowth ?? []).map((step, idx) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-orange-600 text-white font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 12. Bilingual FAQs */}
        <section id="faqs" className="scroll-mt-24 rounded-2xl border border-[#d2d8e2] bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-l-4 border-orange-500 pl-3 border-b border-[#e2e7ee] pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Questions &amp; Answers</span>
            <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-bold text-slate-950">
              12. Frequently Asked Questions (English &amp; Telugu)
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            {(teluguData?.englishFaqs ?? []).map((faq, idx) => {
              const teluguFaq = teluguData?.teluguFaqs?.[idx];
              return (
                <div key={faq.question} className="rounded-xl border border-[#d2d8e2] p-4 bg-[#f8fafc]">
                  <h3 className="font-display text-sm sm:text-base font-bold text-slate-950">
                    {faq.question}
                  </h3>
                  {teluguFaq && (
                    <p className="mt-1 text-xs font-semibold text-orange-800">
                      {teluguFaq.question}
                    </p>
                  )}
                  <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {faq.answer}
                  </p>
                  {teluguFaq && (
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed font-telugu">
                      {teluguFaq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </article>

      {/* Editorial Footer */}
      <footer className="mt-16 border-t border-[#d8dee6] bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-5xl px-4">
          <p className="font-semibold text-slate-800">Varadhi Prep &bull; Examination Information &amp; Preparation Portal</p>
          <p className="mt-1">
            Data sourced from official TSLPRB Notification Rc No. 189 / Rect. / Rect.2 / 2026. For official portal, visit{" "}
            <a href="https://www.tgprb.in" target="_blank" rel="noopener noreferrer" className="text-orange-700 underline font-semibold">
              www.tgprb.in
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
