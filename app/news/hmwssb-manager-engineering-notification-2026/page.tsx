import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandLockup } from "@/components/brand/VaradhiBrand";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

const PRIMARY_SLUG = "hmwssb-manager-engineering-notification-2026";
const CANONICAL_PATH = `/news/${PRIMARY_SLUG}`;

export const metadata: Metadata = {
  title: "TGPSC HMWSSB Manager (Engineering) Notification 2026 (130 Posts): Syllabus, Multi Zone-II Vacancies, Salary & PDF",
  description:
    "TGPSC Notification No. 04/OG/HM/2026 for 130 Manager (Engineering) posts in Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB). Check Civil (80%), Mechanical/Electrical (15%), CSE/IT/ECE (5%) vacancy breakdown, Multi Zone-II 95% local reservation, 450-mark exam scheme, in-hand salary (₹54,220–₹1,33,630), normalization formula, and syllabus PDF.",
  keywords: [
    "TGPSC HMWSSB Manager Engineering Notification 2026",
    "HMWSSB Manager Engineering Recruitment 2026",
    "TGPSC Notification 04/OG/HM/2026",
    "HMWSSB Manager Engineering Civil Syllabus",
    "HMWSSB Manager Engineering Mechanical Electrical Syllabus",
    "HMWSSB Manager Engineering CSE IT ECE Syllabus",
    "HMWSSB Manager Engineering salary in hand pay scale",
    "HMWSSB Manager Multi Zone 2 vacancies",
    "TGPSC Manager Engineering exam pattern 450 marks",
    "TGPSC CBRT normalization formula Annexure VII",
    "HMWSSB Engineering Manager age limit 44 years",
    "తెలంగాణ HMWSSB మేనేజర్ ఇంజనీరింగ్ నోటిఫికేషన్ 2026",
    "HMWSSB మేనేజర్ సిలబస్ పరీక్ష విధానం",
    "TGPSC వాటర్ బోర్డ్ ఇంజనీరింగ్ రిక్రూట్‌మెంట్",
    "HMWSSB మేనేజర్ శాలరీ మరియు పే స్కేల్",
    "TGPSC Manager Engineering free mock test",
  ],
  alternates: { canonical: absoluteUrl(CANONICAL_PATH) },
  openGraph: {
    type: "article",
    url: absoluteUrl(CANONICAL_PATH),
    title: "TGPSC HMWSSB Manager (Engineering) Notification 2026 (130 Posts): Syllabus, Vacancies & Exam Scheme",
    description:
      "Comprehensive recruitment guide for 130 Manager (Engineering) posts in Hyderabad Metropolitan Water Supply and Sewerage Board under TGPSC Multi Zone-II with branch-wise quotas, 450-mark scheme, salary structure, and official syllabus.",
    siteName: "Varadhi Prep",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "TGPSC HMWSSB Manager Engineering Notification 2026 - 130 Vacancies Official Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TGPSC HMWSSB Manager (Engineering) Notification 2026 (130 Posts)",
    description:
      "Official TGPSC guide for 130 HMWSSB Manager (Engineering) vacancies, branch quotas (Civil 80%, Mech/EEE 15%, CSE/ECE 5%), 450-mark pattern, and salary scale.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

// ── Official Recruitment Constants ────────────────────────

const TOTAL_VACANCIES = 130;

const SCHEDULE_EVENTS = [
  {
    title: "Official Notification Issued",
    teluguTitle: "అధికారిక నోటిఫికేషన్ విడుదల (No. 04/OG/HM/2026)",
    date: "18 September 2026",
    status: "Completed",
    detail: "TGPSC officially notified 130 vacancies for Manager (Engineering) in HMWSSB Multi Zone-II.",
  },
  {
    title: "Online Application Commencement",
    teluguTitle: "ఆన్‌లైన్ దరఖాస్తుల ప్రారంభం",
    date: "23 September 2026",
    status: "Completed",
    detail: "Online registration opened on Commission's website https://www.tgpsc.gov.in with OTR login.",
  },
  {
    title: "Last Date for Online Application",
    teluguTitle: "దరఖాస్తుల సమర్పణకు చివరి తేదీ",
    date: "17 October 2026 (5:00 PM)",
    status: "Concluded",
    detail: "Final submission of online applications and fee remittance closed at 5:00 PM.",
  },
  {
    title: "Downloading of Hall Tickets",
    teluguTitle: "హాల్ టికెట్ల డౌన్‌లోడ్",
    date: "7 Days Prior to Exam",
    status: "Upcoming",
    detail: "Hall tickets available for download up to 5:00 PM on previous day of examination on tgpsc.gov.in.",
  },
  {
    title: "Written Examination (CBRT / OMR)",
    teluguTitle: "రాత పరీక్ష నిర్వహణ (ఆబ్జెక్టివ్ టైప్)",
    date: "Tentatively December 2026",
    status: "Upcoming",
    detail: "Objective type examination in Computer Based Recruitment Test (CBRT) or OMR offline mode.",
  },
  {
    title: "Certificate Verification & Merit Ranking",
    teluguTitle: "సర్టిఫికెట్ వెరిఫికేషన్ & తుది ఎంపిక",
    date: "Post Results Declaration",
    status: "Upcoming",
    detail: "Multi Zone-II 95% local reservation allotment based on merit marks with normalization.",
  },
];

const BRANCH_QUOTAS = [
  {
    branch: "Civil Engineering",
    teluguBranch: "సివిల్ ఇంజనీరింగ్",
    share: "80% of Total Posts",
    vacancies: "104 Posts",
    qualification: "B.E. / B.Tech in Civil Engineering from a recognized University",
    scope: "Water supply networks, reservoirs, water treatment plants (WTPs), sewerage lines, sewage treatment plants (STPs), pipelines, and civil infrastructure.",
  },
  {
    branch: "Electrical & Mechanical Engineering",
    teluguBranch: "ఎలక్ట్రికల్ & మెకానికల్ ఇంజనీరింగ్",
    share: "15% of Total Posts",
    vacancies: "20 Posts",
    qualification: "B.E. / B.Tech in Electrical / Mechanical Engineering from a recognized University",
    scope: "Heavy water pumping stations, electro-mechanical machinery, sub-stations, motor drives, turbines, chlorination systems, and pipeline maintenance.",
  },
  {
    branch: "Computer Science & IT / Electronics (CSE / IT / ECE)",
    teluguBranch: "కంప్యూటర్ సైన్స్, ఐటీ & ఈసీఈ ఇంజనీరింగ్",
    share: "5% of Total Posts",
    vacancies: "6 Posts",
    qualification: "B.E. / B.Tech in CSE / IT / ECE Engineering from a recognized University",
    scope: "SCADA systems, IoT-based water distribution monitoring, PLC automation, digital billing, data networks, geographic information systems (GIS), and control rooms.",
  },
];

const COMMUNITY_VACANCIES = [
  { category: "Open Competition (OC)", unreserved: "03", local: "37", total: "40" },
  { category: "Economically Weaker Sections (EWS)", unreserved: "-", local: "13", total: "13" },
  { category: "Backward Classes - Group A (BC-A)", unreserved: "01", local: "09", total: "10" },
  { category: "Backward Classes - Group B (BC-B)", unreserved: "-", local: "12", total: "12" },
  { category: "Backward Classes - Group C (BC-C)", unreserved: "-", local: "02", total: "02" },
  { category: "Backward Classes - Group D (BC-D)", unreserved: "-", local: "08", total: "08" },
  { category: "Backward Classes - Group E (BC-E)", unreserved: "-", local: "05", total: "05" },
  { category: "Scheduled Castes - Group I (SC-GR-I)", unreserved: "-", local: "02", total: "02" },
  { category: "Scheduled Castes - Group II (SC-GR-II)", unreserved: "01", local: "11", total: "12" },
  { category: "Scheduled Castes - Group III (SC-GR-III)", unreserved: "-", local: "06", total: "06" },
  { category: "Scheduled Tribes (ST)", unreserved: "-", local: "13", total: "13" },
  { category: "Visually Handicapped (VH)", unreserved: "01", local: "01", total: "02" },
  { category: "Hearing Handicapped (HH)", unreserved: "-", local: "01", total: "01" },
  { category: "Orthopedically Handicapped (OH)", unreserved: "-", local: "01", total: "01" },
  { category: "Multiple Handicapped (MH)", unreserved: "-", local: "01", total: "01" },
  { category: "Meritorious Sportspersons (SPORTS)", unreserved: "-", local: "02", total: "02" },
];

const MULTI_ZONE_DISTRICTS = [
  { group: "Greater Hyderabad & Core Zone", districts: "Hyderabad, Medchal-Malkajgiri, Ranga Reddy, Sangareddy, Vikarabad" },
  { group: "Nalgonda & Yadadri Region", districts: "Nalgonda, Suryapet, Yadadri-Bhongir, Jangaon" },
  { group: "Mahaboobnagar & Palamuru Region", districts: "Mahaboobnagar, Narayanpet, Jogulamba-Gadwal, Wanaparthy, Nagarkurnool" },
];

const SALARY_COMPONENTS = [
  { item: "Pay Scale (Telangana RPS)", amount: "₹54,220 – ₹1,33,630", note: "Sanctioned RPS grade for Manager (Engineering) in HMWSSB" },
  { item: "Starting Basic Pay", amount: "₹54,220", note: "Minimum entry basic pay in the pay band" },
  { item: "Dearness Allowance (DA @ ~33.67%)", amount: "₹18,256", note: "State DA percentage revised periodically" },
  { item: "House Rent Allowance (HRA @ 24% for Hyderabad / HMDA)", amount: "₹13,013", note: "24% HRA for posting within Hyderabad & HMDA urban agglomeration" },
  { item: "Medical & Special Allowances", amount: "₹1,000", note: "Statutory medical aid & conveyance allowance" },
  { item: "Gross Monthly Salary", amount: "₹86,489", note: "Total gross earnings before mandatory deductions" },
];

const SALARY_DEDUCTIONS = [
  { item: "Contributory Pension Scheme (CPS / NPS - 10% Basic+DA)", amount: "₹7,248", note: "10% employee contribution towards retirement pension corpus" },
  { item: "Professional Tax (PT)", amount: "₹200", note: "State municipal professional tax slab" },
  { item: "Employees Health Scheme (EHS) / TSGLI", amount: "₹1,500", note: "Cashless healthcare coverage and state group life insurance" },
  { item: "Total Monthly Deductions", amount: "₹8,948", note: "Total deductions deducted from gross salary" },
  { item: "Net In-Hand Salary (Take-Home in Hyderabad/HMDA)", amount: "₹77,541", note: "Estimated net credited directly to employee's bank account each month" },
];

const AGE_CRITERIA = [
  { category: "Open Competition (OC) / General", ageRange: "18 to 44 Years", detail: "Upper age limit raised by 10 years (from 34 to 44 years) vide G.O.Ms.No.86, G.A.(Ser.A) Dept, Dt. 18/05/2026. Born between 02/07/1982 and 01/07/2008." },
  { category: "SC, ST, BC & EWS Candidates", ageRange: "18 to 49 Years", detail: "5 years upper age relaxation under Telangana state and subordinate service rules." },
  { category: "Physically Handicapped (PwD) Persons", ageRange: "18 to 54 Years", detail: "10 years upper age relaxation subject to SADAREM disability certificate." },
  { category: "Telangana State Govt Employees", ageRange: "Up to 5 Years Relaxation", detail: "Based on regular service length (excluding Corporation / Municipality employees)." },
  { category: "Ex-Servicemen & NCC Instructors", ageRange: "3 Years + Service Period", detail: "3 years plus total length of service rendered in armed forces / NCC." },
];

const BILINGUAL_FAQS = [
  {
    question: "What is the total number of vacancies and pay scale for TGPSC HMWSSB Manager (Engineering) 2026?",
    answer: "TGPSC Notification No. 04/OG/HM/2026 advertises 130 vacancies for the post of Manager (Engineering) in Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB). The scale of pay is ₹54,220 – ₹1,33,630/-, yielding an initial gross monthly salary of ~₹86,489 and an estimated in-hand take-home salary of ~₹77,541 per month in Hyderabad.",
    teluguQuestion: "TGPSC HMWSSB మేనేజర్ (ఇంజనీరింగ్) 2026 నోటిఫికేషన్‌లో ఖాళీల సంఖ్య మరియు పే స్కేల్ ఎంత?",
    teluguAnswer: "TGPSC నోటిఫికేషన్ నెం. 04/OG/HM/2026 ప్రకారం హైదరాబాద్ మెట్రోపాలిటన్ వాటర్ సప్లై & సీవరేజ్ బోర్డ్ (HMWSSB) లో మేనేజర్ (ఇంజనీరింగ్) కేడర్‌లో మొత్తం 130 ఖాళీలు ఉన్నాయి. పే స్కేల్ ₹54,220 నుండి ₹1,33,630/-. ప్రారంభ స్థూల వేతనం నెలకు సుమారు ₹86,489 కాగా, కటింగ్‌లు పోను చేతికి వచ్చే నికర శాలరీ సుమారు ₹77,541 వరకు ఉంటుంది.",
  },
  {
    question: "What are the branch-wise reservation percentages for engineering graduates?",
    answer: "As per the Board Service Rules: (1) 80% of total posts (104 posts) are reserved for Civil Engineering graduates, (2) 15% of posts (~20 posts) for Electrical / Mechanical Engineering graduates, and (3) 5% of posts (~6 posts) for Computer Science (CSE), Information Technology (IT), and Electronics & Communication Engineering (ECE) graduates.",
    teluguQuestion: "వివిధ ఇంజనీరింగ్ బ్రాంచీల వారీగా పోస్టుల కేటాయింపు శాతం ఎంత?",
    teluguAnswer: "బోర్డు సర్వీస్ నిబంధనల ప్రకారం: (1) సివిల్ ఇంజనీరింగ్‌కు 80% పోస్టులు (104 ఖాళీలు), (2) ఎలక్ట్రికల్ / మెకానికల్ ఇంజనీరింగ్‌కు 15% పోస్టులు (~20 ఖాళీలు), మరియు (3) కంప్యూటర్ సైన్స్ (CSE), ఐటీ, ఈసీఈ (ECE) బ్రాంచీలకు 5% పోస్టులు (~6 ఖాళీలు) కేటాయించబడ్డాయి.",
  },
  {
    question: "What is the examination pattern and total marks for HMWSSB Manager (Engineering)?",
    answer: "The written examination is of Objective Type (CBRT or OMR) for a total of 450 marks: Paper-I covers General Studies & General Abilities (150 Questions, 150 Minutes, 150 Marks - 1 mark/Q, Bilingual in English & Telugu); Paper-II covers the Concerned Engineering Subject at Degree Level (150 Questions, 150 Minutes, 300 Marks - 2 marks/Q, in English only).",
    teluguQuestion: "పరీక్ష విధానం మరియు మొత్తం మార్కులు ఎంత?",
    teluguAnswer: "రాత పరీక్ష మొత్తం 450 మార్కులకు ఆబ్జెక్టివ్ విధానంలో (CBRT / OMR) జరుగుతుంది. పేపర్-1: జనరల్ స్టడీస్ & జనరల్ ఎబిలిటీస్ (150 ప్రశ్నలు, 150 నిమిషాలు, 150 మార్కులు - ఇంగ్లీష్ & తెలుగు మాధ్యమంలో); పేపర్-2: సంబంధిత ఇంజనీరింగ్ సబ్జెక్ట్ డిగ్రీ స్థాయి (150 ప్రశ్నలు, 150 నిమిషాలు, 300 మార్కులు - ప్రతి ప్రశ్నకు 2 మార్కులు, ఇంగ్లీష్ మాధ్యమంలో మాత్రమే).",
  },
  {
    question: "Which districts are included in Multi Zone-II and what is the local reservation quota?",
    answer: "All 130 posts are confined to Multi Zone-II, which entitles 95% local reservation to candidates belonging to: Hyderabad, Medchal-Malkajgiri, Ranga Reddy, Sangareddy, Vikarabad, Nalgonda, Suryapet, Yadadri-Bhongir, Jangaon, Mahaboobnagar, Narayanpet, Jogulamba-Gadwal, Wanaparthy, and Nagarkurnool districts. Unreserved quota comprises 6 posts (5%) open to all eligible Indian citizens.",
    teluguQuestion: "మల్టీ జోన్-2 పరిధిలోకి ఏ జిల్లాలు వస్తాయి? స్థానిక రిజర్వేషన్ ఎంత?",
    teluguAnswer: "ఈ 130 పోస్టులన్నీ మల్టీ జోన్-2 పరిధిలోనివే. 95% స్థానిక రిజర్వేషన్ వర్తిస్తుంది. హైదరాబాద్, మేడ్చల్-మల్కాజ్‌గిరి, రంగారెడ్డి, సంగారెడ్డి, వికారాబాద్, నల్గొండ, సూర్యాపేట, యాదాద్రి-భువనగిరి, జనగాం, మహబూబ్‌నగర్, నారాయణపేట, జోగులాంబ-గద్వాల, వనపర్తి, నాగర్‌కర్నూల్ జిల్లాలు మల్టీ జోన్-2 కిందకు వస్తాయి. 6 పోస్టులు (5%) అన్‌రిజర్వ్‌డ్ ఓపెన్ కేటగిరీ కింద ఉంటాయి.",
  },
  {
    question: "What is the upper age limit and who is eligible for the 10-year age relaxation?",
    answer: "As per G.O.Ms.No.86, G.A.(Ser.A) Dept, Dt. 18/05/2026, the upper age limit for general category candidates has been enhanced by 10 years from 34 to 44 years (age reckoned as on 01/07/2026; candidates born between 02/07/1982 and 01/07/2008). In addition, SC/ST/BC/EWS candidates get 5 years relaxation (up to 49 years) and PwD candidates get 10 years relaxation (up to 54 years).",
    teluguQuestion: "గరిష్ట వయోపరిమితి ఎంత? 10 ఏళ్ల వయో సడలింపు ఎవరికి వర్తిస్తుంది?",
    teluguAnswer: "తెలంగాణ ప్రభుత్వ జీవో నెం. 86 ప్రకారం సాధారణ అభ్యర్థుల గరిష్ట వయోపరిమితిని 34 ఏళ్ల నుండి 44 ఏళ్లకు (10 ఏళ్లు) పెంచారు (01/07/2026 నాటికి). ఎస్సీ, ఎస్టీ, బీసీ, ఈడబ్ల్యూఎస్ అభ్యర్థులకు మరో 5 ఏళ్లు (49 ఏళ్ల వరకు), దివ్యాంగులకు 10 ఏళ్లు (54 ఏళ్ల వరకు) వయో సడలింపు ఉంటుంది.",
  },
  {
    question: "What is the fee structure and who is exempted from the examination fee?",
    answer: "Application Processing Fee is ₹1000/- for OC & BC applicants and ₹500/- for SC, ST, and PwD applicants. The Examination Fee is ₹120/-, from which all unemployed applicants are completely exempted. Employees of Central/State Govts, PSUs, and Corporations must pay the ₹120/- exam fee.",
    teluguQuestion: "దరఖాస్తు ఫీజు ఎంత? పరీక్ష ఫీజు మినహాయింపు ఎవరికి ఉంది?",
    teluguAnswer: "ఆన్‌లైన్ ప్రాసెసింగ్ ఫీజు: ఓసీ మరియు బీసీ అభ్యర్థులకు ₹1000/-, ఎస్సీ, ఎస్టీ, దివ్యాంగులకు ₹500/-. పరీక్ష ఫీజు ₹120/- కాగా, నిరుద్యోగ అభ్యర్థులందరికీ పరీక్ష ఫీజు నుండి పూర్తి మినహాయింపు ఉంది. ప్రభుత్వ/పీఎస్‌యూ ఉద్యోగులు మాత్రం ₹120 పరీక్ష ఫీజు చెల్లించాలి.",
  },
  {
    question: "How does the CBRT Normalization Formula work for multi-session exams?",
    answer: "Under Annexure-VII, if the examination is conducted in multiple shifts, TGPSC applies a standardized percentile normalization formula to eliminate shift difficulty variances. Normalized marks are calculated up to 5 decimal places and form the basis of the General Ranking List (GRL).",
    teluguQuestion: "నార్మలైజేషన్ ఫార్ములా ఎలా పనిచేస్తుంది?",
    teluguAnswer: "అనెక్సర్-7 ప్రకారం కంప్యూటర్ ఆధారిత పరీక్ష పలు సెషన్లలో జరిగితే, వివిధ షిఫ్టుల ప్రశ్నపత్రాల కఠినత్వంలో తేడాలను సమం చేయడానికి TGPSC సైంటిఫిక్ నార్మలైజేషన్ ఫార్ములాను అమలు చేస్తుంది. మార్కులను 5 దశాంశ స్థానాల వరకు లెక్కించి మెరిట్ ర్యాంకింగ్ ప్రకటిస్తారు.",
  },
];

export default function HmwssbManagerEngineeringPage() {
  const canonical = absoluteUrl(CANONICAL_PATH);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: "TGPSC HMWSSB Manager (Engineering) Notification 2026: 130 Posts, Syllabus & Pay Scale",
      description:
        "Official TGPSC recruitment guide for 130 Manager (Engineering) posts in HMWSSB Multi Zone-II. Complete breakdown of Civil (80%), Mechanical/Electrical (15%), CSE/IT/ECE (5%) vacancies, 450-mark exam scheme, in-hand salary (₹54,220–₹1,33,630), and official degree syllabus.",
      url: canonical,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonical,
      },
      image: [absoluteUrl("/opengraph-image")],
      datePublished: "2026-09-18T10:00:00+05:30",
      dateModified: new Date().toISOString(),
      inLanguage: ["en-IN", "te-IN"],
      articleSection: "Government Engineering Recruitment Notifications",
      keywords:
        "TGPSC HMWSSB Manager Engineering Notification 2026, HMWSSB Manager Engineering Civil Syllabus, HMWSSB Manager Mechanical Electrical Syllabus, TGPSC Notification 04/OG/HM/2026, HMWSSB Multi Zone 2 Vacancies, HMWSSB Manager Salary In Hand",
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
      title: "Manager (Engineering) in Hyderabad Metropolitan Water Supply and Sewerage Board",
      description:
        "Direct recruitment for 130 posts of Manager (Engineering) in Hyderabad Metropolitan Water Supply and Sewerage Board (Notification No. 04/OG/HM/2026) by Telangana Public Service Commission (TGPSC). Scale of Pay ₹54,220 - ₹1,33,630. Multi Zone-II.",
      identifier: {
        "@type": "PropertyValue",
        name: "TGPSC",
        value: "Notification No. 04/OG/HM/2026",
      },
      datePosted: "2026-09-18",
      validThrough: "2026-10-17T17:00:00+05:30",
      employmentType: "FULL_TIME",
      industry: "Public Water Supply, Sewerage & Environmental Infrastructure",
      directApply: true,
      hiringOrganization: {
        "@type": "Organization",
        name: "Telangana Public Service Commission (TGPSC)",
        sameAs: "https://www.tgpsc.gov.in",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressRegion: "Telangana",
          addressLocality: "Hyderabad",
          addressCountry: "IN",
        },
      },
      applicantLocationRequirements: {
        "@type": "Country",
        name: "India",
      },
      educationRequirements: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Degree in Engineering (Civil / Mechanical / Electrical / ECE / CSE / IT)",
      },
      experienceRequirements: "Fresher Engineering Graduates Eligible (No prior experience required)",
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: {
          "@type": "QuantitativeValue",
          minValue: 54220,
          maxValue: 133630,
          unitText: "MONTH",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: BILINGUAL_FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${faq.answer} ${faq.teluguAnswer ? `\n\n(తెలుగు: ${faq.teluguAnswer})` : ""}`,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Recruitment News", item: canonical },
        { "@type": "ListItem", position: 3, name: "TGPSC HMWSSB Manager (Engineering) 2026", item: canonical },
      ],
    },
  ];

  return (
    <main className="min-h-screen w-full bg-[#f0f7f6] text-[#132a26] antialiased">
      <JsonLd data={jsonLd} />

      {/* Preload Google Mandali Telugu Font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Mandali&display=swap"
      />

      {/* Top Emerald Header Rule */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#0055a2] via-[#059669] to-[#0d9488]" />

      {/* Broadsheet Masthead */}
      <header className="border-b border-[#cce8e2] bg-white w-full sticky top-0 z-30 shadow-xs">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Varadhi Prep home">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium text-slate-700">
            <span className="hidden sm:inline text-teal-800 font-semibold text-xs bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
              TGPSC Multi Zone-II • 130 Posts
            </span>
            <a
              href="https://www.tgpsc.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-700 bg-white hover:bg-teal-50 text-teal-800 px-3 py-2 font-bold transition text-xs sm:text-sm shadow-2xs"
              title="Official TGPSC Portal"
            >
              <span>TGPSC Portal ↗</span>
            </a>
            <Link
              href="/mock-tests"
              className="inline-flex items-center rounded-lg bg-[#059669] hover:bg-[#047857] text-white px-3.5 sm:px-4 py-2 font-bold transition text-xs sm:text-sm shadow-sm"
            >
              Practice Mock Tests &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Headline Section */}
      <article className="border-b border-[#cce8e2] bg-[#f0f7f6] w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-6 sm:py-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumbs" className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
            <Link href="/" className="hover:text-teal-800 transition font-medium">Home</Link>
            <span>/</span>
            <span className="text-slate-600">Recruitment News</span>
            <span>/</span>
            <span className="font-bold text-slate-950">HMWSSB Manager (Engineering) Notification 2026</span>
          </nav>

          {/* Official Commission Notice Badge */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded border border-teal-300">
              Telangana Public Service Commission (TGPSC) • Hyderabad
            </span>
            <span className="text-xs font-semibold text-slate-600">
              Notification No. 04/OG/HM/2026, Dt. 18/09/2026
            </span>
          </div>

          {/* Headline & Telugu Title */}
          <div className="mt-3 max-w-6xl">
            <h1 className="font-brand text-2xl sm:text-3xl lg:text-[2.65rem] font-bold text-slate-950 leading-[1.2] tracking-tight">
              TGPSC HMWSSB Manager (Engineering) Notification 2026: 130 Posts, Branch Quotas, Scale ₹54,220–₹1,33,630 &amp; Scheme
            </h1>
            <p lang="te" className="font-telugu text-lg sm:text-xl lg:text-2xl text-teal-950 mt-2.5 leading-[1.75] font-normal">
              తెలంగాణ పబ్లిక్ సర్వీస్ కమిషన్ (TGPSC) - హైదరాబాద్ మెట్రోపాలిటన్ వాటర్ సప్లై &amp; సీవరేజ్ బోర్డ్ (HMWSSB) మేనేజర్ (ఇంజనీరింగ్) 130 పోస్టుల నోటిఫికేషన్, సిలబస్ &amp; పరీక్ష విధానం
            </p>
          </div>

          {/* Byline / Metadata Strip */}
          <div className="mt-4 pt-3 border-t border-[#cce8e2] flex flex-wrap items-center justify-between gap-y-2 text-xs sm:text-sm text-slate-700">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="font-bold text-slate-950">Varadhi News Desk</span>
              <span className="text-slate-400">&bull;</span>
              <span>Updated: November 2026</span>
              <span className="text-slate-400">&bull;</span>
              <span>Degree Standard (Engineering) &bull; Multi Zone-II &bull; 450 Marks Scheme</span>
            </div>
            <div className="text-teal-800 font-semibold">
              <span>9 min read</span>
            </div>
          </div>

          {/* Exam Snapshot Cards */}
          <div className="mt-8 rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-7 w-full shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3.5 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-600 ring-4 ring-teal-100" />
                <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-teal-900">
                  Key Recruitment Highlights &amp; Snapshot
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-2xs self-start sm:self-auto">
                <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" />
                Multi Zone-II Allotment
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div className="rounded-xl border border-slate-200 bg-[#f7fbf9] p-4 sm:p-5 hover:border-teal-300 hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Total Vacancies</span>
                <strong className="text-2xl sm:text-3xl font-black text-teal-900 block mt-1">{TOTAL_VACANCIES}</strong>
                <span className="text-xs sm:text-sm text-slate-600 font-medium block mt-1">Multi Zone-II Cadre</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#f7fbf9] p-4 sm:p-5 hover:border-teal-300 hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Scale of Pay</span>
                <strong className="text-lg sm:text-2xl font-black text-teal-900 block mt-1">₹54,220 – ₹1,33,630</strong>
                <span className="text-xs sm:text-sm text-slate-600 font-medium block mt-1">Gross ~₹86,489/mo</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#f7fbf9] p-4 sm:p-5 hover:border-teal-300 hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Total Marks</span>
                <strong className="text-2xl sm:text-3xl font-black text-teal-900 block mt-1">450 Marks</strong>
                <span className="text-xs sm:text-sm text-slate-600 font-medium block mt-1">Paper-I 150 + Paper-II 300</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#f7fbf9] p-4 sm:p-5 hover:border-teal-300 hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Civil Share</span>
                <strong className="text-2xl sm:text-3xl font-black text-teal-900 block mt-1">80% (104)</strong>
                <span className="text-xs sm:text-sm text-slate-600 font-medium block mt-1">15% Mech/EEE • 5% CSE/ECE</span>
              </div>
            </div>

            {/* Quick Links Row */}
            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-700">Jump to Syllabus:</span>
                <a href="#civil-syllabus" className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 font-bold text-teal-800 hover:bg-teal-100">Civil (11 Units)</a>
                <a href="#mech-syllabus" className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 font-bold text-teal-800 hover:bg-teal-100">Mechanical</a>
                <a href="#eee-syllabus" className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 font-bold text-teal-800 hover:bg-teal-100">Electrical</a>
                <a href="#ece-syllabus" className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 font-bold text-teal-800 hover:bg-teal-100">ECE</a>
                <a href="#cse-syllabus" className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 font-bold text-teal-800 hover:bg-teal-100">CSE / IT</a>
              </div>
              <div className="text-slate-600 font-medium">
                Application Period: 23/09/2026 to 17/10/2026 • Exam: Dec 2026
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Main Grid Content */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Article Body (8 Cols) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Table of Contents */}
            <section className="rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-6 shadow-sm">
              <h2 className="font-brand text-lg font-bold text-slate-950 border-b border-slate-200 pb-2.5 mb-3.5 flex items-center gap-2">
                <span className="text-teal-700">📑</span> Table of Contents &bull; Quick Index
              </h2>
              <ol className="grid sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                <li><a href="#overview" className="hover:text-teal-700 hover:underline">1. Official Recruitment Overview</a></li>
                <li><a href="#schedule" className="hover:text-teal-700 hover:underline">2. Chronology &amp; Important Dates</a></li>
                <li><a href="#branch-quota" className="hover:text-teal-700 hover:underline">3. Branch-Wise Engineering Quotas</a></li>
                <li><a href="#vacancies" className="hover:text-teal-700 hover:underline">4. Multi-Zone II Vacancy Breakup</a></li>
                <li><a href="#local-reservation" className="hover:text-teal-700 hover:underline">5. 95% Local Reservation &amp; Districts</a></li>
                <li><a href="#eligibility" className="hover:text-teal-700 hover:underline">6. Educational Qualifications &amp; Cut-Off</a></li>
                <li><a href="#age-limit" className="hover:text-teal-700 hover:underline">7. Age Limits &amp; 10-Year Relaxation</a></li>
                <li><a href="#fees" className="hover:text-teal-700 hover:underline">8. Application &amp; Examination Fees</a></li>
                <li><a href="#exam-scheme" className="hover:text-teal-700 hover:underline">9. Scheme of Examination (450 Marks)</a></li>
                <li><a href="#paper1-syllabus" className="hover:text-teal-700 hover:underline">10. Paper-I: General Studies Syllabus</a></li>
                <li><a href="#paper2-syllabus" className="hover:text-teal-700 hover:underline">11. Paper-II: Branch Syllabuses (Civil, Mech, EEE, ECE, CSE)</a></li>
                <li><a href="#normalization" className="hover:text-teal-700 hover:underline">12. CBRT Normalization Formula</a></li>
                <li><a href="#salary" className="hover:text-teal-700 hover:underline">13. In-Hand Salary Breakdown</a></li>
                <li><a href="#faqs" className="hover:text-teal-700 hover:underline">14. Bilingual Frequently Asked Questions</a></li>
              </ol>
            </section>

            {/* Section 1: Overview */}
            <section id="overview" className="rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-teal-600" />
                1. Official Recruitment Overview &amp; Key Parameters
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                The <strong>Telangana Public Service Commission (TGPSC)</strong>, Hyderabad has released Notification No. <strong>04/OG/HM/2026</strong>, dated <strong>18/09/2026</strong>, for direct recruitment to the post of <strong>Manager (Engineering)</strong> in the <strong>Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB)</strong>. This prestigious recruitment carries <strong>130 gazetted-level engineering vacancies</strong> in <strong>Multi Zone-II</strong>, covering Hyderabad and surrounding district clusters.
              </p>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-xs sm:text-sm text-left divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900 w-1/3">Recruiting Authority</th>
                      <td className="px-4 py-3 text-slate-700 font-medium">Telangana Public Service Commission (TGPSC), Hyderabad</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">User Department / Board</th>
                      <td className="px-4 py-3 text-slate-700 font-medium">Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB)</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Notification Number &amp; Date</th>
                      <td className="px-4 py-3 text-slate-700 font-medium">Notification No. 04/OG/HM/2026, Dt. 18/09/2026</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Post Title</th>
                      <td className="px-4 py-3 text-slate-700 font-medium">Manager (Engineering)</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Total Vacancies</th>
                      <td className="px-4 py-3 font-bold text-teal-800">130 Posts (Multi Zone-II: 06 Unreserved + 124 Local)</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Scale of Pay</th>
                      <td className="px-4 py-3 text-slate-700 font-bold">₹54,220 – ₹1,33,630/- (Gross ~₹86,489/month in Hyderabad)</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Age Bracket (as on 01/07/2026)</th>
                      <td className="px-4 py-3 text-slate-700 font-medium">18 to 44 Years (10-year age relaxation under G.O.Ms.No.86)</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Minimum Educational Qualification</th>
                      <td className="px-4 py-3 text-slate-700 font-medium">Bachelor&apos;s Degree in Engineering (Civil 80%, Mech/EEE 15%, CSE/IT/ECE 5%)</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Examination Format &amp; Marks</th>
                      <td className="px-4 py-3 text-slate-700 font-medium">Objective CBRT / OMR: Total 450 Marks (Paper-I 150M + Paper-II 300M)</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Official Portal</th>
                      <td className="px-4 py-3 text-teal-700 font-bold"><a href="https://www.tgpsc.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">https://www.tgpsc.gov.in</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 2: Chronology & Important Dates */}
            <section id="schedule" className="rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-teal-600" />
                2. Chronology &amp; Important Dates
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                Applicants must monitor the key milestones established under Section 1.2 of the notification. The Commission reserves the right to conduct the examination either in Computer Based Recruitment Test (CBRT) mode or OMR offline mode.
              </p>
              <div className="space-y-3">
                {SCHEDULE_EVENTS.map((event, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:border-teal-300 hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-950 text-sm sm:text-base">{event.title}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          event.status === "Completed" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                          event.status === "Concluded" ? "bg-slate-200 text-slate-800 border-slate-300" :
                          "bg-amber-100 text-amber-800 border-amber-300"
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <p lang="te" className="font-telugu text-xs sm:text-sm text-slate-600 mt-0.5">{event.teluguTitle}</p>
                      <p className="text-xs text-slate-600 mt-1">{event.detail}</p>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <span className="font-mono font-bold text-teal-800 text-xs sm:text-sm block">{event.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Branch-Wise Quotas */}
            <section id="branch-quota" className="rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-teal-600" />
                3. Engineering Discipline &amp; Branch-Wise Vacancy Quota
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                Under Section 3 of the Notification and the Service Rules of the Hyderabad Metropolitan Water Supply and Sewerage Board, the 130 Manager (Engineering) positions are apportioned across engineering disciplines based on operational requirements:
              </p>
              <div className="grid gap-4">
                {BRANCH_QUOTAS.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-teal-300 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-3">
                      <div>
                        <h3 className="font-brand text-base sm:text-lg font-bold text-slate-950">{item.branch}</h3>
                        <p lang="te" className="font-telugu text-xs sm:text-sm text-teal-900">{item.teluguBranch}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 border border-teal-200">
                          {item.share}
                        </span>
                        <span className="rounded-full bg-slate-900 text-white text-xs font-extrabold px-3 py-1">
                          {item.vacancies}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium"><strong>Qualification:</strong> {item.qualification}</p>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed"><strong>Board Functional Scope:</strong> {item.scope}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4: Multi Zone-II Vacancy Breakup */}
            <section id="vacancies" className="rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-teal-600" />
                4. Community &amp; Category-Wise Vacancy Breakup (Multi Zone-II)
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                As per <strong>Annexure-I</strong> of the official notification, all 130 provisional vacancies are categorized between <strong>Unreserved (6 Posts)</strong> and <strong>Local (124 Posts)</strong> in compliance with Rule 22 and 22(A) of Telangana State and Subordinate Service Rules, 1996:
              </p>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-xs sm:text-sm text-left divide-y divide-slate-200">
                  <thead className="bg-slate-100 text-slate-900 font-extrabold">
                    <tr>
                      <th className="px-4 py-3">Community / Category</th>
                      <th className="px-4 py-3 text-center">Unreserved (UR)</th>
                      <th className="px-4 py-3 text-center">Local (Multi Zone-II)</th>
                      <th className="px-4 py-3 text-right">Total Vacancies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {COMMUNITY_VACANCIES.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-2.5 font-medium text-slate-900">{row.category}</td>
                        <td className="px-4 py-2.5 text-center font-mono text-slate-700">{row.unreserved}</td>
                        <td className="px-4 py-2.5 text-center font-mono text-slate-700">{row.local}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-teal-900">{row.total}</td>
                      </tr>
                    ))}
                    <tr className="bg-teal-50 font-black text-teal-950">
                      <td className="px-4 py-3">GRAND TOTAL</td>
                      <td className="px-4 py-3 text-center font-mono">06</td>
                      <td className="px-4 py-3 text-center font-mono">124</td>
                      <td className="px-4 py-3 text-right font-mono text-base">130</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                * Note: Applicants belonging to SC, ST, BC, EWS &amp; Differently Abled who avail upper age relaxation will also be considered for Open Category (OC) vacancies as per official guidelines.
              </p>
            </section>

            {/* Section 5: Local Reservation & Districts */}
            <section id="local-reservation" className="rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-teal-600" />
                5. 95% Local Reservation &amp; Multi Zone-II District Composition
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                Under Section 5.1 and Para-8 of <strong>G.O.Ms.No.124 General Administration (SPF-MC) Department</strong>, dated 30/08/2018, <strong>95% local reservation</strong> applies to all posts notified under Multi Zone-II. Candidates must have studied in recognized educational institutions in these districts for at least 4 consecutive years (or 7 years under state rules) prior to their qualifying degree:
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {MULTI_ZONE_DISTRICTS.map((zone, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-bold text-teal-900 text-xs sm:text-sm mb-1.5">{zone.group}</h3>
                    <p className="text-xs text-slate-700 leading-relaxed">{zone.districts}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 6: Educational Qualifications */}
            <section id="eligibility" className="rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-teal-600" />
                6. Educational Qualifications &amp; Crucial Cut-Off Date
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
                <p>
                  Under Section 3.1 &amp; 3.2 of the notification, the applicant must possess a <strong>Bachelor&apos;s Degree in Engineering</strong> (B.E. / B.Tech) in the specified branch from an institution recognized by AICTE / UGC as on the notification cut-off date: <strong>18/09/2026</strong>.
                </p>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs sm:text-sm text-amber-900">
                  <strong>Crucial Rule (Section 3.2):</strong> The results of the requisite educational qualification must have been declared by the concerned University on or before <strong>18/09/2026</strong>. Mere conduct of exams or pending result processing does not fulfill eligibility.
                </div>
              </div>
            </section>

            {/* Section 7: Age Limit */}
            <section id="age-limit" className="rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-teal-600" />
                7. Age Limits &amp; 10-Year Relaxation (G.O.Ms.No.86)
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                The age is reckoned as on <strong>01/07/2026</strong>. Pursuant to <strong>G.O.Ms.No.86, G.A.(Ser.A) Dept, Dt. 18/05/2026</strong>, the upper age limit for direct recruitment has been raised by <strong>10 years</strong> (from 34 to 44 years):
              </p>
              <div className="space-y-2.5">
                {AGE_CRITERIA.map((crit, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-950 text-xs sm:text-sm">{crit.category}</span>
                      <p className="text-xs text-slate-600 mt-0.5">{crit.detail}</p>
                    </div>
                    <span className="font-mono font-bold text-teal-800 text-xs sm:text-sm bg-teal-50 border border-teal-200 px-3 py-1 rounded-lg shrink-0 self-start sm:self-auto">
                      {crit.ageRange}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 8: Application & Exam Fees */}
            <section id="fees" className="rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-teal-600" />
                8. Application Processing Fee &amp; Examination Fee
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-bold text-slate-950 text-sm mb-1">Online Application Processing Fee</h3>
                  <p className="text-2xl font-black text-teal-900 mt-1">₹1000 / ₹500</p>
                  <p className="text-xs text-slate-600 mt-1">
                    ₹1000/- for OC &amp; BC applicants; ₹500/- for SC, ST, and PwD applicants. Non-refundable.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-bold text-slate-950 text-sm mb-1">Examination Fee (Section 8.2)</h3>
                  <p className="text-2xl font-black text-teal-900 mt-1">₹120 / EXEMPTED</p>
                  <p className="text-xs text-slate-600 mt-1">
                    <strong>All unemployed candidates are 100% exempted</strong> from examination fee. Regular employees of State/Central Govt/PSUs must pay ₹120.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9: Scheme of Examination */}
            <section id="exam-scheme" className="rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-teal-600" />
                9. Scheme of Examination &amp; Marks Weightage (Total: 450 Marks)
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                Under Annexure-II of the notification, the examination consists of two objective papers totaling <strong>450 marks</strong>:
              </p>
              <div className="overflow-x-auto rounded-xl border border-slate-200 mb-5">
                <table className="min-w-full text-xs sm:text-sm text-left divide-y divide-slate-200">
                  <thead className="bg-slate-100 text-slate-900 font-extrabold">
                    <tr>
                      <th className="px-4 py-3">Paper</th>
                      <th className="px-4 py-3 text-center">No. of Questions</th>
                      <th className="px-4 py-3 text-center">Duration</th>
                      <th className="px-4 py-3 text-center">Max Marks</th>
                      <th className="px-4 py-3">Medium / Language</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-950">
                        Paper-I: General Studies and General Abilities
                      </td>
                      <td className="px-4 py-3 text-center font-mono">150</td>
                      <td className="px-4 py-3 text-center font-mono">150 Minutes</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-teal-800">150 Marks (1 mark/Q)</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">Bilingual (English &amp; Telugu)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-950">
                        Paper-II: Concerned Subject (Degree Level)
                      </td>
                      <td className="px-4 py-3 text-center font-mono">150</td>
                      <td className="px-4 py-3 text-center font-mono">150 Minutes</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-teal-800">300 Marks (2 marks/Q)</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">English only</td>
                    </tr>
                    <tr className="bg-teal-50 font-black text-teal-950">
                      <td className="px-4 py-3">TOTAL WRITTEN TEST</td>
                      <td className="px-4 py-3 text-center font-mono">300 Questions</td>
                      <td className="px-4 py-3 text-center font-mono">300 Minutes (5 Hours)</td>
                      <td className="px-4 py-3 text-center font-mono text-base">450 MARKS</td>
                      <td className="px-4 py-3">Objective (CBRT / OMR)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Minimum Qualifying Marks */}
              <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4">
                <h3 className="font-bold text-teal-950 text-sm mb-2">Minimum Qualifying Marks Threshold (Section 12.2):</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                  <div className="rounded-lg bg-white p-3 border border-teal-200 text-center">
                    <span className="block text-slate-600 font-medium">OC, Sports &amp; EWS</span>
                    <strong className="text-lg font-black text-teal-900">40% (180 / 450)</strong>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-teal-200 text-center">
                    <span className="block text-slate-600 font-medium">Backward Classes (BCs)</span>
                    <strong className="text-lg font-black text-teal-900">35% (157.5 / 450)</strong>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-teal-200 text-center">
                    <span className="block text-slate-600 font-medium">SC, ST &amp; PwD</span>
                    <strong className="text-lg font-black text-teal-900">30% (135 / 450)</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 10: Paper-I Syllabus */}
            <section id="paper1-syllabus" className="rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-teal-600" />
                10. Paper-I: General Studies &amp; General Abilities Detailed Syllabus (15 Units)
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                Paper-I is common to all engineering candidates and will be conducted bilingually in English and Telugu for 150 marks:
              </p>
              <div className="grid gap-2.5 text-xs sm:text-sm">
                {[
                  "1. Current affairs – Regional, National and International.",
                  "2. International Relations and Events.",
                  "3. General Science; India’s Achievements in Science and Technology.",
                  "4. Environmental issues; Disaster Management- Prevention and Mitigation Strategies.",
                  "5. Economic and Social Development of India and Telangana.",
                  "6. Physical, Social and Economic Geography of India.",
                  "7. Physical, Social and Economic Geography and Demography of Telangana.",
                  "8. Socio-economic, Political and Cultural History of Modern India with special emphasis on Indian National Movement.",
                  "9. Socio-economic, Political and Cultural History of Telangana with special emphasis on Telangana Statehood Movement and formation of Telangana state.",
                  "10. Indian Constitution; Indian Political System; Governance and Public Policy.",
                  "11. Social Exclusion; Rights issues such as Gender, Caste, Tribe, Disability etc. and inclusive policies.",
                  "12. Society, Culture, Heritage, Arts and Literature of Telangana.",
                  "13. Policies of Telangana State.",
                  "14. Logical Reasoning; Analytical Ability and Data Interpretation.",
                  "15. Basic English (10th class Standard).",
                ].map((item, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 font-medium text-slate-800">
                    {item}
                  </div>
                ))}
              </div>
            </section>

            {/* Section 11: Paper-II Syllabuses for Engineering Branches */}
            <section id="paper2-syllabus" className="rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20 space-y-6">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-1 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-teal-600" />
                11. Paper-II: Engineering Syllabuses (Degree Level • 300 Marks)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Paper-II is conducted in English only. 150 questions carrying 2 marks each (Total 300 Marks). Below is the complete syllabus reproduced from Annexure-II:
              </p>

              {/* Civil Engineering Syllabus */}
              <div id="civil-syllabus" className="rounded-xl border-2 border-teal-300 bg-teal-50/30 p-5 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-teal-200 pb-3 mb-4">
                  <div>
                    <h3 className="font-brand text-lg font-bold text-teal-950">Civil Engineering (Degree Level) &bull; 80% Vacancy Share</h3>
                    <p className="text-xs text-teal-800 font-medium">11 Comprehensive Sections prescribed under Annexure-II</p>
                  </div>
                  <span className="rounded-md bg-teal-800 text-white text-xs font-bold px-2.5 py-1">104 Posts</span>
                </div>
                <div className="space-y-3.5 text-xs sm:text-sm text-slate-800">
                  <div>
                    <strong className="text-teal-950 block font-bold mb-1">1. Building Materials and Construction:</strong>
                    <p className="text-slate-600 leading-relaxed">Bricks– Types, Indian standard classification, properties; Stones – Types, classification, properties, quarrying methods; Cement – Grades, types, properties and IS specifications; Aggregates – Coarse &amp; fine, IS specs; Cement Mortar – Proportions; Concrete – Mix proportioning using IS Code, fresh and hardened properties; Admixtures.</p>
                  </div>
                  <div>
                    <strong className="text-teal-950 block font-bold mb-1">2. Strength of Materials and Theory of Structures:</strong>
                    <p className="text-slate-600 leading-relaxed">Simple stresses and strains, elastic constants, compound bars, temperature stresses; SFD &amp; BMD; Principal stresses &amp; Mohr’s circle; Theory of bending &amp; torsion; Deflections of beams; Trusses, Betti-Maxwell theorem; Direct &amp; bending stresses, columns, strain energy, moving loads &amp; influence lines; Moment distribution, Slope deflection, Kani’s and matrix methods.</p>
                  </div>
                  <div>
                    <strong className="text-teal-950 block font-bold mb-1">3. Cement Concrete and Steel Structures:</strong>
                    <p className="text-slate-600 leading-relaxed">Limit State Method – Beams, Slabs, Columns, Footings, Retaining Walls, Water tanks, T-Beam Slab bridges; Steel Structures – Welded/riveted joints, compound beams/columns, roof trusses, plate girders, plastic analysis; Pre-Stressed Concrete – Pre-stressing systems &amp; losses.</p>
                  </div>
                  <div>
                    <strong className="text-teal-950 block font-bold mb-1">4. Fluid Mechanics and Hydraulics:</strong>
                    <p className="text-slate-600 leading-relaxed">Pressure measurement, fluid kinematics, stream function, Bernoulli’s &amp; momentum equations; Laminar &amp; turbulent pipe flow, Darcy-Weisbach equation, water hammer; Open channels, hydraulic jump, boundary layer; Hydraulic turbines &amp; centrifugal pumps.</p>
                  </div>
                  <div>
                    <strong className="text-teal-950 block font-bold mb-1">5. Hydrology and Water Resources Engineering:</strong>
                    <p className="text-slate-600 leading-relaxed">Hydrological cycle, rainfall, infiltration; Runoff &amp; floods; Groundwater &amp; Darcy’s law; Irrigation – duty, delta, crop requirements; Gravity &amp; earth dams, spillways, canal alignment &amp; cross drainage works, hydroelectric power plants.</p>
                  </div>
                  <div>
                    <strong className="text-teal-950 block font-bold mb-1">6. Environmental Engineering (HMWSSB Core Focus):</strong>
                    <p className="text-slate-600 leading-relaxed">Water supply – population forecasting, water treatment (coagulation, sedimentation, filtration, disinfection, softening), Hardy Cross pipe network analysis; Wastewater – sewer design, BOD, COD, sewage treatment (grit chamber, trickling filters, activated sludge, septic tanks); Municipal solid waste &amp; air/noise pollution.</p>
                  </div>
                  <div>
                    <strong className="text-teal-950 block font-bold mb-1">7. Transportation Engineering:</strong>
                    <p className="text-slate-600 leading-relaxed">Highway alignment, geometric design, traffic surveys, flexible and rigid pavements; Railway engineering – permanent way, rails, super elevation, curves, points &amp; crossings; Airport engineering – runway orientation &amp; length correction.</p>
                  </div>
                  <div>
                    <strong className="text-teal-950 block font-bold mb-1">8. Soil Mechanics and Foundation Engineering:</strong>
                    <p className="text-slate-600 leading-relaxed">Soil properties, permeability, compaction, consolidation, shear strength, Mohr’s circle, slope stability; Bearing capacity, pile foundations, expansive soils, caissons, dewatering; Engineering geology.</p>
                  </div>
                  <div>
                    <strong className="text-teal-950 block font-bold mb-1">9. Estimation, Costing and Construction Management:</strong>
                    <p className="text-slate-600 leading-relaxed">Centerline and long/short wall estimates, earthwork computation (Prismoidal, Trapezoidal), lead statements, rate analysis.</p>
                  </div>
                  <div>
                    <strong className="text-teal-950 block font-bold mb-1">10. Construction Management:</strong>
                    <p className="text-slate-600 leading-relaxed">Project planning and network analysis – CPM and PERT, tendering and construction contracts.</p>
                  </div>
                  <div>
                    <strong className="text-teal-950 block font-bold mb-1">11. Surveying:</strong>
                    <p className="text-slate-600 leading-relaxed">Chain, compass, levelling, theodolite, EDM, Total Station, GPS &amp; GIS fundamentals.</p>
                  </div>
                </div>
              </div>

              {/* Mechanical Engineering Syllabus */}
              <div id="mech-syllabus" className="rounded-xl border border-slate-200 bg-white p-5 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <div>
                    <h3 className="font-brand text-lg font-bold text-slate-950">Mechanical Engineering (Degree Level)</h3>
                    <p className="text-xs text-slate-500 font-medium">Section I, II &amp; III</p>
                  </div>
                  <span className="rounded-md bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 border border-slate-200">15% Quota Shared with EEE</span>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                  <p><strong>Section I: Applied Mechanics and Design:</strong> Free-body diagrams, trusses, dynamics, SOM, Mohr&apos;s circle, thin cylinders, torsion, Euler columns, Theory of Machines, vibrations, Machine Design (bolted/welded joints, shafts, gears, bearings, brakes).</p>
                  <p><strong>Section II: Fluid Mechanics &amp; Thermal Sciences:</strong> Fluid statics, Bernoulli, viscous flow, heat transfer (conduction, convection, radiation, LMTD, NTU), Thermodynamics laws, Rankine &amp; Brayton cycles, I.C. Engines, Refrigeration &amp; Air Conditioning psychrometrics, Turbomachinery (Pelton, Francis, Kaplan).</p>
                  <p><strong>Section III: Materials, Manufacturing &amp; Industrial Engineering:</strong> Materials structure, heat treatment, casting, metal forming, welding/soldering, machining &amp; CNC, metrology &amp; inspection, PPC, inventory control, Operations Research (Linear programming, PERT/CPM).</p>
                </div>
              </div>

              {/* Electrical Engineering Syllabus */}
              <div id="eee-syllabus" className="rounded-xl border border-slate-200 bg-white p-5 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <div>
                    <h3 className="font-brand text-lg font-bold text-slate-950">Electrical Engineering (Degree Level)</h3>
                    <p className="text-xs text-slate-500 font-medium">9 Comprehensive Units</p>
                  </div>
                  <span className="rounded-md bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 border border-slate-200">15% Quota Shared with Mech</span>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                  <p><strong>1. Electric Circuits &amp; Fields:</strong> KCL, KVL, Theorems (Thevenin, Norton, Superposition, Maximum Power Transfer), 3-phase circuits, Laplace/Z transforms, Gauss law, Biot-Savart law.</p>
                  <p><strong>2. Electrical Machines:</strong> Single &amp; 3-phase transformers, DC machines, induction motors, synchronous machines, servo motors.</p>
                  <p><strong>3. Power Systems &amp; Protection:</strong> Generation, transmission line sag/corona, load flow, fault analysis, differential/distance protection, power system stability &amp; equal area criterion.</p>
                  <p><strong>4. Control Systems:</strong> Transfer function, Bode plots, root loci, state space models.</p>
                  <p><strong>5. Measurements:</strong> Bridges, PMMC, moving iron, CRO, energy meters.</p>
                  <p><strong>6. Analog &amp; Digital Electronics:</strong> Diodes, BJTs, Op-amps, logic families, microprocessors 8085/8086, 8051 microcontroller.</p>
                  <p><strong>7. Power Electronics:</strong> Thyristors, MOSFETs, IGBTs, rectifiers, inverters, choppers.</p>
                  <p><strong>8. Electric Drives:</strong> Four-quadrant operation, V/f control, slip power recovery.</p>
                  <p><strong>9. Utilization:</strong> Electric traction, illumination laws, dielectric heating.</p>
                </div>
              </div>

              {/* ECE Syllabus */}
              <div id="ece-syllabus" className="rounded-xl border border-slate-200 bg-white p-5 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <div>
                    <h3 className="font-brand text-lg font-bold text-slate-950">Electronics &amp; Communication Engineering (Degree Level)</h3>
                    <p className="text-xs text-slate-500 font-medium">Sections I through IV</p>
                  </div>
                  <span className="rounded-md bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 border border-slate-200">5% Quota Shared with CSE/IT</span>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                  <p><strong>Section I: Engineering Mathematics:</strong> Linear Algebra, Calculus, Differential Equations, Complex Variables, Probability &amp; Numerical Methods.</p>
                  <p><strong>Section II: Networks &amp; Devices:</strong> Network theorems, transient analysis, semiconductor physics, analog circuits, small signal models, amplifiers &amp; oscillators.</p>
                  <p><strong>Section III: Digital &amp; Systems:</strong> Logic gates, sequential circuits, Microprocessor 8085, signals &amp; systems, LTI systems, control systems (Routh-Hurwitz, Nyquist).</p>
                  <p><strong>Section IV: Communications &amp; Electromagnetics:</strong> AM/FM, pulse code modulation (PCM), digital modulation (ASK, PSK, FSK, QAM), Maxwell&apos;s equations, waveguides, antennas.</p>
                </div>
              </div>

              {/* CSE & IT Syllabus */}
              <div id="cse-syllabus" className="rounded-xl border border-slate-200 bg-white p-5 scroll-mt-24">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <div>
                    <h3 className="font-brand text-lg font-bold text-slate-950">Computer Science &amp; Information Technology (Degree Level)</h3>
                    <p className="text-xs text-slate-500 font-medium">16 Comprehensive Units</p>
                  </div>
                  <span className="rounded-md bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 border border-slate-200">5% Quota Shared with ECE</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-lg">1. Probability &amp; Statistics</div>
                  <div className="p-3 bg-slate-50 rounded-lg">2. Set Theory &amp; Algebra</div>
                  <div className="p-3 bg-slate-50 rounded-lg">3. Discrete Structures &amp; Graph Theory</div>
                  <div className="p-3 bg-slate-50 rounded-lg">4. Digital Logic &amp; Computer Arithmetic</div>
                  <div className="p-3 bg-slate-50 rounded-lg">5. Computer Org &amp; Architecture (ALU, Cache)</div>
                  <div className="p-3 bg-slate-50 rounded-lg">6. Programming in C &amp; Data Structures</div>
                  <div className="p-3 bg-slate-50 rounded-lg">7. Algorithms &amp; Complexity Classes (P, NP)</div>
                  <div className="p-3 bg-slate-50 rounded-lg">8. Theory of Computation &amp; Turing Machines</div>
                  <div className="p-3 bg-slate-50 rounded-lg">9. Compiler Design &amp; Optimization</div>
                  <div className="p-3 bg-slate-50 rounded-lg">10. Operating Systems (Deadlocks, Virtual Memory)</div>
                  <div className="p-3 bg-slate-50 rounded-lg">11. Relational Databases &amp; SQL (B+ Trees)</div>
                  <div className="p-3 bg-slate-50 rounded-lg">12. Software Engineering &amp; UML Diagrams</div>
                  <div className="p-3 bg-slate-50 rounded-lg">13. Computer Networks &amp; Network Security</div>
                  <div className="p-3 bg-slate-50 rounded-lg">14. Web Technologies (PHP, Servlets, JSP)</div>
                  <div className="p-3 bg-slate-50 rounded-lg">15. OOPS Concepts in C++ and JAVA</div>
                  <div className="p-3 bg-slate-50 rounded-lg">16. Data Mining &amp; Classification Algorithms</div>
                </div>
              </div>
            </section>

            {/* Section 12: Normalization Formula */}
            <section id="normalization" className="rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-teal-600" />
                12. CBRT Normalization Formula (Annexure-VII)
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                When exams are held in multiple shifts/sessions, TGPSC normalizes the candidate scores using the scientific formula adopted by national testing bodies:
              </p>
              <div className="rounded-xl border border-teal-300 bg-teal-50/60 p-5 font-mono text-center text-sm sm:text-base text-teal-950 font-bold mb-4 overflow-x-auto">
                $$\hat&#123;M&#125;_&#123;ij&#125; = \frac&#123;\bar&#123;M&#125;^g_t - M^g_q&#125;&#123;\bar&#123;M&#125;_&#123;ti&#125; - M_&#123;iq&#125;&#125; (M_&#123;ij&#125; - M_&#123;iq&#125;) + M^&#123;gm&#125;_q$$
              </div>
              <ul className="text-xs sm:text-sm text-slate-700 space-y-2 list-disc list-inside">
                <li><strong>Calculation Precision:</strong> Normalized marks are computed up to <strong>5 decimal places</strong>.</li>
                <li><strong>General Ranking List (GRL):</strong> The normalized marks only shall be taken for GRL preparation.</li>
                <li><strong>Tie-Breaking Rules:</strong> Local candidates of Telangana get first preference; elder candidate gets priority; higher marks in Paper-II subject paper gets preference.</li>
              </ul>
            </section>

            {/* Section 13: Salary Structure */}
            <section id="salary" className="rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-teal-600" />
                13. Salary Structure &amp; In-Hand Monthly Take-Home Pay
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                The post of Manager (Engineering) in HMWSSB falls under the state pay scale of <strong>₹54,220 – ₹1,33,630/-</strong>. Below is the realistic monthly earnings and deductions breakdown for postings in Hyderabad (24% HRA):
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                {/* Gross Pay Table */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs uppercase text-slate-800">Gross Monthly Salary Components</div>
                  <table className="w-full text-xs divide-y divide-slate-200">
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {SALARY_COMPONENTS.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-3.5 py-2 font-medium text-slate-800">{row.item}</td>
                          <td className="px-3.5 py-2 text-right font-bold text-teal-900">{row.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Deductions Table */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs uppercase text-slate-800">Monthly Deductions &amp; Take-Home</div>
                  <table className="w-full text-xs divide-y divide-slate-200">
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {SALARY_DEDUCTIONS.map((row, idx) => (
                        <tr key={idx} className={idx === SALARY_DEDUCTIONS.length - 1 ? "bg-teal-50 font-black text-teal-950" : ""}>
                          <td className="px-3.5 py-2 font-medium text-slate-800">{row.item}</td>
                          <td className="px-3.5 py-2 text-right font-bold text-teal-900">{row.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl bg-teal-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-teal-200 font-bold uppercase tracking-wider block">Estimated In-Hand Salary</span>
                  <p className="text-2xl sm:text-3xl font-black mt-1">₹77,541 <span className="text-sm font-normal text-teal-200">/ month</span></p>
                  <p className="text-xs text-teal-300 mt-0.5">Plus annual increments, medical reimbursements, and gazetted benefits.</p>
                </div>
                <Link
                  href="/mock-tests"
                  className="rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-bold transition text-center shadow-sm"
                >
                  Start Preparing on Varadhi &rarr;
                </Link>
              </div>
            </section>

            {/* Section 14: Bilingual FAQs */}
            <section id="faqs" className="rounded-2xl border border-[#cce8e2] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-teal-600" />
                14. Frequently Asked Questions (Bilingual &bull; English &amp; తెలుగు)
              </h2>
              <div className="space-y-4">
                {BILINGUAL_FAQS.map((faq, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 p-4 sm:p-5 bg-white">
                    <h3 className="font-bold text-slate-950 text-sm sm:text-base leading-snug">{faq.question}</h3>
                    <p lang="te" className="font-telugu text-teal-900 text-xs sm:text-sm mt-1">{faq.teluguQuestion}</p>
                    <p className="text-xs sm:text-sm text-slate-700 mt-2.5 leading-relaxed">{faq.answer}</p>
                    <p lang="te" className="font-telugu text-xs sm:text-sm text-slate-800 mt-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {faq.teluguAnswer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Action Card */}
            <div className="rounded-2xl border border-teal-200 bg-white p-5 sm:p-6 shadow-sm sticky top-20">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded">
                Official Notification
              </span>
              <h3 className="font-brand text-lg font-bold text-slate-950 mt-2.5">
                TGPSC HMWSSB Manager (Engineering) 2026
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Direct recruitment for 130 Manager posts in Multi Zone-II.
              </p>

              <div className="mt-4 space-y-2 text-xs border-y border-slate-200 py-3 text-slate-700">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Vacancies:</span>
                  <span className="font-bold text-teal-900">130 Posts</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Pay Scale:</span>
                  <span className="font-bold text-slate-900">₹54,220–₹1,33,630</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Exam Mode:</span>
                  <span className="font-bold text-slate-900">CBRT / OMR (450M)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Cadre:</span>
                  <span className="font-bold text-slate-900">Multi Zone-II (95% Local)</span>
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
                <a
                  href="https://www.tgpsc.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-700 bg-white hover:bg-teal-50 text-teal-800 px-4 py-2.5 text-xs font-bold transition shadow-2xs"
                >
                  Official TGPSC Website ↗
                </a>
                <Link
                  href="/mock-tests"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 text-xs font-bold transition shadow-sm"
                >
                  Practice Mock Tests &rarr;
                </Link>
              </div>

              {/* Related Recruitment Links */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Other Telangana Recruitments
                </h4>
                <div className="space-y-2 text-xs">
                  <Link href="/news/telangana-police-constable-notification-2026" className="block p-2 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-800 hover:text-teal-900 font-medium transition">
                    Telangana Police Constable 2026 (7,112 Posts) &rarr;
                  </Link>
                  <Link href="/news/ap-endowment-officer-notification-2026" className="block p-2 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-800 hover:text-teal-900 font-medium transition">
                    AP Endowment Officer Grade-III 2026 (104 Posts) &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
