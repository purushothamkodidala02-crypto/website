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

  const title = "Telangana Police Constable Notification 2026 - 7,112 Posts, Syllabus, Events & Selection";
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

// ── Complete & Self-Contained Notification Data ─────────────────────────────

const VACANCIES = [
  { postCode: "21", postName: "Stipendiary Cadet Trainee (SCT) Police Constable (Civil)", department: "Police Department", genderEligibility: "Men & Women", vacancies: 4965, payScale: "₹24,280 – ₹72,850" },
  { postCode: "22", postName: "SCT Police Constable (AR - Armed Reserve)", department: "Police Department", genderEligibility: "Men & Women", vacancies: 1250, payScale: "₹24,280 – ₹72,850" },
  { postCode: "23", postName: "SCT Police Constable (SAR CPL)", department: "Police Department", genderEligibility: "Men Only", vacancies: 100, payScale: "₹24,280 – ₹72,850" },
  { postCode: "24", postName: "SCT Police Constable (TSSP / TGSPF)", department: "Police Department", genderEligibility: "Men Only", vacancies: 500, payScale: "₹24,280 – ₹72,850" },
  { postCode: "26", postName: "Fire Fighter (Driver Operator)", department: "Disaster Response & Fire Services", genderEligibility: "Men (Valid LMV)", vacancies: 225, payScale: "₹24,280 – ₹72,850" },
  { postCode: "27", postName: "Warder (Male)", department: "Prisons & Correctional Services", genderEligibility: "Men Only", vacancies: 62, payScale: "₹24,280 – ₹72,850" },
  { postCode: "28", postName: "Warder (Female)", department: "Prisons & Correctional Services", genderEligibility: "Women Only", vacancies: 10, payScale: "₹24,280 – ₹72,850" },
];

const TOTAL_VACANCIES = 7112;

const SCHEDULE_EVENTS = [
  { title: "Official Notification Issued", teluguTitle: "అధికారిక నోటిఫికేషన్ విడుదల", date: "29 July 2026", status: "Completed", detail: "TSLPRB published official notification Rc No. 189/Rect./Rect.2/2026 for 7,112 vacancies." },
  { title: "Online Application Window", teluguTitle: "ఆన్‌లైన్ దరఖాస్తుల గడువు", date: "10 Aug – 10 Sep 2026", status: "Completed", detail: "Part-I registration and online fee payment via www.tgprb.in." },
  { title: "Hall Ticket / Admit Card Download", teluguTitle: "హాల్ టికెట్ల డౌన్‌లోడ్", date: "05 Dec 2026 Onwards", status: "Upcoming", detail: "Download preliminary written test admit cards from the official candidate portal." },
  { title: "Preliminary Written Test (PWT)", teluguTitle: "ప్రిలిమినరీ రాత పరీక్ష (PWT)", date: "20 Dec 2026 (Sunday)", status: "Active", detail: "Single objective paper (200 Questions, 200 Marks, 3 Hours, 10:00 AM – 1:00 PM) on offline OMR sheet." },
  { title: "Preliminary Key & Objections", teluguTitle: "ప్రాథమిక కీ & అభ్యంతరాలు", date: "24 Dec – 28 Dec 2026", status: "Upcoming", detail: "Official key published; online objection submission window." },
  { title: "PWT Results & Cut-off List", teluguTitle: "ప్రిలిమ్స్ ఫలితాలు & క్వాలిఫైడ్ లిస్ట్", date: "15 Jan 2027", status: "Upcoming", detail: "Candidates scoring qualifying percentage shortlisted for physical tests." },
  { title: "Part-II Online Application", teluguTitle: "పార్ట్-II ఆన్‌లైన్ దరఖాస్తు", date: "20 Jan – 31 Jan 2027", status: "Upcoming", detail: "Qualified candidates upload academic, caste, and local candidature documents." },
  { title: "PMT & PET Physical Tests", teluguTitle: "శారీరక కొలతలు (PMT) & ఈవెంట్స్ (PET)", date: "Feb – Mar 2027", status: "Upcoming", detail: "RFID biometric timing for 1600m/800m run, Long Jump, Shot Put & PMT measurement." },
  { title: "Final Written Examination (FWE)", teluguTitle: "చివరి రాత పరీక్ష (FWE)", date: "May 2027", status: "Upcoming", detail: "Final selection written test (200 marks for Civil/Fire/Warder; 100 marks for AR/TSSP)." },
];

const AGE_LIMITS = [
  { category: "General / Open Competition (OC)", ageRange: "18 to 27 Years", basis: "Base 18–22 years + 5 years general relaxation under G.O. Ms No. 87 GA (Services-A) Dept" },
  { category: "BC (Backward Classes - A, B, C, D, E)", ageRange: "18 to 32 Years", basis: "Base 18–22 + 5 yrs (GO 87) + 5 yrs statutory state reservation relaxation" },
  { category: "SC & ST Candidates", ageRange: "18 to 32 Years", basis: "Base 18–22 + 5 yrs (GO 87) + 5 yrs statutory state reservation relaxation" },
  { category: "EWS (Economically Weaker Sections)", ageRange: "18 to 32 Years", basis: "Base 18–22 + 5 yrs (GO 87) + 5 yrs reservation relaxation as per Govt orders" },
  { category: "Home Guards (Min. 360 days service)", ageRange: "18 to 45 Years", basis: "Base 18–40 years + 5 years general relaxation under G.O. Ms No. 87" },
  { category: "Telangana State Govt Employees", ageRange: "Up to 5 Years Relaxation", basis: "Length of regular service (excluding Corporations/Public Undertakings), max 5 years" },
  { category: "Ex-Servicemen & NCC Instructors", ageRange: "3 Years + Service Rendered", basis: "Length of regular military service rendered in Armed Forces + 3 additional years" },
  { category: "Widows & Divorced Women (Unremarried)", ageRange: "Up to 40 Years (45 for SC/ST)", basis: "Eligible for SCT Constables, Fire and Warder posts under special statutory rules" },
];

