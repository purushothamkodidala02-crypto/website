import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandLockup } from "@/components/brand/VaradhiBrand";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

const PRIMARY_SLUG = "andhra-police-constable-notification-2026";
const CANONICAL_PATH = `/news/${PRIMARY_SLUG}`;

export const metadata: Metadata = {
  title: "Andhra Pradesh Police Constable Notification 2026 (6,100+ Posts): APSLPRB PC Syllabus, Events, Salary & PDF Download",
  description:
    "APSLPRB Andhra Pradesh Police Constable Notification 2026 for 6,100+ Civil and APSP posts. Check syllabus marks-wise weightage, PMT/PET physical efficiency standards, 1600m run timings, age limit relaxations, in-hand salary (₹25,220–₹80,910), and free bilingual mock tests on Varadhi Prep.",
  keywords: [
    "Andhra Pradesh Police Constable Notification 2026",
    "AP Police Constable Notification 2026 PDF",
    "APSLPRB Constable Recruitment 2026",
    "ap police constable syllabus marks wise",
    "ap police constable syllabus weightage marks",
    "ap police constable physical test events 1600m",
    "ap police constable age limit relaxations",
    "ap police constable salary in hand pay scale",
    "APSLPRB PC preliminary written test pattern",
    "ap police constable mock test in telugu",
    "ఆంధ్రప్రదేశ్ పోలీస్ కానిస్టేబుల్ నోటిఫికేషన్ 2026",
    "ఏపీ పోలీస్ కానిస్టేబుల్ సిలబస్ మార్కుల వెయిటేజీ",
    "ఏపీ కానిస్టేబుల్ ఫిజికల్ ఈవెంట్స్ 1600 మీటర్ల రన్",
    "ఏపీ కానిస్టేబుల్ వయోపరిమితి సడలింపులు",
    "ఏపీ పోలీస్ కానిస్టేబుల్ శాలరీ పే స్కేల్ వివరాలు",
    "APSLPRB కానిస్టేబుల్ ఆన్‌లైన్ దరఖాస్తు",
  ],
  alternates: { canonical: absoluteUrl(CANONICAL_PATH) },
  openGraph: {
    type: "article",
    url: absoluteUrl(CANONICAL_PATH),
    title: "Andhra Pradesh Police Constable Notification 2026 (6,100+ Posts): APSLPRB PC Syllabus, Events, Salary & Pattern",
    description:
      "Complete guide for APSLPRB AP Police Constable recruitment with 6,100+ vacancies, preliminary & final exam patterns, PMT/PET standards, 1600m run slabs, salary breakdown, and free mock tests.",
    siteName: "Varadhi Prep",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Andhra Pradesh Police Constable Notification 2026 - 6,100+ Vacancies Official Notification & Syllabus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Andhra Pradesh Police Constable Notification 2026: APSLPRB PC 6,100+ Posts",
    description:
      "APSLPRB AP Police Constable 6,100+ posts notification, syllabus marks-wise weightage, 1600m event slabs, age limit, and mock tests.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

const TOTAL_VACANCIES = "6,100+";

const VACANCIES_BREAKDOWN = [
  { postCode: "21", postName: "Police Constable (Civil - Men & Women)", cadreType: "District Cadre (Local Reservation)", gender: "Men & Women", share: "5,000+ Posts", summary: "Law & order, crime prevention, investigational support, and citizen safety in local police stations." },
  { postCode: "23", postName: "Police Constable (APSP - Men)", cadreType: "Battalion Cadre (Statewide)", gender: "Men Only", share: "1,100+ Posts", summary: "Andhra Pradesh Special Police active tactical battalions for security, emergency bandobast, and riot management." },
];

const STAGES = [
  { step: "Stage 1", name: "Preliminary Written Test (PWT)", format: "200 Questions · 200 Marks · 3 Hours", nature: "Screening / Qualifying", focus: "Objective OMR / CBRT test covering English, Arithmetic, Reasoning, and General Studies." },
  { step: "Stage 2", name: "Physical Measurement Test (PMT)", format: "Height & Chest (Men) / Height & Weight (Women)", nature: "Qualifying Gate", focus: "Biometric and sensor-verified physical measurements as per statutory standards." },
  { step: "Stage 3", name: "Physical Efficiency Test (PET)", format: "1600m Run & Long Jump", nature: "Qualifying for Civil · 100 Marks Scored for APSP", focus: "Strict RFID timing chip verification on standardized running tracks." },
  { step: "Stage 4", name: "Final Written Examination (FWE)", format: "200 Questions · 200 Marks (Civil) / 100 Marks (APSP)", nature: "Final Merit Computation", focus: "Comprehensive syllabus testing in-depth subject mastery." },
];

const PWT_SUBJECT_WEIGHTAGE = [
  { subject: "Arithmetic & Numerical Ability", questions: 30, marks: 30, level: "SSC / Metric Standard", keyTopics: "Number System, Simple & Compound Interest, Ratio & Proportion, Averages, Time & Work, Time & Distance, Percentages, Profit & Loss." },
  { subject: "Test of Reasoning & Mental Ability", questions: 30, marks: 30, level: "Analytical Reasoning", keyTopics: "Analogy, Series Completion, Coding-Decoding, Blood Relations, Syllogism, Direction Sense, Non-Verbal Venn Diagrams." },
  { subject: "General Science", questions: 30, marks: 30, level: "Daily Life Applications", keyTopics: "Physics fundamentals, Chemical reactions in daily life, Human physiology, Nutrition, Diseases, Environmental Science." },
  { subject: "History of India & Indian National Movement", questions: 30, marks: 30, level: "National & Regional History", keyTopics: "Ancient & Medieval kingdoms, 1857 Revolt, Freedom struggle, Socio-religious reform movements, Andhra History highlights." },
  { subject: "Geography, Indian Polity & Economy", questions: 30, marks: 30, level: "Standard General Studies", keyTopics: "Physical & Economic Geography of India and AP, Indian Constitution, Fundamental Rights, Panchayati Raj, Five Year Plans, AP Bifurcation Act." },
  { subject: "Current Events of National & International Importance", questions: 30, marks: 30, level: "Last 12 Months", keyTopics: "State welfare schemes, National summits, Awards & Honors, Science & Tech developments, Sports milestones." },
  { subject: "English Language Comprehension", questions: 20, marks: 20, level: "SSC Standard", keyTopics: "Grammar, Parts of Speech, Vocabulary, Synonyms/Antonyms, Error Spotting, Sentence Correction, Comprehension Passages." },
];

const SALARY_DETAILS = [
  { item: "Sanctioned Pay Scale (RPS Grade)", amount: "₹25,220 – ₹80,910", note: "Applicable Revised Pay Scales for Police Constable cadre" },
  { item: "Initial Entry Basic Pay", amount: "₹25,220", note: "Starting entry basic pay at minimum grade index" },
  { item: "Dearness Allowance (DA @ ~30%)", amount: "₹7,566", note: "State DA percentage revised twice annually" },
  { item: "House Rent Allowance (HRA @ 16% - 24%)", amount: "₹4,035 – ₹6,052", note: "Depending on posting tier (District HQs vs Major Municipalities)" },
  { item: "Uniform & Conveyance Allowance", amount: "₹1,000", note: "Monthly sanctioned police gear and maintenance allowance" },
  { item: "Gross Monthly Salary", amount: "₹37,821 – ₹39,838", note: "Total gross earnings prior to mandatory state deductions" },
  { item: "CPS / PRAN Pension & PT Deductions", amount: "₹3,478", note: "10% employee pension contribution plus Professional Tax" },
  { item: "Estimated Net In-Hand Salary", amount: "₹34,343 – ₹36,360", note: "Net credited into bank account at initial joining" },
];

const FAQS = [
  {
    q: "What is the educational qualification required for AP Police Constable 2026?",
    a: "Candidates must have passed Intermediate (10+2) or its equivalent examination recognized by the State Board. For SC and ST candidates, candidates who have passed SSC (10th) and completed 2 years of study leading to Intermediate are eligible.",
    te: "అభ్యర్థులు ఇంటర్మీడియట్ (10+2) లేదా సమానమైన విద్యార్హత ఉత్తీర్ణులై ఉండాలి. ఎస్సీ, ఎస్టీ అభ్యర్థులకు 10వ తరగతి ఉత్తీర్ణతతో పాటు రెండేళ్ల ఇంటర్ చదివిన అనుభవం ఉంటే సరిపోతుంది.",
  },
  {
    q: "What are the physical efficiency standards (PET) for AP Police Constable?",
    a: "For Male candidates: 1600 meters run (must be completed within 8 minutes for Civil posts; graded scoring for APSP) and Long Jump (minimum 3.80 meters). For Female candidates: 800 meters run (within 4 minutes) and Long Jump (minimum 2.75 meters).",
    te: "పురుషులకు 1600 మీటర్ల రన్ 8 నిమిషాల్లో (సివిల్ పోస్టులకు క్వాలిఫైయింగ్, ఏపీఎస్పీకి మార్కులు), లాంగ్ జంప్ 3.80 మీటర్లు. మహిళలకు 800 మీటర్ల రన్ 4 నిమిషాల్లో, లాంగ్ జంప్ 2.75 మీటర్లు.",
  },
  {
    q: "What is the age limit and relaxation for AP Police Constable recruitment?",
    a: "The standard age limit is 18 to 26 years for Open Category candidates. A 5-year upper age relaxation applies to BC, SC, ST, and EWS candidates (up to 31 years). Home Guards with minimum 360 days service receive statutory relaxations.",
    te: "ఓపెన్ కేటగిరీ అభ్యర్థులకు 18 నుండి 26 సంవత్సరాలు. బీసీ, ఎస్సీ, ఎస్టీ, ఈడబ్ల్యూఎస్ అభ్యర్థులకు 5 సంవత్సరాల వయోపరిమితి సడలింపు (31 ఏళ్ల వరకు) వర్తిస్తుంది.",
  },
  {
    q: "Where can I practise AP Police Constable bilingual mock tests?",
    a: "You can practise full-length computer-based mock tests with real-time countdown timer, negative marking, and bilingual English-Telugu detailed solutions on Varadhi Prep at varadhiprep.in/mock-tests/andhra-pradesh.",
    te: "వరధి ప్రెప్ (varadhiprep.in) లో ఏపీ పోలీస్ కానిస్టేబుల్ పూర్తి స్థాయి మాక్ టెస్టులను టైమర్ మరియు తెలుగు & ఇంగ్లీష్ వివరణలతో ఉచితంగా ప్రాక్టీస్ చేయవచ్చు.",
  },
];

export default function AndhraPoliceConstableNotificationPage() {
  const canonical = absoluteUrl(CANONICAL_PATH);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: "Andhra Pradesh Police Constable Notification 2026: 6,100+ Posts, APSLPRB PC Syllabus, Events, Salary & Exam Pattern",
      description:
        "Official APSLPRB notification guide for 6,100+ Police Constable vacancies in Andhra Pradesh. Complete breakdown of Civil & APSP cadre, syllabus marks-wise weightage, 1600m PET standards, salary scale, and online mock tests.",
      url: canonical,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonical,
      },
      image: [absoluteUrl("/opengraph-image")],
      datePublished: "2026-11-15T10:00:00+05:30",
      dateModified: new Date().toISOString(),
      inLanguage: ["en-IN", "te-IN"],
      articleSection: "Government Recruitment Notifications",
      keywords:
        "Andhra Pradesh Police Constable Notification 2026, APSLPRB Police Constable, AP PC Syllabus Marks Wise, AP Police Constable Events 1600m, AP Police Constable Salary",
      author: {
        "@type": "Organization",
        name: "Varadhi Prep Editorial Desk",
        url: absoluteUrl("/"),
      },
      publisher: {
        "@type": "Organization",
        name: "Varadhi Prep",
        url: absoluteUrl("/"),
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/varadhi-v-logo.png"),
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: "Police Constable (Civil & APSP) in Andhra Pradesh Police Department",
      description:
        "Direct recruitment to 6,100+ posts of Police Constable (Civil Men & Women) and APSP (Men) by Andhra Pradesh State Level Police Recruitment Board (APSLPRB).",
      identifier: {
        "@type": "PropertyValue",
        name: "APSLPRB",
        value: "APSLPRB Constable Recruitment 2026",
      },
      datePosted: "2026-11-15",
      employmentType: "FULL_TIME",
      industry: "Law Enforcement & Public Order",
      directApply: true,
      hiringOrganization: {
        "@type": "Organization",
        name: "Andhra Pradesh State Level Police Recruitment Board (APSLPRB)",
        sameAs: "https://slprb.ap.gov.in",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressRegion: "Andhra Pradesh",
          addressCountry: "IN",
        },
      },
      applicantLocationRequirements: {
        "@type": "Country",
        name: "India",
      },
      educationRequirements: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Intermediate (10+2) or equivalent",
      },
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: {
          "@type": "QuantitativeValue",
          minValue: 25220,
          maxValue: 80910,
          unitText: "MONTH",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${faq.a}\n\n(తెలుగు: ${faq.te})`,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Recruitment News", item: canonical },
        { "@type": "ListItem", position: 3, name: "Andhra Pradesh Police Constable Notification 2026", item: canonical },
      ],
    },
  ];

  return (
    <main className="min-h-screen w-full bg-[#f4f8fa] text-slate-900 antialiased">
      <JsonLd data={jsonLd} />

      {/* Top Banner Gradient */}
      <div className="h-1.5 w-full bg-gradient-to-r from-teal-700 via-teal-600 to-amber-500" />

      {/* Header */}
      <header className="border-b border-slate-200 bg-white w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Varadhi Prep home">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium text-slate-700">
            <span className="hidden sm:inline text-slate-600 font-semibold text-xs">APSLPRB Constable Recruitment</span>
            <a
              href="https://slprb.ap.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-teal-800 bg-white hover:bg-teal-50 text-teal-800 px-3.5 py-2 font-bold transition text-xs sm:text-sm shadow-2xs"
            >
              <span>APSLPRB Portal ↗</span>
            </a>
            <Link
              href="/mock-tests/andhra-pradesh"
              className="inline-flex items-center rounded-lg bg-teal-800 hover:bg-teal-900 text-white px-3.5 sm:px-4 py-2 font-bold transition text-xs sm:text-sm shadow-sm"
            >
              Practice AP Mock Tests &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <article className="border-b border-slate-200 bg-white w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumbs" className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
            <Link href="/" className="hover:text-teal-700 transition font-medium">Home</Link>
            <span>/</span>
            <Link href="/news/telangana-police-constable-notification-2026" className="hover:text-teal-700 transition font-medium">Recruitment News</Link>
            <span>/</span>
            <span className="font-bold text-slate-950">Andhra Pradesh Police Constable Notification 2026</span>
          </nav>

          {/* Badge */}
          <div className="mt-3.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-teal-800">
              <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
              Andhra Pradesh State Level Police Recruitment Board (APSLPRB)
            </span>
          </div>

          {/* Headline & Telugu Title */}
          <div className="mt-3">
            <h1 className="font-brand text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-950 leading-tight tracking-tight">
              Andhra Pradesh Police Constable Notification 2026: 6,100+ Posts, Syllabus Marks Wise, Events &amp; Pay Scale
            </h1>
            <p lang="te" className="font-telugu text-lg sm:text-xl lg:text-2xl text-slate-800 mt-2.5 leading-relaxed font-normal">
              ఆంధ్రప్రదేశ్ పోలీస్ కానిస్టేబుల్ (సివిల్ &amp; ఏపీఎస్పీ) 6,100+ పోస్టుల అధికారిక నోటిఫికేషన్, సిలబస్ వెయిటేజీ, 1600 మీటర్ల ఈవెంట్స్ &amp; శాలరీ వివరాలు
            </p>
          </div>

          {/* Snapshot Grid */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Vacancies</p>
              <p className="mt-1 text-xl sm:text-2xl font-black text-teal-800">{TOTAL_VACANCIES}</p>
              <p className="text-xs text-slate-600 mt-0.5">Civil &amp; APSP Cadres</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pay Scale</p>
              <p className="mt-1 text-base sm:text-lg font-bold text-slate-900">₹25,220 – ₹80,910</p>
              <p className="text-xs text-slate-600 mt-0.5">Revised RPS Grade</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Qualification</p>
              <p className="mt-1 text-base sm:text-lg font-bold text-slate-900">Intermediate (10+2)</p>
              <p className="text-xs text-slate-600 mt-0.5">SSC for SC/ST with 2 yrs</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Age Limit</p>
              <p className="mt-1 text-base sm:text-lg font-bold text-slate-900">18 to 26 Years</p>
              <p className="text-xs text-slate-600 mt-0.5">+5 Yrs for BC/SC/ST/EWS</p>
            </div>
          </div>
        </div>
      </article>

      {/* Main Content Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-10 space-y-10">

        {/* Cadre Breakdown */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-teal-800">Recruitment Cadres</p>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mt-1">Post-Wise Vacancies &amp; Eligibility</h2>
            </div>
            <span className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200">
              District &amp; Statewide Cadres
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="py-3 px-4 font-bold">Post Code</th>
                  <th className="py-3 px-4 font-bold">Cadre Name</th>
                  <th className="py-3 px-4 font-bold">Gender</th>
                  <th className="py-3 px-4 font-bold">Estimated Posts</th>
                  <th className="py-3 px-4 font-bold">Role Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {VACANCIES_BREAKDOWN.map((v) => (
                  <tr key={v.postCode} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-teal-800">{v.postCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-950">{v.postName}</td>
                    <td className="py-3 px-4">{v.gender}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{v.share}</td>
                    <td className="py-3 px-4 text-slate-600 leading-relaxed">{v.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Selection Stages */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <p className="text-xs font-black uppercase tracking-wider text-teal-800">Complete Process</p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mt-1">Four-Stage Selection Procedure</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {STAGES.map((s) => (
              <div key={s.step} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 hover:border-slate-300 transition">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-900">{s.step}</span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{s.nature}</span>
                </div>
                <h3 className="text-base font-bold text-slate-950 mt-2">{s.name}</h3>
                <p className="text-xs font-mono text-teal-800 mt-1 font-semibold">{s.format}</p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{s.focus}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Syllabus Weightage Table */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-teal-800">Exam Pattern</p>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mt-1">Preliminary Written Test (PWT) Subject Weightage</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">200 Questions · 200 Marks · 3 Hours · Bilingual (English &amp; Telugu)</p>
            </div>
            <Link
              href="/mock-tests/andhra-pradesh"
              className="rounded-xl bg-teal-800 text-white px-4 py-2 text-xs font-bold hover:bg-teal-900 transition shadow-xs"
            >
              Start Free Mock Tests ↗
            </Link>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="py-3 px-4 font-bold">Subject Section</th>
                  <th className="py-3 px-4 font-bold text-center">Questions</th>
                  <th className="py-3 px-4 font-bold text-center">Marks</th>
                  <th className="py-3 px-4 font-bold">Standard</th>
                  <th className="py-3 px-4 font-bold">Key Focus Areas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {PWT_SUBJECT_WEIGHTAGE.map((p) => (
                  <tr key={p.subject} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-950">{p.subject}</td>
                    <td className="py-3 px-4 text-center font-bold text-teal-800">{p.questions}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">{p.marks}</td>
                    <td className="py-3 px-4 text-slate-600">{p.level}</td>
                    <td className="py-3 px-4 text-slate-600 leading-relaxed">{p.keyTopics}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50/80 font-bold border-t border-slate-300">
                  <td className="py-3 px-4 text-slate-950">Grand Total</td>
                  <td className="py-3 px-4 text-center text-teal-800">200 Questions</td>
                  <td className="py-3 px-4 text-center text-slate-950">200 Marks</td>
                  <td className="py-3 px-4 text-slate-600" colSpan={2}>3 Hours Duration</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Physical Events Standards */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <p className="text-xs font-black uppercase tracking-wider text-teal-800">Physical Events</p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mt-1">PMT &amp; PET Standards</h2>
          
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <h3 className="font-bold text-base text-slate-950 mb-3">Male Candidates</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-800 shrink-0">&bull;</span>
                  <span><strong>Height:</strong> Minimum 167.6 cm (160 cm for ST/Agency areas)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-800 shrink-0">&bull;</span>
                  <span><strong>Chest:</strong> Minimum 86.3 cm on full inspiration with min. 5 cm expansion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-800 shrink-0">&bull;</span>
                  <span><strong>1600m Run:</strong> Qualifying under 8 minutes for Civil; scored out of 100 marks for APSP</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-800 shrink-0">&bull;</span>
                  <span><strong>Long Jump:</strong> Minimum 3.80 meters</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <h3 className="font-bold text-base text-slate-950 mb-3">Female Candidates</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-800 shrink-0">&bull;</span>
                  <span><strong>Height:</strong> Minimum 152.5 cm (150 cm for ST/Agency areas)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-800 shrink-0">&bull;</span>
                  <span><strong>Weight:</strong> Minimum 40 kg</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-800 shrink-0">&bull;</span>
                  <span><strong>800m Run:</strong> Must complete under 4 minutes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-800 shrink-0">&bull;</span>
                  <span><strong>Long Jump:</strong> Minimum 2.75 meters</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Salary Breakdown */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <p className="text-xs font-black uppercase tracking-wider text-teal-800">Compensation</p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mt-1">Salary &amp; Monthly In-Hand Breakdown</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="py-3 px-4 font-bold">Salary Component</th>
                  <th className="py-3 px-4 font-bold">Amount</th>
                  <th className="py-3 px-4 font-bold">Administrative Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {SALARY_DETAILS.map((item) => (
                  <tr key={item.item} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-950">{item.item}</td>
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">{item.amount}</td>
                    <td className="py-3 px-4 text-slate-600">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bilingual FAQs */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <p className="text-xs font-black uppercase tracking-wider text-teal-800">Help &amp; Clarifications</p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mt-1">Frequently Asked Questions</h2>
          <div className="mt-6 space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <h3 className="font-bold text-sm sm:text-base text-slate-950">{faq.q}</h3>
                <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed">{faq.a}</p>
                <p lang="te" className="font-telugu text-xs sm:text-sm text-slate-800 mt-2 leading-relaxed border-t border-slate-200/80 pt-2 font-normal">
                  {faq.te}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action Box */}
        <section className="rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-900 to-slate-950 p-6 sm:p-8 text-white text-center">
          <h2 className="text-xl sm:text-2xl font-bold">Practise Free Andhra Pradesh Competitive Exam Mock Tests</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl mx-auto leading-relaxed">
            Boost your score with realistic exam timing, negative marking, instant answer evaluations, and comprehensive bilingual solutions on Varadhi Prep.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/mock-tests/andhra-pradesh"
              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 text-xs sm:text-sm transition shadow-sm"
            >
              Start AP Mock Tests ↗
            </Link>
            <Link
              href="/admin/exam-pages"
              className="rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white font-bold px-5 py-2.5 text-xs sm:text-sm transition"
            >
              View Admin Exam Pages
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
