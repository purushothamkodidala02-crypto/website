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

  const title = "Telangana Police Constable Notification 2026 (7,112 Posts): Syllabus Marks Wise & Weightage, Reasoning Syllabus, Telugu PDF Download";
  const description =
    "TSLPRB Telangana Police Constable Notification 2026 for 7,112 posts. Check TS constable syllabus marks wise, TS constable syllabus weightage marks, comprehensive TS constable reasoning syllabus, and get TS constable syllabus PDF download in Telugu (748 KB). Includes salary in-hand, medical 6/6 standards, and PET 100-mark slabs.";
  const canonical = absoluteUrl(`/news/${PRIMARY_SLUG}`);

  return {
    title,
    description,
    keywords: [
      "Telangana Police Constable Notification 2026",
      "TS Police Constable Notification 2026 PDF",
      "TS Police Constable Notification 2026 PDF download",
      "ts constable syllabus weightage marks",
      "ts constabel syllabus weightage marks",
      "ts constable syllabus pdf download in telugu",
      "ts constable syllabus marks wise",
      "ts constable reasoning syllabus",
      "TS Constable Reasoning Syllabus Topics",
      "TS Constable Syllabus Marks Wise Distribution",
      "TS Constable Syllabus Weightage Marks",
      "TS Constable Syllabus PDF Download in Telugu",
      "TSLPRB Police Constable 7112 Vacancies",
      "TS Police Constable Post Code 21 Civil 22 AR 24 TSSP",
      "Telangana Police Constable Salary in hand pay scale",
      "TS Police Constable Medical Standards Eye Sight 6/6",
      "TS Police Constable Color Blindness test Ishihara",
      "TS Police Constable PET Marks 1600m run timings",
      "TS Police Constable 800m run timings women marks table",
      "TS Police Constable certificate verification documents required",
      "TS Police Constable 95 percent local reservation presidential order",
      "TS Police Constable driving license bonus marks weightage",
      "Telangana Police Constable Syllabus 2026",
      "TS Police Constable PWT Exam Pattern",
      "TS Police Constable Age Limit GO Ms 87",
      "TS Police Constable PET PMT Standards",
      "TG Police Constable Notification 2026",
      "TS Police Constable Apply Online 2026",
      "TSLPRB Constable official website tgprb in",
      "తెలంగాణ పోలీస్ కానిస్టేబుల్ నోటిఫికేషన్ 2026",
      "తెలంగాణ కానిస్టేబుల్ సిలబస్ మార్కుల వెయిటేజీ",
      "తెలంగాణ పోలీస్ కానిస్టేబుల్ సిలబస్ పీడీఎఫ్ డౌన్‌లోడ్ తెలుగు",
      "తెలంగాణ కానిస్టేబుల్ రీజనింగ్ సిలబస్",
      "తెలంగాణ కానిస్టేబుల్ 7112 పోస్టుల వివరాలు",
      "తెలంగాణ పోలీస్ కానిస్టేబుల్ శాలరీ పే స్కేల్ వివరాలు",
      "పోలీస్ కానిస్టేబుల్ మెడికల్ టెస్ట్ & కంటి చూపు 6/6 నిబంధనలు",
      "1600 మీటర్ల పరుగు ఈవెంట్స్ మార్కుల పట్టిక",
      "సర్టిఫికెట్ వెరిఫికేషన్ అవసరమైన డాక్యుమెంట్లు",
      "తెలంగాణ పోలీస్ సిలబస్ 2026",
      "తెలంగాణ కానిస్టేబుల్ అధికారిక నోటిఫికేషన్ పీడీఎఫ్ డౌన్‌లోడ్",
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
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: "Telangana Police Constable Notification 2026 - 7,112 Vacancies Official Notification PDF",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/opengraph-image")],
    },
  };
}

// ── Official Recruitment Data (7,112 Vacancies) ────

const VACANCIES = [
  { postCode: "21", postName: "Police Constable (Civil)", department: "Police Department", cadreType: "District Cadre (95% Local)", genderEligibility: "Men & Women", vacancies: 4965, share: "69.8%", roleSummary: "Law & order, crime investigation, public order, and citizen safety in police stations." },
  { postCode: "22", postName: "Police Constable (Armed Reserve - AR)", department: "Police Department", cadreType: "District Cadre (95% Local)", genderEligibility: "Men & Women", vacancies: 1250, share: "17.6%", roleSummary: "Armed reserve units, VIP escort, bandobast security, and riot control management." },
  { postCode: "23", postName: "Police Constable (SAR CPL)", department: "Police Department", cadreType: "Special Armed Reserve (State)", genderEligibility: "Men Only", vacancies: 100, share: "1.4%", roleSummary: "Special Armed Reserve Central Police Lines for specialized state-wide emergency deployments." },
  { postCode: "24", postName: "Police Constable (TSSP Battalions)", department: "Police Department", cadreType: "Battalion Cadre (Statewide)", genderEligibility: "Men Only", vacancies: 500, share: "7.0%", roleSummary: "Telangana State Special Police active battalions for security and tactical deployments." },
  { postCode: "26", postName: "Fire Fighter (Driver Operator)", department: "Disaster Response & Fire Services", cadreType: "Multi-Zonal Cadre", genderEligibility: "Men (Valid LMV)", vacancies: 225, share: "3.2%", roleSummary: "Fire tender operation, firefighting operations, disaster mitigation, and emergency rescue." },
  { postCode: "27", postName: "Warder (Male)", department: "Prisons & Correctional Services", cadreType: "Zonal Cadre", genderEligibility: "Men Only", vacancies: 62, share: "0.9%", roleSummary: "Security, reformatory programs, and inmate custody in central and district jails." },
  { postCode: "28", postName: "Warder (Female)", department: "Prisons & Correctional Services", cadreType: "Zonal Cadre", genderEligibility: "Women Only", vacancies: 10, share: "0.1%", roleSummary: "Custodial surveillance, inmate welfare, and correctional tasks in women prisons." },
];

const TOTAL_VACANCIES = 7112;