const SELECTION_STAGES = [
  { stage: "Stage 1", title: "Preliminary Written Test (PWT)", detail: "1 Paper with 200 Questions for 200 Marks (3 Hours). Conducted offline on OMR sheet with blue/black ballpoint pen. Negative marking of 20% (0.20 marks) applies per incorrect response. Screening stage." },
  { stage: "Stage 2", title: "Physical Measurement Test (PMT)", detail: "Digital height and chest measurement with biometric verification. Men: Height ≥ 167.6 cm, Chest ≥ 86.3 cm (5 cm expansion). Women: Height ≥ 152.5 cm. (Relaxed for Agency ST: Men 160 cm, Women 150 cm)." },
  { stage: "Stage 3", title: "Physical Efficiency Test (PET)", detail: "RFID sensor-monitored events. 1600 Meters Run for Men (Max 7 mins 15 secs), 800 Meters Run for Women (Max 5 mins 20 secs), Long Jump, and Shot Put. Run marks graded up to 100 marks for AR/TSSP." },
  { stage: "Stage 4", title: "Final Written Examination (FWE)", detail: "Final selection written test. 200 Marks for Civil, Fire Fighter, and Warder posts (100% selection weightage). 100 Marks for AR, SAR CPL, and TSSP posts (Combined 50% FWE + 50% PET Run marks)." },
];

const QUALIFYING_MARKS = [
  { category: "Open Competition (OC) & EWS", pwtPercentage: "30%", pwtMarks: "60 Marks / 200", fwePercentage: "40%", fweMarks: "80 Marks / 200 (Civil) | 40 / 100 (AR)" },
  { category: "Backward Classes (BC)", pwtPercentage: "25%", pwtMarks: "50 Marks / 200", fwePercentage: "35%", fweMarks: "70 Marks / 200 (Civil) | 35 / 100 (AR)" },
  { category: "SC, ST, Ex-Servicemen & Home Guards", pwtPercentage: "20%", pwtMarks: "40 Marks / 200", fwePercentage: "30%", fweMarks: "60 Marks / 200 (Civil) | 30 / 100 (AR)" },
];

const SUBJECTS = [
  { name: "English", teluguName: "ఇంగ్లీష్ లాంగ్వేజ్ (ఆబ్జెక్టివ్)", description: "Comprehension passage, vocabulary, synonyms & antonyms, spotting errors, grammar rules, prepositions, active & passive voice, sentence correction & idioms." },
  { name: "Arithmetic", teluguName: "అర్థమెటిక్ & సంఖ్యా సామర్థ్యం", description: "Number systems, LCM & HCF, fractions & decimals, percentages, averages, ratio & proportion, profit & loss, simple & compound interest, time & work, time & distance, mensuration." },
  { name: "General Science", teluguName: "జనరల్ సైన్స్", description: "Everyday science observations, fundamental physics, chemistry in daily life, human anatomy, diseases & prevention, botany, zoology, environmental science & public hygiene." },
  { name: "History of India & Indian Culture", teluguName: "భారత దేశ చరిత్ర, సంస్కృతి & జాతీయోద్యమం", description: "Ancient civilizations, medieval India, Mughal administration, British expansion, 1857 Revolt, socio-religious reform movements, Indian freedom struggle, national leaders." },
  { name: "Principles of Geography, Indian Geography, Polity & Economy", teluguName: "భౌగోళిక సూత్రాలు, భారత భూగోళం, రాజనీతి & ఆర్థిక వ్యవస్థ", description: "Physical geography, Indian physiography, rivers, climate, soils, Constitution of India, fundamental rights & duties, Parliament, Judiciary, state planning, Indian economy & fiscal policy." },
  { name: "Current Events of National & International Importance", teluguName: "సమకాలీన అంశాలు (జాతీయ & అంతర్జాతీయ కరెంట్ అఫైర్స్)", description: "Recent national & global developments, summits, bilateral pacts, sports tournaments, prestigious awards, science & technology milestones, government welfare schemes." },
  { name: "Test of Reasoning / Mental Ability", teluguName: "రీజనింగ్ & మెంటల్ ఎబిలిటీ", description: "Analogy, series completion, coding-decoding, blood relations, direction sense, syllogisms, Venn diagrams, non-verbal patterns, spatial visualization, ranking & arithmetic reasoning." },
  { name: "Contents Pertaining to the State of Telangana", teluguName: "తెలంగాణ చరిత్ర, ఉద్యమం, సంస్కృతి & ప్రత్యేకతలు", description: "History of Telangana (Satavahanas, Kakatiyas, Qutb Shahis, Asaf Jahis), Telangana armed struggle, 1969 agitation, statehood movement (1948–2014), art, literature, fairs, festivals, geography, rivers, irrigation projects, and state welfare schemes." },
];

const DUTIES = [
  { title: "Law & Order Maintenance & Beat Patrolling", teluguTitle: "శాంతిభద్రతల పరిరక్షణ & బీట్ పెట్రోలింగ్", description: "Executing regular day and night foot and mobile beats in station jurisdiction, surveillance on anti-social elements, crime prevention, and maintaining public order during festivals, rallies, and elections." },
  { title: "Crime Scene Preservation & Station Sentry", teluguTitle: "నేర పరిశోధన సహాయం & స్టేషన్ భద్రత", description: "Assisting Station House Officers (SHO) and Sub-Inspectors during crime scene cordoning, evidence preservation, inquest panchanama, and guarding station lockups, records, and armory as station sentry." },
  { title: "Emergency Response & Dial 100 / 112 Mobile Patrol", teluguTitle: "డయల్ 100 అత్యవసర ప్రతిస్పందన", description: "Serving as frontline emergency responders in Blue Colts and Patrol Mobiles, reaching distress locations swiftly upon receiving Dial 100 calls to provide immediate citizen assistance." },
  { title: "Court Duty, Summons Delivery & Prisoner Escort", teluguTitle: "కోర్టు విధులు, సమన్లు జారీ & ఖైదీల ఎస్కార్ట్", description: "Delivering court summons and warrants to witnesses and accused, escorting under-trial prisoners between central prisons and courts, and producing case evidence before judicial magistrates." },
  { title: "Traffic Regulation & Road Safety Checkpoints", teluguTitle: "ట్రాఫిక్ క్రమబద్ధీకరణ & రహదారి భద్రత", description: "Regulating traffic flow at congested intersections, conducting vehicle document and drunk driving checks during nakabandi operations, and assisting victims during road accidents." },
];

const CAREER_GROWTH = [
  "Police Constable (Entry Level, Pay Scale ₹24,280 – ₹72,850)",
  "Head Constable (Promoted after 5–8 years or via departmental qualifying exam)",
  "Assistant Sub-Inspector (ASI)",
  "Sub-Inspector of Police (SI - Station House Officer)",
  "Circle Inspector of Police (CI)",
  "Deputy Superintendent of Police (DSP / ACP)",
];

