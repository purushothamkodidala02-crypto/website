import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandLockup } from "@/components/brand/VaradhiBrand";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

const PRIMARY_SLUG = "tgpcb-assistant-scientist-notification-2026";
const CANONICAL_PATH = `/news/${PRIMARY_SLUG}`;

export const metadata: Metadata = {
  title: "TGPSC TGPCB Assistant Scientist Cutoff Marks 2026 & Notification: 20 Posts, Chemistry Syllabus & Selected Candidates",
  description:
    "Official TGPSC TGPCB Assistant Scientist (Analyst Grade-II) 2026 Cut-Off Marks and Selected Candidates List (Notification No. 01/OG/PC/2026). 19,568 candidates applied online for 20 posts (~978/post). Check OC (228.80), OCW (225.78), BC-B (225.79), BC-D (223.77), BC-A (222.85), SC (202.79), ST (207.68), EWS (210.68) cutoffs and Paper-II Chemistry syllabus.",
  keywords: [
    "TGPCB Assistant Scientist Cutoff Marks 2026",
    "TGPCB Assistant Scientist candidates applied online 19568",
    "TGPSC TGPCB Assistant Scientist Notification 2026",
    "Telangana Pollution Control Board Analyst Grade 2 Recruitment",
    "TGPCB Assistant Scientist Selected Candidates Marks List",
    "TGPCB Assistant Scientist Cutoff Marks",
    "TSPCB Analyst Grade II exam pattern cut off",
    "TGPCB Assistant Scientist Chemistry Syllabus",
    "TGPCB Assistant Scientist salary in hand pay scale",
    "TGPSC Assistant Scientist 20 vacancies",
    "తెలంగాణ పొల్యూషన్ కంట్రోల్ బోర్డ్ అసిస్టెంట్ సైంటిస్ట్ కటాఫ్ మార్కులు 2026",
    "TGPCB అనలిస్ట్ గ్రేడ్ 2 సిలబస్ పరీక్ష విధానం",
    "TGPSC Assistant Scientist provisional selection list 2026",
    "TGPCB Assistant Scientist mock tests in Telugu and English",
  ],
  alternates: { canonical: absoluteUrl(CANONICAL_PATH) },
  openGraph: {
    type: "article",
    url: absoluteUrl(CANONICAL_PATH),
    title: "TGPCB Assistant Scientist Cutoff Marks 2026 & Notification: 20 Posts, Syllabus & Selection List",
    description:
      "Official TGPSC Cutoff Marks and 19 selected candidates marks list for Assistant Scientist (Analyst Grade-II) in Telangana Pollution Control Board (Notification No. 01/OG/PC/2026). 19,568 candidates applied online (~978/post).",
    siteName: "Varadhi Prep",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "TGPCB Assistant Scientist Cutoff Marks 2026 - Varadhi Prep",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TGPCB Assistant Scientist Cutoff Marks 2026 (Notification No. 01/OG/PC/2026)",
    description:
      "Official TGPSC 2026 Cutoff Marks: OC 228.80, OCW 225.78, BC-B 225.79, SC 202.79, ST 207.68. 19,568 candidates applied online. Full 19 selected candidates marks breakdown & Chemistry syllabus.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

// ── Official Recruitment Constants ────────────────────────

const TOTAL_VACANCIES = 20;
const TOTAL_APPLICANTS = 19568;
const APPLICANTS_PER_POST = "978.4";

const SCHEDULE_EVENTS = [
  {
    title: "Official Notification No. 01/OG/PC/2026 Issued",
    teluguTitle: "అధికారిక నోటిఫికేషన్ విడుదల (నెం. 01/OG/PC/2026)",
    date: "20 April 2026",
    status: "Completed",
    detail: "TGPSC released direct recruitment for 20 posts of Assistant Scientist (Analyst Grade-II) in TGPCB.",
  },
  {
    title: "Online Application Window (19,568 Candidates Applied)",
    teluguTitle: "ఆన్‌లైన్ దరఖాస్తుల స్వీకరణ (19,568 మంది దరఖాస్తుదారులు)",
    date: "Concluded",
    status: "Completed",
    detail: "A total of 19,568 candidates applied online through One Time Registration (OTR) on websitenew.tgpsc.gov.in (Competition ratio: ~978.4 applicants per post).",
  },
  {
    title: "Written Examination (CBRT Mode)",
    teluguTitle: "కంప్యూటర్ ఆధారిత రాత పరీక్ష (CBRT)",
    date: "24 October 2026",
    status: "Completed",
    detail: "Objective type Computer Based Recruitment Test for 300 marks (Paper-I GS 150M + Paper-II Chemistry 150M).",
  },
  {
    title: "Certificate Verification & Medical Evaluation",
    teluguTitle: "ధ్రువపత్రాల పరిశీలన & వైద్య పరీక్షలు",
    date: "November 2026",
    status: "Completed",
    detail: "Shortlisted candidates attended original certificate scrutiny and medical board verification at TGPSC office.",
  },
  {
    title: "Official Selected Candidates & Cut-Off Marks Released",
    teluguTitle: "అధికారిక కటాఫ్ మార్కులు & ఎంపికైన అభ్యర్థుల జాబితా విడుదల",
    date: "14 November 2026",
    status: "Official & Published",
    detail: "TGPSC released official Press Note with marks of 19 selected candidates and community-wise cut-offs under Notification No. 01/OG/PC/2026.",
  },
];

// ── Official 2026 Cut-Off Marks (Notification No. 01/OG/PC/2026) ────

const COMMUNITY_CUTOFFS = [
  {
    category: "Open Competition Carry Forward (OC-UR-CF)",
    selectionCategory: "OC-UR-CF",
    cutoffMarks: "248.91275",
    grlRank: 1,
    htno: "2620114891",
    gender: "Male",
    candidateCommunity: "BC-A",
    percentage: "82.97%",
    description: "State 1st Ranker / Highest mark overall selected against OC Carry Forward vacancy",
  },
  {
    category: "Open Competition General (OC-UR)",
    selectionCategory: "OC-UR",
    cutoffMarks: "228.79866",
    grlRank: 8,
    htno: "2620119565",
    gender: "Male",
    candidateCommunity: "BC-D",
    percentage: "76.27%",
    description: "Last selected candidate under open general merit (Open Competition cutoff)",
  },
  {
    category: "Open Competition Women (OCW-UR)",
    selectionCategory: "OCW-UR",
    cutoffMarks: "225.77852",
    grlRank: 10,
    htno: "2620115302",
    gender: "Female",
    candidateCommunity: "BC-D",
    percentage: "75.26%",
    description: "Last female candidate selected under Open Competition Women quota",
  },
  {
    category: "Backward Class - B (BCB-UR)",
    selectionCategory: "BCB-UR",
    cutoffMarks: "225.79195",
    grlRank: 9,
    htno: "2620106702",
    gender: "Male",
    candidateCommunity: "BC-B",
    percentage: "75.26%",
    description: "BC-B communal quota cutoff (candidates also qualified in OC merit up to 239.86)",
  },
  {
    category: "Backward Class - D (BCD-UR)",
    selectionCategory: "BCD-UR",
    cutoffMarks: "223.76510",
    grlRank: 16,
    htno: "2620107811",
    gender: "Female",
    candidateCommunity: "BC-D",
    percentage: "74.59%",
    description: "BC-D communal reservation cutoff mark",
  },
  {
    category: "Backward Class - A (BCA-UR)",
    selectionCategory: "BCA-UR",
    cutoffMarks: "222.84564",
    grlRank: 17,
    htno: "2620108940",
    gender: "Male",
    candidateCommunity: "BC-A",
    percentage: "74.28%",
    description: "BC-A communal quota cutoff (top BC-A secured State 1st Rank 248.91 in OC)",
  },
  {
    category: "Scheduled Caste Group-2 (SC-GR2-UR)",
    selectionCategory: "SC-GR2-UR",
    cutoffMarks: "222.84564",
    grlRank: 18,
    htno: "2620110880",
    gender: "Male",
    candidateCommunity: "SC-GR-2",
    percentage: "74.28%",
    description: "SC Categorization Group-2 communal cutoff mark",
  },
  {
    category: "SC Group-3 Carry Forward (SC-GR3-UR-CF)",
    selectionCategory: "SC-GR3-UR-CF",
    cutoffMarks: "239.73826",
    grlRank: 4,
    htno: "2620106669",
    gender: "Male",
    candidateCommunity: "SC-GR-3",
    percentage: "79.91%",
    description: "SC Categorization Group-3 Carry Forward roster point (Rank 4 overall)",
  },
  {
    category: "Scheduled Caste Group-3 (SC-GR3-UR)",
    selectionCategory: "SC-GR3-UR",
    cutoffMarks: "202.78523",
    grlRank: 104,
    htno: "2620104957",
    gender: "Male",
    candidateCommunity: "SC-GR-3",
    percentage: "67.60%",
    description: "SC Categorization Group-3 regular communal cutoff mark (lowest selected mark)",
  },
  {
    category: "Scheduled Tribe (ST-UR)",
    selectionCategory: "ST-UR",
    cutoffMarks: "207.68456",
    grlRank: 71,
    htno: "2620100099",
    gender: "Male",
    candidateCommunity: "ST",
    percentage: "69.23%",
    description: "ST communal cutoff mark (top ST candidate also qualified in OC merit with 232.76, Rank 5)",
  },
  {
    category: "Economically Weaker Section (EWS-UR)",
    selectionCategory: "EWS-UR",
    cutoffMarks: "210.68456",
    grlRank: 54,
    htno: "2620103820",
    gender: "Male",
    candidateCommunity: "OC",
    percentage: "70.23%",
    description: "Economically Weaker Section (EWS) reservation cutoff mark",
  },
];

// ── Complete 19 Selected Candidates (Official TGPSC Press Note) ────

const SELECTED_CANDIDATES = [
  { slNo: 1, grlRank: 1, htno: "2620114891", marks: "248.91275", gender: "M", community: "BC-A", ews: "-", selectedCategory: "OC-UR-CF" },
  { slNo: 2, grlRank: 2, htno: "2620113661", marks: "239.85906", gender: "M", community: "BC-B", ews: "-", selectedCategory: "OC-UR" },
  { slNo: 3, grlRank: 3, htno: "2620113002", marks: "239.78523", gender: "F", community: "OC", ews: "No", selectedCategory: "OC-UR" },
  { slNo: 4, grlRank: 4, htno: "2620106669", marks: "239.73826", gender: "M", community: "SC-GR-3", ews: "-", selectedCategory: "SC-GR3-UR-CF" },
  { slNo: 5, grlRank: 5, htno: "2620115968", marks: "232.75839", gender: "M", community: "ST", ews: "-", selectedCategory: "OC-UR" },
  { slNo: 6, grlRank: 6, htno: "2620106442", marks: "231.85235", gender: "M", community: "OC", ews: "Yes", selectedCategory: "OC-UR" },
  { slNo: 7, grlRank: 7, htno: "2620119328", marks: "229.79866", gender: "M", community: "BC-B", ews: "-", selectedCategory: "OC-UR" },
  { slNo: 8, grlRank: 8, htno: "2620119565", marks: "228.79866", gender: "M", community: "BC-D", ews: "-", selectedCategory: "OC-UR" },
  { slNo: 9, grlRank: 9, htno: "2620106702", marks: "225.79195", gender: "M", community: "BC-B", ews: "-", selectedCategory: "BCB-UR" },
  { slNo: 10, grlRank: 10, htno: "2620115302", marks: "225.77852", gender: "F", community: "BC-D", ews: "-", selectedCategory: "OCW-UR" },
  { slNo: 11, grlRank: 16, htno: "2620107811", marks: "223.76510", gender: "F", community: "BC-D", ews: "-", selectedCategory: "BCD-UR" },
  { slNo: 12, grlRank: 17, htno: "2620108940", marks: "222.84564", gender: "M", community: "BC-A", ews: "-", selectedCategory: "BCA-UR" },
  { slNo: 13, grlRank: 18, htno: "2620110880", marks: "222.84564", gender: "M", community: "SC-GR-2", ews: "-", selectedCategory: "SC-GR2-UR" },
  { slNo: 14, grlRank: 30, htno: "2620111291", marks: "217.75168", gender: "F", community: "ST", ews: "-", selectedCategory: "ST-UR" },
  { slNo: 15, grlRank: 43, htno: "2620102448", marks: "213.80537", gender: "M", community: "OC", ews: "Yes", selectedCategory: "EWS-UR" },
  { slNo: 16, grlRank: 52, htno: "2620111222", marks: "210.81879", gender: "M", community: "ST", ews: "-", selectedCategory: "ST-UR" },
  { slNo: 17, grlRank: 54, htno: "2620103820", marks: "210.68456", gender: "M", community: "OC", ews: "Yes", selectedCategory: "EWS-UR" },
  { slNo: 18, grlRank: 71, htno: "2620100099", marks: "207.68456", gender: "M", community: "ST", ews: "-", selectedCategory: "ST-UR" },
  { slNo: 19, grlRank: 104, htno: "2620104957", marks: "202.78523", gender: "M", community: "SC-GR-3", ews: "-", selectedCategory: "SC-GR3-UR" },
];

const SALARY_COMPONENTS = [
  { item: "Pay Scale (Telangana RPS)", amount: "₹45,960 – ₹1,24,150", note: "Sanctioned RPS grade for Assistant Scientist (Analyst Grade-II)" },
  { item: "Starting Basic Pay", amount: "₹45,960", note: "Initial entry basic pay" },
  { item: "Dearness Allowance (DA @ ~33.67%)", amount: "₹15,475", note: "State DA percentage revised bi-annually" },
  { item: "House Rent Allowance (HRA @ 24% for Hyderabad / Head Office)", amount: "₹11,030", note: "24% HRA for posting at Sanathnagar Head Office / Central Laboratory" },
  { item: "Medical & Lab Allowances", amount: "₹1,000", note: "Standard medical aid and chemical lab allowances" },
  { item: "Gross Monthly Salary", amount: "₹73,465", note: "Total gross earnings before statutory deductions" },
];

const SALARY_DEDUCTIONS = [
  { item: "Contributory Pension Scheme (CPS / NPS - 10% Basic+DA)", amount: "₹6,144", note: "10% employee contribution towards retirement pension corpus" },
  { item: "Professional Tax (PT)", amount: "₹200", note: "State municipal professional tax slab" },
  { item: "Employees Health Scheme (EHS) / TSGLI", amount: "₹1,200", note: "Cashless healthcare and state group life insurance" },
  { item: "Total Monthly Deductions", amount: "₹7,544", note: "Total deductions deducted from gross earnings" },
  { item: "Net In-Hand Salary (Take-Home in Hyderabad/HQ)", amount: "₹65,921", note: "Net amount credited directly to bank account each month" },
];

const AGE_CRITERIA = [
  { category: "Open Competition (OC) / General", ageRange: "18 to 44 Years", detail: "Upper age limit raised by 10 years (from 34 to 44 years) vide G.O.Ms.No.86, G.A.(Ser.A) Dept, Dt. 18/05/2026. Age reckoned as on 01/07/2026." },
  { category: "SC, ST, BC & EWS Candidates", ageRange: "18 to 49 Years", detail: "5 years upper age relaxation under Telangana state service rules." },
  { category: "Physically Handicapped (PwD) Persons", ageRange: "18 to 54 Years", detail: "10 years upper age relaxation subject to valid SADAREM disability certificate." },
  { category: "Telangana State Govt Employees", ageRange: "Up to 5 Years", detail: "Based on regular service length (excluding Corporation/Board employees)." },
  { category: "Ex-Servicemen & NCC Instructors", ageRange: "3 Years + Service Period", detail: "3 years plus total length of service rendered in armed forces / NCC." },
];

const BILINGUAL_FAQS = [
  {
    question: "How many candidates applied online for TGPCB Assistant Scientist (Analyst Grade-II) 2026?",
    answer: "A total of 19,568 candidates applied online for the 20 vacancies of Assistant Scientist (Analyst Grade-II) in the Telangana Pollution Control Board (TGPCB / TSPCB). This translates to an intense competition ratio of approximately 978 applicants per vacancy (~978.4:1). From these 19,568 applicants, only 19 candidates were selected in the final merit list, yielding an overall selection rate of 0.097% (1 in every 1,030 applicants).",
    teluguQuestion: "TGPCB అసిస్టెంట్ సైంటిస్ట్ పోస్టులకు ఎంత మంది అభ్యర్థులు ఆన్‌లైన్‌లో దరఖాస్తు చేసుకున్నారు? పోటీ తీవ్రత ఎంత?",
    teluguAnswer: "తెలంగాణ పొల్యూషన్ కంట్రోల్ బోర్డులోని 20 అసిస్టెంట్ సైంటిస్ట్ (అనలిస్ట్ గ్రేడ్-2) పోస్టులకు మొత్తం 19,568 మంది అభ్యర్థులు ఆన్‌లైన్‌లో దరఖాస్తు చేసుకున్నారు. ప్రతి పోస్టుకు సగటున సుమారు 978 మంది (978:1) పోటీ పడ్డారు. తుది ఎంపిక జాబితాలో 19 మంది అభ్యర్థులు మాత్రమే నియామకం పొందగా, ఎంపిక శాతం సుమారు 0.097% (ప్రతి 1,030 మందిలో ఒకరు) గా నమోదైంది.",
  },
  {
    question: "What are the official cut-off marks for TGPCB Assistant Scientist (Analyst Grade-II) 2026?",
    answer: "As per the official TGPSC Press Note (Notification No. 01/OG/PC/2026, dated 20/04/2026): The Open Competition (OC-UR General) cut-off is 228.79866 out of 300 marks (76.27%). Open Competition Women (OCW-UR) cut-off is 225.77852 (75.26%). Communal cut-offs: BC-B (225.79195), BC-D (223.76510), BC-A (222.84564), SC Group-2 (222.84564), SC Group-3 regular (202.78523), SC Group-3 Carry Forward (239.73826), ST (207.68456), and EWS (210.68456). The highest mark overall is 248.91275 (82.97%) by Rank 1 in OC-UR-CF.",
    teluguQuestion: "TGPCB అసిస్టెంట్ సైంటిస్ట్ (అనలిస్ట్ గ్రేడ్-2) 2026 అధికారిక కటాఫ్ మార్కులు ఎంత?",
    teluguAnswer: "TGPSC అధికారిక ప్రెస్ నోట్ (నోటిఫికేషన్ నెం. 01/OG/PC/2026) ప్రకారం: ఓపెన్ కాంపిటీషన్ (OC-UR జనరల్) కటాఫ్ మార్కులు 228.79866 / 300 (76.27%). ఓసీ మహిళల కటాఫ్ 225.77852. ఇతర వర్గాల కటాఫ్‌లు: బీసీ-బి (225.79195), బీసీ-డి (223.76510), బీసీ-ఎ (222.84564), ఎస్సీ గ్రూప్-2 (222.84564), ఎస్సీ గ్రూప్-3 రెగ్యులర్ (202.78523), ఎస్సీ గ్రూప్-3 క్యారీ ఫార్వర్డ్ (239.73826), ఎస్టీ (207.68456), మరియు ఈడబ్ల్యూఎస్ (210.68456). స్టేట్ ఫస్ట్ ర్యాంకర్ మార్కులు 248.91275.",
  },
  {
    question: "Who is the topper in TGPCB Assistant Scientist 2026 and what is the highest mark?",
    answer: "Hall Ticket Number 2620114891 (BC-A Male candidate) secured the State First Rank (GRL Rank 1) with an outstanding score of 248.91275 marks out of 300 (82.97%), selected under the OC-UR-CF vacancy.",
    teluguQuestion: "TGPCB అసిస్టెంట్ సైంటిస్ట్ 2026 రాత పరీక్షలో స్టేట్ టాపర్ ఎవరు? అత్యధిక మార్కులు ఎంత?",
    teluguAnswer: "హాల్ టికెట్ నంబర్ 2620114891 (BC-A పురుష అభ్యర్థి) 300 మార్కులకు గాను 248.91275 మార్కులు (82.97%) సాధించి స్టేట్ ఫస్ట్ ర్యాంక్ (GRL Rank 1) కైవసం చేసుకున్నారు. ఈ అభ్యర్థి OC-UR-CF కేటగిరీ కింద ఎంపికయ్యారు.",
  },
  {
    question: "What is the total vacancy count and pay scale for TGPCB Assistant Scientist (Analyst Grade-II)?",
    answer: "TGPSC advertised 20 vacancies for the post of Assistant Scientist (Analyst Grade-II) in the Telangana Pollution Control Board (TGPCB / TSPCB). The sanctioned scale of pay is ₹45,960 – ₹1,24,150/-, yielding an initial gross monthly salary of ~₹73,465 and an estimated net take-home in-hand salary of ~₹65,921 per month in Hyderabad.",
    teluguQuestion: "TGPCB అసిస్టెంట్ సైంటిస్ట్ (అనలిస్ట్ గ్రేడ్-2) నోటిఫికేషన్‌లో ఖాళీల సంఖ్య మరియు పే స్కేల్ ఎంత?",
    teluguAnswer: "తెలంగాణ పొల్యూషన్ కంట్రోల్ బోర్డ్ (TGPCB) లో అసిస్టెంట్ సైంటిస్ట్ (అనలిస్ట్ గ్రేడ్-2) కేడర్‌లో మొత్తం 20 ఖాళీలను TGPSC భర్తీ చేస్తోంది. పే స్కేల్ ₹45,960 నుండి ₹1,24,150/-. ప్రారంభ స్థూల వేతనం నెలకు సుమారు ₹73,465 కాగా, కటింగ్‌లు పోను చేతికి వచ్చే నికర శాలరీ సుమారు ₹65,921 వరకు ఉంటుంది.",
  },
  {
    question: "What is the educational qualification required for Assistant Scientist in TGPCB?",
    answer: "Candidates must possess a Bachelor's Degree with Chemistry as one of the optional subjects (such as B.Sc. Chemistry / Applied Chemistry / Industrial Chemistry) from a recognized University in India established or incorporated by or under a Central Act, Provincial Act, or State Act recognized by the UGC.",
    teluguQuestion: "ఈ పోస్టుకు దరఖాస్తు చేసుకోవడానికి అర్హత ఏమిటి?",
    teluguAnswer: "అభ్యర్థులు తప్పనిసరిగా గుర్తింపు పొందిన విశ్వవిద్యాలయం నుండి రసాయన శాస్త్రం (Chemistry) ఒక సబ్జెక్ట్‌గా బ్యాచిలర్స్ డిగ్రీ (B.Sc Chemistry / Applied Chemistry) ఉత్తీర్ణులై ఉండాలి.",
  },
  {
    question: "What is the examination pattern and total marks for the written test?",
    answer: "The selection is based on a Computer Based Recruitment Test (CBRT) comprising two objective papers totaling 300 marks: Paper-I covers General Studies & General Abilities (150 Questions, 150 Minutes, 150 Marks - 1 mark/Q, Bilingual in English & Telugu); Paper-II covers Chemistry at Degree Level (150 Questions, 150 Minutes, 150 Marks - 1 mark/Q, in English).",
    teluguQuestion: "పరీక్ష విధానం మరియు మొత్తం మార్కులు ఎంత?",
    teluguAnswer: "ఎంపిక ప్రక్రియ 300 మార్కులకు కంప్యూటర్ ఆధారిత రాత పరీక్ష (CBRT) ద్వారా జరుగుతుంది. పేపర్-1: జనరల్ స్టడీస్ & జనరల్ ఎబిలిటీస్ (150 ప్రశ్నలు, 150 నిమిషాలు, 150 మార్కులు - ఇంగ్లీష్ & తెలుగు మాధ్యమంలో); పేపర్-2: కెమిస్ట్రీ డిగ్రీ స్థాయి (150 ప్రశ్నలు, 150 నిమిషాలు, 150 మార్కులు - ఇంగ్లీష్ మాధ్యమంలో).",
  },
  {
    question: "What are the core topics tested in Paper-II Chemistry for Pollution Control Board analysts?",
    answer: "Paper-II comprehensively covers: (1) Inorganic Chemistry (Atomic structure, periodicity, chemical bonding, coordination compounds, metallurgy); (2) Physical Chemistry (Thermodynamics, chemical kinetics, electrochemistry, solutions, phase equilibria); (3) Organic Chemistry (Reaction mechanisms, hydrocarbons, functional groups, spectroscopy UV/IR/NMR, biomolecules); and (4) Environmental & Analytical Chemistry (BOD, COD, DO, heavy metal analysis by AAS/ICP, air pollution chemistry, smog, ozone depletion, wastewater treatment, and chromatography).",
    teluguQuestion: "పేపర్-2 కెమిస్ట్రీ సిలబస్‌లో ప్రధానంగా ఏ అంశాలు ఉంటాయి?",
    teluguAnswer: "పేపర్-2 లో: (1) ఇనార్గానిక్ కెమిస్ట్రీ (పరమాణు నిర్మాణం, ఆవర్తన పట్టిక, కోఆర్డినేషన్ సమ్మేళనాలు), (2) ఫిజికల్ కెమిస్ట్రీ (థర్మోడైనమిక్స్, కెమికల్ కైనటిక్స్, ఎలెక్ట్రోకెమిస్ట్రీ), (3) ఆర్గానిక్ కెమిస్ట్రీ (రియాక్షన్ మెకానిజమ్స్, స్పెక్ట్రోస్కోపీ UV/IR/NMR, బయోమాలిక్యూల్స్), మరియు (4) ఎన్విరాన్‌మెంటల్ & అనలిటికల్ కెమిస్ట్రీ (నీటి నాణ్యత BOD, COD, DO, భార లోహాల గుర్తింపు, వాయు కాలుష్యం, క్రోమటోగ్రఫీ) ఉంటాయి.",
  },
  {
    question: "What are the key job duties of an Assistant Scientist (Analyst Grade-II) in TGPCB?",
    answer: "Assistant Scientists work in TGPCB's Central Laboratory and Regional Laboratories across Telangana. Key duties include chemical, bacteriological, and instrumental analysis of industrial effluents, wastewater, ambient air, stack emissions, soil, and hazardous wastes; monitoring environmental standards; operating advanced analytical instruments (GC, HPLC, AAS, spectrophotometers); and preparing compliance reports under Water and Air Pollution Acts.",
    teluguQuestion: "TGPCB అసిస్టెంట్ సైంటిస్ట్ విధులు మరియు బాధ్యతలు ఏమిటి?",
    teluguAnswer: "అసిస్టెంట్ సైంటిస్టులు తెలంగాణ పొల్యూషన్ కంట్రోల్ బోర్డు సెంట్రల్ మరియు రీజినల్ ల్యాబొరేటరీలలో పనిచేస్తారు. పరిశ్రమల నుండి వచ్చే వ్యర్థ జలాలు, గాలి కాలుష్యం, నేల నమూనాలను రసాయనిక పద్ధతులలో విశ్లేషించడం (BOD, COD, కెమికల్ అనాలిసిస్), ఆధునిక ల్యాబ్ పరికరాలను (GC, HPLC, AAS) ఆపరేట్ చేయడం మరియు కాలుష్య నియంత్రణ చట్టాల ప్రకారం నివేదికలను రూపొందించడం వీరి ముఖ్య విధులు.",
  },
  {
    question: "What is the fee structure and exam fee exemption?",
    answer: "Online Application Processing Fee is ₹1000/- for OC & BC applicants and ₹500/- for SC, ST, and PwD applicants. The Examination Fee is ₹120/-, from which all unemployed candidates are 100% exempted.",
    teluguQuestion: "దరఖాస్తు ఫీజు ఎంత? నిరుద్యోగులకు ఫీజు మినహాయింపు ఉందా?",
    teluguAnswer: "ఆన్‌లైన్ ప్రాసెసింగ్ ఫీజు: ఓసీ మరియు బీసీ అభ్యర్థులకు ₹1000/-, ఎస్సీ, ఎస్టీ, దివ్యాంగులకు ₹500/-. పరీక్ష ఫీజు ₹120/- కాగా, నిరుద్యోగ అభ్యర్థులందరికీ పరీక్ష ఫీజు నుండి పూర్తి మినహాయింపు ఉంది.",
  },
];

export default function TgpcbAssistantScientistPage() {
  const canonical = absoluteUrl(CANONICAL_PATH);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: "TGPSC TGPCB Assistant Scientist (Analyst Grade-II) Notification 2026: 20 Posts, Chemistry Syllabus & Salary",
      description:
        "Official TGPSC recruitment guide for 20 Assistant Scientist (Analyst Grade-II) posts in Telangana Pollution Control Board (TGPCB). Complete breakdown of B.Sc. Chemistry eligibility, 300-mark CBRT scheme, in-hand salary (₹45,960–₹1,24,150), and official Degree Chemistry syllabus.",
      url: canonical,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonical,
      },
      image: [absoluteUrl("/opengraph-image")],
      datePublished: "2026-09-20T10:00:00+05:30",
      dateModified: new Date().toISOString(),
      inLanguage: ["en-IN", "te-IN"],
      articleSection: "Pollution Control Board & Scientific Recruitment Notifications",
      keywords:
        "TGPCB Assistant Scientist Notification 2026, TSPCB Analyst Grade 2 Recruitment, TGPCB Chemistry Syllabus PDF, TGPSC Assistant Scientist Salary, Telangana Pollution Control Board Analyst 20 Posts",
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
      title: "Assistant Scientist (Analyst Grade-II) in Telangana Pollution Control Board",
      description:
        "Direct recruitment for 20 posts of Assistant Scientist (Analyst Grade-II) in Telangana Pollution Control Board (TGPCB) by Telangana Public Service Commission (TGPSC). Pay scale ₹45,960 - ₹1,24,150. Degree with Chemistry required.",
      identifier: {
        "@type": "PropertyValue",
        name: "TGPSC",
        value: "TGPCB Assistant Scientist Recruitment 2026",
      },
      datePosted: "2026-09-20",
      employmentType: "FULL_TIME",
      industry: "Environmental Protection & Scientific Laboratory Analysis",
      directApply: true,
      hiringOrganization: {
        "@type": "Organization",
        name: "Telangana Pollution Control Board (TGPCB)",
        sameAs: "https://tspcb.cgg.gov.in",
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
        credentialCategory: "Bachelor's Degree with Chemistry as one of the optional subjects",
      },
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: {
          "@type": "QuantitativeValue",
          minValue: 45960,
          maxValue: 124150,
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
        { "@type": "ListItem", position: 3, name: "TGPCB Assistant Scientist 2026", item: canonical },
      ],
    },
  ];

  return (
    <main className="min-h-screen w-full bg-[#f2faf7] text-[#132a26] antialiased">
      <JsonLd data={jsonLd} />

      {/* Preload Google Mandali Telugu Font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Mandali&display=swap"
      />

      {/* Top Emerald Gradient Banner Rule */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#047857] via-[#059669] to-[#0284c7]" />

      {/* Broadsheet Masthead */}
      <header className="border-b border-[#c8ebe1] bg-white w-full sticky top-0 z-30 shadow-xs">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Varadhi Prep home">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium text-slate-700">
            <span className="hidden sm:inline text-emerald-800 font-semibold text-xs bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Telangana PCB • 20 Vacancies
            </span>
            <a
              href="https://www.tgpsc.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700 bg-white hover:bg-emerald-50 text-emerald-800 px-3 py-2 font-bold transition text-xs sm:text-sm shadow-2xs"
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
      <article className="border-b border-[#c8ebe1] bg-[#f2faf7] w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-6 sm:py-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumbs" className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
            <Link href="/" className="hover:text-emerald-800 transition font-medium">Home</Link>
            <span>/</span>
            <span className="text-slate-600">Recruitment News</span>
            <span>/</span>
            <span className="font-bold text-slate-950">TGPCB Assistant Scientist (Analyst Grade-II) 2026</span>
          </nav>

          {/* Official Commission Notice Badge */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded border border-emerald-300">
              Telangana Public Service Commission (TGPSC) &bull; TGPCB / TSPCB
            </span>
            <span className="text-xs font-semibold text-slate-600">
              Post: Assistant Scientist (Analyst Grade-II)
            </span>
          </div>

          {/* Headline & Telugu Title */}
          <div className="mt-3 max-w-6xl">
            <h1 className="font-brand text-2xl sm:text-3xl lg:text-[2.65rem] font-bold text-slate-950 leading-[1.2] tracking-tight">
              TGPCB Assistant Scientist (Analyst Grade-II) Notification 2026: 20 Posts, Chemistry Syllabus, Pay Scale ₹45,960–₹1,24,150 &amp; Selection Updates
            </h1>
            <p lang="te" className="font-telugu text-lg sm:text-xl lg:text-2xl text-emerald-950 mt-2.5 leading-[1.75] font-normal">
              తెలంగాణ పొల్యూషన్ కంట్రోల్ బోర్డ్ (TGPCB) అసిస్టెంట్ సైంటిస్ట్ (అనలిస్ట్ గ్రేడ్-2) 20 పోస్టుల నోటిఫికేషన్, బి.ఎస్సీ కెమిస్ట్రీ సిలబస్, పరీక్ష విధానం &amp; శాలరీ వివరాలు
            </p>
          </div>

          {/* Byline / Metadata Strip */}
          <div className="mt-4 pt-3 border-t border-[#c8ebe1] flex flex-wrap items-center justify-between gap-y-2 text-xs sm:text-sm text-slate-700">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="font-bold text-slate-950">Varadhi Science &amp; Engineering Desk</span>
              <span className="text-slate-400">&bull;</span>
              <span>Updated: November 2026</span>
              <span className="text-slate-400">&bull;</span>
              <span>B.Sc. Chemistry Degree Standard &bull; 300 Marks CBRT &bull; State Cadre</span>
            </div>
            <div className="text-emerald-800 font-semibold">
              <span>8 min read</span>
            </div>
          </div>

          {/* Exam Snapshot Cards */}
          <div className="mt-8 rounded-2xl border border-[#c8ebe1] bg-white p-5 sm:p-7 w-full shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3.5 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-emerald-900">
                  Key Recruitment Highlights &amp; Snapshot
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-2xs self-start sm:self-auto">
                <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" />
                Pollution Control Board Laboratories
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-left">
              <div className="rounded-xl border border-slate-200 bg-[#f7fbf9] p-3.5 sm:p-4 hover:border-emerald-300 hover:bg-white hover:shadow-xs transition">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Vacancies</span>
                <strong className="text-xl sm:text-2xl font-black text-emerald-900 block mt-1">{TOTAL_VACANCIES} Posts</strong>
                <span className="text-xs text-slate-600 font-medium block mt-0.5">19 Selected in Merit</span>
              </div>

              <div className="rounded-xl border-2 border-amber-300 bg-amber-50/70 p-3.5 sm:p-4 hover:border-amber-400 hover:bg-white hover:shadow-xs transition">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">Candidates Applied Online</span>
                <strong className="text-xl sm:text-2xl font-black text-amber-950 block mt-1">19,568</strong>
                <span className="text-xs text-amber-800 font-bold block mt-0.5">~978 Applicants / Post</span>
              </div>

              <div className="rounded-xl border-2 border-emerald-400 bg-emerald-50/70 p-3.5 sm:p-4 hover:border-emerald-500 hover:bg-white hover:shadow-xs transition">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">2026 OC Cut-Off</span>
                <strong className="text-lg sm:text-xl font-black text-emerald-950 block mt-1">228.80 <span className="text-xs font-bold text-emerald-700">/ 300</span></strong>
                <span className="text-xs text-emerald-800 font-medium block mt-0.5">76.27% • Rank 8</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#f7fbf9] p-3.5 sm:p-4 hover:border-emerald-300 hover:bg-white hover:shadow-xs transition">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">2026 Topper Score</span>
                <strong className="text-lg sm:text-xl font-black text-emerald-900 block mt-1">248.91 <span className="text-xs font-bold text-slate-500">/ 300</span></strong>
                <span className="text-xs text-slate-600 font-medium block mt-0.5">82.97% • Rank 1</span>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 bg-[#f7fbf9] p-3.5 sm:p-4 hover:border-emerald-300 hover:bg-white hover:shadow-xs transition">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Scale of Pay</span>
                <strong className="text-base sm:text-lg font-black text-emerald-900 block mt-1">₹45,960–₹1,24,150</strong>
                <span className="text-xs text-slate-600 font-medium block mt-0.5">Gross ~₹73,465/mo</span>
              </div>
            </div>

            {/* Quick Links Row */}
            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-700">Quick Jump:</span>
                <a href="#official-cutoffs" className="rounded-md bg-emerald-800 text-white px-2.5 py-1 font-bold hover:bg-emerald-900 shadow-2xs">⭐ Official 2026 Cut-Offs &amp; Marks</a>
                <a href="#inorganic-chem" className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 font-bold text-emerald-800 hover:bg-emerald-100">Inorganic Chemistry</a>
                <a href="#physical-chem" className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 font-bold text-emerald-800 hover:bg-emerald-100">Physical Chemistry</a>
                <a href="#organic-chem" className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 font-bold text-emerald-800 hover:bg-emerald-100">Organic Chemistry</a>
                <a href="#environmental-chem" className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 font-bold text-emerald-800 hover:bg-emerald-100">Environmental &amp; Analytical</a>
              </div>
              <div className="text-slate-600 font-medium">
                Official Press Note &bull; Notification No. 01/OG/PC/2026
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
            <section className="rounded-2xl border border-[#c8ebe1] bg-white p-5 sm:p-6 shadow-sm">
              <h2 className="font-brand text-lg font-bold text-slate-950 border-b border-slate-200 pb-2.5 mb-3.5 flex items-center gap-2">
                <span className="text-emerald-700">🔬</span> Table of Contents &bull; Quick Navigation
              </h2>
              <ol className="grid sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                <li><a href="#overview" className="hover:text-emerald-700 hover:underline">1. Recruitment Overview &amp; Key Parameters</a></li>
                <li><a href="#schedule" className="hover:text-emerald-700 hover:underline">2. Chronology &amp; Selection Timetable</a></li>
                <li><a href="#official-cutoffs" className="hover:text-emerald-700 hover:underline font-bold text-emerald-800">3. Official 2026 Cut-Off Marks &amp; Selection List ⭐</a></li>
                <li><a href="#eligibility" className="hover:text-emerald-700 hover:underline">4. Educational Qualification &amp; Degree Criteria</a></li>
                <li><a href="#age-limit" className="hover:text-emerald-700 hover:underline">5. Age Limit &amp; 10-Year Relaxation</a></li>
                <li><a href="#fees" className="hover:text-emerald-700 hover:underline">6. Application &amp; Examination Fees</a></li>
                <li><a href="#exam-scheme" className="hover:text-emerald-700 hover:underline">7. Scheme of Examination (300 Marks CBRT)</a></li>
                <li><a href="#paper1-syllabus" className="hover:text-emerald-700 hover:underline">8. Paper-I: General Studies Detailed Syllabus</a></li>
                <li><a href="#paper2-syllabus" className="hover:text-emerald-700 hover:underline">9. Paper-II: Chemistry Degree Level Syllabus</a></li>
                <li><a href="#duties" className="hover:text-emerald-700 hover:underline">10. Role &amp; Laboratory Responsibilities in TGPCB</a></li>
                <li><a href="#salary" className="hover:text-emerald-700 hover:underline">11. Salary Structure &amp; In-Hand Pay Breakdown</a></li>
                <li><a href="#faqs" className="hover:text-emerald-700 hover:underline">12. Bilingual Frequently Asked Questions (with 2026 Cutoff)</a></li>
              </ol>
            </section>

            {/* Section 1: Overview */}
            <section id="overview" className="rounded-2xl border border-[#c8ebe1] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-emerald-600" />
                1. Official Recruitment Overview &amp; Key Parameters
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                The <strong>Telangana Public Service Commission (TGPSC)</strong> conducts direct recruitment for the post of <strong>Assistant Scientist (Analyst Grade-II)</strong> in the <strong>Telangana Pollution Control Board (TGPCB / TSPCB)</strong>. This scientific cadre is responsible for quality assurance, chemical and bacteriological analysis of ambient air, industrial effluents, and water resources across Telangana.
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
                      <td className="px-4 py-3 text-slate-700 font-medium">Telangana Pollution Control Board (TGPCB / TSPCB)</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Post Title</th>
                      <td className="px-4 py-3 text-slate-700 font-medium">Assistant Scientist (Analyst Grade-II)</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Total Vacancies</th>
                      <td className="px-4 py-3 font-bold text-emerald-800">20 Posts (State-wide / Multi-Zone distribution)</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Candidates Applied Online</th>
                      <td className="px-4 py-3 text-slate-900 font-bold">
                        <span className="text-emerald-950 font-black text-base">19,568 Candidates</span>
                        <span className="text-xs font-semibold text-slate-600 block sm:inline sm:ml-2">(Competition: ~978.4 applicants per post)</span>
                      </td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Scale of Pay</th>
                      <td className="px-4 py-3 text-slate-700 font-bold">₹45,960 – ₹1,24,150/- (Gross ~₹73,465/month in Hyderabad)</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Age Limit (as on 01/07/2026)</th>
                      <td className="px-4 py-3 text-slate-700 font-medium">18 to 44 Years (10-year age relaxation under G.O.Ms.No.86)</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Educational Qualification</th>
                      <td className="px-4 py-3 text-slate-700 font-medium">Bachelor&apos;s Degree with Chemistry as one of the optional subjects</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Selection Scheme</th>
                      <td className="px-4 py-3 text-slate-700 font-medium">Computer Based Recruitment Test (CBRT) - 300 Marks (Paper-I 150M + Paper-II 150M)</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-3 font-bold bg-slate-50 text-slate-900">Official Web Portals</th>
                      <td className="px-4 py-3 text-emerald-700 font-bold">
                        <a href="https://www.tgpsc.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">tgpsc.gov.in</a> &bull; <a href="https://tspcb.cgg.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">tspcb.cgg.gov.in</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 2: Chronology & Schedule */}
            <section id="schedule" className="rounded-2xl border border-[#c8ebe1] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-emerald-600" />
                2. Chronology &amp; Selection Timetable
              </h2>
              <div className="space-y-3">
                {SCHEDULE_EVENTS.map((event, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:border-emerald-300 hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-950 text-sm sm:text-base">{event.title}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          event.status === "Completed" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                          "bg-amber-100 text-amber-800 border-amber-300"
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <p lang="te" className="font-telugu text-xs sm:text-sm text-slate-600 mt-0.5">{event.teluguTitle}</p>
                      <p className="text-xs text-slate-600 mt-1">{event.detail}</p>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <span className="font-mono font-bold text-emerald-800 text-xs sm:text-sm block">{event.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Official 2026 Cut-Off Marks & Selected Candidates */}
            <section id="official-cutoffs" className="rounded-2xl border-2 border-emerald-300 bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                      Official Commission Release
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Notification No. 01/OG/PC/2026</span>
                  </div>
                  <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mt-1.5 flex items-center gap-2.5">
                    <span className="h-6 w-1.5 rounded-full bg-emerald-600" />
                    3. Official 2026 Cut-Off Marks &amp; Selected Candidates Merit List
                  </h2>
                </div>
                <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
                  300 Marks CBRT Basis
                </span>
              </div>

              <p lang="te" className="font-telugu text-base sm:text-lg text-emerald-950 mb-3 leading-relaxed">
                తెలంగాణ పబ్లిక్ సర్వీస్ కమిషన్ (TGPSC) విడుదల చేసిన అధికారిక ప్రెస్ నోట్ (నోటిఫికేషన్ నెం. 01/OG/PC/2026) ప్రకారం ఎంపికైన 19 మంది అభ్యర్థుల మార్కులు మరియు కేటగిరీల వారీగా అధికారిక కటాఫ్ మార్కుల పూర్తి వివరాలు క్రింద ఇవ్వబడ్డాయి:
              </p>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-5">
                The Telangana Public Service Commission (TGPSC) officially published the marks of candidates picked for appointment to the post of <strong>Assistant Scientist (Analyst Grade-II) in Telangana Pollution Control Board</strong> (Notification No. 01/OG/PC/2026, dated 20/04/2026). A total of <strong>19,568 candidates applied online</strong> for the 20 sanctioned vacancies, creating a competition ratio of <strong>~978.4 applicants per post</strong>. Following the CBRT examination, <strong>19 candidates</strong> have been selected under State-wide Unreserved merit and communal roster points based on normalized scores out of <strong>300 marks</strong> (selection rate: ~0.097%).
              </p>

              {/* Category-Wise Cut-Off Summary Table */}
              <div className="mb-6">
                <h3 className="font-brand text-base sm:text-lg font-bold text-slate-950 mb-2.5 flex items-center gap-2">
                  <span className="text-emerald-700 font-mono">▸</span>
                  Official Category-Wise Cut-Off Marks (Last Selected Candidate)
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                  <table className="min-w-full text-xs sm:text-sm text-left divide-y divide-slate-200">
                    <thead className="bg-[#e9f6f2] text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-3.5 py-3">Category / Quota</th>
                        <th className="px-3 py-3">Roster Point</th>
                        <th className="px-3 py-3 text-right">Cut-Off Marks (/300)</th>
                        <th className="px-3 py-3 text-right">Percentage</th>
                        <th className="px-3 py-3 text-center">GRL Rank</th>
                        <th className="px-3.5 py-3">Hall Ticket No.</th>
                        <th className="px-3.5 py-3">Analysis &amp; Selection Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {COMMUNITY_CUTOFFS.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                          <td className="px-3.5 py-2.5 font-bold text-slate-950">{item.category}</td>
                          <td className="px-3 py-2.5 font-mono text-emerald-800 font-bold text-xs">{item.selectionCategory}</td>
                          <td className="px-3 py-2.5 font-mono font-black text-emerald-900 text-right text-sm">{item.cutoffMarks}</td>
                          <td className="px-3 py-2.5 font-mono text-slate-700 text-right font-semibold">{item.percentage}</td>
                          <td className="px-3 py-2.5 font-mono text-center font-bold text-slate-800">{item.grlRank}</td>
                          <td className="px-3.5 py-2.5 font-mono text-xs text-slate-600">{item.htno}</td>
                          <td className="px-3.5 py-2.5 text-xs text-slate-600">{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Complete 19 Selected Candidates Table */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2 mb-2.5">
                  <h3 className="font-brand text-base sm:text-lg font-bold text-slate-950 flex items-center gap-2">
                    <span className="text-emerald-700 font-mono">▸</span>
                    Full Selection Merit List: All 19 Appointed Candidates &amp; Marks
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">Rank 1 to 104 • 19 Selected Candidates</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[460px] overflow-y-auto">
                  <table className="min-w-full text-xs text-left divide-y divide-slate-200">
                    <thead className="bg-slate-100 text-slate-900 font-bold uppercase tracking-wider text-[11px] sticky top-0 z-10 shadow-2xs">
                      <tr>
                        <th className="px-3 py-2.5">Sl.</th>
                        <th className="px-3 py-2.5">GRL Rank</th>
                        <th className="px-3.5 py-2.5">Hall Ticket No.</th>
                        <th className="px-3.5 py-2.5 text-right">Marks (/300)</th>
                        <th className="px-2.5 py-2.5 text-center">Gender</th>
                        <th className="px-3 py-2.5">Community</th>
                        <th className="px-2.5 py-2.5 text-center">EWS</th>
                        <th className="px-3.5 py-2.5">Selected Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {SELECTED_CANDIDATES.map((cand) => (
                        <tr key={cand.slNo} className={cand.slNo === 1 ? "bg-amber-50/60 font-semibold" : cand.slNo % 2 === 0 ? "bg-slate-50/50" : "bg-white"}>
                          <td className="px-3 py-2 font-mono text-slate-500">{cand.slNo}</td>
                          <td className="px-3 py-2 font-mono font-bold text-slate-900">
                            {cand.grlRank === 1 ? <span className="text-amber-700 font-black">Rank 1 🏆</span> : `Rank ${cand.grlRank}`}
                          </td>
                          <td className="px-3.5 py-2 font-mono font-semibold text-slate-900">{cand.htno}</td>
                          <td className="px-3.5 py-2 font-mono font-bold text-emerald-900 text-right">{cand.marks}</td>
                          <td className="px-2.5 py-2 text-center text-slate-700">{cand.gender === "M" ? "Male" : "Female"}</td>
                          <td className="px-3 py-2 font-medium text-slate-700">{cand.community}</td>
                          <td className="px-2.5 py-2 text-center text-slate-500">{cand.ews}</td>
                          <td className="px-3.5 py-2 font-mono font-bold text-xs text-emerald-800">{cand.selectedCategory}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Analytical Highlights Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
                <div className="rounded-xl border-2 border-amber-300 bg-amber-50/70 p-3.5">
                  <span className="text-xs font-bold text-amber-900 uppercase block mb-1">Total Online Applicants</span>
                  <strong className="text-lg font-black text-amber-950 block">19,568 Candidates</strong>
                  <p className="text-xs text-amber-800 mt-1">~978.4 applicants per post. 19 selected out of 19,568 (0.097% success rate).</p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                  <span className="text-xs font-bold text-emerald-900 uppercase block mb-1">State Topper (Rank 1)</span>
                  <strong className="text-lg font-black text-emerald-950 block">248.91275 / 300</strong>
                  <p className="text-xs text-emerald-800 mt-1">HTNO 2620114891 (BC-A Male) secured 82.97%, selected under OC-UR-CF vacancy.</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <span className="text-xs font-bold text-slate-700 uppercase block mb-1">Open Merit Cut-Off (OC-UR)</span>
                  <strong className="text-lg font-black text-slate-900 block">228.79866 / 300</strong>
                  <p className="text-xs text-slate-600 mt-1">GRL Rank 8 secured 76.27%. Meritorious candidates from BC-B, OC, ST, and BC-D competed in open quota.</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <span className="text-xs font-bold text-slate-700 uppercase block mb-1">Lowest Selected Score</span>
                  <strong className="text-lg font-black text-slate-900 block">202.78523 / 300</strong>
                  <p className="text-xs text-slate-600 mt-1">GRL Rank 104 (SC Group-3 Male) secured 67.60%, qualifying under SC-GR3-UR quota.</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                <strong>Source:</strong> Telangana Public Service Commission (TGPSC) Official Press Note: Selection list &amp; marks for Assistant Scientist (Analyst Grade-II) in TGPCB (Notification No. 01/OG/PC/2026, dated 20/04/2026), accessed via websitenew.tgpsc.gov.in.
              </div>
            </section>

            {/* Section 4: Educational Qualification */}
            <section id="eligibility" className="rounded-2xl border border-[#c8ebe1] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-emerald-600" />
                4. Educational Qualification &amp; Degree Criteria
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                Under the Service Rules of the Telangana Pollution Control Board, applicants must possess:
              </p>
              <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/50 p-5">
                <h3 className="font-bold text-emerald-950 text-base mb-1.5">Bachelor&apos;s Degree with Chemistry</h3>
                <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                  Must possess a <strong>Bachelor&apos;s Degree in Science (B.Sc.)</strong> with <strong>Chemistry as one of the optional subjects</strong> (including B.Sc. Chemistry, Applied Chemistry, Industrial Chemistry) from a recognized University in India established or incorporated by or under a Central Act, Provincial Act, or State Act recognized by the UGC.
                </p>
                <div className="mt-3 pt-3 border-t border-emerald-200 text-xs text-emerald-800 font-medium">
                  &bull; The qualification must have been completed with the result declared by the University on or before the notification cut-off date.
                </div>
              </div>
            </section>

            {/* Section 5: Age Limit */}
            <section id="age-limit" className="rounded-2xl border border-[#c8ebe1] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-emerald-600" />
                5. Age Limit &amp; 10-Year Relaxation (G.O.Ms.No.86)
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                The age is reckoned as on <strong>01/07/2026</strong>. In accordance with <strong>G.O.Ms.No.86, G.A.(Ser.A) Dept, Dt. 18/05/2026</strong>, the upper age limit for direct recruitment has been enhanced by <strong>10 years</strong> (from 34 to 44 years):
              </p>
              <div className="space-y-2.5">
                {AGE_CRITERIA.map((crit, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-950 text-xs sm:text-sm">{crit.category}</span>
                      <p className="text-xs text-slate-600 mt-0.5">{crit.detail}</p>
                    </div>
                    <span className="font-mono font-bold text-emerald-800 text-xs sm:text-sm bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg shrink-0 self-start sm:self-auto">
                      {crit.ageRange}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 6: Application & Exam Fees */}
            <section id="fees" className="rounded-2xl border border-[#c8ebe1] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-emerald-600" />
                6. Application Processing Fee &amp; Examination Fee
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-bold text-slate-950 text-sm mb-1">Online Application Processing Fee</h3>
                  <p className="text-2xl font-black text-emerald-900 mt-1">₹1000 / ₹500</p>
                  <p className="text-xs text-slate-600 mt-1">
                    ₹1000/- for OC &amp; BC applicants; ₹500/- for SC, ST, and PwD applicants.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-bold text-slate-950 text-sm mb-1">Examination Fee (With Exemption)</h3>
                  <p className="text-2xl font-black text-emerald-900 mt-1">₹120 / EXEMPTED</p>
                  <p className="text-xs text-slate-600 mt-1">
                    <strong>All unemployed applicants are 100% exempted</strong> from payment of the examination fee. Regular government employees pay ₹120/-.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7: Scheme of Examination */}
            <section id="exam-scheme" className="rounded-2xl border border-[#c8ebe1] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-emerald-600" />
                7. Scheme of Examination (300 Total Marks)
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                The written examination is conducted in <strong>Computer Based Recruitment Test (CBRT)</strong> objective format for a total of <strong>300 marks</strong>:
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
                      <td className="px-4 py-3 text-center font-mono font-bold text-emerald-800">150 Marks (1 mark/Q)</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">Bilingual (English &amp; Telugu)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-slate-950">
                        Paper-II: Chemistry (Degree Level)
                      </td>
                      <td className="px-4 py-3 text-center font-mono">150</td>
                      <td className="px-4 py-3 text-center font-mono">150 Minutes</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-emerald-800">150 Marks (1 mark/Q)</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">English only</td>
                    </tr>
                    <tr className="bg-emerald-50 font-black text-emerald-950">
                      <td className="px-4 py-3">TOTAL WRITTEN TEST</td>
                      <td className="px-4 py-3 text-center font-mono">300 Questions</td>
                      <td className="px-4 py-3 text-center font-mono">300 Minutes</td>
                      <td className="px-4 py-3 text-center font-mono text-base">300 MARKS</td>
                      <td className="px-4 py-3">Objective (CBRT)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Qualifying Marks */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <h3 className="font-bold text-emerald-950 text-sm mb-2">Minimum Qualifying Marks Threshold:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                  <div className="rounded-lg bg-white p-3 border border-emerald-200 text-center">
                    <span className="block text-slate-600 font-medium">OC, Sports &amp; EWS</span>
                    <strong className="text-lg font-black text-emerald-900">40% (120 / 300)</strong>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-emerald-200 text-center">
                    <span className="block text-slate-600 font-medium">Backward Classes (BCs)</span>
                    <strong className="text-lg font-black text-emerald-900">35% (105 / 300)</strong>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-emerald-200 text-center">
                    <span className="block text-slate-600 font-medium">SC, ST &amp; PwD</span>
                    <strong className="text-lg font-black text-emerald-900">30% (90 / 300)</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8: Paper-I Syllabus */}
            <section id="paper1-syllabus" className="rounded-2xl border border-[#c8ebe1] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-emerald-600" />
                8. Paper-I: General Studies &amp; General Abilities Detailed Syllabus (15 Units)
              </h2>
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

            {/* Section 9: Paper-II Chemistry Syllabus */}
            <section id="paper2-syllabus" className="rounded-2xl border border-[#c8ebe1] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20 space-y-6">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-1 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-emerald-600" />
                9. Paper-II: Chemistry Detailed Syllabus (Degree Level • 150 Marks)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                150 objective questions carrying 1 mark each. Conducted in English. Comprises four core branches with specific weightage on environmental analytics:
              </p>

              {/* Branch I: Inorganic */}
              <div id="inorganic-chem" className="rounded-xl border border-slate-200 bg-white p-5 scroll-mt-24 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
                  <h3 className="font-brand text-base sm:text-lg font-bold text-emerald-950">I. Inorganic Chemistry</h3>
                  <span className="rounded bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5">Section I</span>
                </div>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <p><strong>Atomic Structure:</strong> Bohr’s model, de Broglie relation, Heisenberg uncertainty principle, Schrödinger wave equation, significance of &psi; and &psi;&sup2;, quantum numbers, radial and angular distribution, Aufbau principle, Hund’s rule, Pauli exclusion principle.</p>
                  <p><strong>Chemical Periodicity:</strong> Classification of elements (s, p, d, f blocks), periodic trends in atomic/ionic radii, ionization energy, electron affinity, and electronegativity.</p>
                  <p><strong>Chemical Bonding:</strong> &sigma; and &pi; bonds, VSEPR theory, Molecular Orbital Theory (MOT), bond order, hybridization, hydrogen bonding, and metallic bonding.</p>
                  <p><strong>Coordination &amp; Bio-inorganic Compounds:</strong> IUPAC nomenclature, Werner’s theory, crystal field theory (CFT), isomerism, metal carbonyls; Role of metal ions in biological systems (Heme, Chlorophyll, Vitamin B12).</p>
                  <p><strong>Metallurgy &amp; Radioactivity:</strong> Principles of extraction of metals, nuclear reactions, fission, fusion, and radioisotopes in environmental tracing.</p>
                </div>
              </div>

              {/* Branch II: Physical */}
              <div id="physical-chem" className="rounded-xl border border-slate-200 bg-white p-5 scroll-mt-24 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
                  <h3 className="font-brand text-base sm:text-lg font-bold text-emerald-950">II. Physical Chemistry</h3>
                  <span className="rounded bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5">Section II</span>
                </div>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <p><strong>States of Matter &amp; Solutions:</strong> Kinetic gas equation, real gas deviations, Van der Waals equation; Solutions – Raoult’s law, colligative properties (osmotic pressure, depression of freezing point), and molecular weight determination.</p>
                  <p><strong>Thermodynamics:</strong> First, Second, and Third laws of thermodynamics, internal energy (U), enthalpy (H), entropy (S), Gibbs free energy (G), and spontaneity criteria.</p>
                  <p><strong>Chemical Kinetics:</strong> Order and molecularity of reactions, rate equations, half-life, activation energy, Arrhenius equation, and catalysis.</p>
                  <p><strong>Electrochemistry:</strong> Conductance, Kohlrausch’s law, electrochemical cells, EMF, Nernst equation, pH determination, buffer solutions, and solubility product (Ksp).</p>
                  <p><strong>Phase Equilibria:</strong> Phase rule, one-component system (water, sulphur), and two-component systems.</p>
                </div>
              </div>

              {/* Branch III: Organic */}
              <div id="organic-chem" className="rounded-xl border border-slate-200 bg-white p-5 scroll-mt-24 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3">
                  <h3 className="font-brand text-base sm:text-lg font-bold text-emerald-950">III. Organic Chemistry</h3>
                  <span className="rounded bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5">Section III</span>
                </div>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <p><strong>Structural Theory &amp; Reaction Mechanisms:</strong> Inductive, resonance, and hyperconjugation effects; reactive intermediates (carbocations, carbanions, free radicals, carbenes); electrophilic and nucleophilic substitutions (SN1, SN2, E1, E2).</p>
                  <p><strong>Hydrocarbons &amp; Functional Groups:</strong> Aromaticity and Huckel&apos;s rule; synthesis and reactions of alcohols, phenols, ethers, aldehydes, ketones, carboxylic acids, and amines.</p>
                  <p><strong>Spectroscopic Identification:</strong> Fundamentals of UV-Visible spectroscopy (chromophores, auxochromes), Infrared (IR) functional group frequencies, and &sup1;H-NMR chemical shifts.</p>
                  <p><strong>Biomolecules &amp; Heterocycles:</strong> Carbohydrates, amino acids, peptides, proteins; chemistry of furan, thiophene, pyrrole, and pyridine.</p>
                </div>
              </div>

              {/* Branch IV: Environmental & Analytical */}
              <div id="environmental-chem" className="rounded-xl border-2 border-emerald-300 bg-emerald-50/40 p-5 scroll-mt-24 shadow-xs">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5 mb-3">
                  <h3 className="font-brand text-base sm:text-lg font-bold text-emerald-950">
                    IV. Environmental Chemistry &amp; Analytical Techniques (TGPCB Laboratory Core)
                  </h3>
                  <span className="rounded bg-emerald-700 text-white text-xs font-bold px-2 py-0.5">Core Focus</span>
                </div>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-800">
                  <p><strong>Water Quality Parameters:</strong> Biochemical Oxygen Demand (BOD), Chemical Oxygen Demand (COD), Dissolved Oxygen (DO by Winkler method), Total Dissolved Solids (TDS), Total Suspended Solids (TSS), hardness, alkalinity, and trace heavy metals (Lead, Cadmium, Arsenic, Mercury, Chromium).</p>
                  <p><strong>Air Pollution Analysis:</strong> Composition of atmosphere, greenhouse gases, photochemical smog, acid rain chemistry, ozone hole mechanism, and National Ambient Air Quality Standards (NAAQS / AQI).</p>
                  <p><strong>Waste Management &amp; Treatment:</strong> Chemical neutralization, coagulation, advanced oxidation processes (AOPs), activated carbon adsorption, sludge treatment, and hazardous waste handling.</p>
                  <p><strong>Analytical Methods &amp; Instrumentation:</strong> Principles of volumetric (acid-base, redox, complexometric EDTA) and gravimetric analysis; Spectrophotometry, Atomic Absorption Spectroscopy (AAS), Inductively Coupled Plasma (ICP), Gas Chromatography (GC), High Performance Liquid Chromatography (HPLC), and error analysis.</p>
                </div>
              </div>
            </section>

            {/* Section 10: TGPCB Duties */}
            <section id="duties" className="rounded-2xl border border-[#c8ebe1] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-emerald-600" />
                10. Key Job Duties in TGPCB Laboratories
              </h2>
              <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block mb-1">Industrial Effluent Testing</strong>
                  Testing industrial wastewater discharge samples collected from pharma, textile, and chemical estates across Patancheru, Jeedimetla, and Pashamylaram.
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block mb-1">Ambient Air Quality Monitoring</strong>
                  Measuring PM2.5, PM10, SO2, and NOx levels across continuous ambient air quality monitoring stations (CAAQMS) in Greater Hyderabad and industrial hubs.
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block mb-1">Advanced Instrumental Operation</strong>
                  Operating and calibrating advanced analytical equipment including GC-MS, HPLC, Atomic Absorption Spectrophotometer (AAS), and TOC analyzers.
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block mb-1">Compliance &amp; Legal Reporting</strong>
                  Submitting certified analytical test reports used as evidentiary legal documents under the Water Act 1974 and Air Act 1981.
                </div>
              </div>
            </section>

            {/* Section 11: Salary Structure */}
            <section id="salary" className="rounded-2xl border border-[#c8ebe1] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-emerald-600" />
                11. Salary Structure &amp; Monthly In-Hand Pay Breakdown
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
                The post carries the state pay scale of <strong>₹45,960 – ₹1,24,150/-</strong>. Below is the realistic monthly earnings breakdown for postings in Hyderabad (24% HRA):
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                {/* Gross Pay Table */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs uppercase text-slate-800">Gross Monthly Earnings</div>
                  <table className="w-full text-xs divide-y divide-slate-200">
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {SALARY_COMPONENTS.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-3.5 py-2 font-medium text-slate-800">{row.item}</td>
                          <td className="px-3.5 py-2 text-right font-bold text-emerald-900">{row.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Deductions Table */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs uppercase text-slate-800">Monthly Deductions</div>
                  <table className="w-full text-xs divide-y divide-slate-200">
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {SALARY_DEDUCTIONS.map((row, idx) => (
                        <tr key={idx} className={idx === SALARY_DEDUCTIONS.length - 1 ? "bg-emerald-50 font-black text-emerald-950" : ""}>
                          <td className="px-3.5 py-2 font-medium text-slate-800">{row.item}</td>
                          <td className="px-3.5 py-2 text-right font-bold text-emerald-900">{row.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl bg-emerald-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider block">Estimated Net Take-Home Pay</span>
                  <p className="text-2xl sm:text-3xl font-black mt-1">₹65,921 <span className="text-sm font-normal text-emerald-200">/ month</span></p>
                  <p className="text-xs text-emerald-300 mt-0.5">Plus annual increments, medical health card, and state service security.</p>
                </div>
                <Link
                  href="/mock-tests"
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-bold transition text-center shadow-sm"
                >
                  Practice Mock Tests &rarr;
                </Link>
              </div>
            </section>

            {/* Section 12: Bilingual FAQs */}
            <section id="faqs" className="rounded-2xl border border-[#c8ebe1] bg-white p-5 sm:p-7 shadow-sm scroll-mt-20">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-slate-950 mb-3 flex items-center gap-2.5">
                <span className="h-6 w-1.5 rounded-full bg-emerald-600" />
                12. Frequently Asked Questions (Bilingual &bull; English &amp; తెలుగు)
              </h2>
              <div className="space-y-4">
                {BILINGUAL_FAQS.map((faq, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 p-4 sm:p-5 bg-white">
                    <h3 className="font-bold text-slate-950 text-sm sm:text-base leading-snug">{faq.question}</h3>
                    <p lang="te" className="font-telugu text-emerald-900 text-xs sm:text-sm mt-1">{faq.teluguQuestion}</p>
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
            
            {/* Quick Action Card */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 sm:p-6 shadow-sm sticky top-20">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                Scientific Cadre Notice
              </span>
              <h3 className="font-brand text-lg font-bold text-slate-950 mt-2.5">
                TGPCB Assistant Scientist (Analyst Grade-II)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Telangana Pollution Control Board Central &amp; Regional Labs.
              </p>

              <div className="mt-4 space-y-2 text-xs border-y border-slate-200 py-3 text-slate-700">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Vacancies:</span>
                  <span className="font-bold text-emerald-900">20 Posts</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Applied Online:</span>
                  <span className="font-bold text-slate-900">19,568</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Competition:</span>
                  <span className="font-bold text-amber-800">~978 / Post</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Pay Scale:</span>
                  <span className="font-bold text-slate-900">₹45,960–₹1,24,150</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Qualification:</span>
                  <span className="font-bold text-slate-900">B.Sc. Chemistry</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Exam Scheme:</span>
                  <span className="font-bold text-slate-900">300 Marks CBRT</span>
                </div>
              </div>

              {/* Official 2026 Cutoff Summary Badge */}
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 block mb-1.5">
                  ⭐ Official 2026 Cut-Off Marks
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Topper (Rank 1):</span>
                    <span className="font-mono font-black text-emerald-950">248.91</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">OC General:</span>
                    <span className="font-mono font-bold text-slate-900">228.80</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">OC Women:</span>
                    <span className="font-mono font-bold text-slate-900">225.78</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">BC-B / BC-D:</span>
                    <span className="font-mono font-bold text-slate-900">225.79 / 223.77</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">BC-A / SC-GR2:</span>
                    <span className="font-mono font-bold text-slate-900">222.85</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">EWS Cutoff:</span>
                    <span className="font-mono font-bold text-slate-900">210.68</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">ST Cutoff:</span>
                    <span className="font-mono font-bold text-slate-900">207.68</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">SC-GR3 Cutoff:</span>
                    <span className="font-mono font-bold text-slate-900">202.79</span>
                  </div>
                </div>
                <a href="#official-cutoffs" className="mt-2.5 block text-center text-[11px] font-bold text-emerald-800 hover:underline">
                  View Full 19 Selected List &rarr;
                </a>
              </div>

              <div className="mt-5 space-y-2.5">
                <a
                  href="https://www.tgpsc.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-700 bg-white hover:bg-emerald-50 text-emerald-800 px-4 py-2.5 text-xs font-bold transition shadow-2xs"
                >
                  Official TGPSC Website ↗
                </a>
                <Link
                  href="/mock-tests"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 text-xs font-bold transition shadow-sm"
                >
                  Practice Mock Tests &rarr;
                </Link>
              </div>

              {/* Related Recruitments */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Other Telangana Recruitments
                </h4>
                <div className="space-y-2 text-xs">
                  <Link href="/news/hmwssb-manager-engineering-notification-2026" className="block p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 font-medium transition">
                    HMWSSB Manager (Engineering) (130 Posts) &rarr;
                  </Link>
                  <Link href="/news/telangana-police-constable-notification-2026" className="block p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 font-medium transition">
                    Telangana Police Constable (7,112 Posts) &rarr;
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
