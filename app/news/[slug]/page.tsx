import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandLockup } from "@/components/brand/VaradhiBrand";
import { absoluteUrl } from "@/lib/site";

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

  const title = "Telangana Police Constable Notification 2026: 7,112 Posts, Syllabus, Events & Selection";
  const description =
    "TSLPRB Telangana Police Constable Notification 2026 (Rc No. 189/Rect./Rect.2/2026) for 7,112 vacancies. Complete cadre-wise posts, timeline dates, GO Ms 87 age limits, PMT/PET standards, Annexure-II syllabus, salary & application process.";
  const canonical = absoluteUrl(`/news/${PRIMARY_SLUG}`);

  return {
    title,
    description,
    keywords: [
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
      "తెలంగాణ పోలీస్ సిలబస్ 2026",
      "TG Police Constable mock test in Telugu",
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

// ── Official Recruitment Data (TSLPRB Rc No. 189/Rect./Rect.2/2026) ────

const VACANCIES = [
  { postCode: "21", postName: "SCT Police Constable (Civil)", department: "Police Department", genderEligibility: "Men & Women", vacancies: 4965, share: "69.8%" },
  { postCode: "22", postName: "SCT Police Constable (AR - Armed Reserve)", department: "Police Department", genderEligibility: "Men & Women", vacancies: 1250, share: "17.6%" },
  { postCode: "23", postName: "SCT Police Constable (SAR CPL)", department: "Police Department", genderEligibility: "Men Only", vacancies: 100, share: "1.4%" },
  { postCode: "24", postName: "SCT Police Constable (TSSP / TGSPF)", department: "Police Department", genderEligibility: "Men Only", vacancies: 500, share: "7.0%" },
  { postCode: "26", postName: "Fire Fighter (Driver Operator)", department: "Disaster Response & Fire Services", genderEligibility: "Men (Valid LMV)", vacancies: 225, share: "3.2%" },
  { postCode: "27", postName: "Warder (Male)", department: "Prisons & Correctional Services", genderEligibility: "Men Only", vacancies: 62, share: "0.9%" },
  { postCode: "28", postName: "Warder (Female)", department: "Prisons & Correctional Services", genderEligibility: "Women Only", vacancies: 10, share: "0.1%" },
];

const TOTAL_VACANCIES = 7112;

const SCHEDULE_EVENTS = [
  {
    title: "Official Notification Issued",
    teluguTitle: "అధికారిక నోటిఫికేషన్ విడుదల",
    date: "29 July 2026",
    status: "Completed",
    detail: "TSLPRB issued notification Rc No. 189/Rect./Rect.2/2026 sanctioning 7,112 posts across 7 cadres.",
  },
  {
    title: "Online Application Window",
    teluguTitle: "ఆన్‌లైన్ దరఖాస్తుల గడువు",
    date: "10 Aug – 10 Sep 2026",
    status: "Completed",
    detail: "Part-I candidate registration and fee payment completed via www.tgprb.in.",
  },
  {
    title: "Admit Card / Hall Ticket Download",
    teluguTitle: "హాల్ టికెట్ల డౌన్‌లోడ్ ప్రారంభం",
    date: "05 Dec 2026 Onwards",
    status: "Upcoming",
    detail: "Hall tickets will be accessible on the candidate login portal 15 days prior to the exam date.",
  },
  {
    title: "Preliminary Written Test (PWT)",
    teluguTitle: "ప్రిలిమినరీ రాత పరీక్ష (PWT)",
    date: "20 Dec 2026 (Sunday)",
    status: "Active Stage",
    detail: "Single objective OMR paper: 200 Questions, 200 Marks, 3 Hours (10:00 AM – 1:00 PM).",
  },
  {
    title: "Preliminary Key & Objections",
    teluguTitle: "ప్రాథమిక కీ & అభ్యంతరాలు",
    date: "24 Dec – 28 Dec 2026",
    status: "Upcoming",
    detail: "Official master question paper & preliminary key release with 5-day online objection window.",
  },
  {
    title: "PWT Results & Shortlisting",
    teluguTitle: "ప్రిలిమ్స్ ఫలితాలు & క్వాలిఫైడ్ లిస్ట్",
    date: "15 Jan 2027",
    status: "Upcoming",
    detail: "Release of qualifying marks list for Physical Measurement Test (PMT) & Physical Efficiency Test (PET).",
  },
  {
    title: "PMT & PET Physical Tests",
    teluguTitle: "శారీరక కొలతలు (PMT) & ఈవెంట్స్ (PET)",
    date: "February – March 2027",
    status: "Upcoming",
    detail: "RFID sensor-timed events (1600m/800m run, Long Jump, Shot Put) and digital PMT measurement.",
  },
  {
    title: "Final Written Examination (FWE)",
    teluguTitle: "చివరి రాత పరీక్ష (FWE)",
    date: "May 2027",
    status: "Upcoming",
    detail: "Final selection written test (200 marks for Civil/Fire/Warder; 100 marks for AR/TSSP).",
  },
];

const AGE_LIMITS = [
  {
    category: "General / Open Competition (OC)",
    ageRange: "18 to 27 Years",
    detail: "Base 18–22 years + 5 years general relaxation under G.O. Ms No. 87 GA (Services-A) Dept.",
  },
  {
    category: "BC (Backward Classes - A, B, C, D, E)",
    ageRange: "18 to 32 Years",
    detail: "Base 18–22 + 5 yrs (G.O. 87) + 5 yrs statutory state reservation relaxation.",
  },
  {
    category: "SC & ST Candidates",
    ageRange: "18 to 32 Years",
    detail: "Base 18–22 + 5 yrs (G.O. 87) + 5 yrs statutory state reservation relaxation.",
  },
  {
    category: "EWS (Economically Weaker Sections)",
    ageRange: "18 to 32 Years",
    detail: "Base 18–22 + 5 yrs (G.O. 87) + 5 yrs reservation relaxation under applicable state norms.",
  },
  {
    category: "Home Guards (Min. 360 days service)",
    ageRange: "18 to 45 Years",
    detail: "Base 18–40 years + 5 years relaxation under G.O. Ms No. 87.",
  },
  {
    category: "Telangana State Govt Employees",
    ageRange: "Up to 5 Years Relaxation",
    detail: "Length of regular government service (excluding Corporations/Public Sector), max 5 years.",
  },
  {
    category: "Ex-Servicemen & NCC Instructors",
    ageRange: "3 Years + Service Period",
    detail: "Length of regular military service rendered in Armed Forces plus 3 additional years.",
  },
];

const SELECTION_STAGES = [
  {
    step: "Stage 1",
    name: "Preliminary Written Test (PWT)",
    teluguName: "ప్రిలిమినరీ రాత పరీక్ష",
    description: "Screening test consisting of 200 objective questions for 200 marks (3 hours) on OMR sheet. Negative marking of 0.20 marks (20%) per incorrect answer.",
    weightage: "Screening Only",
  },
  {
    step: "Stage 2",
    name: "Physical Measurement Test (PMT)",
    teluguName: "శారీరక కొలతల పరీక్ష",
    description: "Biometric and digital measurement of height and chest (for men) and height (for women). Candidates must satisfy the mandatory minimum thresholds.",
    weightage: "Mandatory Qualifying",
  },
  {
    step: "Stage 3",
    name: "Physical Efficiency Test (PET)",
    teluguName: "శారీరక సామర్థ్య పరీక్ష (ఈవెంట్స్)",
    description: "RFID-monitored athletic events: 1600m run (men) or 800m run (women), followed by long jump and shot put. Run timings carry marks for AR & TSSP cadres.",
    weightage: "Graded for AR/TSSP (100 Marks)",
  },
  {
    step: "Stage 4",
    name: "Final Written Examination (FWE)",
    teluguName: "చివరి రాత పరీక్ష (మెయిన్స్)",
    description: "Final written examination. 200 marks for Civil, Fire, and Warder posts; 100 marks for AR, SAR CPL, and TSSP posts.",
    weightage: "100% for Civil | 50% for AR/TSSP",
  },
];

const QUALIFYING_MARKS = [
  { category: "Open Competition (OC) & EWS", pwtPercent: "30%", pwtCutoff: "60 Marks / 200", fwePercent: "40%", fweCutoff: "80 / 200 (Civil) | 40 / 100 (AR)" },
  { category: "Backward Classes (BC)", pwtPercent: "25%", pwtCutoff: "50 Marks / 200", fwePercent: "35%", fweCutoff: "70 / 200 (Civil) | 35 / 100 (AR)" },
  { category: "SC, ST, Ex-Servicemen & Home Guards", pwtPercent: "20%", pwtCutoff: "40 Marks / 200", fwePercent: "30%", fweCutoff: "60 / 200 (Civil) | 30 / 100 (AR)" },
];

const SUBJECTS = [
  {
    number: "01",
    name: "English",
    teluguName: "ఇంగ్లీష్ లాంగ్వేజ్",
    topics: "Comprehension passage, vocabulary, synonyms & antonyms, spotting errors, grammar rules, prepositions, active & passive voice, sentence correction & idioms.",
  },
  {
    number: "02",
    name: "Arithmetic",
    teluguName: "అర్థమెటిక్ & సంఖ్యా సామర్థ్యం",
    topics: "Number systems, LCM & HCF, fractions, percentages, averages, ratio & proportion, profit & loss, simple & compound interest, time & work, time & distance, mensuration.",
  },
  {
    number: "03",
    name: "General Science",
    teluguName: "జనరల్ సైన్స్",
    topics: "Everyday science observations, basic physics, chemistry in daily life, human biology, nutrition, diseases & prevention, environmental ecology & public hygiene.",
  },
  {
    number: "04",
    name: "History of India & Indian Culture",
    teluguName: "భారత దేశ చరిత్ర & సంస్కృతి",
    topics: "Ancient India, Delhi Sultanate, Mughal era, British rule, 1857 Revolt, socio-religious reform movements, Indian National Congress, Indian freedom struggle & national leaders.",
  },
  {
    number: "05",
    name: "Geography, Polity & Indian Economy",
    teluguName: "భౌగోళిక అంశాలు, పాలిటీ & భారత ఆర్థిక వ్యవస్థ",
    topics: "Physical & Indian geography, rivers, climate, Constitution of India, fundamental rights & duties, Parliament, Judiciary, state planning, Indian economy & fiscal policy.",
  },
  {
    number: "06",
    name: "Current Events (National & International)",
    teluguName: "సమకాలీన అంశాలు (కరెంట్ అఫైర్స్)",
    topics: "Major events of the past 12 months, national & international summits, bilateral pacts, sports tournaments, prestigious awards, science & tech milestones, and central welfare schemes.",
  },
  {
    number: "07",
    name: "Reasoning & Mental Ability",
    teluguName: "రీజనింగ్ & మెంటల్ ఎబిలిటీ",
    topics: "Analogy, series completion, coding-decoding, blood relations, direction sense, syllogisms, Venn diagrams, non-verbal spatial patterns, ranking & arithmetic reasoning.",
  },
  {
    number: "08",
    name: "Telangana Movement, History & Culture",
    teluguName: "తెలంగాణ ఉద్యమం, చరిత్ర & సంస్కృతి",
    topics: "History of Telangana (Satavahanas, Kakatiyas, Qutb Shahis, Asaf Jahis), Telangana armed struggle, 1969 agitation, statehood movement (1948–2014), art, literature, fairs, festivals, geography, rivers, irrigation projects, and state welfare schemes.",
  },
];

const BILINGUAL_FAQS = [
  {
    question: "What is the official notification number and vacancy count for Telangana Police Constable 2026?",
    answer: "The official notification is Rc No. 189 / Rect. / Rect.2 / 2026 issued by TSLPRB. It sanctions a total of 7,112 vacancies: SCT Constable Civil (4,965), AR (1,250), SAR CPL (100), TSSP/TGSPF (500), Fire Fighters (225), Warder Male (62), and Warder Female (10).",
    teluguQuestion: "తెలంగాణ కానిస్టేబుల్ 2026 నోటిఫికేషన్ నంబర్ మరియు మొత్తం ఖాళీల సంఖ్య ఎంత?",
    teluguAnswer: "అధికారిక నోటిఫికేషన్ నంబర్ Rc No. 189 / Rect. / Rect.2 / 2026. దీని ద్వారా మొత్తం 7,112 పోస్టులను భర్తీ చేస్తున్నారు (సివిల్ 4,965, ఏఆర్ 1,250, సార్ సిపిఎల్ 100, టిఎస్ఎస్పి 500, ఫైర్ 225, జైలు వార్డర్స్ 72).",
  },
  {
    question: "What are the age limits and relaxation under G.O. Ms No. 87?",
    answer: "The base age is 18 to 22 years (as of 1 July 2026). Under G.O. Ms No. 87, the Telangana Government sanctioned a 5-year upper age relaxation. General/OC candidates can apply up to 27 years. BC, SC, ST, and EWS candidates receive an additional 5-year statutory reservation relaxation, making them eligible up to 32 years. Home Guards can apply up to 45 years.",
    teluguQuestion: "పోలీస్ కానిస్టేబుల్ వయోపరిమితి ఎంత? జీవో నం. 87 ప్రకారం ఎంత సడలింపు లభిస్తుంది?",
    teluguAnswer: "నిర్దేశిత ప్రాథమిక వయస్సు 18 నుండి 22 సంవత్సరాలు. తెలంగాణ ప్రభుత్వం జీవో 87 ద్వారా 5 ఏళ్ల సాధారణ సడలింపు ఇచ్చింది. దీనితో జనరల్/ఓసీ అభ్యర్థులు 27 ఏళ్ల వరకు దరఖాస్తు చేసుకోవచ్చు. బీసీ, ఎస్సీ, ఎస్టీ, ఈడబ్ల్యూఎస్ అభ్యర్థులకు మరో 5 ఏళ్ల సడలింపుతో 32 ఏళ్ల వరకు అర్హత ఉంటుంది.",
  },
  {
    question: "What is the educational qualification required?",
    answer: "Candidates must have passed Intermediate (10+2) or its equivalent recognized by the Telangana State Board of Intermediate Education. For SC and ST candidates, passing SSC (10th) and appearing for 1st & 2nd year Intermediate examinations is sufficient. Fire Fighter posts mandate a valid Light Motor Vehicle (LMV) driving license.",
    teluguQuestion: "ఈ ఉద్యోగాలకు అవసరమైన విద్యా అర్హతలు ఏమిటి?",
    teluguAnswer: "అభ్యర్థులు ఇంటర్మీడియట్ (10+2) లేదా తత్సమాన బోర్డు పరీక్ష ఉత్తీర్ణులై ఉండాలి. ఎస్సీ, ఎస్టీ అభ్యర్థులు పదో తరగతి ఉత్తీర్ణులై ఇంటర్మీడియట్ రెండు సంవత్సరాల పరీక్షలకు హాజరైతే సరిపోతుంది. ఫైర్ ఫైటర్ పోస్టులకు ఎల్‌ఎమ్‌వి డ్రైవింగ్ లైసెన్స్ ఉండాలి.",
  },
  {
    question: "What is the examination pattern and negative marking for the Preliminary Written Test (PWT)?",
    answer: "The PWT comprises 1 objective paper with 200 multiple-choice questions for 200 marks (duration: 3 hours / 180 minutes). The test is conducted offline on OMR sheets. Negative marking is 0.20 marks (20%) deducted for each wrong answer marked.",
    teluguQuestion: "ప్రిలిమ్స్ (PWT) పరీక్ష విధానం మరియు నెగెటివ్ మార్కింగ్ విధానం ఏమిటి?",
    teluguAnswer: "ప్రిలిమ్స్ రాత పరీక్ష 200 ప్రశ్నలతో 200 మార్కులకు 3 గంటల (180 నిమిషాలు) వ్యవధిలో ఆఫ్‌లైన్ ఓఎంఆర్ షీట్‌పై నిర్వహించబడుతుంది. ప్రతి తప్పు సమాధానానికి 20% (0.20 మార్కు) నెగెటివ్ మార్కింగ్‌గా తీసివేయబడుతుంది.",
  },
  {
    question: "What are the physical standards (PMT) and event criteria (PET) for Men and Women?",
    answer: "Men: Minimum height 167.6 cm (160 cm for Agency ST) and chest 86.3 cm (with 5 cm expansion). PET: 1600m Run in 7 mins 15 secs, Long Jump 4.00m, Shot Put (7.26 kg) 6.00m. Women: Minimum height 152.5 cm (150 cm for Agency ST). PET: 800m Run in 5 mins 20 secs, Long Jump 2.50m, Shot Put (4 kg) 4.00m.",
    teluguQuestion: "పురుష మరియు మహిళా అభ్యర్థులకు నిర్దేశించిన శారీరక కొలతలు & ఈవెంట్స్ ఏమిటి?",
    teluguAnswer: "పురుషుల కనీస ఎత్తు 167.6 సెం.మీ (ఏజెన్సీ ఎస్టీలకు 160 సెం.మీ), ఛాతీ 86.3 సెం.మీ. ఈవెంట్స్: 1600 మీటర్ల పరుగు 7 నిమిషాల 15 సెకన్లు, లాంగ్ జంప్ 4.00 మీటర్లు, షాట్‌పుట్ 6.00 మీటర్లు. మహిళల ఎత్తు 152.5 సెం.మీ (ఏజెన్సీ ఎస్టీలకు 150 సెం.మీ). ఈవెంట్స్: 800 మీటర్ల పరుగు 5 నిమిషాల 20 సెకన్లు, లాంగ్ జంప్ 2.50 మీటర్లు, షాట్‌పుట్ 4.00 మీటర్లు.",
  },
  {
    question: "What is the pay scale and monthly in-hand salary for a Telangana Police Constable?",
    answer: "The sanctioned pay scale is ₹24,280 – ₹72,850 under the Revised Pay Scales (RPS). Factoring in Basic Pay (₹24,280), DA, HRA (11% to 24% depending on posting location), and police allowances, the initial gross monthly salary is approximately ₹34,000 to ₹39,000 per month.",
    teluguQuestion: "తెలంగాణ కానిస్టేబుల్ పే స్కేల్ మరియు నెలవారీ గ్రాస్ వేతనం ఎంత?",
    teluguAnswer: "అధికారిక పే స్కేలు ₹24,280 – ₹72,850. బేసిక్ పే, డీఏ, హెచ్‌ఆర్‌ఏ మరియు ఇతర పోలీస్ అలవెన్సులతో కలిపి ప్రారంభ స్థూల వేతనం నెలకు సుమారు ₹34,000 నుండి ₹39,000 వరకు ఉంటుంది.",
  },
  {
    question: "What are the minimum qualifying marks in the PWT and Final Written Examination?",
    answer: "For PWT: Open Competition (OC) & EWS candidates must score 30% (60/200); BC candidates must score 25% (50/200); and SC/ST/Ex-Servicemen/Home Guards must score 20% (40/200). For FWE: OC & EWS must score 40%; BC 35%; and SC/ST 30%.",
    teluguQuestion: "ప్రిలిమ్స్ మరియు మెయిన్స్ పరీక్షల్లో కనీస అర్హత మార్కులు (క్వాలిఫైయింగ్ మార్క్స్) ఎంత?",
    teluguAnswer: "ప్రిలిమ్స్ (PWT) లో: ఓసీ & ఈడబ్ల్యూఎస్ 30% (60 మార్కులు); బీసీ 25% (50 మార్కులు); ఎస్సీ/ఎస్టీ/మాజీ సైనికులు 20% (40 మార్కులు). మెయిన్స్ పరీక్షలో: ఓసీలు 40%, బీసీలు 35%, ఎస్సీ/ఎస్టీలు 30% సాధించాలి.",
  },
  {
    question: "Where can I practice free bilingual mock tests with genuine negative marking?",
    answer: "You can practice 58 full-length bilingual mock tests with timed 180-minute countdown, realistic 0.20 negative marking, and detailed solutions on Varadhi Prep at varadhiprep.in/mock-tests/telangana/police-constable-free-mock-test.",
    teluguQuestion: "నెగెటివ్ మార్కింగ్‌తో ఉచిత మాక్ టెస్ట్‌లను ఎక్కడ ప్రాక్టీస్ చేయవచ్చు?",
    teluguAnswer: "వరధి ప్రెప్‌లో 58 పూర్తి స్థాయి మాక్ టెస్టులను 180 నిమిషాల టైమర్, 0.20 నెగెటివ్ మార్కింగ్ మరియు తెలుగు & ఇంగ్లీష్ వివరణలతో ఉచితంగా రాయవచ్చు.",
  },
];

export default async function TelanganaPoliceNotificationPage({ params }: Props) {
  const { slug } = await params;
  if (slug !== PRIMARY_SLUG && !ALIAS_SLUGS.has(slug)) {
    notFound();
  }
  if (slug !== PRIMARY_SLUG) {
    permanentRedirect(`/news/${PRIMARY_SLUG}`);
  }

  const canonical = absoluteUrl(`/news/${PRIMARY_SLUG}`);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: "Telangana Police Constable Notification 2026: 7,112 Posts, Syllabus & Selection Procedure",
      description:
        "Official Telangana State Level Police Recruitment Board (TSLPRB) notification Rc No. 189/Rect./Rect.2/2026 for 7,112 posts with complete syllabus, post-wise vacancies, selection process, PMT/PET standards, and salary.",
      url: canonical,
      datePublished: "2026-07-29T10:00:00+05:30",
      dateModified: "2026-11-14T17:00:00+05:30",
      inLanguage: ["en-IN", "te-IN"],
      publisher: {
        "@type": "Organization",
        name: "Varadhi Prep",
        url: absoluteUrl("/"),
      },
      "associatedMedia": {
        "@type": "DigitalDocument",
        name: "TSLPRB Telangana Police Constable 2026 Official Gazette Notification PDF",
        encodingFormat: "application/pdf",
        url: absoluteUrl("/docs/telangana-police-constable-notification-2026-official.pdf"),
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
      mainEntity: BILINGUAL_FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
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
    <main className="min-h-screen w-full bg-white text-[#1a1a1a] antialiased">
      <JsonLd data={jsonLd} />

      {/* Direct Google Font Preload for Mandali (TV9 Telugu Font) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Mandali&display=swap"
      />

      {/* Full-Screen Broadsheet Top Rule */}
      <div className="h-1 w-full bg-[#111827]" />

      {/* Full-Screen Newspaper Header (Daily Dispatch & Moneycontrol Style) */}
      <header className="border-b border-gray-200 bg-white w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Varadhi Prep home">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-medium text-gray-600">
            <span className="hidden sm:inline text-gray-500 font-sans">Saturday, Nov 14, 2026</span>
            <a
              href="/docs/telangana-police-constable-notification-2026-official.pdf"
              download="TSLPRB_Police_Constable_Notification_2026_Official.pdf"
              className="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 px-3 py-1.5 sm:py-2 font-semibold transition text-xs"
              title="Download Official Notification PDF (748 KB)"
            >
              <svg className="w-4 h-4 text-red-700 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4 4a1 1 0 10-2 0v2a1 1 0 102 0v-2z" clipRule="evenodd" />
              </svg>
              <span>Download Official PDF</span>
            </a>
            <Link
              href="/mock-tests/telangana/police-constable-free-mock-test"
              className="inline-flex items-center rounded bg-[#0f2e59] hover:bg-[#0a1f3d] text-white px-3 sm:px-4 py-1.5 sm:py-2 font-semibold transition text-xs sm:text-sm"
            >
              Practice Mock Tests &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Full-Screen Editorial Article Header */}
      <article className="border-b border-gray-200 bg-white w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-6 sm:py-8">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumbs" className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-900 transition font-medium">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-500">Recruitment News</span>
            <span>/</span>
            <span className="font-semibold text-gray-900">Telangana Police Constable 2026</span>
          </nav>

          {/* Editorial Category Tag */}
          <div className="mt-3.5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#b91c1c]">
              Telangana State Recruitment &bull; Official Notification
            </span>
          </div>

          {/* Full-Width Headline with TV9 Mandali Telugu Font */}
          <div className="mt-2.5 max-w-6xl">
            <h1 className="font-brand text-2xl sm:text-3xl lg:text-[2.65rem] font-bold text-gray-950 leading-[1.2] tracking-tight">
              Telangana Police Constable Notification 2026: 7,112 Posts, Cadre Breakdown, Syllabus &amp; Selection Procedure
            </h1>
            <p lang="te" className="font-telugu text-lg sm:text-xl lg:text-2xl text-gray-800 mt-2.5 leading-[1.75] font-normal">
              తెలంగాణ పోలీస్ కానిస్టేబుల్ 7,112 పోస్టుల అధికారిక నోటిఫికేషన్, సిలబస్, ఈవెంట్స్ &amp; ఎంపిక విధానం
            </p>
          </div>

          {/* Author Byline & Timestamp */}
          <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-y-2 text-xs text-gray-600">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="font-bold text-gray-900">Varadhi News Desk</span>
              <span className="text-gray-300">&bull;</span>
              <span>Updated: Nov 14, 2026, 05:30 PM IST</span>
              <span className="text-gray-300">&bull;</span>
              <span>Notification Rc No. 189 / Rect. / Rect.2 / 2026</span>
            </div>
            <div className="text-gray-500 font-medium">
              <span>5 min read</span>
            </div>
          </div>

          {/* Full-Width Moneycontrol "Key Highlights & Exam Snapshot" Box */}
          <div className="mt-6 rounded-md border border-gray-200 bg-[#f9fafb] p-4 sm:p-5 w-full">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2.5">
              <span className="h-2 w-2 rounded-full bg-[#b91c1c]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                Key Highlights &amp; Exam Snapshot
              </h2>
            </div>
            <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4 text-left">
              
              <div className="rounded border border-gray-200 bg-white p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Total Vacancies</span>
                <strong className="text-xl sm:text-2xl font-bold text-gray-900 block mt-0.5">7,112</strong>
                <span className="text-xs text-gray-600 block">Civil &amp; Allied</span>
              </div>

              <div className="rounded border border-gray-200 bg-white p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">PWT Exam Date</span>
                <strong className="text-lg sm:text-xl font-bold text-gray-900 block mt-0.5">20 Dec 2026</strong>
                <span className="text-xs text-gray-600 block">10 AM – 1 PM</span>
              </div>

              <div className="rounded border border-gray-200 bg-white p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Age (General)</span>
                <strong className="text-xl sm:text-2xl font-bold text-gray-900 block mt-0.5">18 – 27 Yrs</strong>
                <span className="text-xs text-gray-600 block">G.O. Ms 87 (+5Y)</span>
              </div>

              <div className="rounded border border-gray-200 bg-white p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Scale of Pay</span>
                <strong className="text-sm sm:text-base font-bold text-gray-900 block mt-0.5 leading-snug">₹24,280–₹72,850</strong>
                <span className="text-xs text-gray-600 block">~₹34k–₹39k Gross</span>
              </div>

              <div className="rounded border border-gray-200 bg-white p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Qualification</span>
                <strong className="text-sm sm:text-base font-bold text-gray-900 block mt-0.5 leading-snug">10+2 Intermediate</strong>
                <span className="text-xs text-gray-600 block">Board of Inter.</span>
              </div>

              <div className="rounded border border-gray-200 bg-white p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Negative Mark</span>
                <strong className="text-xl sm:text-2xl font-bold text-gray-900 block mt-0.5">0.20 Marks</strong>
                <span className="text-xs text-gray-600 block">20% deduction</span>
              </div>

              <div className="rounded border border-gray-200 bg-white p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Selection</span>
                <strong className="text-xl sm:text-2xl font-bold text-gray-900 block mt-0.5">4 Stages</strong>
                <span className="text-xs text-gray-600 block">PWT &rarr; FWE</span>
              </div>

              <div className="rounded border border-gray-200 bg-white p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Exam Fee</span>
                <strong className="text-xl sm:text-2xl font-bold text-gray-900 block mt-0.5">₹800 / ₹400</strong>
                <span className="text-xs text-gray-600 block">50% SC/ST Relief</span>
              </div>

            </div>

            {/* Official Gazette PDF Banner */}
            <div className="mt-4 pt-3.5 border-t border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <span className="text-red-700 font-bold text-xs">PDF</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Original Gazette Notification Document: Rc No. 189 / Rect. / Rect.2 / 2026
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Official 36-page TSLPRB Gazette publication &bull; Includes Cadre Breakdowns, Annexure-II Syllabus, PMT/PET Standards &bull; 748 KB
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href="/docs/telangana-police-constable-notification-2026-official.pdf"
                  download="TSLPRB_Police_Constable_Notification_2026_Official.pdf"
                  className="inline-flex items-center gap-1.5 rounded bg-[#0f2e59] hover:bg-[#0a1f3d] text-white px-3.5 py-2 font-bold text-xs transition shadow-2xs"
                >
                  <span>📥 Download Official PDF (748 KB)</span>
                </a>
                <a
                  href="https://doc.tgprb.in/PC+(Civil+et+al)+2026+Notification+dated+29-07-2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 font-semibold text-xs transition"
                >
                  <span>Board Server Mirror ↗</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </article>

      {/* Full-Screen 2-Column Broad Editorial Grid: Main Story + Sidebar */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start w-full">

          {/* Main Story Editorial Content Column (Full Width Stretch) */}
          <div className="lg:col-span-8 xl:col-span-9 2xl:col-span-9 space-y-9">

            {/* Lead Story Paragraph */}
            <p className="text-base sm:text-[17px] leading-[1.8] text-gray-800 font-normal">
              The Telangana State Level Police Recruitment Board (TSLPRB) has formally announced Notification Rc No. 189/Rect./Rect.2/2026 for the direct recruitment of 7,112 Stipendiary Cadet Trainee (SCT) Police Constables across Civil, Armed Reserve (AR), SAR CPL, TSSP/TGSPF, Disaster Response &amp; Fire Services, and Prison Warders. Here is the comprehensive briefing on cadre vacancies, chronological timelines, G.O. Ms No. 87 age relief, physical test parameters, and the complete Annexure-II written exam syllabus.
            </p>

            {/* Section 1: Important Dates & Timeline */}
            <section id="schedule" className="scroll-mt-6">
              <div className="border-b-2 border-gray-900 pb-1.5 mb-4">
                <h2 className="font-brand text-xl sm:text-2xl font-bold text-gray-950">
                  1. Important Dates &amp; Recruitment Roadmap
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Official chronological schedule published by the recruitment board.
              </p>

              <div className="border border-gray-200 rounded divide-y divide-gray-200 bg-white">
                {SCHEDULE_EVENTS.map((evt, idx) => {
                  const isCurrent = evt.status === "Active Stage";
                  return (
                    <div
                      key={evt.title}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrent ? "bg-[#f8fafc]" : "bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-gray-100 font-mono text-xs font-bold text-gray-800 mt-0.5 border border-gray-200">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900">{evt.title}</h3>
                            <span className={`rounded px-2 py-0.5 text-[11px] font-semibold border ${
                              isCurrent
                                ? "bg-[#0f2e59] text-white border-[#0f2e59]"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}>
                              {evt.status}
                            </span>
                          </div>
                          {evt.teluguTitle && (
                            <p lang="te" className="font-telugu text-sm sm:text-base text-gray-700 mt-1 leading-[1.7]">
                              {evt.teluguTitle}
                            </p>
                          )}
                          <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                            {evt.detail}
                          </p>
                        </div>
                      </div>
                      <div className="sm:text-right shrink-0 pl-9 sm:pl-0">
                        <span className="inline-block rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-bold text-gray-900">
                          {evt.date}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section 2: Cadre-Wise Vacancy Breakdown (Moneycontrol Style Data Table) */}
            <section id="vacancies" className="scroll-mt-6">
              <div className="border-b-2 border-gray-900 pb-1.5 mb-4">
                <h2 className="font-brand text-xl sm:text-2xl font-bold text-gray-950">
                  2. Cadre-Wise Vacancy Breakdown (Total 7,112 Posts)
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Official cadre distribution under TSLPRB Notification Rc No. 189/Rect./Rect.2/2026.
              </p>

              {/* Accessible Data Table following Modern Web Guidance */}
              <div
                tabIndex={0}
                role="region"
                aria-label="Cadre-wise vacancy breakdown table"
                className="overflow-x-auto rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 w-full"
              >
                <table className="w-full min-w-[620px] text-left text-sm divide-y divide-gray-200">
                  <thead className="bg-[#f3f4f6] font-bold text-gray-900 text-xs uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-3.5 py-3 border-r border-gray-200">Code</th>
                      <th scope="col" className="px-3.5 py-3 border-r border-gray-200">Cadre &amp; Post</th>
                      <th scope="col" className="px-3.5 py-3 border-r border-gray-200">Department</th>
                      <th scope="col" className="px-3.5 py-3 border-r border-gray-200">Eligibility</th>
                      <th scope="col" className="px-3.5 py-3 border-r border-gray-200">Share</th>
                      <th scope="col" className="px-3.5 py-3 text-right">Vacancies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800 bg-white">
                    {VACANCIES.map((v, idx) => (
                      <tr key={v.postCode} className={idx % 2 === 1 ? "bg-gray-50/60 hover:bg-gray-100/50" : "bg-white hover:bg-gray-100/50"}>
                        <td className="px-3.5 py-3 font-mono text-xs font-bold text-gray-700 border-r border-gray-200">
                          <span className="inline-block rounded bg-gray-100 px-2 py-0.5 border border-gray-200">
                            {v.postCode}
                          </span>
                        </td>
                        <th scope="row" className="px-3.5 py-3 font-bold text-gray-900 border-r border-gray-200 font-sans">
                          {v.postName}
                        </th>
                        <td className="px-3.5 py-3 text-gray-600 border-r border-gray-200 text-xs sm:text-sm font-medium">
                          {v.department}
                        </td>
                        <td className="px-3.5 py-3 text-gray-600 border-r border-gray-200 text-xs">
                          <span className="inline-block rounded bg-gray-100 px-2.5 py-0.5 text-gray-800 font-medium border border-gray-200">
                            {v.genderEligibility}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-gray-600 border-r border-gray-200 text-xs font-semibold">
                          {v.share}
                        </td>
                        <td className="px-3.5 py-3 text-right font-bold text-gray-900 text-sm sm:text-base">
                          {v.vacancies.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#f3f4f6] font-bold text-gray-900 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan={5} className="px-3.5 py-3.5 text-right border-r border-gray-300 text-xs uppercase tracking-wider text-gray-800">
                        Total Sanctioned Posts
                      </td>
                      <td className="px-3.5 py-3.5 text-right text-gray-950 text-base font-extrabold">
                        {TOTAL_VACANCIES.toLocaleString("en-IN")} Posts
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* Section 3: Age Limits & G.O. Ms No. 87 Relaxation */}
            <section id="eligibility" className="scroll-mt-6">
              <div className="border-b-2 border-gray-900 pb-1.5 mb-4">
                <h2 className="font-brand text-xl sm:text-2xl font-bold text-gray-950">
                  3. Age Limits &amp; G.O. Ms No. 87 (+5 Years Age Relaxation)
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Age benchmarked as of 1st July 2026. The Government of Telangana issued G.O. Ms No. 87 granting a uniform 5-year upper age relaxation.
              </p>

              {/* Age Categories Table */}
              <div
                tabIndex={0}
                role="region"
                aria-label="Age limit category-wise table"
                className="overflow-x-auto rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 w-full"
              >
                <table className="w-full min-w-[550px] text-left text-sm divide-y divide-gray-200">
                  <thead className="bg-[#f3f4f6] font-bold text-gray-900 text-xs uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-3.5 py-3 border-r border-gray-200">Category</th>
                      <th scope="col" className="px-3.5 py-3 border-r border-gray-200">Permissible Age Range</th>
                      <th scope="col" className="px-3.5 py-3">Statutory Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800 bg-white">
                    {AGE_LIMITS.map((a, idx) => (
                      <tr key={a.category} className={idx % 2 === 1 ? "bg-gray-50/60" : "bg-white"}>
                        <th scope="row" className="px-3.5 py-3 font-semibold text-gray-900 border-r border-gray-200 font-sans text-xs sm:text-sm">
                          {a.category}
                        </th>
                        <td className="px-3.5 py-3 border-r border-gray-200 whitespace-nowrap text-xs sm:text-sm font-bold text-gray-900">
                          {a.ageRange}
                        </td>
                        <td className="px-3.5 py-3 text-gray-600 text-xs leading-relaxed font-normal">
                          {a.detail}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Educational Criteria Callouts */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded border border-gray-200 bg-[#f9fafb] p-4">
                  <span className="text-xs font-bold text-[#b91c1c] uppercase tracking-wider block">Prescribed Qualification</span>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mt-1">Intermediate (10+2) Pass</h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                    Must have passed Intermediate (10+2) or equivalent recognized by the Telangana State Board of Intermediate Education as on 29th July 2026.
                  </p>
                </div>
                <div className="rounded border border-gray-200 bg-[#f9fafb] p-4">
                  <span className="text-xs font-bold text-[#b91c1c] uppercase tracking-wider block">SC / ST &amp; Technical Requirements</span>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mt-1">SSC Pass + Inter Appearance</h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                    SC &amp; ST candidates who passed SSC (10th) and appeared for both 1st &amp; 2nd year Intermediate exams are eligible. Fire Fighter posts require a valid LMV license.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: 4-Stage Selection Procedure */}
            <section id="selection" className="scroll-mt-6">
              <div className="border-b-2 border-gray-900 pb-1.5 mb-4">
                <h2 className="font-brand text-xl sm:text-2xl font-bold text-gray-950">
                  4. 4-Stage Selection Procedure
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Candidate progression from preliminary screening exam to final cadre allocation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SELECTION_STAGES.map((st) => (
                  <div key={st.step} className="rounded border border-gray-200 bg-white p-4.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#b91c1c] uppercase tracking-wider">{st.step}</span>
                        <span className="text-[11px] font-semibold border border-gray-200 bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {st.weightage}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 mt-2">{st.name}</h3>
                      <p lang="te" className="font-telugu text-sm text-gray-700 mt-0.5 leading-[1.7]">
                        {st.teluguName}
                      </p>
                      <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                        {st.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 5: PMT & PET Physical Standards */}
            <section id="physical" className="scroll-mt-6">
              <div className="border-b-2 border-gray-900 pb-1.5 mb-4">
                <h2 className="font-brand text-xl sm:text-2xl font-bold text-gray-950">
                  5. Physical Measurements (PMT) &amp; Physical Efficiency (PET)
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Mandatory biometric physical standards and RFID-monitored athletic events.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Men Standards */}
                <div className="rounded border border-gray-200 overflow-hidden bg-white">
                  <div className="bg-[#f3f4f6] px-4 py-3 font-bold text-xs text-gray-900 uppercase tracking-wider border-b border-gray-200 flex items-center justify-between">
                    <span>Men Candidates Standards</span>
                    <span className="rounded bg-white border border-gray-300 text-gray-800 text-[10px] px-2 py-0.5 font-bold">1600m Run</span>
                  </div>
                  <div className="p-4 space-y-3.5 text-xs sm:text-sm text-gray-700 divide-y divide-gray-100">
                    <div>
                      <strong className="block font-bold text-gray-900">Height:</strong>
                      <p className="text-gray-700 mt-0.5">General, BC, SC: <span className="font-bold text-gray-900">Minimum 167.6 cms</span></p>
                      <p className="text-gray-600">Agency ST Tribes: Minimum 160.0 cms</p>
                    </div>
                    <div className="pt-2.5">
                      <strong className="block font-bold text-gray-900">Chest:</strong>
                      <p className="text-gray-700 mt-0.5"><span className="font-bold text-gray-900">Minimum 86.3 cms</span> (with 5 cms expansion)</p>
                      <p className="text-gray-600">Agency ST Tribes: Minimum 80.0 cms (3 cms expansion)</p>
                    </div>
                    <div className="pt-2.5">
                      <strong className="block font-bold text-gray-900">1600m Run (Mandatory Qualifying):</strong>
                      <p className="text-gray-700 mt-0.5">Maximum Time: <span className="font-bold text-gray-900">7 Minutes 15 Seconds</span></p>
                      <p className="text-gray-500 text-[11px]">(Ex-Servicemen: 9 Minutes 30 Seconds)</p>
                    </div>
                    <div className="pt-2.5">
                      <strong className="block font-bold text-gray-900">Long Jump &amp; Shot Put:</strong>
                      <p className="text-gray-700 mt-0.5">Long Jump: <span className="font-bold text-gray-900">Min 4.00 Meters</span> (Qualifying)</p>
                      <p className="text-gray-700">Shot Put (7.26 Kg): <span className="font-bold text-gray-900">Min 6.00 Meters</span></p>
                    </div>
                  </div>
                </div>

                {/* Women Standards */}
                <div className="rounded border border-gray-200 overflow-hidden bg-white">
                  <div className="bg-[#f3f4f6] px-4 py-3 font-bold text-xs text-gray-900 uppercase tracking-wider border-b border-gray-200 flex items-center justify-between">
                    <span>Women Candidates Standards</span>
                    <span className="rounded bg-white border border-gray-300 text-gray-800 text-[10px] px-2 py-0.5 font-bold">800m Run</span>
                  </div>
                  <div className="p-4 space-y-3.5 text-xs sm:text-sm text-gray-700 divide-y divide-gray-100">
                    <div>
                      <strong className="block font-bold text-gray-900">Height:</strong>
                      <p className="text-gray-700 mt-0.5">General, BC, SC: <span className="font-bold text-gray-900">Minimum 152.5 cms</span></p>
                      <p className="text-gray-600">Agency ST Tribes: Minimum 150.0 cms</p>
                    </div>
                    <div className="pt-2.5">
                      <strong className="block font-bold text-gray-900">800m Run (Mandatory Qualifying):</strong>
                      <p className="text-gray-700 mt-0.5">Maximum Time: <span className="font-bold text-gray-900">5 Minutes 20 Seconds</span></p>
                      <p className="text-gray-500 text-[11px]">RFID sensor-tracked digital timing</p>
                    </div>
                    <div className="pt-2.5">
                      <strong className="block font-bold text-gray-900">Long Jump:</strong>
                      <p className="text-gray-700 mt-0.5"><span className="font-bold text-gray-900">Minimum 2.50 Meters</span> (Qualifying)</p>
                    </div>
                    <div className="pt-2.5">
                      <strong className="block font-bold text-gray-900">Shot Put:</strong>
                      <p className="text-gray-700 mt-0.5">Shot Put (4 Kg): <span className="font-bold text-gray-900">Minimum 4.00 Meters</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Exam Pattern & Qualifying Marks */}
            <section id="pattern" className="scroll-mt-6">
              <div className="border-b-2 border-gray-900 pb-1.5 mb-4">
                <h2 className="font-brand text-xl sm:text-2xl font-bold text-gray-950">
                  6. Written Examination Scheme &amp; Qualifying Marks
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Preliminary Written Test (PWT) and Para 16(A) minimum qualifying score requirements.
              </p>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded border border-gray-200 bg-[#f9fafb] p-3.5 text-center">
                  <span className="text-xs font-semibold uppercase text-gray-500 block">Questions</span>
                  <strong className="text-xl sm:text-2xl font-bold text-gray-900 block mt-0.5">200 MCQs</strong>
                  <span className="text-xs text-gray-600">Objective type</span>
                </div>
                <div className="rounded border border-gray-200 bg-[#f9fafb] p-3.5 text-center">
                  <span className="text-xs font-semibold uppercase text-gray-500 block">Total Marks</span>
                  <strong className="text-xl sm:text-2xl font-bold text-gray-900 block mt-0.5">200 Marks</strong>
                  <span className="text-xs text-gray-600">1 mark per Q</span>
                </div>
                <div className="rounded border border-gray-200 bg-[#f9fafb] p-3.5 text-center">
                  <span className="text-xs font-semibold uppercase text-gray-500 block">Duration</span>
                  <strong className="text-xl sm:text-2xl font-bold text-gray-900 block mt-0.5">3 Hours</strong>
                  <span className="text-xs text-gray-600">180 minutes</span>
                </div>
                <div className="rounded border border-gray-200 bg-[#f9fafb] p-3.5 text-center">
                  <span className="text-xs font-semibold uppercase text-gray-500 block">Negative Mark</span>
                  <strong className="text-xl sm:text-2xl font-bold text-gray-900 block mt-0.5">0.20 Marks</strong>
                  <span className="text-xs text-gray-600">20% deduction</span>
                </div>
              </div>

              {/* Qualifying Marks Table */}
              <div className="mt-4 rounded border border-gray-200 overflow-hidden">
                <div className="bg-[#f3f4f6] px-4 py-3 font-bold text-xs text-gray-900 uppercase tracking-wider border-b border-gray-200 flex justify-between items-center">
                  <span>Minimum Qualifying Marks (Rule 16(A))</span>
                  <span className="text-xs font-normal text-gray-600">Applies to PWT &amp; FWE</span>
                </div>
                <div className="divide-y divide-gray-200 bg-white">
                  {QUALIFYING_MARKS.map((qm) => (
                    <div key={qm.category} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                      <span className="font-bold text-gray-900">{qm.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="rounded bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-800 border border-gray-200">
                          PWT: {qm.pwtPercent} ({qm.pwtCutoff})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 7: Annexure-II Syllabus Topics */}
            <section id="syllabus" className="scroll-mt-6">
              <div className="border-b-2 border-gray-900 pb-1.5 mb-4">
                <h2 className="font-brand text-xl sm:text-2xl font-bold text-gray-950">
                  7. Complete Subject-wise Syllabus (8 Subjects)
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Standard Intermediate level curriculum prescribed for PWT &amp; FWE examinations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SUBJECTS.map((sub) => (
                  <div key={sub.number} className="rounded border border-gray-200 bg-[#f9fafb] p-4.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block rounded bg-gray-200 px-2 py-0.5 text-xs font-bold font-mono text-gray-900">
                          {sub.number}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900">{sub.name}</h3>
                      </div>
                      <span lang="te" className="font-telugu text-sm sm:text-base text-gray-700 font-medium block mt-1 leading-[1.7]">
                        {sub.teluguName}
                      </span>
                      <p className="mt-2 text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                        {sub.topics}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 8: Application Fee Structure & Apply Steps */}
            <section id="fees" className="scroll-mt-6">
              <div className="border-b-2 border-gray-900 pb-1.5 mb-4">
                <h2 className="font-brand text-xl sm:text-2xl font-bold text-gray-950">
                  8. Application Fee &amp; How to Apply Online
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Official online registration fee and submission workflow on www.tgprb.in.
              </p>

              {/* Fee Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded border border-gray-200 bg-white p-4.5">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">General / OC, BC &amp; Other States</span>
                  <strong className="text-2xl sm:text-3xl font-bold text-gray-900 block mt-1">₹800</strong>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                    Payable online via Net Banking, UPI, or Debit/Credit card.
                  </p>
                </div>
                <div className="rounded border border-gray-200 bg-white p-4.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">TS SC &amp; ST Candidates</span>
                    <span className="rounded bg-gray-200 text-gray-800 text-[10px] px-2 py-0.5 font-bold">
                      50% Concession
                    </span>
                  </div>
                  <strong className="text-2xl sm:text-3xl font-bold text-gray-900 block mt-1">₹400</strong>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                    Applicable for candidates belonging to Telangana with valid community certificates.
                  </p>
                </div>
              </div>

              {/* 5 Clear Application Steps */}
              <div className="mt-4 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Summary of Application Steps
                </h3>
                <ol className="divide-y divide-gray-200 border border-gray-200 rounded overflow-hidden text-xs sm:text-sm text-gray-700 bg-white">
                  <li className="p-3.5 flex items-start gap-3">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-gray-100 text-gray-800 font-bold text-xs shrink-0 border border-gray-300">1</span>
                    <span>Visit the official recruitment portal at <strong>www.tgprb.in</strong>.</span>
                  </li>
                  <li className="p-3.5 bg-gray-50/60 flex items-start gap-3">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-gray-100 text-gray-800 font-bold text-xs shrink-0 border border-gray-300">2</span>
                    <span>Authenticate your mobile number via OTP to create candidate credentials.</span>
                  </li>
                  <li className="p-3.5 flex items-start gap-3">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-gray-100 text-gray-800 font-bold text-xs shrink-0 border border-gray-300">3</span>
                    <span>Complete online examination fee payment (₹800 or ₹400).</span>
                  </li>
                  <li className="p-3.5 bg-gray-50/60 flex items-start gap-3">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-gray-100 text-gray-800 font-bold text-xs shrink-0 border border-gray-300">4</span>
                    <span>Fill Part-I application details, post preferences, and upload photo/signature.</span>
                  </li>
                  <li className="p-3.5 flex items-start gap-3">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-gray-100 text-gray-800 font-bold text-xs shrink-0 border border-gray-300">5</span>
                    <span>Submit and download the final acknowledgment form with reference number.</span>
                  </li>
                </ol>
              </div>
            </section>

            {/* Section 9: Official Links & Original PDF Hub */}
            <section id="links" className="scroll-mt-6">
              <div className="border-b-2 border-gray-900 pb-1.5 mb-4">
                <h2 className="font-brand text-xl sm:text-2xl font-bold text-gray-950">
                  9. Official Notification PDF &amp; Direct Links
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Verified direct downloads of the original government recruitment gazette, press release, and official portal.
              </p>

              <div className="divide-y divide-gray-200 border border-gray-200 rounded overflow-hidden text-xs sm:text-sm bg-white">
                {/* 1. Official Notification PDF */}
                <div className="p-4 bg-[#fbfcfd] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded bg-red-100 border border-red-300 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-red-800 font-bold text-xs uppercase">PDF</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">TSLPRB Official Gazette Notification (Rc No. 189/2026)</h3>
                        <span className="rounded bg-red-50 text-red-700 border border-red-200 text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wide">
                          Official PDF
                        </span>
                      </div>
                      <p lang="te" className="font-telugu text-xs text-gray-700 mt-0.5">
                        తెలంగాణ కానిస్టేబుల్ 7,112 పోస్టుల ఒరిజినల్ అఫీషియల్ గెజిట్ నోటిఫికేషన్
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Complete 36-page document: Cadres, G.O. 87 age rules, PMT/PET standards &amp; Annexure-II syllabus &bull; 748 KB
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0 sm:self-center">
                    <a
                      href="/docs/telangana-police-constable-notification-2026-official.pdf"
                      download="TSLPRB_Police_Constable_Notification_2026_Official.pdf"
                      className="inline-flex items-center gap-1.5 rounded bg-[#0f2e59] hover:bg-[#0a1f3d] text-white font-bold px-4 py-2 transition text-xs shadow-2xs"
                    >
                      <span>📥 Download PDF (748 KB)</span>
                    </a>
                    <a
                      href="https://doc.tgprb.in/PC+(Civil+et+al)+2026+Notification+dated+29-07-2026.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded bg-white hover:bg-gray-100 text-gray-700 font-semibold px-3 py-2 transition text-xs border border-gray-300"
                    >
                      <span>Board Mirror ↗</span>
                    </a>
                  </div>
                </div>

                {/* 2. Official Press Note */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded bg-gray-100 border border-gray-300 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-gray-700 font-bold text-xs uppercase">PDF</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">TSLPRB Official Press Release Note</h3>
                      <p className="text-xs text-gray-600 mt-0.5">Recruitment board executive release summarizing 7,112 posts &amp; key dates &bull; 255 KB</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href="/docs/telangana-police-constable-2026-press-note.pdf"
                      download="TSLPRB_Constable_2026_Press_Note.pdf"
                      className="inline-flex items-center gap-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-3.5 py-2 transition text-xs border border-gray-300"
                    >
                      <span>📥 Press Note PDF</span>
                    </a>
                    <a
                      href="https://www.tgprb.in/SI_PC_2026/Notification%202026%20Press%20Note%20dated%2029-07-2026.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded bg-white hover:bg-gray-50 text-gray-600 font-medium px-2.5 py-2 transition text-xs border border-gray-200"
                    >
                      <span>Mirror ↗</span>
                    </a>
                  </div>
                </div>

                {/* 3. Official Recruitment Portal */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                  <div>
                    <h3 className="font-bold text-gray-900">TSLPRB Official Recruitment Portal</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Online candidate login, notifications, and results portal (tgprb.in).</p>
                  </div>
                  <a
                    href="https://www.tgprb.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-3.5 py-2 transition text-xs border border-gray-300"
                  >
                    Visit tgprb.in &rarr;
                  </a>
                </div>

                {/* 4. Free Mock Tests */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f9fafb]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">58 Full-Length Bilingual Mock Tests</h3>
                      <span className="rounded bg-gray-200 text-gray-800 text-[10px] px-2 py-0.5 font-bold">
                        Free Access
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">200 questions, 180-minute countdown, 0.20 negative marking, English &amp; Telugu explanations.</p>
                  </div>
                  <Link
                    href="/mock-tests/telangana/police-constable-free-mock-test"
                    className="shrink-0 inline-flex items-center gap-1.5 rounded bg-[#0f2e59] hover:bg-[#0a1f3d] text-white font-bold px-4 py-2 transition text-xs"
                  >
                    Practice Free Tests &rarr;
                  </Link>
                </div>

                {/* 5. Support & Helpline */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                  <div>
                    <h3 className="font-bold text-gray-900">TSLPRB Candidate Support &amp; Helpline</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Official board query portal for registration and hall ticket concerns.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="shrink-0 text-xs font-mono text-gray-800 bg-gray-100 px-2.5 py-1 rounded border border-gray-300 font-semibold">
                      040-41895151
                    </span>
                    <span className="shrink-0 text-xs font-mono text-gray-800 bg-gray-100 px-2.5 py-1 rounded border border-gray-300 font-semibold">
                      support@tgprb.in
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 10: Frequently Asked Questions */}
            <section id="faqs" className="scroll-mt-6">
              <div className="border-b-2 border-gray-900 pb-1.5 mb-4">
                <h2 className="font-brand text-xl sm:text-2xl font-bold text-gray-950">
                  10. Frequently Asked Questions (English &amp; Telugu)
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Official clarifications on eligibility, age relaxations, and examination requirements.
              </p>

              <div className="space-y-3.5">
                {BILINGUAL_FAQS.map((faq, idx) => (
                  <div key={idx} className="rounded border border-gray-200 bg-white p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <span className="grid h-6 w-6 place-items-center rounded bg-gray-100 text-gray-800 font-bold text-xs shrink-0 mt-0.5 border border-gray-200">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900">
                          {faq.question}
                        </h3>
                        {faq.teluguQuestion && (
                          <p lang="te" className="font-telugu mt-1 text-sm sm:text-base text-gray-700 font-medium leading-[1.7]">
                            {faq.teluguQuestion}
                          </p>
                        )}
                        <p className="mt-2 text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                          {faq.answer}
                        </p>
                        {faq.teluguAnswer && (
                          <p lang="te" className="font-telugu mt-1.5 text-xs sm:text-sm text-gray-600 leading-[1.7]">
                            {faq.teluguAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Official Source & Legal Note */}
            <section className="rounded border border-gray-200 bg-[#f9fafb] p-4 sm:p-5 text-xs text-gray-600 leading-relaxed">
              <strong className="block text-gray-900 font-semibold mb-1">
                Official Gazette Reference:
              </strong>
              This news briefing is curated from official TSLPRB Notification Rc No. 189/Rect./Rect.2/2026 and G.O. Ms No. 87 issued by the Government of Telangana. For direct candidate login and hall ticket releases, visit the official website at <a href="https://www.tgprb.in" target="_blank" rel="noopener noreferrer" className="text-[#0f2e59] underline font-semibold">www.tgprb.in</a>.
            </section>

          </div>

          {/* Sticky Sidebar Column (30%) - Full Height Alignment */}
          <aside className="lg:col-span-4 xl:col-span-3 2xl:col-span-3 space-y-6 lg:sticky lg:top-16">

            {/* Official Gazette PDF Download Card */}
            <div className="rounded border-2 border-[#0f2e59]/30 bg-[#fbfcfd] p-5 shadow-2xs">
              <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-2.5">
                <span className="rounded bg-[#b91c1c] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                  Official PDF
                </span>
                <span className="text-[11px] font-mono font-semibold text-gray-500">Rc No. 189/2026</span>
              </div>
              <h3 className="mt-2.5 text-sm font-bold text-gray-900 leading-snug">
                Original Gazette Notification PDF
              </h3>
              <p lang="te" className="font-telugu text-xs text-gray-700 mt-1 leading-[1.6]">
                పోలీస్ కానిస్టేబుల్ 7,112 పోస్టుల అధికారిక నోటిఫికేషన్ పీడీఎఫ్ డాక్యుమెంట్
              </p>
              <div className="mt-3.5 space-y-2">
                <a
                  href="/docs/telangana-police-constable-notification-2026-official.pdf"
                  download="TSLPRB_Police_Constable_Notification_2026_Official.pdf"
                  className="w-full flex items-center justify-center gap-2 rounded bg-[#0f2e59] hover:bg-[#0a1f3d] text-white py-2.5 px-3 text-xs font-bold transition shadow-2xs"
                >
                  <span>📥 Download Official PDF (748 KB)</span>
                </a>
                <a
                  href="https://doc.tgprb.in/PC+(Civil+et+al)+2026+Notification+dated+29-07-2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-2 px-3 text-xs font-semibold transition"
                >
                  <span>Board Server Mirror ↗</span>
                </a>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="rounded border border-gray-200 bg-white p-5 shadow-2xs">
              <div className="border-b border-gray-200 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  Quick Facts Overview
                </h3>
              </div>
              <dl className="mt-3.5 space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Notification</dt>
                  <dd className="font-bold text-gray-900">Rc No. 189/2026</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Board</dt>
                  <dd className="font-semibold text-gray-900">TSLPRB</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Total Posts</dt>
                  <dd className="font-bold text-gray-900">7,112 Posts</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">PWT Exam Date</dt>
                  <dd className="font-bold text-gray-900">20 Dec 2026</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Admit Cards</dt>
                  <dd className="font-semibold text-gray-900">05 Dec 2026</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">General Age</dt>
                  <dd className="font-semibold text-gray-900">18 – 27 Years</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Negative Marks</dt>
                  <dd className="font-semibold text-gray-900">-0.20 per wrong Q</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Scale of Pay</dt>
                  <dd className="font-semibold text-gray-900">₹24,280 – ₹72,850</dd>
                </div>
              </dl>
            </div>

            {/* Free Mock Test Practice Widget */}
            <div className="rounded border border-gray-200 bg-[#f9fafb] p-5 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#b91c1c] block">
                Free Practice Series
              </span>
              <h3 className="mt-1 text-base font-bold text-gray-900 font-brand">
                58 Police Constable Mock Tests
              </h3>
              <p lang="te" className="font-telugu mt-0.5 text-xs text-gray-600 font-medium">
                పూర్తి స్థాయి 200 ప్రశ్నల తెలుగు &amp; ఇంగ్లీష్ మాక్ టెస్టులు
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-gray-600">
                <li className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-bold">&bull;</span> 200 Questions timed for 180 mins
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-bold">&bull;</span> Genuine 0.20 negative marking
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-bold">&bull;</span> Step-by-step bilingual explanations
                </li>
              </ul>
              <Link
                href="/mock-tests/telangana/police-constable-free-mock-test"
                className="mt-4 block w-full rounded bg-[#0f2e59] hover:bg-[#0a1f3d] text-white text-center py-2.5 text-xs sm:text-sm font-bold transition"
              >
                Practice Free Tests &rarr;
              </Link>
            </div>

            {/* Official Website & Helpline Widget */}
            <div className="rounded border border-gray-200 bg-white p-5 text-xs text-gray-600 shadow-2xs">
              <h3 className="font-bold text-gray-900 text-sm mb-1.5">Official Board Portal</h3>
              <p className="leading-relaxed">
                Candidate registration, hall tickets, and results are published on the official board website:
              </p>
              <a
                href="https://www.tgprb.in"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-block text-xs font-bold text-[#0f2e59] underline hover:text-blue-900"
              >
                https://www.tgprb.in &rarr;
              </a>
            </div>

            {/* Table of Contents Quick Links */}
            <div className="rounded border border-gray-200 bg-white p-5 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-2">
                In This Article
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-gray-600">
                <li><a href="#schedule" className="hover:text-gray-900 transition font-medium">1. Important Dates</a></li>
                <li><a href="#vacancies" className="hover:text-gray-900 transition font-medium">2. Cadre-Wise Vacancies</a></li>
                <li><a href="#eligibility" className="hover:text-gray-900 transition font-medium">3. Age &amp; G.O. Ms 87</a></li>
                <li><a href="#selection" className="hover:text-gray-900 transition font-medium">4. Selection Procedure</a></li>
                <li><a href="#physical" className="hover:text-gray-900 transition font-medium">5. PMT &amp; PET Events</a></li>
                <li><a href="#pattern" className="hover:text-gray-900 transition font-medium">6. Exam Pattern &amp; Cutoffs</a></li>
                <li><a href="#syllabus" className="hover:text-gray-900 transition font-medium">7. Annexure-II Syllabus</a></li>
                <li><a href="#fees" className="hover:text-gray-900 transition font-medium">8. Application Fee &amp; Steps</a></li>
                <li><a href="#links" className="hover:text-gray-900 transition font-medium">9. Official Notification PDF &amp; Links</a></li>
                <li><a href="#faqs" className="hover:text-gray-900 transition font-medium">10. Frequently Asked Questions</a></li>
              </ul>
            </div>

          </aside>

        </div>
      </div>

      {/* Broadsheet Newspaper Editorial Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-[#f9fafb] py-8 text-center text-xs text-gray-500 w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 space-y-2">
          <p className="font-semibold text-gray-800 text-sm">
            Varadhi Prep &bull; Examination Information &amp; Practice Portal
          </p>
          <p className="text-gray-600">
            Official examination details sourced directly from TSLPRB Notification Rc No. 189 / Rect. / Rect.2 / 2026.
          </p>
          <p>
            Official Board Portal:{" "}
            <a href="https://www.tgprb.in" target="_blank" rel="noopener noreferrer" className="text-[#0f2e59] underline hover:text-blue-900 font-medium">
              www.tgprb.in
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