const SCHEDULE_EVENTS = [
  {
    title: "Official Notification Issued",
    teluguTitle: "అధికారిక నోటిఫికేషన్ విడుదల",
    date: "29 July 2026",
    status: "Completed",
    detail: "Recruitment board sanctioned 7,112 posts across 7 cadres.",
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

const SALARY_COMPONENTS = [
  { item: "Pay Scale (Revised Pay Scales)", amount: "₹24,280 – ₹72,850", note: "Sanctioned RPS grade for Police Constable" },
  { item: "Basic Pay (Initial Entry Level)", amount: "₹24,280", note: "Starting basic pay at minimum of scale" },
  { item: "Dearness Allowance (DA @ ~33.67%)", amount: "₹8,175", note: "Applicable state DA percentage revised periodically" },
  { item: "House Rent Allowance (HRA - Hyderabad/GHMC @ 24%)", amount: "₹5,827", note: "24% for Hyderabad; 16% for District HQs (~₹3,885); 12% for rural areas (~₹2,914)" },
  { item: "City Compensatory Allowance (CCA)", amount: "₹400 – ₹700", note: "Tier-wise city posting compensatory allowance" },
  { item: "Police Uniform / Kit Maintenance Allowance", amount: "₹500", note: "Monthly sanctioned police uniform allowance" },
  { item: "Gross Monthly Salary (Hyderabad / GHMC)", amount: "₹39,182", note: "Gross pay before mandatory state deductions" },
  { item: "Gross Monthly Salary (District Headquarters)", amount: "₹37,240", note: "Gross pay in district headquarters / municipal corporations" },
  { item: "Gross Monthly Salary (Other Rural Centers)", amount: "₹36,269", note: "Gross pay in sub-divisions and mandals" },
];

const SALARY_DEDUCTIONS = [
  { item: "Contributory Pension Scheme (CPS / PRAN - 10% of Basic+DA)", amount: "₹3,245", note: "Government contributes matching 14% to pension corpus" },
  { item: "Professional Tax (PT)", amount: "₹200", note: "Statutory state municipal tax" },
  { item: "Employee Health Scheme (EHS) / TSGLI", amount: "₹300", note: "Cashless healthcare coverage for employee & family" },
  { item: "Total Monthly Deductions", amount: "₹3,745", note: "Total deductions deducted from gross salary" },
  { item: "Net In-Hand Salary (Take-Home in Hyderabad)", amount: "₹35,437", note: "Net credited into bank account every month" },
  { item: "Net In-Hand Salary (Take-Home in District HQs)", amount: "₹33,495", note: "Net take-home pay in major towns and district centers" },
  { item: "Net In-Hand Salary (Take-Home in Rural Areas)", amount: "₹32,524", note: "Net take-home pay in mandal headquarters" },
];

const AGE_LIMITS = [
  {
    category: "General / Open Competition (OC)",
    ageRange: "18 to 27 Years",
    detail: "Base 18–22 years + 5 years general relaxation under G.O. Ms No. 87.",
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
    weightage: "Screening Only (Qualifying for Stage 2)",
  },
  {
    step: "Stage 2",
    name: "Physical Measurement Test (PMT)",
    teluguName: "శారీరక కొలతల పరీక్ష",
    description: "Digital sensor measurement of height and chest (for men) and height (for women). Candidates must satisfy the mandatory minimum thresholds.",
    weightage: "Mandatory Qualifying (No Marks)",
  },
  {
    step: "Stage 3",
    name: "Physical Efficiency Test (PET)",
    teluguName: "శారీరక సామర్థ్య పరీక్ష (ఈవెంట్స్)",
    description: "RFID-monitored athletic events: 1600m run (men) or 800m run (women), followed by Long Jump and Shot Put. Crucial: The run event carries 100 marks for AR & TSSP cadres!",
    weightage: "Qualifying for Civil/Fire | 100 Marks for AR/TSSP",
  },
  {
    step: "Stage 4",
    name: "Final Written Examination (FWE)",
    teluguName: "చివరి రాత పరీక్ష (మెయిన్స్)",
    description: "Final written examination. 200 marks for Civil, Fire, and Warder posts; 100 marks for AR, SAR CPL, and TSSP posts.",
    weightage: "Civil: 200 Marks | AR/TSSP: 100 Marks (Total: 200 with PET)",
  },
];

const MEN_RUN_SLABS = [
  { timing: "4 Minutes 15 Seconds or less", marks: "100 Marks", status: "Exceptional / Maximum" },
  { timing: "4 Min 16 Sec to 4 Min 35 Sec", marks: "95 Marks", status: "Very Good" },
  { timing: "4 Min 36 Sec to 4 Min 55 Sec", marks: "90 Marks", status: "Very Good" },
  { timing: "4 Min 56 Sec to 5 Min 15 Sec", marks: "85 Marks", status: "Good" },
  { timing: "5 Min 16 Sec to 5 Min 35 Sec", marks: "80 Marks", status: "Good" },
  { timing: "5 Min 36 Sec to 5 Min 55 Sec", marks: "75 Marks", status: "Above Average" },
  { timing: "5 Min 56 Sec to 6 Min 15 Sec", marks: "70 Marks", status: "Average" },
  { timing: "6 Min 16 Sec to 6 Min 35 Sec", marks: "65 Marks", status: "Satisfactory" },
  { timing: "6 Min 36 Sec to 6 Min 55 Sec", marks: "60 Marks", status: "Fair" },
  { timing: "6 Min 56 Sec to 7 Min 15 Sec", marks: "50 Marks", status: "Qualifying Threshold" },
  { timing: "More than 7 Min 15 Seconds", marks: "0 Marks", status: "Disqualified" },
];

const WOMEN_RUN_SLABS = [
  { timing: "3 Minutes 05 Seconds or less", marks: "100 Marks", status: "Exceptional / Maximum" },
  { timing: "3 Min 06 Sec to 3 Min 20 Sec", marks: "95 Marks", status: "Very Good" },
  { timing: "3 Min 21 Sec to 3 Min 35 Sec", marks: "90 Marks", status: "Very Good" },
  { timing: "3 Min 36 Sec to 3 Min 50 Sec", marks: "85 Marks", status: "Good" },
  { timing: "3 Min 51 Sec to 4 Min 05 Sec", marks: "80 Marks", status: "Good" },
  { timing: "4 Min 06 Sec to 4 Min 20 Sec", marks: "75 Marks", status: "Above Average" },
  { timing: "4 Min 21 Sec to 4 Min 35 Sec", marks: "70 Marks", status: "Average" },
  { timing: "4 Min 36 Sec to 4 Min 50 Sec", marks: "65 Marks", status: "Satisfactory" },
  { timing: "4 Min 51 Sec to 5 Min 05 Sec", marks: "60 Marks", status: "Fair" },
  { timing: "5 Min 06 Sec to 5 Min 20 Sec", marks: "50 Marks", status: "Qualifying Threshold" },
  { timing: "More than 5 Min 20 Seconds", marks: "0 Marks", status: "Disqualified" },
];

const MEDICAL_STANDARDS = [
  { parameter: "Distant Vision (Without Glasses)", rightEye: "6/6 (Snellen)", leftEye: "6/6 (Snellen)", rule: "Must be 6/6 uncorrected in both eyes without spectacles or contact lenses." },
  { parameter: "Near Vision (Without Glasses)", rightEye: "0/5 (Snellen)", leftEye: "0/5 (Snellen)", rule: "Must be 0/5 uncorrected in both eyes." },
  { parameter: "Color Vision (Ishihara 38 Plates)", rightEye: "Normal Color Perception", leftEye: "Normal Color Perception", rule: "Strict disqualification for Color Blindness (Red-Green deficiency) or partial color blindness." },
  { parameter: "Field of Vision", rightEye: "Full Normal Field", leftEye: "Full Normal Field", rule: "Each eye must have an uninterrupted full field of vision." },
  { parameter: "Night Vision (Nyctalopia)", rightEye: "Normal", leftEye: "Normal", rule: "Night blindness is a strict ground for rejection." },
  { parameter: "Squint (Strabismus)", rightEye: "No Squint", leftEye: "No Squint", rule: "Presence of squint or chronic eye disorders leads to immediate disqualification." },
  { parameter: "Corneal Refractive Surgery (LASIK / PRK)", rightEye: "Evaluated by Board", leftEye: "Evaluated by Board", rule: "Subject to medical board evaluation for clear vision." },
];

const PHYSICAL_DEFECTS_DISQUALIFIED = [
  { defect: "Knock Knees", impact: "Inability to run, march, or stand at attention without knees touching." },
  { defect: "Flat Foot", impact: "Absence of normal foot arch causing severe fatigue during long standing or running." },
  { defect: "Varicose Veins", impact: "Swollen or twisted veins in legs that impair running and long standing endurance." },
  { defect: "Pigeon Chest & Ribcage Deformity", impact: "Abnormal ribcage contour restricting chest expansion below the mandatory 5 cm threshold." },
  { defect: "Deformed Toes or Missing Fingers", impact: "Toe or finger deformities that impede weapon handling, running, or boot endurance." },
  { defect: "Joint Stiffness or Unhealed Fractures", impact: "Any malunited bone fracture or restricted range of motion in elbow, shoulder, knee, or ankle." },
  { defect: "Severe Speech Impediment", impact: "Severe stammering that interferes with radio communication and commanding duties." },
  { defect: "Ear Discharge or Hearing Defects", impact: "Chronic ear infection, perforated eardrum, or hearing loss." },
];

const DOCUMENTS_CHECKLIST = [
  { item: "SSC (10th Class) Marks Memo", purpose: "Authentic proof of Date of Birth (DOB), candidate name, and father's name.", issuingAuthority: "State Board of Secondary Education" },
  { item: "Intermediate (10+2) Pass Certificate & Memo", purpose: "Proof of prescribed minimum educational qualification.", issuingAuthority: "Telangana State Board of Intermediate Education or equivalent" },
  { item: "Study / Bonafide Certificates (Classes 1st to 7th)", purpose: "Mandatory for establishing 95% Local Candidature (minimum 4 consecutive years of study).", issuingAuthority: "Heads of Recognized Schools" },
  { item: "Residence Certificate (If privately studied)", purpose: "For candidates who did not study in school for 4 consecutive years; certifies 4-year local stay.", issuingAuthority: "Tahsildar / Mandal Revenue Officer (MRO)" },
  { item: "Community / Caste Certificate (SC / ST / BC)", purpose: "Claiming statutory age relaxation and category reservation benefits.", issuingAuthority: "MeeSeva / Revenue Department, Govt of Telangana" },
  { item: "Non-Creamy Layer (NCL) Certificate", purpose: "Mandatory for BC candidates claiming Backward Class reservation; must be issued within valid financial year.", issuingAuthority: "Competent Revenue Authority (Tahsildar)" },
  { item: "Economically Weaker Section (EWS) Certificate", purpose: "Income and Asset Certificate for claiming 10% EWS reservation.", issuingAuthority: "Tahsildar / Competent Revenue Officer" },
  { item: "Agency / Scheduled Area ST Certificate", purpose: "Claiming PMT height relaxations (160 cm for men, 150 cm for women) in notified Scheduled Areas.", issuingAuthority: "Tahsildar / Project Officer ITDA" },
  { item: "Valid Driving License (LMV / HMV)", purpose: "Claiming 3 bonus marks for Civil/AR/TSSP posts, and mandatory qualification for Fire Fighter posts.", issuingAuthority: "Regional Transport Authority (RTA)" },
  { item: "Home Guard Service Certificate", purpose: "Claiming Home Guard age relaxation (up to 45 years) with proof of minimum 360 days service.", issuingAuthority: "Superintendent of Police / Unit Head" },
  { item: "Discharge Book / Ex-Servicemen Certificate", purpose: "Claiming Ex-Servicemen age relaxation and reservation quota.", issuingAuthority: "Zilla Sainik Welfare Officer / Armed Forces Unit" },
];

const QUALIFYING_MARKS = [
  { category: "Open Competition (OC) & EWS", pwtPercent: "30%", pwtMinMarks: "60 Marks / 200", fwePercent: "40%", fweMinMarks: "80 / 200 (Civil) | 40 / 100 (AR)" },
  { category: "Backward Classes (BC)", pwtPercent: "25%", pwtMinMarks: "50 Marks / 200", fwePercent: "35%", fweMinMarks: "70 / 200 (Civil) | 35 / 100 (AR)" },
  { category: "SC, ST, Ex-Servicemen & Home Guards", pwtPercent: "20%", pwtMinMarks: "40 Marks / 200", fwePercent: "30%", fweMinMarks: "60 / 200 (Civil) | 30 / 100 (AR)" },
];

const SUBJECTS = [
  {
    number: "01",
    name: "English Language",
    teluguName: "ఇంగ్లీష్ లాంగ్వేజ్",
    weightage: "15 - 20 Marks",
    level: "SSC Standard",
    topics: "Comprehension passage, vocabulary, synonyms & antonyms, spotting errors, grammar rules, prepositions, active & passive voice, sentence correction & idioms.",
  },
  {
    number: "02",
    name: "Arithmetic & Numerical Ability",
    teluguName: "అర్థమెటిక్ & సంఖ్యా సామర్థ్యం",
    weightage: "25 Marks",
    level: "SSC Standard",
    topics: "Number systems, LCM & HCF, fractions, percentages, averages, ratio & proportion, profit & loss, simple & compound interest, time & work, time & distance, mensuration.",
  },
  {
    number: "03",
    name: "General Science",
    teluguName: "జనరల్ సైన్స్ (ఫిజిక్స్, కెమిస్ట్రీ, బయాలజీ)",
    weightage: "25 Marks",
    level: "Intermediate Standard",
    topics: "Everyday science observations, basic physics, chemistry in daily life, human biology, nutrition, diseases & prevention, environmental ecology & public hygiene.",
  },
  {
    number: "04",
    name: "History of India & Indian Culture",
    teluguName: "భారత దేశ చరిత్ర & సంస్కృతి",
    weightage: "25 Marks",
    level: "Intermediate Standard",
    topics: "Ancient India, Delhi Sultanate, Mughal era, British rule, 1857 Revolt, socio-religious reform movements, Indian National Congress, Indian freedom struggle & national leaders.",
  },
  {
    number: "05",
    name: "Geography, Polity & Indian Economy",
    teluguName: "భౌగోళిక అంశాలు, పాలిటీ & భారత ఆర్థిక వ్యవస్థ",
    weightage: "25 Marks",
    level: "Intermediate Standard",
    topics: "Physical & Indian geography, rivers, climate, Constitution of India, fundamental rights & duties, Parliament, Judiciary, state planning, Indian economy & fiscal policy.",
  },
  {
    number: "06",
    name: "Current Events (National & International)",
    teluguName: "సమకాలీన అంశాలు (కరెంట్ అఫైర్స్)",
    weightage: "25 Marks",
    level: "Past 12 Months",
    topics: "Major events of the past 12 months, national & international summits, bilateral pacts, sports tournaments, prestigious awards, science & tech milestones, and central welfare schemes.",
  },
  {
    number: "07",
    name: "Reasoning & Mental Ability",
    teluguName: "రీజనింగ్ & మెంటల్ ఎబిలిటీ",
    weightage: "25 Marks",
    level: "Intermediate Standard",
    topics: "Analogy, series completion, coding-decoding, blood relations, direction sense, syllogisms, Venn diagrams, non-verbal spatial patterns, ranking & arithmetic reasoning.",
  },
  {
    number: "08",
    name: "Telangana Movement, History & Culture",
    teluguName: "తెలంగాణ ఉద్యమం, చరిత్ర & సంస్కృతి",
    weightage: "35 - 40 Marks (Highest)",
    level: "Intermediate Standard",
    topics: "History of Telangana (Satavahanas, Kakatiyas, Qutb Shahis, Asaf Jahis), Telangana armed struggle, 1969 agitation, statehood movement (1948–2014), art, literature, fairs, festivals, geography, rivers, irrigation projects, and state welfare schemes.",
  },
];

const BILINGUAL_FAQS = [
  {
    question: "What is the official vacancy count for Telangana Police Constable 2026?",
    answer: "TSLPRB has sanctioned a total of 7,112 vacancies: Police Constable Civil (Post Code 21 - 4,965), AR (Post Code 22 - 1,250), SAR CPL (Post Code 23 - 100), TSSP Battalions (Post Code 24 - 500), Fire Fighters (Post Code 26 - 225), Warder Male (Post Code 27 - 62), and Warder Female (Post Code 28 - 10).",
    teluguQuestion: "తెలంగాణ కానిస్టేబుల్ 2026 నోటిఫికేషన్‌లో మొత్తం ఖాళీల సంఖ్య ఎంత?",
    teluguAnswer: "తెలంగాణ పోలీస్ రిక్రూట్‌మెంట్ బోర్డు ద్వారా మొత్తం 7,112 పోస్టులను భర్తీ చేస్తున్నారు (పోస్ట్ కోడ్ 21 సివిల్ 4,965, పోస్ట్ కోడ్ 22 ఏఆర్ 1,250, పోస్ట్ కోడ్ 23 సార్ సిపిఎల్ 100, పోస్ట్ కోడ్ 24 టిఎస్ఎస్పి 500, పోస్ట్ కోడ్ 26 ఫైర్ 225, పోస్ట్ కోడ్ 27 & 28 జైలు వార్డర్స్ 72).",
  },
  {
    question: "What is the monthly in-hand take-home salary and pay scale for a Telangana Police Constable?",
    answer: "The official pay scale is ₹24,280 – ₹72,850 under the Revised Pay Scales (RPS). Factoring in Basic Pay (₹24,280), DA (~33.67% = ₹8,175), HRA (24% in Hyderabad = ₹5,827; 16% in district HQs = ₹3,885), CCA, and uniform allowance, the initial gross salary ranges from ₹36,269 to ₹39,182. After mandatory CPS pension (₹3,245), PT (₹200), and EHS health insurance deductions, the net take-home salary is approximately ₹32,500 to ₹35,500 per month.",
    teluguQuestion: "తెలంగాణ కానిస్టేబుల్ పే స్కేల్ మరియు ప్రతి నెలా చేతికి వచ్చే (ఇన్-హ్యాండ్) నికర వేతనం ఎంత?",
    teluguAnswer: "అధికారిక పే స్కేలు ₹24,280 – ₹72,850. ప్రారంభ బేసిక్ పే ₹24,280, డీఏ (33.67%), హెచ్‌ఆర్‌ఏ (హైదరాబాద్‌లో 24%, జిల్లాల్లో 16%) కలిపి మొత్తం స్థూల వేతనం నెలకు ₹36,269 నుండి ₹39,182 వరకు ఉంటుంది. సీపీఎస్ పెన్షన్, పీటీ, ఈహెచ్ఎస్ మినహాయింపులు పోను చేతికి వచ్చే నికర ఇన్-హ్యాండ్ శాలరీ నెలకు సుమారు ₹32,500 నుండి ₹35,500 వరకు అందుతుంది.",
  },
  {
    question: "What are the medical standards and eye sight (visual acuity) requirements?",
    answer: "Distant Vision must be 6/6 uncorrected in both eyes without glasses or contact lenses. Near Vision must be 0/5 in both eyes. Candidates must possess full field of vision. Color blindness (tested via Ishihara plates), night blindness, squint, knock-knees, flat foot, and varicose veins are strict grounds for disqualification by the Medical Board.",
    teluguQuestion: "పోలీస్ కానిస్టేబుల్ మెడికల్ పరీక్షలో కంటి చూపు (విజువల్ స్టాండర్డ్స్) మరియు అనర్హత నిబంధనలు ఏమిటి?",
    teluguAnswer: "అభ్యర్థులకు రెండు కళ్లలోనూ కళ్లద్దాలు లేకుండా డిస్టెంట్ విజన్ 6/6 మరియు నియర్ విజన్ 0/5 ఉండాలి. కలర్ బ్లైండ్‌నెస్ (ఇషిహారా టెస్ట్), రేచీకటి, మెల్లకన్ను, నాక్ నీస్ (మోకాళ్లు రాపిడి), ఫ్లాట్ ఫుట్, మరియు వెరికోస్ వెయిన్స్ ఉన్న అభ్యర్థులను మెడికల్ బోర్డు అనర్హులుగా ప్రకటిస్తుంది.",
  },
  {
    question: "How do PET marks work for AR, SAR CPL, and TSSP (Post Codes 22, 23, 24)?",
    answer: "For Civil Constable (Post Code 21), Fire Fighters, and Warders, the PET 1600m/800m run is qualifying only, and selection is 100% on the 200-mark FWE. But for AR (22), SAR CPL (23), and TSSP (24), the 1600m run (men) or 800m run (women) carries 100 marks based on timing slabs! The final merit is calculated for 200 marks total: FWE (100 Marks) + PET Run (100 Marks).",
    teluguQuestion: "ఏఆర్ మరియు టీఎస్‌ఎస్‌పీ (పోస్ట్ కోడ్స్ 22, 23, 24) పోస్టులకు ఈవెంట్స్ 100 మార్కుల విధానం ఎలా ఉంటుంది?",
    teluguAnswer: "సివిల్ కానిస్టేబుల్ (పోస్ట్ కోడ్ 21) కు ఈవెంట్స్ కేవలం క్వాలిఫైయింగ్ మాత్రమే (మెయిన్స్ 200 మార్కులు). అయితే ఏఆర్, సార్ సిపిఎల్, టీఎస్‌ఎస్‌పీ పోస్టులకు 1600 మీటర్ల / 800 మీటర్ల పరుగుకు సమయాన్ని బట్టి 100 మార్కులు కేటాయిస్తారు. మెయిన్స్ పరీక్ష 100 మార్కులు + ఈవెంట్స్ 100 మార్కులు కలిపి మొత్తం 200 మార్కులకు తుది మెరిట్ జాబితా తీస్తారు.",
  },
  {
    question: "What bonus marks are awarded for holding a driving license?",
    answer: "Candidates who possess a valid Light Motor Vehicle (LMV) or Heavy Motor Vehicle (HMV) driving license continuously for at least 2 years prior to the notification date receive 3 bonus marks added to their final score for Post Codes 21, 22, 23, and 24. For Post Code 26 (Fire Fighter), an LMV license is a mandatory qualification.",
    teluguQuestion: "డ్రైవింగ్ లైసెన్స్ ఉన్నవారికి ఎన్ని బోనస్ మార్కులు లేదా వెయిటేజీ లభిస్తుంది?",
    teluguAnswer: "నోటిఫికేషన్ తేదీ నాటికి కనీసం 2 సంవత్సరాల నుండి చెల్లుబాటు అయ్యే ఎల్‌ఎమ్‌వి లేదా హెచ్‌ఎమ్‌వి డ్రైవింగ్ లైసెన్స్ ఉన్న అభ్యర్థులకు పోస్ట్ కోడ్ 21, 22, 23, 24 ఎంపికలో 3 బోనస్ మార్కులు (వెయిటేజీ) లభిస్తాయి. ఫైర్ ఫైటర్ (పోస్ట్ 26) కు డ్రైవింగ్ లైసెన్స్ తప్పనిసరి.",
  },
  {
    question: "How does the 95% Local Reservation work under Presidential Order 2018?",
    answer: "Under the Presidential Order 2018 (New Zonal System), 95% of vacancies in District Cadres (Civil & AR) are strictly reserved for candidates who are local to that specific district (studied for at least 4 consecutive years between Classes 1 to 7 in that district). The remaining 5% vacancies are open to Open Competition (OC) across all districts and states.",
    teluguQuestion: "ప్రెసిడెన్షియల్ ఆర్డర్ 2018 ప్రకారం 95% స్థానిక రిజర్వేషన్ ఎలా వర్తిస్తుంది?",
    teluguAnswer: "రాష్ట్రపతి ఉత్తర్వులు 2018 (కొత్త జోనల్ విధానం) ప్రకారం జిల్లా క్యాడర్ పోస్టులలో (సివిల్ & ఏఆర్) 95 శాతం ఖాళీలు ఆయా జిల్లా స్థానిక అభ్యర్థులకే (1 నుండి 7వ తరగతి వరకు వరుసగా 4 ఏళ్లు ఆ జిల్లాలో చదివిన వారికి) రిజర్వ్ చేయబడతాయి. మిగిలిన 5 శాతం పోస్టులు ఓపెన్ కాంపిటీషన్ (ఓసీ) కింద అన్ని జిల్లాల అభ్యర్థులకు అందుబాటులో ఉంటాయి.",
  },
  {
    question: "What certificates are required for Part-II application and Certificate Verification (DV)?",
    answer: "11 key documents: SSC memo (DOB proof), Intermediate marks memo & pass certificate, Study/Bonafide certificates from Class 1st to 7th (for 95% local status), Community/Caste certificate (SC/ST/BC), Non-Creamy Layer (NCL) certificate for BCs, EWS certificate, Agency ST certificate, valid driving license (if claiming 3 bonus marks), Ex-Servicemen discharge book, Home Guard service certificate, and TS Govt employee service certificate.",
    teluguQuestion: "పార్ట్-2 దరఖాస్తు మరియు సర్టిఫికెట్ వెరిఫికేషన్ (డీవీ) కోసం ఏఏ ఒరిజినల్ డాక్యుమెంట్లు కావాలి?",
    teluguAnswer: "10వ తరగతి మార్కుల మెమో (పుట్టిన తేదీ కోసం), ఇంటర్మీడియట్ పాస్ సర్టిఫికెట్ & మెమో, 1 నుండి 7వ తరగతి వరకు స్టడీ/బోనఫైడ్ సర్టిఫికెట్లు (95% లోకల్ రిజర్వేషన్ కోసం), కుల ధ్రువీకరణ పత్రం (ఎస్సీ/ఎస్టీ/బీసీ), బీసీలకు నాన్-క్రీమీ లేయర్ (NCL), ఈడబ్ల్యూఎస్ సర్టిఫికెట్, ఏజెన్సీ ఎస్టీ సర్టిఫికెట్, డ్రైవింగ్ లైసెన్స్ (బోనస్ మార్కుల కోసం), మాజీ సైనికుల డిశ్చార్జ్ బుక్, మరియు హోంగార్డు సర్వీస్ సర్టిఫికెట్.",
  },
  {
    question: "What are the age limits and relaxation under G.O. Ms No. 87 and G.O. Ms 122?",
    answer: "The base age is 18 to 22 years (as of 1 July 2026). Under G.O. Ms No. 87, the Telangana Government sanctioned a 5-year upper age relaxation. General/OC candidates can apply up to 27 years. BC, SC, ST, and EWS candidates receive an additional 5-year statutory reservation relaxation, making them eligible up to 32 years. Home Guards can apply up to 45 years.",
    teluguQuestion: "పోలీస్ కానిస్టేబుల్ వయోపరిమితి ఎంత? జీవో నం. 87 ప్రకారం ఎంత సడలింపు లభిస్తుంది?",
    teluguAnswer: "నిర్దేశిత ప్రాథమిక వయస్సు 18 నుండి 22 సంవత్సరాలు. తెలంగాణ ప్రభుత్వం జీవో 87 ద్వారా 5 ఏళ్ల సాధారణ సడలింపు ఇచ్చింది. దీనితో జనరల్/ఓసీ అభ్యర్థులు 27 ఏళ్ల వరకు దరఖాస్తు చేసుకోవచ్చు. బీసీ, ఎస్సీ, ఎస్టీ, ఈడబ్ల్యూఎస్ అభ్యర్థులకు మరో 5 ఏళ్ల సడలింపుతో 32 ఏళ్ల వరకు అర్హత ఉంటుంది.",
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
    question: "Where can I practice free bilingual mock tests with genuine negative marking?",
    answer: "You can practice 58 full-length bilingual mock tests with timed 180-minute countdown, realistic 0.20 negative marking, and detailed solutions on Varadhi Prep at varadhiprep.in/mock-tests/telangana/police-constable-free-mock-test.",
    teluguQuestion: "నెగెటివ్ మార్కింగ్‌తో ఉచిత మాక్ టెస్ట్‌లను ఎక్కడ ప్రాక్టీస్ చేయవచ్చు?",
    teluguAnswer: "వరధి ప్రెప్‌లో 58 పూర్తి స్థాయి మాక్ టెస్టులను 180 నిమిషాల టైమర్, 0.20 నెగెటివ్ మార్కింగ్ మరియు తెలుగు & ఇంగ్లీష్ వివరణలతో ఉచితంగా రాయవచ్చు.",
  },
  {
    question: "What is the TS Constable syllabus weightage marks and marks wise distribution?",
    answer: "The TS Constable Written Examination (PWT and FWE) has 200 objective questions for 200 marks. The TS constable syllabus marks wise weightage distribution is: 1) Telangana Movement, Statehood History & Culture: 35–40 Marks (Highest Weightage); 2) Reasoning & Mental Ability: 25 Marks; 3) Arithmetic & Numerical Ability: 25 Marks; 4) General Science: 25 Marks; 5) History of India & Indian Culture: 25 Marks; 6) Geography, Polity & Indian Economy: 25 Marks; 7) Current Events of National & International Importance: 25 Marks; 8) English Language: 15–20 Marks.",
    teluguQuestion: "తెలంగాణ పోలీస్ కానిస్టేబుల్ సిలబస్ మార్కుల వెయిటేజీ (TS Constable Syllabus Marks Wise & Weightage Marks) ఎంత?",
    teluguAnswer: "ప్రిలిమ్స్ (PWT) మరియు మెయిన్స్ (FWE) పరీక్ష 200 మార్కులకు (200 ప్రశ్నలు) జరుగుతుంది. సబ్జెక్టుల వారీగా మార్కుల వెయిటేజీ: 1) తెలంగాణ ఉద్యమం, చరిత్ర & సంస్కృతి: 35-40 మార్కులు; 2) రీజనింగ్ & మెంటల్ ఎబిలిటీ: 25 మార్కులు; 3) అర్థమెటిక్: 25 మార్కులు; 4) జనరల్ సైన్స్: 25 మార్కులు; 5) భారత దేశ చరిత్ర: 25 మార్కులు; 6) జాగ్రఫీ, పాలిటీ, ఎకానమీ: 25 మార్కులు; 7) కరెంట్ అఫైర్స్: 25 మార్కులు; 8) ఇంగ్లీష్ లాంగ్వేజ్: 15-20 మార్కులు.",
  },
  {
    question: "Where can I find the official TS Constable syllabus PDF download in Telugu?",
    answer: "You can download the official TS Constable syllabus PDF in Telugu and English directly on Varadhi Prep from the Official Notification & Syllabus PDF link (748 KB) or via the TSLPRB official website at www.tgprb.in. The syllabus is officially bilingual and provides the complete topic list in both Telugu and English.",
    teluguQuestion: "తెలంగాణ కానిస్టేబుల్ సిలబస్ పీడీఎఫ్ డౌన్‌లోడ్ తెలుగులో (TS Constable Syllabus PDF Download in Telugu) ఎలా పొందాలి?",
    teluguAnswer: "వరధి ప్రెప్ వెబ్‌సైట్‌లో అధికారిక సిలబస్ పీడీఎఫ్ (748 KB) మరియు నోటిఫికేషన్ పత్రాన్ని తెలుగు మరియు ఇంగ్లీష్ మాధ్యమాల్లో ఉచితంగా డౌన్‌లోడ్ చేసుకోవచ్చు. లేదా అధికారిక వెబ్‌సైట్ www.tgprb.in నుండి కూడా డౌన్‌లోడ్ చేసుకోవచ్చు.",
  },
  {
    question: "What topics are included in the TS Constable reasoning syllabus?",
    answer: "The TS Constable reasoning syllabus (Mental Ability - 25 Marks) comprises: Analogies, Similarities & Differences, Spatial Visualization, Spatial Orientation, Problem Solving, Analysis, Judgment, Decision Making, Visual Memory, Discriminating Observation, Blood Relations, Arithmetical Reasoning, Figural Classification, Arithmetic Number Series, Non-Verbal Series, Coding & Decoding, Statement Conclusion, Syllogistic Reasoning, Clock & Calendar problems, and Venn Diagrams.",
    teluguQuestion: "తెలంగాణ కానిస్టేబుల్ రీజనింగ్ సిలబస్ (TS Constable Reasoning Syllabus) లో ఏ అంశాలు ఉంటాయి?",
    teluguAnswer: "రీజనింగ్ & మెంటల్ ఎబిలిటీ (25 మార్కులు) విభాగంలో: పోలికలు (Analogies), కోడింగ్ & డీకోడింగ్, నెంబర్ & లెటర్ సిరీస్, రక్త సంబంధాలు, దిశలు, వెన్ డయాగ్రమ్స్, సిలాజిజమ్స్, నాన్-వెర్బల్ ప్యాటర్న్స్, మిర్రర్ ఇమేజెస్, డైస్ & క్యూబ్స్, మరియు స్టేట్‌మెంట్స్-తీర్మానాలు వంటి ముఖ్యమైన అంశాలు ఉంటాయి.",
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
      headline: "Telangana Police Constable Notification 2026: 7,112 Posts, Official PDF Download, Syllabus, Salary & Dates",
      description:
        "Official Telangana State Level Police Recruitment Board (TSLPRB) notification for 7,112 posts with complete syllabus, post-wise vacancies (Post Codes 21-28), salary breakdown, medical eye sight 6/6 standards, PET 100-mark scoring slabs, and official PDF download.",
      url: canonical,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonical,
      },
      image: [absoluteUrl("/opengraph-image")],
      datePublished: "2026-07-29T10:00:00+05:30",
      dateModified: new Date().toISOString(),
      inLanguage: ["en-IN", "te-IN"],
      articleSection: "Government Recruitment Notifications",
      keywords:
        "Telangana Police Constable Notification 2026, TS Police Constable Syllabus, ts constable syllabus weightage marks, ts constabel syllabus weightage marks, ts constable syllabus pdf download in telugu, ts constable syllabus marks wise, ts constable reasoning syllabus, TSLPRB 7112 Vacancies, Download Official PDF, GO Ms 87, TS Police Constable Salary In Hand, TS Police Constable Medical Eye Sight 6/6, TS Police Constable 1600m Run Marks",
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
      associatedMedia: {
        "@type": "DigitalDocument",
        name: "TSLPRB Telangana Police Constable 2026 Official Gazette Notification PDF",
        encodingFormat: "application/pdf",
        url: absoluteUrl("/docs/telangana-police-constable-notification-2026-official.pdf"),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: "Telangana Police Constable (Civil, AR, SAR CPL, TSSP) - 7,112 Vacancies",
      description:
        "Direct recruitment for 7,112 posts of Police Constables (Civil Post Code 21, AR Post Code 22, SAR CPL Post Code 23, TSSP Battalions Post Code 24), Fire Fighters (Post Code 26), and Warders (Post Codes 27 & 28) by the Telangana State Level Police Recruitment Board.",
      identifier: {
        "@type": "PropertyValue",
        name: "TSLPRB",
        value: "TSLPRB Police Constable 2026",
      },
      datePosted: "2026-07-29",
      validThrough: "2026-12-31T23:59:59+05:30",
      employmentType: "FULL_TIME",
      industry: "Law Enforcement & State Police Services",
      directApply: true,
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
      applicantLocationRequirements: {
        "@type": "Country",
        name: "India",
      },
      educationRequirements: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Intermediate / 10+2 or equivalent",
      },
      experienceRequirements: "No experience required (Freshers eligible)",
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
        { "@type": "ListItem", position: 3, name: "Telangana Police Constable Notification 2026", item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Telangana Police Constable Notification 2026: TS Constable Syllabus Marks Wise, Weightage & Telugu PDF",
      url: canonical,
      description:
        "Comprehensive guide featuring TS constable syllabus marks wise breakdown, TS constable syllabus weightage marks, comprehensive TS constable reasoning syllabus, TS constable syllabus PDF download in Telugu (748 KB), salary breakdown, medical eye sight 6/6 standards, and PET 100-mark scoring slabs.",
      keywords:
        "ts constable syllabus weightage marks, ts constabel syllabus weightage marks, ts constable syllabus pdf download in telugu, ts constable syllabus marks wise, ts constable reasoning syllabus, telangana police constable notification 2026",
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "article p:first-of-type"],
      },
    },
  ];

  return (
    <main className="min-h-screen w-full bg-[#e2e6ea] text-[#1a1a1a] antialiased">
      <JsonLd data={jsonLd} />

      {/* Direct Google Font Preload for Mandali (TV9 Telugu Font) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Mandali&display=swap"
      />

      {/* Full-Screen Broadsheet Top Rule */}
      <div className="h-1.5 w-full bg-[#0b2545]" />

      {/* Full-Screen Newspaper Header (Daily Dispatch & Moneycontrol Style) */}
      <header className="border-b border-slate-300 bg-white w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Varadhi Prep home">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium text-slate-700">
            <span className="hidden sm:inline text-slate-600 font-sans font-semibold text-xs">Saturday, Nov 14, 2026</span>
            <a
              href="/docs/telangana-police-constable-notification-2026-official.pdf"
              download="TSLPRB_Police_Constable_Notification_2026_Official.pdf"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-2 font-semibold transition text-xs sm:text-sm shadow-2xs"
              title="Download Official Notification PDF (748 KB)"
            >
              <svg className="w-4 h-4 text-slate-700 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4 4a1 1 0 10-2 0v2a1 1 0 102 0v-2z" clipRule="evenodd" />
              </svg>
              <span>Download Official PDF</span>
            </a>
            <Link
              href="/mock-tests/telangana/police-constable-free-mock-test"
              className="inline-flex items-center rounded-lg bg-[#0b2545] hover:bg-[#071a32] text-white px-3.5 sm:px-4 py-2 font-semibold transition text-xs sm:text-sm shadow-sm"
            >
              Practice Mock Tests &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Full-Screen Editorial Article Header */}
      <article className="border-b border-slate-300 bg-[#e2e6ea] w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-6 sm:py-8">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumbs" className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
            <Link href="/" className="hover:text-[#0b2545] transition font-medium">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-600">Recruitment News</span>
            <span>/</span>
            <span className="font-bold text-slate-950">Telangana Police Constable 2026</span>
          </nav>

          {/* Editorial Category Tag */}
          <div className="mt-3.5">
            <span className="text-xs font-black uppercase tracking-wider text-[#0b2545]">
              Telangana State Recruitment &bull; Official Notification
            </span>
          </div>

          {/* Full-Width Headline with TV9 Mandali Telugu Font */}
          <div className="mt-2.5 max-w-6xl">
            <h1 className="font-brand text-2xl sm:text-3xl lg:text-[2.65rem] font-bold text-slate-950 leading-[1.2] tracking-tight">
              Telangana Police Constable Notification 2026: 7,112 Posts, Cadre Breakdown, Salary, Syllabus &amp; Selection Procedure
            </h1>
            <p lang="te" className="font-telugu text-lg sm:text-xl lg:text-2xl text-slate-900 mt-2.5 leading-[1.75] font-normal">
              తెలంగాణ పోలీస్ కానిస్టేబుల్ 7,112 పోస్టుల అధికారిక నోటిఫికేషన్, శాలరీ, సిలబస్, ఈవెంట్స్ &amp; ఎంపిక విధానం
            </p>
          </div>

          {/* Author Byline & Timestamp */}
          <div className="mt-4 pt-3 border-t border-slate-300/80 flex flex-wrap items-center justify-between gap-y-2 text-xs sm:text-sm text-slate-700">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="font-bold text-slate-950">Varadhi News Desk</span>
              <span className="text-slate-400">&bull;</span>
              <span>Updated: Nov 14, 2026, 05:30 PM IST</span>
              <span className="text-slate-400">&bull;</span>
              <span>Official Recruitment Notification</span>
            </div>
            <div className="text-slate-600 font-semibold">
              <span>6 min read</span>
            </div>
          </div>

          {/* Full-Width Moneycontrol "Key Highlights & Exam Snapshot" Box */}
          <div className="mt-8 rounded-xl border border-slate-300 bg-white p-5 sm:p-7 w-full shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3.5 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-600 ring-4 ring-amber-100" />
                <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#0b2545]">
                  Key Highlights &amp; Exam Snapshot
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs self-start sm:self-auto">
                <span className="h-2 w-2 rounded-full bg-slate-600 inline-block" />
                Official Recruitment Gazette
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 hover:border-slate-300 hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Total Vacancies</span>
                <strong className="text-2xl sm:text-3xl font-black text-[#0b2545] block mt-1">7,112</strong>
                <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">Post Codes 21–28</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 hover:border-slate-300 hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">PWT Exam Date</span>
                <strong className="text-xl sm:text-2xl font-black text-[#0b2545] block mt-1">20 Dec 2026</strong>
                <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">10 AM – 1 PM</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 hover:border-slate-300 hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Age (General)</span>
                <strong className="text-2xl sm:text-3xl font-black text-[#0b2545] block mt-1">18 – 27 Yrs</strong>
                <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">G.O. Ms 87 (+5Y)</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 hover:border-slate-300 hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">In-Hand Salary</span>
                <strong className="text-base sm:text-lg font-black text-[#0b2545] block mt-1 leading-snug">~₹32.5k–₹35.5k</strong>
                <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">Scale ₹24.2k–₹72.8k</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 hover:border-slate-300 hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Qualification</span>
                <strong className="text-base sm:text-lg font-black text-[#0b2545] block mt-1 leading-snug">10+2 Intermediate</strong>
                <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">Board of Inter.</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 hover:border-slate-300 hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Negative Mark</span>
                <strong className="text-2xl sm:text-3xl font-black text-[#0b2545] block mt-1">0.20 Marks</strong>
                <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">20% deduction</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 hover:border-slate-300 hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Selection</span>
                <strong className="text-2xl sm:text-3xl font-black text-[#0b2545] block mt-1">4 Stages</strong>
                <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">PWT &rarr; PMT/PET &rarr; FWE</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 hover:border-slate-300 hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Exam Fee</span>
                <strong className="text-2xl sm:text-3xl font-black text-[#0b2545] block mt-1">₹800 / ₹400</strong>
                <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">50% SC/ST Relief</span>
              </div>

            </div>

            {/* Official Gazette PDF Banner */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70 p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-lg bg-[#0b2545]/8 border border-[#0b2545]/20 flex items-center justify-center shrink-0">
                  <span className="text-[#0b2545] font-black text-sm">PDF</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 text-sm sm:text-base">
                    Official Police Constable Recruitment Document (7,112 Posts)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Official 36-page TSLPRB Notification &bull; Includes Cadre Breakdowns, Complete Syllabus, PMT/PET Standards &bull; 748 KB
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <a
                  href="/docs/telangana-police-constable-notification-2026-official.pdf"
                  download="TSLPRB_Police_Constable_Notification_2026_Official.pdf"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0b2545] hover:bg-[#071a32] text-white px-4 py-2.5 font-semibold text-xs sm:text-sm transition shadow-sm"
                >
                  <span>📥 Download Official PDF (748 KB)</span>
                </a>
                <a
                  href="https://doc.tgprb.in/PC+(Civil+et+al)+2026+Notification+dated+29-07-2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-2.5 font-semibold text-xs sm:text-sm transition shadow-2xs"
                >
                  <span>View ↗</span>
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
            <p className="text-base sm:text-lg leading-[1.8] text-slate-800 font-normal border-l-4 border-l-[#0b2545] p-5 sm:p-6 bg-white rounded-xl border border-slate-300 shadow-xs">
              The Telangana State Level Police Recruitment Board (TSLPRB) has announced 7,112 Police Constable vacancies across Civil (Post Code 21), Armed Reserve (Post Code 22), SAR CPL (Post Code 23), TSSP Battalions (Post Code 24), Disaster Response &amp; Fire Services (Post Code 26), and Prison Warders (Post Codes 27 &amp; 28). This comprehensive guide provides the complete syllabus with marks-wise weightage, post-wise vacancy distribution, monthly in-hand salary calculations, 6/6 medical eye sight criteria, 100-mark PET physical timing slabs, 95% local reservation rules, and required certificate verification documents.
            </p>

            {/* Section 1: Important Dates & Timeline */}
            <section id="schedule" className="scroll-mt-6">
              <div className="border-b-2 border-[#0b2545] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  1. Important Dates &amp; Recruitment Roadmap
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Official chronological schedule published by the recruitment board.
              </p>

              <div className="border border-slate-300 rounded-xl divide-y divide-slate-200 bg-white overflow-hidden shadow-xs">
                {SCHEDULE_EVENTS.map((evt, idx) => {
                  const isCurrent = evt.status === "Active Stage";
                  return (
                    <div
                      key={evt.title}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrent ? "bg-[#f8fafc] border-l-4 border-l-[#0b2545]" : "bg-white hover:bg-slate-50/50 transition"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-xs sm:text-sm font-bold mt-0.5 border ${
                          isCurrent ? "bg-[#0b2545] text-white border-[#0b2545]" : "bg-slate-100 text-slate-800 border-slate-200"
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-slate-950">{evt.title}</h3>
                            <span className={`rounded-full px-3 py-0.5 text-xs font-bold border ${
                              isCurrent
                                ? "bg-amber-50 text-amber-900 border-amber-300"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}>
                              {isCurrent && <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-600 mr-1.5 animate-pulse" />}
                              {evt.status}
                            </span>
                          </div>
                          {evt.teluguTitle && (
                            <p lang="te" className="font-telugu text-base sm:text-lg text-slate-900 mt-1 leading-[1.8] font-medium">
                              {evt.teluguTitle}
                            </p>
                          )}
                          <p className="mt-1.5 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                            {evt.detail}
                          </p>
                        </div>
                      </div>
                      <div className="sm:text-right shrink-0 pl-10 sm:pl-0">
                        <span className="inline-block rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-900 shadow-2xs">
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
              <div className="border-b-2 border-[#0b2545] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  2. Cadre-Wise Vacancy Breakdown &amp; Post Codes (Total 7,112 Posts)
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Official distribution of 7,112 vacancies across Civil, Armed Reserve, TSSP Battalions, Fire Services, and Prison Warders.
              </p>

              {/* Accessible Data Table following Modern Web Guidance */}
              <div
                tabIndex={0}
                role="region"
                aria-label="Cadre-wise vacancy breakdown table"
                className="overflow-x-auto rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 w-full shadow-xs bg-white"
              >
                <table className="w-full min-w-[660px] text-left text-sm divide-y divide-slate-200">
                  <thead className="bg-[#f1f5f9] font-bold text-slate-950 text-xs sm:text-sm uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-4 py-3.5 border-r border-slate-200">Post Code</th>
                      <th scope="col" className="px-4 py-3.5 border-r border-slate-200">Cadre &amp; Designation</th>
                      <th scope="col" className="px-4 py-3.5 border-r border-slate-200">Department / Cadre Unit</th>
                      <th scope="col" className="px-4 py-3.5 border-r border-slate-200">Eligibility</th>
                      <th scope="col" className="px-4 py-3.5 border-r border-slate-200">Share</th>
                      <th scope="col" className="px-4 py-3.5 text-right">Vacancies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800 bg-white text-sm sm:text-base">
                    {VACANCIES.map((v, idx) => (
                      <tr key={v.postCode} className={idx % 2 === 1 ? "bg-slate-50/60 hover:bg-slate-100/60 transition" : "bg-white hover:bg-slate-100/60 transition"}>
                        <td className="px-4 py-3.5 font-mono text-xs sm:text-sm font-bold text-slate-900 border-r border-slate-200">
                          <span className="inline-block rounded-md bg-[#0b2545]/8 text-[#0b2545] border border-[#0b2545]/20 px-2.5 py-1">
                            Post Code {v.postCode}
                          </span>
                        </td>
                        <th scope="row" className="px-4 py-3.5 font-bold text-slate-950 border-r border-slate-200 font-sans">
                          <div className="text-sm sm:text-base font-bold text-slate-950">{v.postName}</div>
                          <span className="text-xs sm:text-sm font-normal text-slate-600 block mt-1">{v.roleSummary}</span>
                        </th>
                        <td className="px-4 py-3.5 border-r border-slate-200 text-xs sm:text-sm">
                          <div className="font-semibold text-slate-900">{v.department}</div>
                          <span className="text-xs text-slate-500 font-medium block mt-0.5">{v.cadreType}</span>
                        </td>
                        <td className="px-4 py-3.5 border-r border-slate-200 text-xs sm:text-sm">
                          <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-slate-900 font-semibold border border-slate-200">
                            {v.genderEligibility}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-800 border-r border-slate-200 text-xs sm:text-sm font-bold">
                          {v.share}
                        </td>
                        <td className="px-4 py-3.5 text-right font-black text-slate-950 text-base sm:text-lg">
                          {v.vacancies.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#0b2545]/5 font-bold text-[#0b2545] border-t-2 border-[#0b2545]/20">
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-right border-r border-[#0b2545]/20 text-xs sm:text-sm uppercase tracking-wider font-extrabold text-[#0b2545]">
                        Total Sanctioned Posts Across All 7 Cadres
                      </td>
                      <td className="px-4 py-4 text-right text-[#0b2545] text-lg sm:text-xl font-black">
                        {TOTAL_VACANCIES.toLocaleString("en-IN")} Posts
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Cadre Roles Explanation Cards */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-800">
                <div className="rounded-xl border border-slate-300 bg-white p-4.5 sm:p-5 shadow-xs">
                  <strong className="text-slate-950 font-bold text-sm sm:text-base block">Post Code 21: Police Constable (Civil) - 4,965 Posts (69.8%)</strong>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Primary station policing cadre for men and women. Posted across local police stations, traffic wings, cyber cells, and investigation bureaus. 95% District Cadre reservation applies.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-300 bg-white p-4.5 sm:p-5 shadow-xs">
                  <strong className="text-slate-950 font-bold text-sm sm:text-base block">Post Code 22: Police Constable (Armed Reserve - AR) - 1,250 Posts (17.6%)</strong>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    District armed reserves for VIP security, prisoner escorts, vital installations protection, law and order emergencies, and crowd control. Men and women eligible.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-300 bg-white p-4.5 sm:p-5 shadow-xs">
                  <strong className="text-slate-950 font-bold text-sm sm:text-base block">Post Code 24: Police Constable (TSSP Battalions) - 500 Posts (7.0%)</strong>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Telangana State Special Police (TSSP 1st to 13th Battalions). Tactical strike reserve deployed for anti-extremist combing operations, elections, and interstate border duties.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-300 bg-white p-4.5 sm:p-5 shadow-xs">
                  <strong className="text-slate-950 font-bold text-sm sm:text-base block">Post Codes 26, 27 &amp; 28: Fire Fighters &amp; Warders - 297 Posts</strong>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    225 Fire Fighters (Disaster Response &amp; Fire Services) with mandatory LMV license, 62 Warder (Male), and 10 Warder (Female) in Prisons &amp; Correctional Services.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Salary Structure, In-Hand Pay Scale & Allowances */}
            <section id="salary" className="scroll-mt-6">
              <div className="border-b-2 border-[#0b2545] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  3. Salary Structure, In-Hand Pay Scale &amp; Monthly Allowances
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Official salary breakdown for Telangana Police Constables under the Revised Pay Scales (RPS).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Gross Salary Components Table */}
                <div className="rounded-xl border border-slate-300 overflow-hidden bg-white shadow-xs">
                  <div className="bg-[#f1f5f9] px-4 py-3.5 font-bold text-xs sm:text-sm text-slate-950 uppercase tracking-wider border-b border-slate-200 flex justify-between items-center">
                    <span>Monthly Earnings (Gross Breakdown)</span>
                    <span className="text-xs rounded-md bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 font-semibold">RPS Grade</span>
                  </div>
                  <div className="divide-y divide-slate-200 text-sm sm:text-base">
                    {SALARY_COMPONENTS.map((sc, i) => (
                      <div key={i} className={`p-3.5 flex justify-between items-start gap-2 ${i >= 6 ? "bg-slate-100/70 font-bold" : ""}`}>
                        <div>
                          <span className={i >= 6 ? "font-bold text-slate-950 text-base" : "font-semibold text-slate-900"}>{sc.item}</span>
                          <span className="block text-xs sm:text-sm text-slate-600 font-normal mt-0.5">{sc.note}</span>
                        </div>
                        <span className={`shrink-0 font-mono ${i >= 6 ? "text-base sm:text-lg font-black text-slate-950" : "font-semibold text-slate-900"}`}>
                          {sc.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deductions & Net Take-Home Pay Table */}
                <div className="rounded-xl border border-slate-300 overflow-hidden bg-white shadow-xs">
                  <div className="bg-[#f1f5f9] px-4 py-3.5 font-bold text-xs sm:text-sm text-slate-950 uppercase tracking-wider border-b border-slate-200 flex justify-between items-center">
                    <span>Deductions &amp; Net In-Hand Salary</span>
                    <span className="text-xs rounded-md bg-[#0b2545]/10 text-[#0b2545] border border-[#0b2545]/20 px-2.5 py-1 font-bold">Take-Home</span>
                  </div>
                  <div className="divide-y divide-slate-200 text-sm sm:text-base">
                    {SALARY_DEDUCTIONS.map((sd, i) => (
                      <div key={i} className={`p-3.5 flex justify-between items-start gap-2 ${i >= 4 ? "bg-[#0b2545]/8 border-t-2 border-[#0b2545]/20" : i === 3 ? "bg-slate-50 font-bold" : ""}`}>
                        <div>
                          <span className={i >= 4 ? "font-black text-base sm:text-lg text-[#0b2545]" : "font-semibold text-slate-900"}>{sd.item}</span>
                          <span className="block text-xs sm:text-sm text-slate-600 font-normal mt-0.5">{sd.note}</span>
                        </div>
                        <span className={`shrink-0 font-mono ${i >= 4 ? "text-lg sm:text-xl font-black text-[#0b2545]" : i === 3 ? "font-bold text-slate-950" : "font-semibold text-slate-800"}`}>
                          {sd.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Perks & Telugu Explanation */}
              <div className="mt-5 rounded-xl border border-slate-300 bg-white p-5 sm:p-6 text-sm text-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0b2545]" />
                  <strong className="text-slate-950 text-base font-bold">Additional Service Perks &amp; Career Progression:</strong>
                </div>
                <p className="leading-relaxed text-sm sm:text-base text-slate-700">
                  Apart from monthly take-home salary, appointed Police Constables receive 15 to 30 days annual Surrender Leave Encashment, annual uniform kit grant, complete cashless hospitalization under the Telangana Employee Health Scheme (EHS) for self and dependent parents/family, and government pension security under the Contributory Pension Scheme (CPS with matching 14% state contribution). Promotion channel leads from Police Constable to Head Constable (HC), Assistant Sub-Inspector (ASI), and Sub-Inspector of Police (SI).
                </p>
                <p lang="te" className="font-telugu text-base sm:text-lg text-slate-900 pt-2 leading-[1.8] font-medium border-t border-slate-200">
                  తెలంగాణ పోలీస్ కానిస్టేబుల్ పే స్కేల్ ₹24,280 – ₹72,850. ప్రాథమిక బేసిక్ పే ₹24,280 తో పాటు డీఏ, హెచ్‌ఆర్‌ఏ, సీసీఏ మరియు అలవెన్సులు కలుపుకుని హైదరాబాద్ పరిధిలో నెలవారీ గ్రాస్ వేతనం సుమారు ₹39,182 కాగా, అన్ని మినహాయింపులు పోను ప్రతి నెలా చేతికి వచ్చే నికర ఇన్-హ్యాండ్ జీతం సుమారు ₹35,437 ఉంటుంది. ఇతర జిల్లాల్లో ఇన్-హ్యాండ్ జీతం సుమారు ₹32,524 నుండి ₹33,495 వరకు అందుతుంది.
                </p>
              </div>
            </section>

            {/* Section 4: Age Limits & G.O. Ms No. 87 Relaxation */}
            <section id="eligibility" className="scroll-mt-6">
              <div className="border-b-2 border-[#0b2545] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  4. Age Limits &amp; G.O. Ms No. 87 (+5 Years Age Relaxation)
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Age benchmarked as of 1st July 2026. The Government of Telangana issued G.O. Ms No. 87 granting a uniform 5-year upper age relaxation.
              </p>

              {/* Age Categories Table */}
              <div
                tabIndex={0}
                role="region"
                aria-label="Age limit category-wise table"
                className="overflow-x-auto rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 w-full shadow-xs bg-white"
              >
                <table className="w-full min-w-[550px] text-left text-sm divide-y divide-slate-200">
                  <thead className="bg-[#f1f5f9] font-bold text-slate-950 text-xs sm:text-sm uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-4 py-3.5 border-r border-slate-200">Category</th>
                      <th scope="col" className="px-4 py-3.5 border-r border-slate-200">Permissible Age Range</th>
                      <th scope="col" className="px-4 py-3.5">Statutory Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800 bg-white">
                    {AGE_LIMITS.map((a, idx) => (
                      <tr key={a.category} className={idx % 2 === 1 ? "bg-slate-50/60" : "bg-white"}>
                        <th scope="row" className="px-4 py-3.5 font-bold text-slate-950 border-r border-slate-200 font-sans text-sm">
                          {a.category}
                        </th>
                        <td className="px-4 py-3.5 border-r border-slate-200 whitespace-nowrap text-sm sm:text-base font-black text-[#0b2545]">
                          {a.ageRange}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 text-xs sm:text-sm leading-relaxed font-normal">
                          {a.detail}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Educational Criteria & Special Category Reservations Callouts */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-xs">
                  <span className="text-xs font-bold text-[#0b2545] uppercase tracking-wider block">Prescribed Qualification</span>
                  <h3 className="font-bold text-slate-950 text-base sm:text-lg mt-1">Intermediate (10+2) Pass</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    Must have passed Intermediate (10+2) or equivalent recognized by the Telangana State Board of Intermediate Education as on 29th July 2026.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-xs">
                  <span className="text-xs font-bold text-[#0b2545] uppercase tracking-wider block">SC / ST &amp; Technical Requirements</span>
                  <h3 className="font-bold text-slate-950 text-base sm:text-lg mt-1">SSC Pass + Inter Appearance</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    SC &amp; ST candidates who passed SSC (10th) and appeared for both 1st &amp; 2nd year Intermediate exams are eligible. Fire Fighter posts require a valid LMV license.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-xs">
                  <span className="text-xs font-bold text-[#0b2545] uppercase tracking-wider block">Special Reservation Quotas</span>
                  <h3 className="font-bold text-slate-950 text-base sm:text-lg mt-1">Horizontal Quotas</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    Special reservation quotas apply for Children of Police Personnel (CPP), Children of Deceased Police Personnel (CDI), Sports Persons (MSP), NCC, and Home Guards (min. 360 days active duty).
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: 4-Stage Selection Procedure */}
            <section id="selection" className="scroll-mt-6">
              <div className="border-b-2 border-[#0b2545] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  5. 4-Stage Selection Procedure &amp; Marking Methodology
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Comprehensive candidate progression from preliminary test to final selection list.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SELECTION_STAGES.map((st) => (
                  <div key={st.step} className="rounded-xl border border-slate-300 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#0b2545] uppercase tracking-wider">{st.step}</span>
                        <span className="text-xs font-bold border border-slate-200 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md">
                          {st.weightage}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-950 mt-2">{st.name}</h3>
                      <p lang="te" className="font-telugu text-sm sm:text-base text-slate-800 mt-1 leading-[1.7] font-medium">
                        {st.teluguName}
                      </p>
                      <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                        {st.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Critical Marking Difference Callout */}
              <div className="mt-5 rounded-xl border border-slate-300 border-l-4 border-l-[#0b2545] bg-white p-5 sm:p-6 text-sm text-slate-800 shadow-xs">
                <strong className="block text-slate-950 font-bold text-base mb-2">
                  ⚖️ Critical Selection Distinction: Civil (Post 21) vs Armed Reserve / TSSP (Posts 22, 23, 24)
                </strong>
                <p className="leading-relaxed">
                  <strong>For Police Constable Civil (Post Code 21), Fire Fighters (Post 26), and Warders (Posts 27 &amp; 28):</strong> Physical Efficiency Test (PET) is strictly <em>qualifying</em> in nature. Final selection is decided 100% on marks scored in the 200-mark Final Written Examination (FWE).
                </p>
                <p className="mt-1.5 leading-relaxed">
                  <strong>For Police Constable AR (Post Code 22), SAR CPL (Post 23), and TSSP Battalions (Post Code 24):</strong> The PET 1600m run (men) or 800m run (women) carries <strong>100 marks</strong> towards final merit! Final selection is out of 200 marks total: FWE (100 Marks) + PET Run (100 Marks). Running faster directly boosts candidate rank.
                </p>
              </div>
            </section>

            {/* Section 6: PMT Standards & PET 100-Marks Slabs */}
            <section id="physical" className="scroll-mt-6">
              <div className="border-b-2 border-[#0b2545] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  6. Physical Measurements (PMT) &amp; PET 100-Mark Scoring Slabs
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Mandatory biometric physical standards and official timing-to-mark conversion slabs for the 1600m / 800m run events.
              </p>

              {/* Basic PMT Standards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                {/* Men Standards */}
                <div className="rounded-xl border border-slate-300 overflow-hidden bg-white shadow-xs">
                  <div className="bg-[#f1f5f9] px-4 py-3.5 font-bold text-xs sm:text-sm text-slate-950 uppercase tracking-wider border-b border-slate-200 flex items-center justify-between">
                    <span>Men Candidates Standards (PMT &amp; Events)</span>
                    <span className="rounded-md bg-white border border-slate-300 text-slate-900 text-xs px-2.5 py-1 font-bold">1600m Run</span>
                  </div>
                  <div className="p-4 sm:p-5 space-y-3.5 text-sm sm:text-base text-slate-800 divide-y divide-slate-100">
                    <div>
                      <strong className="block font-bold text-slate-950">Height:</strong>
                      <p className="text-slate-800 mt-1">General, BC, SC: <span className="font-black text-slate-950">Minimum 167.6 cms</span></p>
                      <p className="text-slate-600 text-xs sm:text-sm mt-0.5">Agency Scheduled Area ST: Minimum 160.0 cms</p>
                    </div>
                    <div className="pt-3">
                      <strong className="block font-bold text-slate-950">Chest:</strong>
                      <p className="text-slate-800 mt-1"><span className="font-black text-slate-950">Minimum 86.3 cms</span> (with 5 cms expansion)</p>
                      <p className="text-slate-600 text-xs sm:text-sm mt-0.5">Agency Scheduled Area ST: Minimum 80.0 cms (3 cms expansion)</p>
                    </div>
                    <div className="pt-3">
                      <strong className="block font-bold text-slate-950">1600m Run Threshold:</strong>
                      <p className="text-slate-800 mt-1">Maximum Qualifying Time Limit: <span className="font-black text-slate-950">7 Minutes 15 Seconds</span></p>
                      <p className="text-slate-600 text-xs sm:text-sm mt-0.5">(Ex-Servicemen: 9 Minutes 30 Seconds)</p>
                    </div>
                    <div className="pt-3">
                      <strong className="block font-bold text-slate-950">Long Jump &amp; Shot Put:</strong>
                      <p className="text-slate-800 mt-1">Long Jump: <span className="font-black text-slate-950">Min 4.00 Meters</span> (Qualifying only)</p>
                      <p className="text-slate-800 mt-0.5">Shot Put (7.26 Kg): <span className="font-black text-slate-950">Min 6.00 Meters</span> (Qualifying only)</p>
                    </div>
                  </div>
                </div>

                {/* Women Standards */}
                <div className="rounded-xl border border-slate-300 overflow-hidden bg-white shadow-xs">
                  <div className="bg-[#f1f5f9] px-4 py-3.5 font-bold text-xs sm:text-sm text-slate-950 uppercase tracking-wider border-b border-slate-200 flex items-center justify-between">
                    <span>Women Candidates Standards (PMT &amp; Events)</span>
                    <span className="rounded-md bg-white border border-slate-300 text-slate-900 text-xs px-2.5 py-1 font-bold">800m Run</span>
                  </div>
                  <div className="p-4 sm:p-5 space-y-3.5 text-sm sm:text-base text-slate-800 divide-y divide-slate-100">
                    <div>
                      <strong className="block font-bold text-slate-950">Height:</strong>
                      <p className="text-slate-800 mt-1">General, BC, SC: <span className="font-black text-slate-950">Minimum 152.5 cms</span></p>
                      <p className="text-slate-600 text-xs sm:text-sm mt-0.5">Agency Scheduled Area ST: Minimum 150.0 cms</p>
                    </div>
                    <div className="pt-3">
                      <strong className="block font-bold text-slate-950">800m Run Threshold:</strong>
                      <p className="text-slate-800 mt-1">Maximum Qualifying Time Limit: <span className="font-black text-slate-950">5 Minutes 20 Seconds</span></p>
                      <p className="text-slate-600 text-xs sm:text-sm mt-0.5">Monitored digitally with RFID transponder chips</p>
                    </div>
                    <div className="pt-3">
                      <strong className="block font-bold text-slate-950">Long Jump &amp; Shot Put:</strong>
                      <p className="text-slate-800 mt-1">Long Jump: <span className="font-black text-slate-950">Min 2.50 Meters</span> (Qualifying only)</p>
                      <p className="text-slate-800 mt-0.5">Shot Put (4 Kg): <span className="font-black text-slate-950">Min 4.00 Meters</span> (Qualifying only)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Official PET 100-Mark Scoring Slabs Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Men 1600m Table */}
                <div className="rounded-xl border border-slate-300 overflow-hidden bg-white shadow-xs">
                  <div className="bg-[#f1f5f9] px-4 py-3.5 font-bold text-xs sm:text-sm text-slate-950 uppercase tracking-wider border-b border-slate-200 flex justify-between items-center">
                    <span>Men 1600m Run Scoring Slabs (Posts 22, 23, 24)</span>
                    <span className="text-xs bg-[#0b2545]/10 text-[#0b2545] font-bold px-2.5 py-1 rounded-md border border-[#0b2545]/20">100 Marks</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-200">
                      <thead className="bg-[#f1f5f9] text-slate-950 font-bold uppercase tracking-wide">
                        <tr>
                          <th className="px-3.5 py-3 border-r border-slate-200">Time Duration</th>
                          <th className="px-3.5 py-3 border-r border-slate-200 text-center">Marks</th>
                          <th className="px-3.5 py-3">Performance Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800 bg-white">
                        {MEN_RUN_SLABS.map((sl, idx) => (
                          <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/60 hover:bg-slate-100/60 transition" : "bg-white hover:bg-slate-100/60 transition"}>
                            <td className="px-3.5 py-2.5 border-r border-slate-200 font-mono font-medium text-slate-900">{sl.timing}</td>
                            <td className="px-3.5 py-2.5 border-r border-slate-200 text-center font-black text-[#0b2545] text-sm sm:text-base">{sl.marks}</td>
                            <td className="px-3.5 py-2.5 text-slate-700 font-medium">{sl.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Women 800m Table */}
                <div className="rounded-xl border border-slate-300 overflow-hidden bg-white shadow-xs">
                  <div className="bg-[#f1f5f9] px-4 py-3.5 font-bold text-xs sm:text-sm text-slate-950 uppercase tracking-wider border-b border-slate-200 flex justify-between items-center">
                    <span>Women 800m Run Scoring Slabs (Posts 22, 23, 24)</span>
                    <span className="text-xs bg-[#0b2545]/10 text-[#0b2545] font-bold px-2.5 py-1 rounded-md border border-[#0b2545]/20">100 Marks</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-200">
                      <thead className="bg-[#f1f5f9] text-slate-950 font-bold uppercase tracking-wide">
                        <tr>
                          <th className="px-3.5 py-3 border-r border-slate-200">Time Duration</th>
                          <th className="px-3.5 py-3 border-r border-slate-200 text-center">Marks</th>
                          <th className="px-3.5 py-3">Performance Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800 bg-white">
                        {WOMEN_RUN_SLABS.map((sl, idx) => (
                          <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/60 hover:bg-slate-100/60 transition" : "bg-white hover:bg-slate-100/60 transition"}>
                            <td className="px-3.5 py-2.5 border-r border-slate-200 font-mono font-medium text-slate-900">{sl.timing}</td>
                            <td className="px-3.5 py-2.5 border-r border-slate-200 text-center font-black text-[#0b2545] text-sm sm:text-base">{sl.marks}</td>
                            <td className="px-3.5 py-2.5 text-slate-700 font-medium">{sl.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Medical Standards & Eye Sight (Visual Acuity) Guidelines */}
            <section id="medical" className="scroll-mt-6">
              <div className="border-b-2 border-[#0b2545] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  7. Medical Standards &amp; Eye Sight (Visual Acuity 6/6) Criteria
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Mandatory physical fitness and visual standards verified by the Government Medical Board. Candidates failing visual acuity or possessing physical defects are disqualified.
              </p>

              {/* Visual Acuity Table */}
              <div
                tabIndex={0}
                role="region"
                aria-label="Medical standards and eye sight table"
                className="overflow-x-auto rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 w-full mb-5 shadow-xs bg-white"
              >
                <table className="w-full min-w-[620px] text-left text-sm sm:text-base divide-y divide-slate-200">
                  <thead className="bg-[#f1f5f9] font-bold text-slate-950 text-xs sm:text-sm uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-4 py-3.5 border-r border-slate-200">Visual Test Parameter</th>
                      <th scope="col" className="px-4 py-3.5 border-r border-slate-200">Right Eye</th>
                      <th scope="col" className="px-4 py-3.5 border-r border-slate-200">Left Eye</th>
                      <th scope="col" className="px-4 py-3.5">Medical Board Criterion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800 bg-white">
                    {MEDICAL_STANDARDS.map((ms, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/60 hover:bg-slate-100/60 transition" : "bg-white hover:bg-slate-100/60 transition"}>
                        <th scope="row" className="px-4 py-3.5 font-bold text-slate-950 border-r border-slate-200 font-sans text-sm sm:text-base">
                          {ms.parameter}
                        </th>
                        <td className="px-4 py-3.5 font-mono font-black text-slate-950 border-r border-slate-200 text-sm sm:text-base">
                          {ms.rightEye}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-black text-slate-950 border-r border-slate-200 text-sm sm:text-base">
                          {ms.leftEye}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 text-xs sm:text-sm font-normal leading-relaxed">
                          {ms.rule}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Disqualifying Physical Conditions */}
              <div className="rounded-xl border border-slate-300 border-l-4 border-l-[#0b2545] bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0b2545]" />
                  <h3 className="font-bold text-slate-950 text-base sm:text-lg">
                    Disqualifying Medical &amp; Physical Conditions
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-slate-700 mb-4 leading-relaxed">
                  During the official medical board examination, candidates having any of the following physical conditions are disqualified:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {PHYSICAL_DEFECTS_DISQUALIFIED.map((pd, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 shadow-2xs">
                      <strong className="text-slate-950 font-bold block text-sm sm:text-base">{i + 1}. {pd.defect}</strong>
                      <span className="text-slate-700 block mt-1 text-xs sm:text-sm leading-relaxed">{pd.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 8: Driving License Bonus Marks & Weightage */}
            <section id="driving" className="scroll-mt-6">
              <div className="border-b-2 border-[#0b2545] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  8. Driving License Bonus Marks &amp; Weightage
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Special bonus mark allocation for candidates holding valid motor vehicle driving licenses.
              </p>

              <div className="rounded-xl border border-slate-300 bg-white p-5 sm:p-6 space-y-4 text-sm sm:text-base text-slate-800 shadow-xs">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-block rounded-md bg-[#0b2545] text-white text-xs font-bold px-3 py-1">
                    +3 Marks Weightage
                  </span>
                  <h3 className="font-bold text-slate-950 text-base sm:text-lg">
                    3 Bonus Marks for Valid LMV / HMV Driving License Holders
                  </h3>
                </div>
                <p className="leading-relaxed text-slate-700">
                  Candidates who have held a valid Light Motor Vehicle (LMV) or Heavy Motor Vehicle (HMV) driving license continuously for a minimum period of <strong>two years</strong> prior to the notification date (issued on or before 29th July 2024) are awarded <strong>3 Bonus Marks</strong> in the final selection for Civil, AR, SAR CPL, and TSSP posts.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-700">
                  <li>The driving license must be issued by a competent Regional Transport Authority (RTA) in India.</li>
                  <li>Learner&apos;s Driving License (LLR) is strictly <strong>not accepted</strong> for bonus marks.</li>
                  <li>For Post Code 26 (Fire Fighter / Driver Operator), possessing a valid LMV license is a <em>mandatory basic qualification</em>, hence no extra bonus marks apply for Post 26.</li>
                </ul>
              </div>
            </section>

            {/* Section 9: 95% Local Reservation (Presidential Order 2018) */}
            <section id="reservation" className="scroll-mt-6">
              <div className="border-b-2 border-[#0b2545] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  9. 95% Local Reservation &amp; Presidential Order 2018 Norms
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Under the Telangana Presidential Order (New Zonal System), local district candidates receive 95% reservation in district-level constable posts.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-300 border-t-4 border-t-[#0b2545] bg-white p-5 sm:p-6 shadow-xs">
                  <span className="text-xs font-bold text-[#0b2545] uppercase tracking-wider block">Local Cadre Quota</span>
                  <strong className="text-3xl sm:text-4xl font-black text-[#0b2545] block mt-1.5">95% Reserved</strong>
                  <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    95% of vacancies in District Cadres (Post Code 21 Civil and Post Code 22 AR) are strictly reserved exclusively for candidates who belong to that local district.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-300 border-t-4 border-t-[#0b2545] bg-white p-5 sm:p-6 shadow-xs">
                  <span className="text-xs font-bold text-[#0b2545] uppercase tracking-wider block">Open Competition Quota</span>
                  <strong className="text-3xl sm:text-4xl font-black text-[#0b2545] block mt-1.5">5% Unreserved</strong>
                  <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    5% of vacancies are open competition (unreserved), where candidates from all 33 districts of Telangana and eligible non-local candidates compete purely on merit.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-300 bg-white p-5 sm:p-6 text-sm sm:text-base text-slate-800 space-y-3 shadow-xs">
                <h3 className="font-bold text-slate-950 text-base sm:text-lg">How is Local Candidature Determined?</h3>
                <p className="leading-relaxed text-slate-700">
                  <strong>School Study Rule:</strong> A candidate is regarded as a local candidate to a district if they studied in an educational institution in that district for a minimum period of <strong>not less than 4 consecutive academic years</strong> ending with the academic year in which they first appeared for the 7th class examination (Classes 1st to 7th).
                </p>
                <p className="leading-relaxed text-slate-700">
                  <strong>Private Study Rule:</strong> If a candidate did not study in any school during that 7-year period, they must produce a Residence Certificate issued by the Tahsildar / MRO confirming continuous residence in that district for a period of not less than 4 years immediately preceding the completion of SSC/equivalent.
                </p>
              </div>
            </section>

            {/* Section 10: Documents & Certificate Verification Checklist */}
            <section id="documents" className="scroll-mt-6">
              <div className="border-b-2 border-[#0b2545] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  10. Mandatory Document Verification Checklist (Part-II Application &amp; DV)
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Comprehensive checklist of official certificates required during Part-II online upload and in-person Certificate Verification.
              </p>

              <div className="divide-y divide-slate-200 border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                {DOCUMENTS_CHECKLIST.map((doc, idx) => (
                  <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                    <div className="flex items-start gap-3.5">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#0b2545] text-white font-bold text-xs sm:text-sm shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <strong className="text-slate-950 font-bold text-sm sm:text-base block">{doc.item}</strong>
                        <span className="text-slate-700 text-xs sm:text-sm block mt-1 leading-relaxed">{doc.purpose}</span>
                      </div>
                    </div>
                    <span className="shrink-0 text-slate-800 font-semibold text-xs sm:text-sm bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 sm:self-center pl-10 sm:pl-3">
                      {doc.issuingAuthority}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 11: Exam Pattern & Minimum Qualifying Marks */}
            <section id="pattern" className="scroll-mt-6">
              <div className="border-b-2 border-[#0b2545] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  11. Written Examination Scheme &amp; Minimum Qualifying Marks
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Preliminary Written Test (PWT) scheme and category-wise minimum qualifying scores.
              </p>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-300 bg-white p-4 sm:p-5 text-center shadow-xs hover:shadow-sm transition">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Questions</span>
                  <strong className="text-2xl sm:text-3xl font-black text-[#0b2545] block mt-1">200 MCQs</strong>
                  <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">Objective type</span>
                </div>
                <div className="rounded-xl border border-slate-300 bg-white p-4 sm:p-5 text-center shadow-xs hover:shadow-sm transition">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Total Marks</span>
                  <strong className="text-2xl sm:text-3xl font-black text-[#0b2545] block mt-1">200 Marks</strong>
                  <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">1 mark per Q</span>
                </div>
                <div className="rounded-xl border border-slate-300 bg-white p-4 sm:p-5 text-center shadow-xs hover:shadow-sm transition">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Duration</span>
                  <strong className="text-2xl sm:text-3xl font-black text-[#0b2545] block mt-1">3 Hours</strong>
                  <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">180 minutes</span>
                </div>
                <div className="rounded-xl border border-slate-300 bg-white p-4 sm:p-5 text-center shadow-xs hover:shadow-sm transition">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Negative Mark</span>
                  <strong className="text-2xl sm:text-3xl font-black text-[#0b2545] block mt-1">0.20 Marks</strong>
                  <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">20% deduction</span>
                </div>
              </div>

              {/* Qualifying Marks Table */}
              <div className="mt-5 rounded-xl border border-slate-300 overflow-hidden shadow-xs bg-white">
                <div className="bg-[#f1f5f9] px-4 py-3.5 font-bold text-xs sm:text-sm text-slate-950 uppercase tracking-wider border-b border-slate-200 flex justify-between items-center">
                  <span>Category-Wise Minimum Qualifying Marks</span>
                  <span className="text-xs font-semibold text-slate-700">Applies to PWT &amp; FWE</span>
                </div>
                <div className="divide-y divide-slate-200 bg-white">
                  {QUALIFYING_MARKS.map((qm) => (
                    <div key={qm.category} className="p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-sm sm:text-base hover:bg-slate-50/50 transition">
                      <span className="font-bold text-slate-950">{qm.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="rounded-lg bg-[#0b2545]/8 text-[#0b2545] px-3 py-1 text-xs sm:text-sm font-bold border border-[#0b2545]/20">
                          PWT: {qm.pwtPercent} ({qm.pwtMinMarks})
                        </span>
                        <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs sm:text-sm font-semibold text-slate-800 border border-slate-200">
                          FWE: {qm.fwePercent}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 12: Syllabus & Marks-Wise Weightage */}
            <section id="syllabus" className="scroll-mt-6">
              <div className="border-b-2 border-[#0b2545] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  12. TS Constable Syllabus: Marks Wise Weightage, Reasoning Syllabus &amp; Telugu PDF Download
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Official curriculum prescribed by TSLPRB for the 200-question Preliminary Written Test (PWT) and Final Written Examination (FWE). Below is the comprehensive TS constable syllabus marks wise breakdown, subject weightage marks, in-depth TS constable reasoning syllabus, and the official TS constable syllabus PDF download in Telugu.
              </p>

              {/* Component 1: Official TS Constable Syllabus PDF Download in Telugu */}
              <div className="rounded-xl border border-slate-300 border-l-4 border-l-[#0b2545] bg-white p-5 sm:p-6 mb-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-[#0b2545] text-white text-xs px-2.5 py-1 font-bold uppercase tracking-wider">Official Syllabus</span>
                      <span className="text-xs sm:text-sm text-slate-600 font-medium">Bilingual &bull; Telugu &amp; English</span>
                    </div>
                    <h3 className="font-brand text-base sm:text-lg font-bold text-slate-950 mt-1.5">
                      TS Constable Syllabus PDF Download in Telugu &amp; English
                    </h3>
                    <p lang="te" className="font-telugu text-base sm:text-lg text-slate-900 mt-1 leading-[1.8] font-medium">
                      తెలంగాణ పోలీస్ కానిస్టేబుల్ పూర్తి సిలబస్ పీడీఎఫ్ ను తెలుగు మరియు ఇంగ్లీష్ మాధ్యమాల్లో ఉచితంగా డౌన్‌లోడ్ చేసుకోండి.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <a
                      href="https://doc.tgprb.in/PC+(Civil+et+al)+2026+Notification+dated+29-07-2026.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition shadow-2xs"
                      title="View Official TSLPRB Gazette Mirror"
                    >
                      View ↗
                    </a>
                    <a
                      href="/docs/telangana-police-constable-notification-2026-official.pdf"
                      download="TSLPRB_Police_Constable_Syllabus_Telugu_Official.pdf"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0b2545] hover:bg-[#071a32] text-white px-4 py-2.5 text-xs sm:text-sm font-semibold transition shadow-sm"
                      title="Download TS Constable Syllabus PDF in Telugu (748 KB)"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Download Telugu PDF (748 KB)</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Component 2: TS Constable Syllabus Marks Wise & Weightage Marks Table */}
              <div className="mb-6 rounded-xl border border-slate-300 overflow-hidden bg-white shadow-xs">
                <div className="bg-[#f1f5f9] px-4 py-3.5 font-bold text-xs sm:text-sm text-slate-950 uppercase tracking-wider border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span>TS Constable Syllabus Marks Wise &amp; Weightage Marks (200 Questions / 200 Marks)</span>
                  <span className="text-xs font-semibold text-slate-700">Duration: 3 Hours (180 Mins) &bull; Negative: 0.20 Marks</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm sm:text-base">
                    <thead>
                      <tr className="border-b border-slate-200 bg-[#f1f5f9] text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wide">
                        <th className="px-4 py-3.5 border-r border-slate-200">#</th>
                        <th className="px-4 py-3.5 border-r border-slate-200">Subject / Paper</th>
                        <th className="px-4 py-3.5 border-r border-slate-200">Telugu Title</th>
                        <th className="px-4 py-3.5 border-r border-slate-200">Standard</th>
                        <th className="px-4 py-3.5 text-right">TS Constable Syllabus Weightage Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {SUBJECTS.map((sub) => (
                        <tr key={sub.number} className="hover:bg-slate-50/60 transition">
                          <td className="px-4 py-3 font-mono text-slate-500 font-bold text-xs sm:text-sm border-r border-slate-200">{sub.number}</td>
                          <td className="px-4 py-3 font-bold text-slate-950 border-r border-slate-200">{sub.name}</td>
                          <td lang="te" className="px-4 py-3 font-telugu text-slate-900 border-r border-slate-200 text-sm sm:text-base font-medium">{sub.teluguName}</td>
                          <td className="px-4 py-3 text-slate-600 text-xs sm:text-sm border-r border-slate-200">{sub.level}</td>
                          <td className="px-4 py-3 text-right font-black text-[#0b2545] text-base sm:text-lg">{sub.weightage}</td>
                        </tr>
                      ))}
                      <tr className="bg-[#0b2545]/5 font-bold text-[#0b2545] border-t-2 border-[#0b2545]/20">
                        <td colSpan={4} className="px-4 py-4 text-right uppercase tracking-wider text-xs sm:text-sm font-extrabold border-r border-[#0b2545]/20">
                          Total Examination Marks (PWT &amp; FWE Civil)
                        </td>
                        <td className="px-4 py-4 text-right text-base sm:text-lg font-black text-[#0b2545]">
                          200 Questions / 200 Marks
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-slate-50 text-xs sm:text-sm text-slate-700 border-t border-slate-200 leading-relaxed">
                  <strong>Scoring Note:</strong> For Post Code 21 (Civil), 26 (Fire), 27 &amp; 28 (Warder), final merit is based entirely on the 200-mark FWE. For Post Codes 22 (AR), 23 (SAR CPL), and 24 (TSSP), the FWE is scaled to 100 marks and combined with 100 marks from the PET physical events run for a 200-mark final merit list.
                </div>
              </div>

              {/* Component 3: TS Constable Reasoning Syllabus (Deep-Dive Blueprint) */}
              <div className="mb-6 rounded-xl border border-slate-300 overflow-hidden bg-white shadow-xs">
                <div className="bg-[#f1f5f9] px-4 py-3.5 font-bold text-xs sm:text-sm text-slate-950 uppercase tracking-wider border-b border-slate-200 flex items-center justify-between">
                  <span>TS Constable Reasoning Syllabus (Mental Ability &bull; 25 Marks Weightage)</span>
                  <span className="rounded-md bg-[#0b2545]/10 text-[#0b2545] border border-[#0b2545]/20 text-xs px-2.5 py-1 font-bold">25 Marks</span>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-sm sm:text-base text-slate-800 mb-5 leading-relaxed">
                    The <strong>TS constable reasoning syllabus</strong> evaluates both verbal analytical deduction and non-verbal spatial reasoning. Candidates targeting high ranks must secure at least 22+ marks out of 25 in this section. The complete topic-wise syllabus breakdown is structured below:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Verbal Reasoning Column */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3.5">
                        <h4 className="font-bold text-sm sm:text-base text-slate-950 uppercase tracking-wider">
                          Part A: Verbal Reasoning (15 &ndash; 17 Marks)
                        </h4>
                        <span className="text-xs font-bold text-[#0b2545]">High Weightage</span>
                      </div>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed">
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Analogies:</strong> Word analogy, letter/alphabet analogy, number analogy &amp; paired relations.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Coding &amp; Decoding:</strong> Letter shifting, numeric coding, substitution &amp; deciphering coded messages.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Series Completion:</strong> Number series, alphabetical series, alternating series &amp; missing term identification.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Blood Relations:</strong> Deciphering family relationships, tree diagrams &amp; coded relation statements.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Direction &amp; Distance:</strong> 8-point compass navigation, turning angles &amp; Pythagoras distance problems.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Syllogisms &amp; Venn Diagrams:</strong> Two-statement deductions, Euler circle overlaps &amp; set relations.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Ranking &amp; Seating Arrangement:</strong> Left/right rank calculations, circular &amp; linear row orders.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Arithmetical Reasoning:</strong> Age word problems, mathematical symbol interchanging &amp; balance equations.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Clocks &amp; Calendars:</strong> Minute-hour hand angle calculation, leap year &amp; odd-day counting.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Non-Verbal Reasoning Column */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3.5">
                        <h4 className="font-bold text-sm sm:text-base text-slate-950 uppercase tracking-wider">
                          Part B: Non-Verbal Reasoning (8 &ndash; 10 Marks)
                        </h4>
                        <span className="text-xs font-bold text-[#0b2545]">Spatial Focus</span>
                      </div>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed">
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Spatial Visualization:</strong> Mental rotation, figure matching &amp; perspective transformation.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Mirror &amp; Water Images:</strong> Lateral inversion of alphanumeric characters, symbols &amp; compound shapes.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Paper Folding &amp; Cutting:</strong> Symmetric unfolding &amp; punched hole location mapping.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Embedded Figures:</strong> Finding hidden geometric patterns embedded within complex figures.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Pattern &amp; Figure Completion:</strong> Quadrant filling &amp; grid continuation logic.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Cubes &amp; Dice:</strong> Opposite face determination, standard vs general dice, and net box folding.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Non-Verbal Series:</strong> Clockwise/anticlockwise icon rotation &amp; stroke progression sequences.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#0b2545] font-bold text-base">&bull;</span>
                          <span><strong>Counting of Figures:</strong> Triangles, squares, straight lines &amp; rectangle counting formulas.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Component 4: Detailed Subject Topic Cards with Marks Weightage */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                  Detailed Syllabus Topics for All 8 Subjects
                </h3>
                <span className="text-xs text-slate-500 font-medium">Prescribed Standard</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SUBJECTS.map((sub) => (
                  <div key={sub.number} className="rounded-xl border border-slate-300 bg-white p-5 hover:border-slate-400 shadow-xs hover:shadow-sm transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-block rounded-md bg-slate-200 px-2.5 py-1 text-xs font-bold font-mono text-slate-900">
                            {sub.number}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-slate-950">{sub.name}</h3>
                        </div>
                        <span className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-[#0b2545] shadow-2xs shrink-0">
                          {sub.weightage}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span lang="te" className="font-telugu text-sm sm:text-base text-slate-900 font-medium leading-[1.8]">
                          {sub.teluguName}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-500 font-sans">&bull; {sub.level}</span>
                      </div>
                      <p className="mt-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                        {sub.topics}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 13: Application Fee Structure & Apply Steps */}
            <section id="fees" className="scroll-mt-6">
              <div className="border-b-2 border-[#0b2545] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  13. Application Fee &amp; How to Apply Online
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Official online registration fee and submission workflow on www.tgprb.in.
              </p>

              {/* Fee Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-300 border-t-4 border-t-[#0b2545] bg-white p-5 sm:p-6 shadow-xs">
                  <span className="text-xs font-bold text-[#0b2545] uppercase tracking-wider block">General / OC, BC &amp; Other States</span>
                  <strong className="text-3xl sm:text-4xl font-black text-[#0b2545] block mt-1.5">₹800</strong>
                  <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed font-normal">
                    Payable online via Net Banking, UPI, or Debit/Credit card.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-300 border-t-4 border-t-[#0b2545] bg-white p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0b2545] uppercase tracking-wider block">TS SC &amp; ST Candidates</span>
                    <span className="rounded-md bg-amber-50 text-amber-900 border border-amber-300 text-xs px-2.5 py-1 font-bold">
                      50% Concession
                    </span>
                  </div>
                  <strong className="text-3xl sm:text-4xl font-black text-[#0b2545] block mt-1.5">₹400</strong>
                  <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed font-normal">
                    Applicable for candidates belonging to Telangana with valid community certificates.
                  </p>
                </div>
              </div>

              {/* 5 Clear Application Steps */}
              <div className="mt-5 space-y-3">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                  Summary of Application Steps
                </h3>
                <ol className="divide-y divide-slate-200 border border-slate-300 rounded-xl overflow-hidden text-sm sm:text-base text-slate-800 bg-white shadow-xs">
                  <li className="p-4 sm:p-4.5 flex items-start gap-3.5">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#0b2545] text-white font-bold text-xs sm:text-sm shrink-0">1</span>
                    <span>Visit the official recruitment portal at <strong className="text-slate-950">www.tgprb.in</strong>.</span>
                  </li>
                  <li className="p-4 sm:p-4.5 bg-slate-50/50 flex items-start gap-3.5">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#0b2545] text-white font-bold text-xs sm:text-sm shrink-0">2</span>
                    <span>Authenticate your mobile number via OTP to create candidate credentials.</span>
                  </li>
                  <li className="p-4 sm:p-4.5 flex items-start gap-3.5">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#0b2545] text-white font-bold text-xs sm:text-sm shrink-0">3</span>
                    <span>Complete online examination fee payment (₹800 or ₹400).</span>
                  </li>
                  <li className="p-4 sm:p-4.5 bg-slate-50/50 flex items-start gap-3.5">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#0b2545] text-white font-bold text-xs sm:text-sm shrink-0">4</span>
                    <span>Fill Part-I application details, post preferences, and upload photo/signature.</span>
                  </li>
                  <li className="p-4 sm:p-4.5 flex items-start gap-3.5">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#0b2545] text-white font-bold text-xs sm:text-sm shrink-0">5</span>
                    <span>Submit and download the final acknowledgment form with reference number.</span>
                  </li>
                </ol>
              </div>
            </section>

            {/* Section 14: Official Links & Original PDF Hub */}
            <section id="links" className="scroll-mt-6">
              <div className="border-b-2 border-[#0b2545] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  14. Official Notification PDF &amp; Direct Links
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Verified direct downloads of the original government recruitment gazette, press release, and official portal.
              </p>

              <div className="divide-y divide-slate-200 border border-slate-300 rounded-xl overflow-hidden text-sm sm:text-base bg-white shadow-xs">
                {/* 1. Official Notification PDF */}
                <div className="p-4 sm:p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="h-11 w-11 rounded-lg bg-[#0b2545]/8 border border-[#0b2545]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[#0b2545] font-black text-sm uppercase">PDF</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-950 text-base sm:text-lg">Official Police Constable Notification PDF</h3>
                        <span className="rounded-md bg-amber-50 text-amber-900 border border-amber-300 text-xs px-2.5 py-1 font-bold uppercase tracking-wide">
                          Official PDF
                        </span>
                      </div>
                      <p lang="te" className="font-telugu text-sm sm:text-base text-slate-900 mt-1 font-medium">
                        తెలంగాణ కానిస్టేబుల్ 7,112 పోస్టుల అధికారిక నోటిఫికేషన్ పీడీఎఫ్
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Complete 36-page document: Cadres, age relaxation rules, PMT/PET physical standards &amp; complete syllabus &bull; 748 KB
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 sm:self-center">
                    <a
                      href="/docs/telangana-police-constable-notification-2026-official.pdf"
                      download="TSLPRB_Police_Constable_Notification_2026_Official.pdf"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0b2545] hover:bg-[#071a32] text-white font-semibold px-4 py-2.5 transition text-xs sm:text-sm shadow-sm"
                    >
                      <span>📥 Download PDF (748 KB)</span>
                    </a>
                    <a
                      href="https://doc.tgprb.in/PC+(Civil+et+al)+2026+Notification+dated+29-07-2026.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-semibold px-3.5 py-2.5 transition text-xs sm:text-sm border border-slate-300 shadow-2xs"
                    >
                      <span>View ↗</span>
                    </a>
                  </div>
                </div>

                {/* 2. Official Press Note */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50/50 transition">
                  <div className="flex items-start gap-3.5">
                    <div className="h-11 w-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-slate-800 font-black text-sm uppercase">PDF</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-950 text-base sm:text-lg">TSLPRB Official Press Release Note</h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">Recruitment board executive release summarizing 7,112 posts &amp; key dates &bull; 255 KB</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <a
                      href="/docs/telangana-police-constable-2026-press-note.pdf"
                      download="TSLPRB_Constable_2026_Press_Note.pdf"
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2.5 transition text-xs sm:text-sm border border-slate-300"
                    >
                      <span>📥 Press Note PDF</span>
                    </a>
                    <a
                      href="https://www.tgprb.in/SI_PC_2026/Notification%202026%20Press%20Note%20dated%2029-07-2026.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-2.5 transition text-xs sm:text-sm border border-slate-200 shadow-2xs"
                    >
                      <span>View ↗</span>
                    </a>
                  </div>
                </div>

                {/* 3. Official Recruitment Portal */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50/50 transition">
                  <div>
                    <h3 className="font-bold text-slate-950 text-base sm:text-lg">TSLPRB Official Recruitment Portal</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">Online candidate login, notifications, and results portal (tgprb.in).</p>
                  </div>
                  <a
                    href="https://www.tgprb.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold px-4 py-2.5 transition text-xs sm:text-sm border border-slate-300"
                  >
                    Visit tgprb.in &rarr;
                  </a>
                </div>

                {/* 4. Free Mock Tests */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-950 text-base sm:text-lg">58 Full-Length Bilingual Mock Tests</h3>
                      <span className="rounded-md bg-[#0b2545]/10 text-[#0b2545] border border-[#0b2545]/20 text-xs px-2.5 py-1 font-bold">
                        Free Access
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">200 questions, 180-minute countdown, 0.20 negative marking, English &amp; Telugu explanations.</p>
                  </div>
                  <Link
                    href="/mock-tests/telangana/police-constable-free-mock-test"
                    className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#0b2545] hover:bg-[#071a32] text-white font-semibold px-4 py-2.5 transition text-xs sm:text-sm shadow-sm"
                  >
                    Practice Free Tests &rarr;
                  </Link>
                </div>

                {/* 5. Support & Helpline */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                  <div>
                    <h3 className="font-bold text-slate-950 text-base sm:text-lg">TSLPRB Candidate Support &amp; Helpline</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">Official board query portal for registration and hall ticket concerns.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="shrink-0 text-xs sm:text-sm font-mono text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-bold">
                      040-41895151
                    </span>
                    <span className="shrink-0 text-xs sm:text-sm font-mono text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-bold">
                      support@tgprb.in
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 15: Frequently Asked Questions */}
            <section id="faqs" className="scroll-mt-6">
              <div className="border-b-2 border-[#0b2545] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  15. Frequently Asked Questions (English &amp; Telugu)
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Official clarifications on vacancies, salary, medical eye sight criteria, PET scoring, and certificate verification.
              </p>

              <div className="space-y-4">
                {BILINGUAL_FAQS.map((faq, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-300 bg-white p-5 sm:p-6 shadow-xs hover:shadow-sm transition">
                    <div className="flex items-start gap-3.5">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#0b2545] text-white font-bold text-xs sm:text-sm shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-950">
                          {faq.question}
                        </h3>
                        {faq.teluguQuestion && (
                          <p lang="te" className="font-telugu mt-1.5 text-base sm:text-lg text-slate-900 font-medium leading-[1.8]">
                            {faq.teluguQuestion}
                          </p>
                        )}
                        <p className="mt-2.5 text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
                          {faq.answer}
                        </p>
                        {faq.teluguAnswer && (
                          <p lang="te" className="font-telugu mt-2 text-sm sm:text-base text-slate-700 leading-[1.8] font-normal">
                            {faq.teluguAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Official Source & Reference */}
            <section className="rounded-xl border border-slate-300 bg-white p-5 sm:p-6 text-sm sm:text-base text-slate-700 leading-relaxed shadow-xs">
              <strong className="block text-slate-950 font-bold mb-1.5 text-base sm:text-lg">
                Official Information Source:
              </strong>
              This recruitment guide is compiled from official notifications and Government Orders issued by the Telangana State Level Police Recruitment Board. For direct candidate login and official announcements, visit the official portal at <a href="https://www.tgprb.in" target="_blank" rel="noopener noreferrer" className="text-[#0b2545] underline font-bold hover:text-[#071a32]">www.tgprb.in</a>.
            </section>

          </div>

          {/* Sticky Sidebar Column (30%) - Full Height Alignment */}
          <aside className="lg:col-span-4 xl:col-span-3 2xl:col-span-3 space-y-6 lg:sticky lg:top-16">

            {/* Official PDF Download Card */}
            <div className="rounded-xl border border-slate-300 border-t-4 border-t-[#0b2545] bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <span className="rounded-md bg-[#0b2545] text-white text-xs font-bold px-2.5 py-1 uppercase tracking-wide">
                  Official PDF
                </span>
                <span className="text-xs font-mono font-bold text-slate-600">7,112 Posts</span>
              </div>
              <h3 className="mt-3 text-base sm:text-lg font-bold text-slate-950 leading-snug">
                Official Notification Document
              </h3>
              <p lang="te" className="font-telugu text-sm sm:text-base text-slate-800 mt-1.5 leading-[1.7] font-medium">
                పోలీస్ కానిస్టేబుల్ 7,112 పోస్టుల అధికారిక నోటిఫికేషన్ పీడీఎఫ్ డాక్యుమెంట్
              </p>
              <div className="mt-4 space-y-2.5">
                <a
                  href="/docs/telangana-police-constable-notification-2026-official.pdf"
                  download="TSLPRB_Police_Constable_Notification_2026_Official.pdf"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0b2545] hover:bg-[#071a32] text-white py-3 px-4 text-xs sm:text-sm font-semibold transition shadow-sm"
                >
                  <span>📥 Download Official PDF (748 KB)</span>
                </a>
                <a
                  href="https://doc.tgprb.in/PC+(Civil+et+al)+2026+Notification+dated+29-07-2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 py-2.5 px-4 text-xs sm:text-sm font-semibold transition shadow-2xs"
                >
                  <span>View ↗</span>
                </a>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="rounded-xl border border-slate-300 border-t-4 border-t-[#0b2545] bg-white p-5 sm:p-6 shadow-xs">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0b2545]">
                  Quick Facts Overview
                </h3>
              </div>
              <dl className="mt-4 space-y-3.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <dt className="text-slate-600 font-medium">Recruitment</dt>
                  <dd className="font-bold text-slate-950">Police Constable 2026</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-slate-600 font-medium">Board</dt>
                  <dd className="font-bold text-slate-950">TSLPRB</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-slate-600 font-medium">Total Posts</dt>
                  <dd className="font-bold text-[#0b2545]">7,112 Posts</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-slate-600 font-medium">PWT Exam Date</dt>
                  <dd className="font-bold text-slate-950">20 Dec 2026</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-slate-600 font-medium">Admit Cards</dt>
                  <dd className="font-bold text-slate-950">05 Dec 2026</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-slate-600 font-medium">General Age</dt>
                  <dd className="font-bold text-slate-950">18 – 27 Years</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-slate-600 font-medium">In-Hand Salary</dt>
                  <dd className="font-bold text-slate-950">~₹32.5k–₹35.5k</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-slate-600 font-medium">Eye Sight</dt>
                  <dd className="font-bold text-slate-950">6/6 Uncorrected</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-slate-600 font-medium">Scale of Pay</dt>
                  <dd className="font-bold text-slate-950">₹24,280 – ₹72,850</dd>
                </div>
              </dl>
            </div>

            {/* Free Mock Test Practice Widget */}
            <div className="rounded-xl border border-slate-300 border-t-4 border-t-[#0b2545] bg-white p-5 sm:p-6 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0b2545] block">
                Free Practice Series
              </span>
              <h3 className="mt-1.5 text-lg sm:text-xl font-bold text-slate-950 font-brand">
                58 Police Constable Mock Tests
              </h3>
              <p lang="te" className="font-telugu mt-1 text-sm sm:text-base text-slate-800 font-medium">
                పూర్తి స్థాయి 200 ప్రశ్నల తెలుగు &amp; ఇంగ్లీష్ మాక్ టెస్టులు
              </p>
              <ul className="mt-3.5 space-y-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="text-[#0b2545] font-black">&bull;</span> 200 Questions timed for 180 mins
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#0b2545] font-black">&bull;</span> Genuine 0.20 negative marking
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#0b2545] font-black">&bull;</span> Step-by-step bilingual explanations
                </li>
              </ul>
              <Link
                href="/mock-tests/telangana/police-constable-free-mock-test"
                className="mt-5 block w-full rounded-lg bg-[#0b2545] hover:bg-[#071a32] text-white text-center py-3 text-sm font-bold transition shadow-sm"
              >
                Practice Free Tests &rarr;
              </Link>
            </div>

            {/* Official Website & Helpline Widget */}
            <div className="rounded-xl border border-slate-300 border-t-4 border-t-[#0b2545] bg-white p-5 sm:p-6 text-sm text-slate-700 shadow-xs">
              <h3 className="font-bold text-slate-950 text-base mb-2">Official Board Portal</h3>
              <p className="leading-relaxed text-xs sm:text-sm text-slate-600">
                Candidate registration, hall tickets, and results are published on the official board website:
              </p>
              <a
                href="https://www.tgprb.in"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs sm:text-sm font-bold text-[#0b2545] underline hover:text-[#071a32]"
              >
                https://www.tgprb.in &rarr;
              </a>
            </div>

            {/* Table of Contents Quick Links */}
            <div className="rounded-xl border border-slate-300 border-t-4 border-t-[#0b2545] bg-white p-5 sm:p-6 shadow-xs">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0b2545] border-b border-slate-200 pb-3">
                In This Article
              </h3>
              <ul className="mt-3.5 space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li><a href="#schedule" className="hover:text-[#0b2545] transition font-medium">1. Important Dates</a></li>
                <li><a href="#vacancies" className="hover:text-[#0b2545] transition font-medium">2. Cadre-Wise Vacancies &amp; Post Codes</a></li>
                <li><a href="#salary" className="hover:text-[#0b2545] transition font-medium">3. Salary Structure &amp; In-Hand Pay</a></li>
                <li><a href="#eligibility" className="hover:text-[#0b2545] transition font-medium">4. Age &amp; G.O. Ms 87</a></li>
                <li><a href="#selection" className="hover:text-[#0b2545] transition font-medium">5. Selection Procedure &amp; Marking</a></li>
                <li><a href="#physical" className="hover:text-[#0b2545] transition font-medium">6. PMT &amp; PET 100-Mark Slabs</a></li>
                <li><a href="#medical" className="hover:text-[#0b2545] transition font-medium">7. Medical Standards &amp; Eye Sight 6/6</a></li>
                <li><a href="#driving" className="hover:text-[#0b2545] transition font-medium">8. Driving License Bonus (+3 Marks)</a></li>
                <li><a href="#reservation" className="hover:text-[#0b2545] transition font-medium">9. 95% Local Reservation Rules</a></li>
                <li><a href="#documents" className="hover:text-[#0b2545] transition font-medium">10. Certificate Verification Checklist</a></li>
                <li><a href="#pattern" className="hover:text-[#0b2545] transition font-medium">11. Exam Pattern &amp; Qualifying Marks</a></li>
                <li><a href="#syllabus" className="hover:text-[#0b2545] transition font-medium">12. Syllabus, Marks Wise &amp; Telugu PDF</a></li>
                <li><a href="#fees" className="hover:text-[#0b2545] transition font-medium">13. Application Fee &amp; Steps</a></li>
                <li><a href="#links" className="hover:text-[#0b2545] transition font-medium">14. Official Notification PDF &amp; Links</a></li>
                <li><a href="#faqs" className="hover:text-[#0b2545] transition font-medium">15. Frequently Asked Questions</a></li>
              </ul>
            </div>

          </aside>

        </div>
      </div>

      {/* Broadsheet Newspaper Editorial Footer */}
      <footer className="mt-16 border-t border-slate-300 bg-[#d8dce2] py-10 text-center text-xs sm:text-sm text-slate-700 w-full shadow-inner">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 space-y-2">
          <p className="font-bold text-slate-900 text-sm sm:text-base">
            Varadhi Prep &bull; Examination Information &amp; Practice Portal
          </p>
          <p className="text-slate-600">
            Official examination details sourced directly from Telangana State Level Police Recruitment Board announcements.
          </p>
          <p>
            Official Board Portal:{" "}
            <a href="https://www.tgprb.in" target="_blank" rel="noopener noreferrer" className="text-[#0b2545] underline hover:text-[#071a32] font-bold">
              www.tgprb.in
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