const BILINGUAL_FAQS = [
  {
    question: "What is the official notification number and total vacancies for Telangana Police Constable 2026?",
    answer: "The official notification number is Rc No. 189 / Rect. / Rect.2 / 2026 issued by TSLPRB. It notifies a total of 7,112 vacancies across SCT Constables (Civil: 4,965, AR: 1,250, SAR CPL: 100, TSSP/TGSPF: 500), Fire Fighters (225), and Warders (72).",
    teluguQuestion: "తెలంగాణ పోలీస్ కానిస్టేబుల్ 2026 నోటిఫికేషన్ నంబర్ మరియు మొత్తం ఖాళీలు ఎన్ని?",
    teluguAnswer: "అధికారిక నోటిఫికేషన్ నంబర్ Rc No. 189 / Rect. / Rect.2 / 2026. దీని ద్వారా మొత్తం 7,112 పోస్టులను భర్తీ చేస్తున్నారు (సివిల్ 4,965, ఏఆర్ 1,250, సార్ సిపిఎల్ 100, టిఎస్ఎస్పి/టిజిఎస్పిఎఫ్ 500, ఫైర్ 225, వార్డర్స్ 72).",
  },
  {
    question: "What is the age limit for Telangana Police Constable? Is there any age relaxation under G.O. Ms No. 87?",
    answer: "The base age is 18 to 22 years as on 1st July 2026. Under G.O. Ms No. 87, the Telangana Government granted a 5-year upper age relaxation for direct recruitment in uniformed services. With this, General/OC candidates can apply up to 27 years. BC, SC, ST, and EWS candidates receive an additional 5-year statutory reservation relaxation, making them eligible up to 32 years. Home Guards can apply up to 45 years.",
    teluguQuestion: "తెలంగాణ పోలీస్ కానిస్టేబుల్ వయోపరిమితి ఎంత? జీవో 87 ప్రకారం ఎంత సడలింపు లభిస్తుంది?",
    teluguAnswer: "ప్రిస్క్రైబ్డ్ సాధారణ వయస్సు 18 నుండి 22 సంవత్సరాలు. తెలంగాణ ప్రభుత్వం జీవో ఎంఎస్ నం. 87 ద్వారా 5 సంవత్సరాల సాధారణ సడలింపు ఇచ్చింది. దీనితో జనరల్/ఓసీ అభ్యర్థులు 27 ఏళ్ల వరకు దరఖాస్తు చేసుకోవచ్చు. బీసీ, ఎస్సీ, ఎస్టీ, ఈడబ్ల్యూఎస్ అభ్యర్థులకు మరో 5 ఏళ్ల రిజర్వేషన్ సడలింపుతో 32 సంవత్సరాల వరకు, హోంగార్డులకు 45 ఏళ్ల వరకు అర్హత ఉంది.",
  },
  {
    question: "What is the educational qualification required for Telangana Police Constable posts?",
    answer: "Candidates must have passed Intermediate (10+2) or equivalent examination recognized by the Telangana State Board of Intermediate Education. For SC and ST candidates, passing SSC (10th) and appearing for both 1st and 2nd year Intermediate exams is required. Fire Fighter posts mandate a valid Light Motor Vehicle (LMV) driving license.",
    teluguQuestion: "పోలీస్ కానిస్టేబుల్ ఉద్యోగాలకు అవసరమైన విద్యార్హత ఏమిటి?",
    teluguAnswer: "అభ్యర్థులు ఇంటర్మీడియట్ (10+2) లేదా తత్సమాన బోర్డు పరీక్ష ఉత్తీర్ణులై ఉండాలి. ఎస్సీ, ఎస్టీ అభ్యర్థులు పదో తరగతి ఉత్తీర్ణులై ఇంటర్మీడియట్ రెండు సంవత్సరాల పరీక్షలకు హాజరైతే సరిపోతుంది. ఫైర్ ఫైటర్ పోస్టులకు చెల్లుబాటు అయ్యే ఎల్‌ఎమ్‌వి డ్రైవింగ్ లైసెన్స్ ఉండాలి.",
  },
  {
    question: "What is the pay scale and gross monthly salary for Telangana Police Constables?",
    answer: "The sanctioned pay scale is ₹24,280 – ₹72,850 under Telangana State Revised Pay Scales. With Basic Pay (₹24,280), DA (approx. ₹6,408), HRA (11% to 24% by city: ₹2,670 to ₹5,827), and allowances, the gross monthly salary ranges between ₹34,000 and ₹39,000 per month.",
    teluguQuestion: "తెలంగాణ కానిస్టేబుల్ పే స్కేల్ మరియు నెలవారీ గ్రాస్ శాలరీ ఎంత?",
    teluguAnswer: "అధికారిక పే స్కేలు ₹24,280 – ₹72,850. బేసిక్ పే, డీఏ, హెచ్‌ఆర్‌ఏ మరియు ఇతర పోలీస్ అలవెన్సులతో కలిపి ప్రారంభ స్థూల వేతనం నెలకు సుమారు ₹34,000 నుండి ₹39,000 వరకు ఉంటుంది.",
  },
  {
    question: "What is the examination pattern and negative marking for the Preliminary Written Test (PWT)?",
    answer: "The PWT comprises 1 objective paper with 200 multiple-choice questions for 200 marks, with a duration of 3 hours (180 minutes). The test is bilingual (English and Telugu/Urdu) and conducted offline on OMR sheets. Negative marking is 20% (0.20 marks deducted for each wrong answer marked).",
    teluguQuestion: "ప్రిలిమ్స్ (PWT) పరీక్ష విధానం మరియు నెగెటివ్ మార్కింగ్ విధానం ఏమిటి?",
    teluguAnswer: "ప్రిలిమ్స్ రాత పరీక్ష 200 ప్రశ్నలతో 200 మార్కులకు 3 గంటల (180 నిమిషాలు) వ్యవధిలో ఆఫ్‌లైన్ ఓఎంఆర్ షీట్‌పై నిర్వహించబడుతుంది. ప్రతి తప్పు సమాధానానికి 20% మార్కులు (0.20 మార్కు) నెగెటివ్ మార్కింగ్‌గా తీసివేయబడుతుంది.",
  },
  {
    question: "What are the minimum qualifying marks in the PWT and Final Written Examination (FWE)?",
    answer: "For PWT: OC & EWS must score 30% (60 marks out of 200); BC must score 25% (50 marks); and SC/ST/Ex-SM/Home Guards must score 20% (40 marks). For FWE: OC/EWS must score 40% (80 marks/200 for Civil); BC must score 35% (70 marks); and SC/ST must score 30% (60 marks).",
    teluguQuestion: "ప్రిలిమ్స్ మరియు మెయిన్స్ రాత పరీక్షల్లో కనీస క్వాలిఫైయింగ్ మార్కులు ఎంత?",
    teluguAnswer: "ప్రిలిమ్స్ (PWT) లో: ఓసీ & ఈడబ్ల్యూఎస్ 30% (60 మార్కులు); బీసీ 25% (50 మార్కులు); ఎస్సీ/ఎస్టీ/మాజీ సైనికులు/హోంగార్డులు 20% (40 మార్కులు). మెయిన్స్ (FWE) లో: ఓసీలు 40% (80 మార్కులు), బీసీలు 35% (70 మార్కులు), ఎస్సీ/ఎస్టీలు 30% (60 మార్కులు) సాధించాలి.",
  },
  {
    question: "What are the mandatory PMT and PET physical standards for Men and Women?",
    answer: "Men must meet a minimum height of 167.6 cm (160 cm for Agency ST) and chest of 86.3 cm (5 cm expansion). PET requires qualifying the 1600m Run in 7 mins 15 secs (Ex-SM: 9m 30s), Long Jump of 4.00m, and Shot Put (7.26 kg) of 6.00m. Women must meet height of 152.5 cm (150 cm for Agency ST) and qualify the 800m Run in 5 mins 20 secs, Long Jump of 2.50m, and Shot Put (4 kg) of 4.00m.",
    teluguQuestion: "పురుష మరియు మహిళా అభ్యర్థులకు నిర్దేశించిన శారీరక కొలతలు (PMT) & ఈవెంట్స్ (PET) ఏమిటి?",
    teluguAnswer: "పురుషుల ఎత్తు కనీసం 167.6 సెం.మీ (ఏజెన్సీ ఎస్టీలకు 160 సెం.మీ), ఛాతీ 86.3 సెం.మీ. 1600 మీటర్ల పరుగును 7 నిమిషాల 15 సెకన్లలో, లాంగ్ జంప్ 4.00 మీటర్లు, షాట్‌పుట్ 6.00 మీటర్లు పూర్తి చేయాలి. మహిళల ఎత్తు 152.5 సెం.మీ (ఏజెన్సీ ఎస్టీలకు 150 సెం.మీ). 800 మీటర్ల పరుగును 5 నిమిషాల 20 సెకన్లలో, లాంగ్ జంప్ 2.50 మీటర్లు, షాట్‌పుట్ 4.00 మీటర్లు సాధించాలి.",
  },
  {
    question: "How can I prepare with free bilingual mock tests for Telangana Police Constable?",
    answer: "You can practice complete, timed 200-question bilingual mock tests with realistic 0.20 negative marking and instant step-by-step solutions for free on Varadhi Prep (varadhiprep.in/mock-tests/telangana/police-constable-free-mock-test).",
    teluguQuestion: "తెలంగాణ కానిస్టేబుల్ పరీక్షకు వరధి ప్రెప్‌లో ఉచిత మాక్ టెస్ట్‌లు ఎలా రాయాలి?",
    teluguAnswer: "వరధి ప్రెప్ వెబ్‌సైట్‌లో తెలంగాణ పోలీస్ కానిస్టేబుల్ మాక్ టెస్ట్ సిరీస్‌ను ఉచితంగా సాధన చేయవచ్చు. అధికారిక 200 ప్రశ్నలు, 3 గంటల టైమర్, 0.20 నెగెటివ్ మార్కింగ్ మరియు పూర్తి తెలుగు & ఇంగ్లీష్ వివరణలతో ఆన్‌లైన్‌లో ప్రాక్టీస్ చేయవచ్చు.",
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
      headline: "Telangana Police Constable Notification 2026 - 7,112 Posts, Syllabus & Selection Procedure",
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
    <main className="student-page min-h-screen bg-[#f8fafc] text-slate-800 w-full max-w-full overflow-x-hidden">
      <JsonLd data={jsonLd} />

      {/* Authority Top Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-slate-900 via-blue-700 to-emerald-600" />

      {/* Clean Professional Header - Logo on left of screen */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="flex w-full items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/" className="flex items-center gap-2" aria-label="Varadhi Prep home">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200/90 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              TSLPRB Notification Hub
            </span>
            <Link
              href="/mock-tests/telangana/police-constable-free-mock-test"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs sm:text-sm font-semibold transition shadow-xs"
            >
              Practice Mock Tests →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Headline Section with Clean Executive Slate Tone */}
      <section className="border-b border-slate-200/90 bg-gradient-to-b from-white via-slate-50/60 to-[#f8fafc]">
        <div className="w-full max-w-7xl mx-auto px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          {/* Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs">
            <Link href="/" className="font-medium text-slate-500 hover:text-blue-800 transition">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-500">Recruitment News</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">Telangana Police Constable Notification 2026</span>
          </nav>

          {/* Authoritative Badge Cluster - Clean, Muted, Refined Editorial Pills */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 font-semibold text-slate-800 shadow-2xs">
              Official Notification
            </span>
            <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 shadow-2xs">
              TSLPRB Rc No. 189 / Rect. / Rect.2 / 2026
            </span>
            <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-900 shadow-2xs">
              7,112 Total Vacancies
            </span>
            <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-900 shadow-2xs">
              G.O. Ms No. 87 (+5 Years Age Relaxation)
            </span>
          </div>

          {/* Main Title, Subtitle, and Executive Lead Paragraph */}
          <div className="mt-5 max-w-5xl">
            <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-bold text-slate-900 leading-snug">
              Telangana Police Constable Notification 2026
            </h1>
            <p lang="te" className="font-telugu mt-1.5 text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
              తెలంగాణ పోలీస్ కానిస్టేబుల్ 7,112 పోస్టుల అధికారిక నోటిఫికేషన్, సిలబస్, ఈవెంట్స్ &amp; ఎంపిక విధానం
            </p>
            <p className="mt-2.5 text-sm sm:text-[15px] leading-relaxed text-slate-600 max-w-4xl font-normal">
              The Telangana State Level Police Recruitment Board (TSLPRB) has officially published Notification Rc No. 189/Rect./Rect.2/2026 for 7,112 vacancies across SCT Police Constables (Civil, AR, SAR CPL, TSSP/TGSPF), Fire Fighters, and Prison Warders. Review the key exam parameters, eligibility with G.O. Ms No. 87 (+5 years age relaxation), physical standards (PMT/PET), exam pattern, and Annexure-II syllabus below.
            </p>

            {/* Quick Action Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Link
                href="/mock-tests/telangana/police-constable-free-mock-test"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs sm:text-sm font-semibold transition shadow-xs"
              >
                Practice 58 Mock Tests Free →
              </Link>
              <a
                href="#schedule"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs sm:text-sm font-medium transition shadow-2xs"
              >
                Important Dates ↓
              </a>
              <a
                href="#vacancies"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs sm:text-sm font-medium transition shadow-2xs"
              >
                Post Breakdown (7,112) ↓
              </a>
              <a
                href="#pattern"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs sm:text-sm font-medium transition shadow-2xs"
              >
                Exam Pattern ↓
              </a>
              <a
                href="#syllabus"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs sm:text-sm font-medium transition shadow-2xs"
              >
                Curriculum Topics ↓
              </a>
            </div>
          </div>

          {/* 6 Balanced Metric Tiles in Clean, Consistent Corporate Slate Tone - NO SHINING COLORS */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 block">Total Vacancies</span>
              <strong className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 block">7,112</strong>
              <span className="text-xs font-medium text-slate-600 block mt-0.5">Civil &amp; Allied Cadres</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 block">Scale of Pay</span>
              <strong className="mt-1 text-base sm:text-lg font-bold text-slate-900 block leading-tight">₹24,280 – ₹72,850</strong>
              <span className="text-xs font-medium text-slate-600 block mt-0.5">₹34k–₹39k In-Hand Gross</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 block">PWT Exam Date</span>
              <strong className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 block">20 Dec 2026</strong>
              <span className="text-xs font-medium text-slate-600 block mt-0.5">Forenoon 10 AM – 1 PM</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 block">Negative Marking</span>
              <strong className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 block">20% (-0.20)</strong>
              <span className="text-xs font-medium text-slate-600 block mt-0.5">Per Wrong Answer</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 block">General Age</span>
              <strong className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 block">18 – 27 Years</strong>
              <span className="text-xs font-medium text-slate-600 block mt-0.5">G.O. Ms 87 (+5 Years)</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 block">Qualification</span>
              <strong className="mt-1 text-base sm:text-lg font-bold text-slate-900 block leading-tight">10+2 Intermediate</strong>
              <span className="text-xs font-medium text-slate-600 block mt-0.5">State Board or Equiv.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout with Standard Clean Width */}
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6 sm:space-y-8">

        {/* 1. Important Dates & Timeline Roadmap */}
        <section id="schedule" className="scroll-mt-20 rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="border-l-4 border-blue-600 pl-3.5 border-b border-slate-100 pb-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Official Schedule</span>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
              1. Important Dates &amp; Recruitment Schedule
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Chronological schedule of key events for TSLPRB Police Constable Recruitment 2026.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCHEDULE_EVENTS.map((evt, idx) => (
              <div
                key={evt.title}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 hover:border-blue-300 hover:bg-blue-50/20 transition gap-3.5"
              >
                <div className="flex items-start gap-3.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-blue-200 bg-blue-50 text-blue-900 font-bold text-xs">
                    0{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {evt.title}
                    </h3>
                    {evt.teluguTitle && (
                      <p lang="te" className="font-telugu text-sm font-semibold text-blue-900 mt-0.5 leading-[1.85]">
                        {evt.teluguTitle}
                      </p>
                    )}
                    <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {evt.detail}
                    </p>
                  </div>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="inline-block rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-900 shadow-2xs">
                    {evt.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 7,112 Cadre Vacancy Distribution */}
        <section id="vacancies" className="scroll-mt-20 rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="border-l-4 border-blue-600 pl-3.5 border-b border-slate-100 pb-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Post Matrix</span>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
              2. Cadre-Wise Vacancy Breakdown (Total 7,112 Posts)
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Official cadre distribution as sanctioned in TSLPRB Notification Rc No. 189/Rect./Rect.2/2026.
            </p>
          </div>

          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200/90">
            <table className="w-full min-w-[700px] text-left text-sm divide-y divide-slate-200">
              <thead className="bg-slate-50/90 font-bold text-slate-700 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 border-r border-slate-200/80">Code</th>
                  <th className="px-4 py-3 border-r border-slate-200/80">Cadre &amp; Post Name</th>
                  <th className="px-4 py-3 border-r border-slate-200/80">Department</th>
                  <th className="px-4 py-3 border-r border-slate-200/80">Gender Eligibility</th>
                  <th className="px-4 py-3 border-r border-slate-200/80">Share</th>
                  <th className="px-4 py-3 text-right font-bold">Vacancies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {VACANCIES.map((v, idx) => {
                  const pct = Math.round((v.vacancies / TOTAL_VACANCIES) * 100);
                  return (
                    <tr key={v.postCode} className={idx % 2 === 1 ? "bg-slate-50/40 hover:bg-blue-50/30" : "bg-white hover:bg-blue-50/30"}>
                      <td className="px-4 py-3 font-bold border-r border-slate-100">
                        <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-800 font-bold font-mono">
                          {v.postCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 border-r border-slate-100">
                        {v.postName}
                      </td>
                      <td className="px-4 py-3 text-slate-700 border-r border-slate-100 font-medium">
                        {v.department}
                      </td>
                      <td className="px-4 py-3 text-slate-700 border-r border-slate-100">
                        <span className="inline-block rounded-md bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 border border-slate-200/80">
                          {v.genderEligibility}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 border-r border-slate-100 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden hidden sm:block">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.max(pct, 2)}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-800">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {v.vacancies.toLocaleString("en-IN")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                <tr>
                  <td colSpan={5} className="px-4 py-3.5 text-right border-r border-slate-200 uppercase tracking-wider text-xs sm:text-sm font-bold text-slate-700">
                    Total Notified Vacancies
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-900 text-base sm:text-lg font-bold">
                    {TOTAL_VACANCIES.toLocaleString("en-IN")} Posts
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Full-Width Exam Preparation Callout Banner Immediately After Section 2 */}
        <section className="rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-emerald-50/60 p-6 sm:p-7 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-blue-300 bg-blue-100/80 text-blue-900 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Free Exam Preparation
              </span>
              <span className="rounded-md border border-emerald-300 bg-emerald-100 text-emerald-950 px-3 py-1 text-xs font-bold">
                58 Full Papers &bull; 11,600 Questions
              </span>
            </div>
            <h3 className="mt-3 text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              Practice 58 Full-Length Mock Tests Free
            </h3>
            <p lang="te" className="font-telugu mt-1 text-sm sm:text-base font-semibold text-blue-900 leading-[1.85]">
              తెలంగాణ పోలీస్ కానిస్టేబుల్ 58 పూర్తిస్థాయి మాక్ టెస్టులు ఉచితంగా ప్రాక్టీస్ చేయండి
            </p>
            <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed max-w-xl font-normal">
              Train for the 200-question, 3-hour Preliminary Written Test with authentic OMR countdown timers, 0.20 negative marking, and bilingual step-by-step solutions.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs">
                ⏱️ 180 Mins Timed
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs">
                🎯 0.20 Negative Marking
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs">
                🌐 Bilingual (English &amp; Telugu)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs">
                📝 OMR Sheet Mode
              </span>
            </div>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              href="/mock-tests/telangana/police-constable-free-mock-test"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-6 py-3.5 text-sm sm:text-base transition shadow-sm text-center"
            >
              Start Practicing Free Mock Tests →
            </Link>
            <a
              href="https://www.tgprb.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold px-4 py-3.5 text-sm border border-slate-200/90 shadow-2xs transition text-center"
            >
              TSLPRB Portal (tgprb.in) ↗
            </a>
          </div>
        </section>

        {/* 3. Application Fee Structure */}
        <section id="fees" className="scroll-mt-20 rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="border-l-4 border-blue-600 pl-3.5 border-b border-slate-100 pb-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Fee Details</span>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
              3. Application Fee Structure &amp; Concessions
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Prescribed examination fee for online registration via payment gateway.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4.5">
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-5 flex flex-col justify-between">
              <div>
                <span className="inline-block rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-800">
                  General / OC &amp; BC
                </span>
                <p className="mt-2.5 text-2xl sm:text-3xl font-bold text-slate-900">₹800</p>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  For OC, BC, and EWS candidates belonging to the State of Telangana.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/70 text-xs text-slate-600 font-medium">
                Online Mode: UPI / Net Banking / Debit Card
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-5 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-block rounded-md border border-emerald-300 bg-emerald-100 text-emerald-950 px-2.5 py-1 text-xs font-bold">
                    TS SC &amp; ST (50% Concession)
                  </span>
                </div>
                <p className="mt-2.5 text-2xl sm:text-3xl font-bold text-emerald-950">₹400</p>
                <p className="mt-2 text-sm text-emerald-900 leading-relaxed font-medium">
                  Concession rate for Scheduled Castes and Scheduled Tribes belonging to Telangana State.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200 text-xs text-emerald-900 font-semibold">
                Must possess valid Telangana Community Certificate
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-5 flex flex-col justify-between">
              <div>
                <span className="inline-block rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-800">
                  All Other States
                </span>
                <p className="mt-2.5 text-2xl sm:text-3xl font-bold text-slate-900">₹800</p>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  Candidates belonging to States other than Telangana must pay full fee regardless of category.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/70 text-xs text-slate-600 font-medium">
                Treated under Open Competition (OC)
              </div>
            </div>
          </div>
        </section>

        {/* 4. Pay Scale & Monthly Salary */}
        <section id="salary" className="scroll-mt-20 rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="border-l-4 border-blue-600 pl-3.5 border-b border-slate-100 pb-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Remuneration</span>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
              4. Pay Scale &amp; Monthly Salary Structure
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Revised RPS scale, allowances, and net monthly take-home salary breakdown.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4.5 text-sm">
            <div className="rounded-xl border border-slate-200/90 p-5 bg-slate-50/60">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Revised RPS Scale</span>
              <p className="mt-1.5 text-xl sm:text-2xl font-bold text-slate-900">₹24,280 – ₹72,850</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Governed by Telangana State Revised Pay Rules. Basic salary begins at ₹24,280 with annual grade increments reaching up to ₹72,850.
              </p>
            </div>
            <div className="rounded-xl border border-blue-200/80 p-5 bg-blue-50/40">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Estimated Monthly Gross</span>
              <p className="mt-1.5 text-xl sm:text-2xl font-bold text-blue-950">₹34,000 – ₹39,000 / mo</p>
              <p className="mt-2 text-sm leading-relaxed text-blue-900/90 font-medium">
                Includes Basic Pay + Dearness Allowance (DA) + House Rent Allowance (11% to 24% by city) + Medical &amp; Kit Allowance.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200/80 p-5 bg-emerald-50/40">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Perks &amp; Entitlements</span>
              <p className="mt-1.5 text-xl sm:text-2xl font-bold text-emerald-950">EHS &amp; Pension</p>
              <p className="mt-2 text-sm leading-relaxed text-emerald-900 font-medium">
                Comprehensive cashless healthcare under Employee Health Scheme (EHS), contributory pension, annual leaves, and special duty allowances.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Eligibility Criteria & Age Limits */}
        <section id="eligibility" className="scroll-mt-20 rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="border-l-4 border-blue-600 pl-3.5 border-b border-slate-100 pb-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Eligibility</span>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
              5. Age Limits &amp; G.O. Ms No. 87 5-Year Age Relaxation
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Age benchmarked as of 1st July 2026. The Government of Telangana issued G.O. Ms No. 87 granting a 5-year upper age relaxation.
            </p>
          </div>

          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200/90">
            <table className="w-full min-w-[650px] text-left text-sm divide-y divide-slate-200">
              <thead className="bg-slate-50/90 font-bold text-slate-700 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 border-r border-slate-200/80">Category</th>
                  <th className="px-4 py-3 border-r border-slate-200/80">Permissible Age Range</th>
                  <th className="px-4 py-3">Statutory Basis &amp; Relaxation Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {AGE_LIMITS.map((a, idx) => (
                  <tr key={a.category} className={idx % 2 === 1 ? "bg-slate-50/40" : "bg-white"}>
                    <td className="px-4 py-3 font-semibold text-slate-900 border-r border-slate-100">{a.category}</td>
                    <td className="px-4 py-3 font-bold text-blue-950 border-r border-slate-100 whitespace-nowrap">{a.ageRange}</td>
                    <td className="px-4 py-3 text-slate-700 text-xs sm:text-sm leading-relaxed">{a.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs sm:text-sm text-slate-700 space-y-1.5 leading-relaxed">
              <strong className="block text-slate-900 font-bold text-sm">Educational Qualification:</strong>
              <p>Must have passed Intermediate (10+2) or its equivalent recognized by the Telangana State Board of Intermediate Education as on 29th July 2026.</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 text-xs sm:text-sm text-blue-950 space-y-1.5 leading-relaxed">
              <strong className="block text-blue-950 font-bold text-sm">SC / ST Concession &amp; Technical Requirements:</strong>
              <p>SC &amp; ST candidates must have passed SSC (10th) and appeared for both 1st &amp; 2nd year Intermediate exams. Fire Fighter posts mandate a valid Light Motor Vehicle (LMV) license.</p>
            </div>
          </div>
        </section>

        {/* 6. Selection Process Flow */}
        <section id="selection" className="scroll-mt-20 rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="border-l-4 border-blue-600 pl-3.5 border-b border-slate-100 pb-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Selection Stages</span>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
              6. 4-Stage Selection Procedure
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Stage-by-stage progression from screening prelims to final merit list.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SELECTION_STAGES.map((st) => (
              <div key={st.stage} className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4.5 flex flex-col justify-between hover:border-blue-300 hover:bg-blue-50/20 transition">
                <div>
                  <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold uppercase text-blue-900">
                    {st.stage}
                  </span>
                  <h3 className="mt-2.5 text-sm sm:text-base font-bold text-slate-900">{st.title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">{st.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. PMT & PET Physical Standards */}
        <section id="physical" className="scroll-mt-20 rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="border-l-4 border-blue-600 pl-3.5 border-b border-slate-100 pb-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Physical Tests</span>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
              7. Physical Measurements (PMT) &amp; Physical Efficiency (PET)
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Prescribed physical standards and RFID-monitored athletic events.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-slate-200/90 overflow-hidden bg-white">
              <div className="bg-slate-50 px-4 py-3 font-bold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-200">
                Physical Measurement Standards (PMT)
              </div>
              <div className="p-4 sm:p-5 space-y-3.5 text-sm text-slate-700">
                <div className="border-b border-slate-100 pb-3">
                  <strong className="block text-slate-900 font-bold">Men (General, BC, SC):</strong>
                  <p className="text-slate-700 mt-0.5">Height: Minimum 167.6 cms</p>
                  <p className="text-slate-700">Chest: Minimum 86.3 cms (5 cms minimum expansion)</p>
                </div>
                <div className="border-b border-slate-100 pb-3">
                  <strong className="block text-slate-900 font-bold">Men (ST &amp; Agency Aboriginal Tribes):</strong>
                  <p className="text-slate-700 mt-0.5">Height: Minimum 160.0 cms</p>
                  <p className="text-slate-700">Chest: Minimum 80.0 cms (3 cms expansion)</p>
                </div>
                <div className="border-b border-slate-100 pb-3">
                  <strong className="block text-slate-900 font-bold">Women (General, BC, SC):</strong>
                  <p className="text-slate-700 mt-0.5">Height: Minimum 152.5 cms</p>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold">Women (ST &amp; Agency Aboriginal Tribes):</strong>
                  <p className="text-slate-700 mt-0.5">Height: Minimum 150.0 cms</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200/80 overflow-hidden bg-white">
              <div className="bg-blue-50/70 px-4 py-3 font-bold text-xs text-blue-950 uppercase tracking-wider border-b border-blue-100">
                Physical Efficiency Test Events (PET)
              </div>
              <div className="p-4 sm:p-5 space-y-3.5 text-sm text-slate-700">
                <div className="border-b border-slate-100 pb-3">
                  <strong className="block text-slate-900 font-bold">1600 Meters Run (Men Candidates):</strong>
                  <p className="text-slate-700 mt-0.5">Max Time: 7 Minutes 15 Seconds (Mandatory Qualifying Event &bull; Graded for AR/TSSP)</p>
                </div>
                <div className="border-b border-slate-100 pb-3">
                  <strong className="block text-slate-900 font-bold">800 Meters Run (Women Candidates):</strong>
                  <p className="text-slate-700 mt-0.5">Max Time: 5 Minutes 20 Seconds (Mandatory Qualifying Event &bull; Graded for AR/TSSP)</p>
                </div>
                <div className="border-b border-slate-100 pb-3">
                  <strong className="block text-slate-900 font-bold">Long Jump:</strong>
                  <p className="text-slate-700 mt-0.5">Men: Minimum 4.00 Meters | Women: Minimum 2.50 Meters (Qualifying)</p>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold">Shot Put:</strong>
                  <p className="text-slate-700 mt-0.5">Men (7.26 Kg): Min 6.00 Meters | Women (4 Kg): Min 4.00 Meters (Qualifying)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Exam Pattern & Qualifying Marks */}
        <section id="pattern" className="scroll-mt-20 rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="border-l-4 border-blue-600 pl-3.5 border-b border-slate-100 pb-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Exam Scheme</span>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
              8. Written Examination Pattern &amp; Qualifying Marks
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              OMR test configuration, time allotment, and Para 16(A) minimum qualifying marks.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center">
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4">
              <span className="text-xs font-semibold uppercase text-slate-500 block">Total Questions</span>
              <strong className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 block">200 Qs</strong>
              <span className="text-xs text-slate-600 block mt-0.5">Objective MCQs</span>
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4">
              <span className="text-xs font-semibold uppercase text-slate-500 block">Total Marks</span>
              <strong className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 block">200 Marks</strong>
              <span className="text-xs text-slate-600 block mt-0.5">1 Mark Per Question</span>
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4">
              <span className="text-xs font-semibold uppercase text-slate-500 block">Duration</span>
              <strong className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 block">3 Hours</strong>
              <span className="text-xs text-slate-600 block mt-0.5">180 Minutes Timed</span>
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4">
              <span className="text-xs font-semibold uppercase text-slate-500 block">Negative Marking</span>
              <strong className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 block">20% (-0.20)</strong>
              <span className="text-xs text-slate-600 block mt-0.5">Per Wrong Answer</span>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200/90 overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 font-bold text-xs text-slate-700 uppercase tracking-wider border-b border-slate-200 flex justify-between items-center">
              <span>Category Minimum Qualifying Marks (Para 16(A))</span>
              <span className="text-xs font-normal text-slate-500">Applies to both PWT and FWE</span>
            </div>
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center bg-white">
              {QUALIFYING_MARKS.map((qm) => (
                <div key={qm.category} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 block">{qm.category}</span>
                  <strong className="text-2xl sm:text-3xl font-bold text-slate-900 block mt-1.5">{qm.pwtPercentage}</strong>
                  <span className="text-xs sm:text-sm text-blue-900 font-bold block mt-1">{qm.pwtMarks}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Annexure-II Syllabus */}
        <section id="syllabus" className="scroll-mt-20 rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="border-l-4 border-blue-600 pl-3.5 border-b border-slate-100 pb-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Annexure-II Curriculum</span>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
              9. Complete Subject-wise Syllabus (PWT &amp; FWE)
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Standard Intermediate level curriculum prescribed in official notification across 8 key subjects.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4.5">
            {SUBJECTS.map((sub, idx) => (
              <div key={sub.name} className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-5 hover:border-blue-300 hover:bg-blue-50/20 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-lg border border-blue-200 bg-blue-50 text-xs font-bold text-blue-900">
                      0{idx + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">{sub.name}</h3>
                  </div>
                  <span lang="te" className="font-telugu text-sm font-semibold text-blue-900 block mt-1 leading-[1.85]">{sub.teluguName}</span>
                  <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {sub.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/70">
                  <Link
                    href="/mock-tests/telangana/police-constable-free-mock-test"
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-blue-900 hover:text-blue-950 transition"
                  >
                    Practice {sub.name} Questions &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 10. Step-by-Step Online Application Guide */}
        <section id="how-to-apply" className="scroll-mt-20 rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="border-l-4 border-blue-600 pl-3.5 border-b border-slate-100 pb-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Application Steps</span>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
              10. Step-by-Step Online Application Process
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Official procedures for candidate registration and submission on the official portal.
            </p>
          </div>

          <div className="mt-5 space-y-3.5 text-xs sm:text-sm text-slate-700">
            <div className="flex gap-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 items-start">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-blue-200 bg-blue-50 text-blue-900 font-bold text-xs">
                1
              </span>
              <div>
                <strong className="text-slate-900 block font-bold text-sm">Portal Access:</strong>
                <p className="text-slate-700 mt-0.5">Navigate to the official TSLPRB portal at <strong>www.tgprb.in</strong>.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 items-start">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-blue-200 bg-blue-50 text-blue-900 font-bold text-xs">
                2
              </span>
              <div>
                <strong className="text-slate-900 block font-bold text-sm">Mobile Registration &amp; User ID:</strong>
                <p className="text-slate-700 mt-0.5">Use your primary active mobile phone number to authenticate via OTP.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 items-start">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-blue-200 bg-blue-50 text-blue-900 font-bold text-xs">
                3
              </span>
              <div>
                <strong className="text-slate-900 block font-bold text-sm">Online Fee Payment:</strong>
                <p className="text-slate-700 mt-0.5">Pay ₹800 (for OC/BC) or ₹400 (for TS SC/ST) online using Net Banking, UPI, or Debit card.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 items-start">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-blue-200 bg-blue-50 text-blue-900 font-bold text-xs">
                4
              </span>
              <div>
                <strong className="text-slate-900 block font-bold text-sm">Part-I Application Submission:</strong>
                <p className="text-slate-700 mt-0.5">Fill academic qualifications, post cadre preferences, and upload photo/signature.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 items-start">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-blue-200 bg-blue-50 text-blue-900 font-bold text-xs">
                5
              </span>
              <div>
                <strong className="text-slate-900 block font-bold text-sm">Download Acknowledgment:</strong>
                <p className="text-slate-700 mt-0.5">Save and print your completed application PDF with the unique Reference Number.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 11. Police Duties & Hierarchy */}
        <section id="duties" className="scroll-mt-20 rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="border-l-4 border-blue-600 pl-3.5 border-b border-slate-100 pb-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Career &amp; Duties</span>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
              11. Police Constable Responsibilities &amp; Promotion Ladder
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Operational expectations, law &amp; order responsibilities, and promotional hierarchy.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5 text-sm">
            <div className="space-y-3">
              <strong className="block text-slate-900 font-bold text-sm">Key Station Responsibilities:</strong>
              {DUTIES.map((d) => (
                <div key={d.title} className="rounded-xl border border-slate-200/90 p-4 bg-slate-50/50">
                  <span className="font-bold text-slate-900 block text-sm sm:text-base">{d.title}</span>
                  {d.teluguTitle && <span lang="te" className="font-telugu text-sm font-semibold text-blue-900 block mt-0.5 leading-[1.85]">{d.teluguTitle}</span>}
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">{d.description}</p>
                </div>
              ))}
            </div>

            <div>
              <strong className="block text-slate-900 font-bold text-sm mb-3">Police Career Advancement Ladder:</strong>
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-5 space-y-3.5 text-sm">
                {CAREER_GROWTH.map((step, idx) => (
                  <div key={step} className="flex items-center gap-3.5">
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-blue-200 bg-blue-50 text-blue-900 font-bold text-xs shrink-0">
                      0{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 12. Bilingual FAQs */}
        <section id="faqs" className="scroll-mt-20 rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="border-l-4 border-blue-600 pl-3.5 border-b border-slate-100 pb-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">FAQs</span>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold text-slate-900">
              12. Frequently Asked Questions (English &amp; Telugu)
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Official answers to common questions about eligibility, events, and examination patterns.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4.5">
            {BILINGUAL_FAQS.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-slate-200/90 p-5 bg-slate-50/50 hover:border-slate-300 transition flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {faq.question}
                  </h3>
                  {faq.teluguQuestion && (
                    <p lang="te" className="font-telugu mt-1 text-sm font-semibold text-blue-900 leading-[1.85]">
                      {faq.teluguQuestion}
                    </p>
                  )}
                  <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {faq.answer}
                  </p>
                  {faq.teluguAnswer && (
                    <p lang="te" className="font-telugu mt-1.5 text-xs sm:text-sm text-slate-700 leading-[1.85]">
                      {faq.teluguAnswer}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Critical Candidate Notes & Official Portal Reference Card */}
        <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            <strong className="block text-slate-900 font-bold text-sm sm:text-base">Critical Candidate Notes:</strong>
            <p>&bull; <strong>Negative Marking:</strong> 20% mark (0.20) is deducted per wrong answer in the PWT.</p>
            <p>&bull; <strong>1600m Run:</strong> Mandatory qualifying event for Men candidates (7 mins 15 secs).</p>
            <p>&bull; <strong>800m Run:</strong> Mandatory qualifying event for Women candidates (5 mins 20 secs).</p>
            <p>&bull; <strong>Age Relief:</strong> G.O. Ms No. 87 provides +5 years across all categories.</p>
          </div>

          <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block">
                Official Verification Portal
              </span>
              <h4 className="mt-1 text-base font-bold text-slate-900">
                TSLPRB Official Recruitment Website
              </h4>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                Online applications, hall tickets, and key objection windows are processed exclusively on the official recruitment website.
              </p>
            </div>
            <div className="mt-4">
              <a
                href="https://www.tgprb.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 text-xs sm:text-sm transition shadow-2xs"
              >
                Visit tgprb.in Official Portal &rarr;
              </a>
            </div>
          </div>
        </section>

      </div>

      {/* Modern Clean Footer */}
      <footer className="mt-14 border-t border-slate-200/90 bg-white py-10 text-center text-xs sm:text-sm text-slate-600">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-bold text-slate-800 text-sm sm:text-base">Varadhi Prep &bull; Examination Information &amp; Preparation Portal</p>
          <p className="mt-1.5 text-slate-600 text-xs sm:text-sm">
            Data sourced from official TSLPRB Notification Rc No. 189 / Rect. / Rect.2 / 2026. Official website:{" "}
            <a href="https://www.tgprb.in" target="_blank" rel="noopener noreferrer" className="text-blue-900 underline font-semibold hover:text-blue-950">
              www.tgprb.in
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
