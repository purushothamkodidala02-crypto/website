import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
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
  const title = "Telangana Police Constable Notification 2026: 7,112 Vacancies, Syllabus, Exam Pattern, Age Limit & PET Standards";
  const description =
    "Telangana Police Constable Notification 2026 released for 7,112 vacancies by TSLPRB (Rc No. 189/Rect./Rect.2/2026). Check post-wise vacancies, syllabus, exam pattern, GO Ms 87 age limits, physical tests (PET/PMT) and pay scale.";
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
      title,
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
      title,
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
      dateModified: "2026-11-14T11:45:00+05:30",
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
    <main className="student-page min-h-screen bg-[#f8fafc] text-slate-900 w-full max-w-full overflow-x-hidden">
      <JsonLd data={jsonLd} />
      <PublicHeader />

      {/* Article Hero Header */}
      <section className="border-b border-slate-200/90 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link href="/" className="font-semibold text-slate-500 hover:text-slate-800 transition">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-500">Recruitment News</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-teal-800">Telangana Police Constable Notification 2026</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold text-teal-900">
              TSLPRB Official Recruitment
            </span>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
              Notification Rc No. 189 / Rect. / Rect.2 / 2026
            </span>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
              Total 7,112 Posts
            </span>
          </div>

          <h1 className="font-display mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-950 leading-tight">
            Telangana Police Constable Notification 2026
          </h1>
          <p className="mt-2 text-sm sm:text-base font-semibold text-teal-900">
            తెలంగాణ పోలీస్ కానిస్టేబుల్ 7,112 పోస్టుల అధికారిక నోటిఫికేషన్, సిలబస్, ఈవెంట్స్ &amp; ఎంపిక విధానం
          </p>

          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600">
            The Telangana State Level Police Recruitment Board (TSLPRB) has officially published the recruitment notification (Rc No. 189/Rect./Rect.2/2026) for 7,112 vacancies of Police Constables (Civil, AR, SAR CPL, TSSP/TGSPF), Fire Fighters, and Prison Warders. Candidates can find all official details regarding eligibility, age relaxation under G.O. Ms No. 87, examination pattern, physical tests, pay scale, and Annexure-II syllabus below.
          </p>

          {/* Key Facts Summary Table */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
              Notification Highlights at a Glance
            </h2>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Recruitment Board</span>
                <strong className="text-slate-900 block mt-0.5">TSLPRB, Telangana</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Post Name</span>
                <strong className="text-slate-900 block mt-0.5">Police Constable (Civil &amp; Allied)</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Total Posts</span>
                <strong className="text-slate-900 block mt-0.5">7,112 Vacancies</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Pay Scale</span>
                <strong className="text-slate-900 block mt-0.5">₹24,280 – ₹72,850</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Preliminary Exam</span>
                <strong className="text-slate-900 block mt-0.5">200 Qs · 200 Marks (3 Hrs)</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Negative Marking</span>
                <strong className="text-slate-900 block mt-0.5">20% (-0.20 Marks per wrong)</strong>
              </div>
              <div>
                <span className="text-slate-500 block">General Age Limit</span>
                <strong className="text-slate-900 block mt-0.5">18 – 27 Years (GO 87)</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Qualification</span>
                <strong className="text-slate-900 block mt-0.5">Intermediate (10+2) Pass</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Selection Mode</span>
                <strong className="text-slate-900 block mt-0.5">PWT → PMT / PET → FWE</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Article Content Body */}
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-10">

        {/* Table of Contents */}
        <section aria-label="Table of contents" className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Index</p>
          <h2 className="font-display mt-1 text-lg font-bold text-slate-950">Table of Contents</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
            <a href="#vacancies" className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100 hover:bg-teal-50 hover:text-teal-900 transition">
              1. 7,112 Cadre Vacancy Distribution →
            </a>
            <a href="#salary" className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100 hover:bg-teal-50 hover:text-teal-900 transition">
              2. Pay Scale &amp; Salary Structure →
            </a>
            <a href="#eligibility" className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100 hover:bg-teal-50 hover:text-teal-900 transition">
              3. Age Limits &amp; GO Ms 87 5-Yr Relaxation →
            </a>
            <a href="#selection" className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100 hover:bg-teal-50 hover:text-teal-900 transition">
              4. 4-Stage Selection Procedure →
            </a>
            <a href="#physical" className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100 hover:bg-teal-50 hover:text-teal-900 transition">
              5. PMT &amp; PET Physical Standards →
            </a>
            <a href="#pattern" className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100 hover:bg-teal-50 hover:text-teal-900 transition">
              6. Preliminary Written Test (PWT) Pattern →
            </a>
            <a href="#syllabus" className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100 hover:bg-teal-50 hover:text-teal-900 transition">
              7. Annexure-II Subject-wise Syllabus →
            </a>
            <a href="#duties" className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100 hover:bg-teal-50 hover:text-teal-900 transition">
              8. Police Hierarchy &amp; Duties →
            </a>
            <a href="#faqs" className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100 hover:bg-teal-50 hover:text-teal-900 transition">
              9. Frequently Asked Questions (FAQs) →
            </a>
          </div>
        </section>

        {/* 1. Vacancy Details */}
        <section id="vacancies" className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Post Breakdown</span>
            <h2 className="font-display mt-1 text-xl sm:text-2xl font-bold text-slate-950">
              1. Telangana Police Constable Vacancy 2026 (7,112 Posts)
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Official post code distribution as per TSLPRB Notification Rc No. 189/Rect./Rect.2/2026.
            </p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[550px] text-left text-xs sm:text-sm border border-slate-200 divide-y divide-slate-200">
              <thead className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  <th className="px-3.5 py-3 border-r border-slate-200">Post Code</th>
                  <th className="px-3.5 py-3 border-r border-slate-200">Name of Post</th>
                  <th className="px-3.5 py-3 border-r border-slate-200">Department</th>
                  <th className="px-3.5 py-3 border-r border-slate-200">Gender</th>
                  <th className="px-3.5 py-3 text-right">Vacancies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {vacancies.map((v) => (
                  <tr key={v.postCode} className="hover:bg-slate-50/70 transition">
                    <td className="px-3.5 py-3 font-bold border-r border-slate-200">{v.postCode}</td>
                    <td className="px-3.5 py-3 font-semibold text-slate-900 border-r border-slate-200">{v.postName}</td>
                    <td className="px-3.5 py-3 text-slate-600 border-r border-slate-200">{v.department}</td>
                    <td className="px-3.5 py-3 text-slate-600 border-r border-slate-200">{v.genderEligibility}</td>
                    <td className="px-3.5 py-3 font-bold text-slate-950 text-right">{v.vacancies.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-slate-950 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={4} className="px-3.5 py-3 text-right border-r border-slate-200 uppercase tracking-wider text-xs">
                    Total Notified Posts
                  </td>
                  <td className="px-3.5 py-3 text-right text-teal-900 text-base">
                    {totalVacancies.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* 2. Salary & Pay Scale */}
        <section id="salary" className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Remuneration</span>
            <h2 className="font-display mt-1 text-xl sm:text-2xl font-bold text-slate-950">
              2. Salary &amp; Pay Scale for Telangana Police Constables
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pay Scale</span>
              <p className="font-display mt-1 text-xl font-bold text-slate-950">{jobProfile?.payScale ?? "₹24,280 – ₹72,850"}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Governed by Telangana State Revised Pay Rules. Basic pay starts at ₹24,280 with annual increments up to ₹72,850.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross In-Hand Salary</span>
              <p className="font-display mt-1 text-xl font-bold text-teal-900">{jobProfile?.grossSalaryMonthly ?? "₹34,000 – ₹39,000 / month"}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Monthly gross includes Basic Pay, Dearness Allowance (DA), House Rent Allowance (11% to 24%), Medical Allowance, and Uniform/Kit Allowances.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Eligibility & Age Limits */}
        <section id="eligibility" className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Age &amp; Education</span>
            <h2 className="font-display mt-1 text-xl sm:text-2xl font-bold text-slate-950">
              3. Eligibility Criteria &amp; Age Limit (GO Ms No. 87)
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Age is calculated as of 1st July 2026. The Government of Telangana issued G.O. Ms No. 87 granting a 5-year upper age relaxation.
            </p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[550px] text-left text-xs sm:text-sm border border-slate-200 divide-y divide-slate-200">
              <thead className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  <th className="px-3.5 py-3 border-r border-slate-200">Category</th>
                  <th className="px-3.5 py-3 border-r border-slate-200">Age Range</th>
                  <th className="px-3.5 py-3">Legal Basis &amp; Relaxations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {ageLimits.map((a) => (
                  <tr key={a.category} className="hover:bg-slate-50/70 transition">
                    <td className="px-3.5 py-3 font-semibold text-slate-950 border-r border-slate-200">{a.category}</td>
                    <td className="px-3.5 py-3 font-bold text-teal-900 border-r border-slate-200">{a.ageRange}</td>
                    <td className="px-3.5 py-3 text-slate-600">{a.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-1.5 leading-relaxed">
            <p><strong>Educational Qualification:</strong> Must have passed Intermediate (10+2) or equivalent recognized by State Government as on 29th July 2026.</p>
            <p><strong>SC / ST Concession:</strong> Must have passed SSC (10th) and appeared for 1st and 2nd year Intermediate examinations.</p>
          </div>
        </section>

        {/* 4. Selection Process */}
        <section id="selection" className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Selection Stages</span>
            <h2 className="font-display mt-1 text-xl sm:text-2xl font-bold text-slate-950">
              4. Selection Procedure
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stages.map((st, idx) => (
              <div key={st} className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 flex flex-col justify-between">
                <div>
                  <span className="inline-flex rounded-md bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-900">
                    Stage {idx + 1}
                  </span>
                  <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">{st}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. PMT & PET Physical Standards */}
        <section id="physical" className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Annexure-I Physical Standards</span>
            <h2 className="font-display mt-1 text-xl sm:text-2xl font-bold text-slate-950">
              5. Physical Measurement Test (PMT) &amp; Physical Efficiency Test (PET)
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
                Physical Measurements (PMT)
              </div>
              <div className="p-4 space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="border-b border-slate-100 pb-2.5">
                  <strong className="block text-slate-900 font-bold">Men (General, BC, SC):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">Height: Minimum 167.6 cms</p>
                  <p className="text-xs text-slate-600">Chest: Minimum 86.3 cms (5 cms expansion)</p>
                </div>
                <div className="border-b border-slate-100 pb-2.5">
                  <strong className="block text-slate-900 font-bold">Men (ST &amp; Agency Aboriginals):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">Height: Minimum 160.0 cms</p>
                  <p className="text-xs text-slate-600">Chest: Minimum 80.0 cms (3 cms expansion)</p>
                </div>
                <div className="border-b border-slate-100 pb-2.5">
                  <strong className="block text-slate-900 font-bold">Women (General, BC, SC):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">Height: Minimum 152.5 cms</p>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold">Women (ST &amp; Agency Aboriginals):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">Height: Minimum 150.0 cms</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
                Physical Efficiency Events (PET)
              </div>
              <div className="p-4 space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="border-b border-slate-100 pb-2.5">
                  <strong className="block text-slate-900 font-bold">1600 Meters Run (Men):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">Time: 7 Minutes 15 Seconds (Mandatory qualifying)</p>
                </div>
                <div className="border-b border-slate-100 pb-2.5">
                  <strong className="block text-slate-900 font-bold">800 Meters Run (Women):</strong>
                  <p className="text-xs text-slate-600 mt-0.5">Time: 5 Minutes 20 Seconds (Mandatory qualifying)</p>
                </div>
                <div className="border-b border-slate-100 pb-2.5">
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

        {/* 6. PWT Pattern & Negative Marking */}
        <section id="pattern" className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Examination Scheme</span>
            <h2 className="font-display mt-1 text-xl sm:text-2xl font-bold text-slate-950">
              6. Preliminary Written Test (PWT) Pattern &amp; 20% Negative Marking
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Questions</span>
              <strong className="mt-1 text-base sm:text-lg font-bold text-slate-950 block">200 Qs</strong>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Marks</span>
              <strong className="mt-1 text-base sm:text-lg font-bold text-slate-950 block">200 Marks</strong>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Duration</span>
              <strong className="mt-1 text-base sm:text-lg font-bold text-slate-950 block">3 Hours</strong>
            </div>
            <div className="rounded-xl border border-rose-200 p-3 bg-rose-50/50">
              <span className="text-[10px] font-bold uppercase text-rose-800 block">Negative Marking</span>
              <strong className="mt-1 text-base sm:text-lg font-bold text-rose-950 block">20% (-0.20)</strong>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
              Category Minimum Qualifying Marks
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-center">
              {qualifyingMarks.map((qm) => (
                <div key={qm.category} className="rounded-lg border border-slate-200 p-3 bg-white">
                  <span className="text-xs font-semibold text-slate-600 block">{qm.category}</span>
                  <strong className="text-lg font-bold text-slate-950 block mt-1">{qm.pwtPercentage}</strong>
                  <span className="text-[11px] text-teal-800 font-semibold block">{qm.pwtMarks}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Annexure-II Syllabus */}
        <section id="syllabus" className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Annexure-II Curriculum</span>
            <h2 className="font-display mt-1 text-xl sm:text-2xl font-bold text-slate-950">
              7. Complete Subject-wise Syllabus (PWT &amp; FWE)
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            {subjects.map((sub, idx) => (
              <div key={sub.name} className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-teal-50 border border-teal-200 text-xs font-bold text-teal-900">
                      {idx + 1}
                    </span>
                    <h3 className="font-display text-sm sm:text-base font-bold text-slate-950">{sub.name}</h3>
                  </div>
                  <span className="text-xs font-semibold text-teal-800">{sub.teluguName}</span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                  {sub.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Duties & Responsibilities */}
        <section id="duties" className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Service Roles</span>
            <h2 className="font-display mt-1 text-xl sm:text-2xl font-bold text-slate-950">
              8. Police Constable Responsibilities &amp; Hierarchy
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="space-y-3">
              <strong className="block text-slate-900 font-bold text-sm">Key Duties:</strong>
              {jobProfile?.duties.map((d) => (
                <div key={d.title} className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                  <span className="font-bold text-slate-950 block">{d.title}</span>
                  {d.teluguTitle && <span className="text-[11px] font-semibold text-teal-800 block mt-0.5">{d.teluguTitle}</span>}
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{d.description}</p>
                </div>
              ))}
            </div>

            <div>
              <strong className="block text-slate-900 font-bold text-sm mb-3">Police Promotion Hierarchy:</strong>
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3 text-xs sm:text-sm">
                {(jobProfile?.careerGrowth ?? []).map((step, idx) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-800 text-white font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 9. Bilingual FAQs */}
        <section id="faqs" className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Questions &amp; Answers</span>
            <h2 className="font-display mt-1 text-xl sm:text-2xl font-bold text-slate-950">
              9. Frequently Asked Questions (English &amp; Telugu)
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            {(teluguData?.englishFaqs ?? []).map((faq, idx) => {
              const teluguFaq = teluguData?.teluguFaqs?.[idx];
              return (
                <div key={faq.question} className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <h3 className="font-display text-sm sm:text-base font-bold text-slate-950">
                    {faq.question}
                  </h3>
                  {teluguFaq && (
                    <p className="mt-1 text-xs font-semibold text-teal-800">
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
    </main>
  );
}
