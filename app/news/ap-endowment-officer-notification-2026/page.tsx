import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandLockup } from "@/components/brand/VaradhiBrand";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

const PRIMARY_SLUG = "ap-endowment-officer-notification-2026";
const CANONICAL_PATH = `/news/${PRIMARY_SLUG}`;

export const metadata: Metadata = {
  title: "AP Endowment Officer Notification 2026 (104 Posts): EO Grade-III Syllabus Marks Wise, Hindu Philosophy Weightage & Telugu PDF Download",
  description:
    "APPSC Executive Officer Grade-III in A.P. Endowments Subordinate Service (Brief Notification No. 23/2026) for 104 vacancies. Check Paper-I GS & Paper-II Hindu Philosophy marks-wise weightage, Act 30/1987 key sections, salary in-hand pay scale (₹25,220–₹80,910), CPT pattern, and syllabus PDF download in Telugu.",
  keywords: [
    "AP Endowment Officer Notification 2026",
    "APPSC Endowment Officer Notification 2026 PDF",
    "APPSC EO Grade 3 Notification 2026",
    "ap endowment officer syllabus weightage marks",
    "ap endowment officer syllabus marks wise",
    "ap endowment officer hindu philosophy syllabus",
    "ap endowment officer paper 2 syllabus telugu",
    "ap endowment officer previous question paper with answers pdf",
    "ap endowment officer 2023 paper analysis",
    "AP Endowments Act 1987 sections 29 57 82 85",
    "AP Endowment Officer salary in hand pay scale",
    "AP Endowment Officer CPT computer proficiency test pattern",
    "APPSC EO Grade 3 104 vacancies",
    "AP Endowments Subordinate Service Executive Officer Grade III",
    "APPSC Endowment Officer eligibility degree qualification",
    "ఆంధ్రప్రదేశ్ దేవాదాయ శాఖ ఎగ్జిక్యూటివ్ ఆఫీసర్ నోటిఫికేషన్ 2026",
    "ఎండోమెంట్ ఆఫీసర్ సిలబస్ మార్కుల వెయిటేజీ",
    "హిందూ ఫిలాసఫీ మరియు టెంపుల్ సిస్టమ్ సిలబస్ తెలుగు",
    "ఎండోమెంట్ ఆఫీసర్ మునుపటి పేపర్లు విశ్లేషణ 2023",
    "APPSC EO గ్రేడ్ 3 శాలరీ మరియు పే స్కేల్ వివరాలు",
    "కంప్యూటర్ ప్రొఫిషియన్సీ టెస్ట్ CPT సిలబస్",
    "దేవాదాయ చట్టం 1987 ముఖ్యమైన సెక్షన్లు",
    "APPSC Endowment Officer free mock test in Telugu",
  ],
  alternates: { canonical: absoluteUrl(CANONICAL_PATH) },
  openGraph: {
    type: "article",
    url: absoluteUrl(CANONICAL_PATH),
    title: "AP Endowment Officer Notification 2026 (104 Posts): EO Grade-III Syllabus Marks Wise, Hindu Philosophy Weightage & Official PDF Download",
    description:
      "Complete guide for APPSC Executive Officer Grade-III with 104 vacancies, Paper-I & Paper-II weightage analysis based on 2023 question papers, CPT practical format, salary scale, and official PDF download.",
    siteName: "Varadhi Prep",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "AP Endowment Officer Notification 2026 - 104 Vacancies Official Notification & Syllabus PDF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AP Endowment Officer Notification 2026 (104 Posts): EO Grade-III Syllabus & Weightage",
    description:
      "APPSC EO Grade-III 104 posts notification, syllabus marks-wise weightage for GS & Hindu Philosophy, CPT pattern, and official PDF download.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

// ── Official Recruitment Constants ────────────────────────

const TOTAL_VACANCIES = 104;

const SCHEDULE_EVENTS = [
  {
    title: "Brief Notification Issued",
    teluguTitle: "సంక్షిప్త నోటిఫికేషన్ విడుదల (No. 23/2026)",
    date: "15 September 2026",
    status: "Completed",
    detail: "APPSC officially sanctioned 104 vacancies for Executive Officer Grade-III in A.P. Endowments Subordinate Service.",
  },
  {
    title: "Detailed Notification Publication",
    teluguTitle: "సవివర నోటిఫికేషన్ విడుదల (No. 23/2026)",
    date: "16 October 2026",
    status: "Completed",
    detail: "Detailed breakup of vacancies, community reservations, age limits, and online guidelines published on psc.ap.gov.in.",
  },
  {
    title: "Online Application Window",
    teluguTitle: "ఆన్‌లైన్ దరఖాస్తుల గడువు (ముగిసింది)",
    date: "16 Oct 2026 – 05 Nov 2026 (Extended to 12 Nov 2026)",
    status: "Concluded",
    detail: "Online registration and application submissions through APPSC One Time Profile Registration (OTPR) concluded on 12 November 2026.",
  },
  {
    title: "Crucial Reckoning Date",
    teluguTitle: "అర్హతల నిర్ధారణ కీలక తేదీ",
    date: "16 October 2026",
    status: "Reckoned",
    detail: "Crucial date for reckoning educational qualifications, age limits, and community certificates under notification guidelines.",
  },
  {
    title: "Written Examination (CBRT) Schedule Announcement",
    teluguTitle: "రాత పరీక్ష షెడ్యూల్ ప్రకటన",
    date: "Expected in Nov / Dec 2026",
    status: "Active Stage",
    detail: "APPSC is finalizing the district-level Computer-Based Recruitment Test (CBRT) examination centers and timetable.",
  },
  {
    title: "Hall Ticket / Admit Card Release",
    teluguTitle: "హాల్ టికెట్ల డౌన్‌లోడ్",
    date: "10 Days Before Exam",
    status: "Upcoming",
    detail: "Admit cards will be made accessible on candidate login portal on psc.ap.gov.in.",
  },
  {
    title: "Single-Level Written Test (CBRT)",
    teluguTitle: "కంప్యూటర్ ఆధారిత రాత పరీక్ష (CBRT)",
    date: "To be announced by APPSC",
    status: "Upcoming",
    detail: "Degree standard objective exam (300 Marks: Paper-I 150M + Paper-II 150M). No Screening Test.",
  },
  {
    title: "Computer Proficiency Test (CPT)",
    teluguTitle: "కంప్యూటర్ ప్రొఫిషియన్సీ టెస్ట్ (CPT)",
    date: "Post Written Results",
    status: "Upcoming",
    detail: "Mandatory qualifying test (100 Marks, 60 Minutes) in Office Automation as per G.O. Ms No. 26.",
  },
  {
    title: "Certificate Verification & Merit Allotment",
    teluguTitle: "సర్టిఫికెట్ వెరిఫికేషన్ & నియామకాలు",
    date: "Final Selection Stage",
    status: "Upcoming",
    detail: "Original certificate verification and merit-based appointment as Executive Officer Grade-III.",
  },
];

const SALARY_COMPONENTS = [
  { item: "Pay Scale (Revised Pay Scales - RPS)", amount: "₹25,220 – ₹80,910", note: "Sanctioned RPS grade for Executive Officer Grade-III" },
  { item: "Basic Pay (Initial Entry Level)", amount: "₹25,220", note: "Starting basic pay at minimum of scale" },
  { item: "Dearness Allowance (DA @ ~33.67%)", amount: "₹8,492", note: "Applicable state DA percentage revised bi-annually" },
  { item: "House Rent Allowance (HRA - Tier I: Vijayawada/Visakhapatnam @ 24%)", amount: "₹6,053", note: "24% for major municipal corporations" },
  { item: "House Rent Allowance (HRA - District HQs @ 16%)", amount: "₹4,035", note: "16% for district centers and major pilgrimage towns" },
  { item: "House Rent Allowance (HRA - Other Mandal Centers @ 12%)", amount: "₹3,026", note: "12% for rural mandal centers" },
  { item: "City Compensatory Allowance (CCA)", amount: "₹400 – ₹700", note: "Town/city classification allowance" },
  { item: "Gross Monthly Salary (Tier I Cities)", amount: "₹40,465", note: "Gross pay before statutory deductions" },
  { item: "Gross Monthly Salary (District HQs)", amount: "₹38,447", note: "Gross pay in district headquarters and pilgrimage centers" },
  { item: "Gross Monthly Salary (Rural Areas)", amount: "₹37,438", note: "Gross pay in small mandals" },
];

const SALARY_DEDUCTIONS = [
  { item: "Contributory Pension Scheme (CPS / PRAN - 10% of Basic+DA)", amount: "₹3,371", note: "Mandatory retirement pension corpus deduction" },
  { item: "Professional Tax (PT)", amount: "₹200", note: "Statutory state municipal professional tax" },
  { item: "Employees Health Scheme (EHS) / APGLI", amount: "₹350", note: "Cashless healthcare and state group insurance" },
  { item: "Total Monthly Deductions", amount: "₹3,921", note: "Total deductions deducted from gross earnings" },
  { item: "Net In-Hand Salary (Take-Home in Tier I Cities)", amount: "₹36,544", note: "Net credited into bank account monthly" },
  { item: "Net In-Hand Salary (Take-Home in District HQs)", amount: "₹34,526", note: "Net take-home pay in district centers" },
  { item: "Net In-Hand Salary (Take-Home in Rural Areas)", amount: "₹33,517", note: "Net take-home pay in mandal headquarters" },
];

const AGE_LIMITS = [
  { category: "Open Competition (OC) / General", ageRange: "18 to 42 Years", detail: "Standard statutory age bracket for APPSC subordinate services." },
  { category: "BC (Backward Classes - A, B, C, D, E)", ageRange: "18 to 47 Years", detail: "5 years upper age relaxation under AP state service rules." },
  { category: "SC & ST Candidates", ageRange: "18 to 47 Years", detail: "5 years upper age relaxation under AP state service rules." },
  { category: "EWS (Economically Weaker Sections)", ageRange: "18 to 47 Years", detail: "5 years upper age relaxation under state quota guidelines." },
  { category: "Ex-Servicemen & NCC Instructors", ageRange: "3 Years + Service Period", detail: "Period of military service rendered plus 3 additional years." },
  { category: "AP State Govt Employees (excluding Corporations)", ageRange: "Up to 5 Years Relaxation", detail: "Based on length of regular qualifying service, maximum 5 years." },
  { category: "Physically Challenged (PBD) Candidates", ageRange: "18 to 52 Years", detail: "10 years upper age relaxation subject to medical fitness." },
];

// ── Verified Weightage Breakdown: Paper-I (150 Marks) ─────

const PAPER_1_SUBJECTS = [
  {
    number: "01",
    name: "Current Events (National, International & AP)",
    teluguName: "జాతీయ, అంతర్జాతీయ & ఆంధ్రప్రదేశ్ సమకాలీన అంశాలు",
    marks2023: "15 Qs",
    weightage: "10.0%",
    topics: "International summits (WEF Davos, BRICS, G20, ASEAN, COP28), sports championships (IPL, Ranji, Duleep, Durand cups), UNGA International Year of Millets, Forbes & Time Person of the Year, national awards.",
  },
  {
    number: "02",
    name: "General Science & Contemporary S&T",
    teluguName: "సాధారణ సైన్స్ & సైన్స్ అండ్ టెక్నాలజీ నూతన పురోగతి",
    marks2023: "15 Qs",
    weightage: "10.0%",
    topics: "Everyday science applications, cell biology, plant classifications (Thallophyta, Gymnosperms), human digestion, 5G Testbed, vaccines (qHPV cervical cancer, iNCOVACC nasal vaccine), Candida albicans genes, AUM Photonic.",
  },
  {
    number: "03",
    name: "History of India & Modern Andhra Pradesh",
    teluguName: "భారత దేశ చరిత్ర & ఆధునిక ఆంధ్రప్రదేశ్ సాంస్కృతిక చరిత్ర",
    marks2023: "15 Qs",
    weightage: "10.0%",
    topics: "Early modern AP trade (Dutch & British factories at Masulipatnam 1600s & Nellore 1626), Golconda kingdom & Aurangzeb conquest (1687), Social reformers (Kandukuri Veeresalingam, Vivekavardhini 1874), Krishna District Association (1892), 1956 state formation.",
  },
  {
    number: "04",
    name: "Geography of India with Focus on AP",
    teluguName: "భారత & ఆంధ్రప్రదేశ్ భౌగోళిక అంశాలు, నదులు & వనరులు",
    marks2023: "17 Qs",
    weightage: "11.3%",
    topics: "River basins (Godavari, Krishna, Dindi tributary, Kolleru lake, Amarkantak origin), AP soils (Red soil 6 sub-groups, 66% Rayalaseema, Laterite weathering), AP coastline rank (2nd), Nellore mica belt, Visakhapatnam district reorganization, ISFR 2019 forest data.",
  },
  {
    number: "05",
    name: "Indian Polity, Governance & AP Reorganisation Act",
    teluguName: "భారత రాజ్యాంగం, సుపరిపాలన & ఏపీ విభజన చట్టం 2014",
    marks2023: "16 Qs",
    weightage: "10.7%",
    topics: "AP Reorganisation Act 2014 (Hyderabad 10-year common capital, Krishna River Management Board Sec 85, Sericulture 7th Schedule fund, Governor powers, Appointed Day 2 June 2014), e-Governance (CARD land registration, Spandana portal, APSWAN 2 Mbps), AP Municipalities Act 1965.",
  },
  {
    number: "06",
    name: "Indian & AP Economy, Planning & Welfare Schemes",
    teluguName: "భారత & ఆంధ్రప్రదేశ్ ఆర్థిక వ్యవస్థ, బడ్జెట్ & సంక్షేమ పథకాలు",
    marks2023: "14 Qs",
    weightage: "9.3%",
    topics: "AP Budget & Deficits (Revenue Deficit ₹17,000 Cr / 1.27% of GSDP, Debt-to-GSDP 32%), Central grants-in-aid, State Institution for Transformation, state schemes (YSR Crop Insurance 22 crops, AP Community Managed Natural Farming, YSR AP One, Janmabhoomi 1997, World Bank AP Project).",
  },
  {
    number: "07",
    name: "Sustainable Development & Environmental Protection",
    teluguName: "సుస్థిర అభివృద్ధి & పర్యావరణ పరిరక్షణ",
    marks2023: "10 Qs",
    weightage: "6.7%",
    topics: "NITI Aayog SDG India Index 2020-21 (overall score 66; lagging goals: Goal 2 Zero Hunger & Goal 5 Gender Equality), Carrying Capacity definition, Namami Gange 4 pillars, Nokrek Biosphere Reserve (Garo Hills), Global warming & Ozone depletion.",
  },
  {
    number: "08",
    name: "Disaster Management, Remote Sensing & GIS",
    teluguName: "విపత్తు నిర్వహణ, రిమోట్ సెన్సింగ్ & జీఐఎస్ అనువర్తనాలు",
    marks2023: "12 Qs",
    weightage: "8.0%",
    topics: "Earthquake mitigation (DROP COVER HOLD, National Centre for Seismology, Calcutta 1898 observatory, 59% hazard land mass), Landslide mitigation (GNSS slope deformation, BMTPC Vulnerability Atlas, NDMA risk zones), Remote sensing (MODIS & SNPP-VIIRS at Shadnagar Earth Station, flood zones).",
  },
  {
    number: "09",
    name: "Logical Reasoning & Mental Ability",
    teluguName: "లాజికల్ రీజనింగ్ & మానసిక సామర్థ్యం",
    marks2023: "15 Qs",
    weightage: "10.0%",
    topics: "Circular seating arrangement, vertical box ordering puzzle, calendar birthday deduction, syllogisms, rod ranking/ordering, alphanumeric series, PROCTOR letter pairs, coding-decoding, direction sense & distance, coded blood relations, mathematical operator swapping.",
  },
  {
    number: "10",
    name: "Data Analysis & Basic Statistics",
    teluguName: "డేటా అనాలిసిస్ & ప్రాథమిక సాంఖ్యకశాస్త్రం",
    marks2023: "15 Qs",
    weightage: "10.0%",
    topics: "Summary statistics (Arithmetic Mean, Geometric Mean, Median even observations formula, Mode from frequency table, Mean deviation from median, First quartile Q1, Standard deviation from variance 49 -> 7, Pearson empirical mode formula), Data interpretation (courier table, mutual fund pie chart, FDI bar chart, minor exam line graph, pipe production chart).",
  },
];

// ── Verified Weightage Breakdown: Paper-II (150 Marks) ────

const PAPER_2_SUBJECTS = [
  {
    number: "01",
    name: "Ramayanam (Characters, Kandaas, Places & Dynasties)",
    teluguName: "రామాయణం (పాత్రలు, కాండాలు, వంశాలు & ప్రదేశాలు)",
    marks2023: "16 Qs",
    weightage: "10.7%",
    topics: "Characters (Narada as Devarshi, Dasharatha's father Aja, Janaka's brother Kushadhvaja, Maricha's quote 'Ramo vigrahavan dharmah', Agastya giving Aditya Hridayam, Vishwamitra as Gadheya, Khara-Dooshana at Janasthana), Kandaas (Kishkindhakanda Sampati dialogue), geography (Panchavati, Ayodhya on River Sarayu, Sagara's Ashwamedha horse stolen by Indra), Surya Vamsha founded by Ikshvaku.",
  },
  {
    number: "02",
    name: "Mahabharatham (Characters, Parvaas, Places & Dynasties)",
    teluguName: "మహాభారతం (పాత్రలు, పర్వాలు, వంశాలు & ప్రదేశాలు)",
    marks2023: "18 Qs",
    weightage: "12.0%",
    topics: "Parvaas (Adi Parva first, Bhishma Parva preaching of Bhagavad Gita), early title (Jaya Samhita), Pandavas' incognito year at Viratanagar, Priest Dhoumya, Bhishma as Gangeya & narrator of Vishnu Sahasranama to Yudhishthira, Lakshagriha (built by Purochana, shelter at Ekachakrapura), Dronacharya & Ekalavya thumb gurudakshina, Karna (King of Anga, army chief), Drupada (Panchala), Arjuna's conch Devadatta, Kirata duel with Mahadev.",
  },
  {
    number: "03",
    name: "Bhagavatham (Characters, Skandams & Places)",
    teluguName: "భాగవతం (పాత్రలు, స్కంధాలు & ప్రదేశాలు)",
    marks2023: "14 Qs",
    weightage: "9.3%",
    topics: "Bhagavatam as Mahapurana, Sage Shuka narrating at Naimisharanya, King Parikshit giving residence to Kali in gambling/dyutam, Diti & Sage Kashyapa, Narakasura kidnapping 16,000 princesses in Kamarupa, Lord Krishna leaving mortal body at Prabhasa Tirtha, Kapila Muni avatar, Mohini avatar, 4 avatars in Satya Yuga (Matsya, Kurma, Varaha, Narasimha).",
  },
  {
    number: "04",
    name: "Hindu Puranams (18 Maha Puranas & Places)",
    teluguName: "హిందూ పురాణాలు (18 మహా పురాణాలు & పుణ్యక్షేత్రాలు)",
    marks2023: "14 Qs",
    weightage: "9.3%",
    topics: "10 Lakshanas of Puranas in Bhagavata Purana, Durga Saptashati in Markandeya Purana, Prabhasa Tirtha in Skanda Purana, Nachiketa's Yama Loka visit in Varaha Purana, 51 Shakti Peethas, Samudra Manthana churning rod (Mount Mandara), Nandiswara as Shiva's vahana, Vishwakarma (architect of gods & Sthapatya Veda), Magadha location in Bihar.",
  },
  {
    number: "05",
    name: "Temple Agamas (Vaishnava, Saiva & Sakteya)",
    teluguName: "ఆలయ ఆగమ శాస్త్రాలు (వైష్ణవ, శైవ & శాక్తేయ సంప్రదాయాలు)",
    marks2023: "12 Qs",
    weightage: "8.0%",
    topics: "Vaishnava Agamas: Vaikhanasa tradition (followed at Tirumala Tirupati temple, 32 questions in Vaikhanasa Kalpasutra) vs Pancharatra tradition (popularized by Ramanujacharya). Saiva Agamas: Smartha, Adi Saiva, Veera Saiva, Jangama sect, Kapalika Saivam (meaning of Kapala = skull), Sakteyam worship.",
  },
  {
    number: "06",
    name: "Hindu Festivals & Classical Fine Arts",
    teluguName: "హిందూ పండుగలు, జాతరలు & భారతీయ శాస్త్రీయ లలిత కళలు",
    marks2023: "13 Qs",
    weightage: "8.7%",
    topics: "Festivals: Vinayaka Chavithi (Bhadrapada month, 21 patra pooja), Akshaya Tritiya (Vaisakha Tritiya), Kanuma (thanksgiving to cattle & birds), Madanotsavam (Holi), Baisakhi (Punjab), Bestu Varas (Gujarat New Year on Diwali), Thai Poosam (Tamil Nadu). Classical arts: Sangita Ratnakara by Sharangadeva, 64 Arts in Kamasutra, Ghumar dance (Rajasthan), Chaya Someshvara Swamy temple shadow phenomenon (Telangana).",
  },
  {
    number: "07",
    name: "Vedic Culture, Vedas, Upavedas & Upanishads",
    teluguName: "వైదిక సంస్కృతి, చతుర్వేదాలు, ఉపవేదాలు & ఉపనిషత్తులు",
    marks2023: "20 Qs",
    weightage: "13.3%",
    topics: "14 Vidyas (branches of ancient knowledge), Rigveda (10 Mandalas, 9th Pavamana Mandala), Samaveda (Udgata Rtvik, Chandogyopanishad), Shukla Yajurveda (Shatapatha Brahmana), Krishna Yajurveda (Taittiriya Brahmana), Gayatri Mantra (24 syllables), Pratishakhya phonetics, Kathopanishad (Viswajit Yajna / Uddalaka), Nirukta by Yaska, Mimamsa Sutras by Jaimini, 4 Purusharthas by Manu, 4 Ashramas (3rd: Vanaprastha), Ashtanga Ayurveda (8 branches).",
  },
  {
    number: "08",
    name: "Philosophies, Cults & Gurus",
    teluguName: "భారతీయ తత్వశాస్త్రాలు, మత శాఖలు & ఆచార్యులు",
    marks2023: "15 Qs",
    weightage: "10.0%",
    topics: "Shankaracharya: Advaita, guru Govinda Bhagavatpada, debate with Mandana Mishra & Ubhaya Bharati, Bhamati commentary by Vachaspati Mishra. Ramanujacharya: Vishishtadvaita, Shri Bhashya on Brahma Sutras, 5 divine forms of Lord (Para, Vyuha, Vibhava, Antaryami, Archa), Chattada Sri Vaishnavas. Madhvacharya: Dvaita, Mahabharata Tatparya Nirnaya, 3 types of Jivatmas. Basaveswara: Veera Shaivism / Lingayat. Bhakti saints: 12 Alwars (Godadevi/Andal), 63 Nayanars (Periya Puranam), Panchayatana worship.",
  },
  {
    number: "09",
    name: "Family Structure, Marriage, Adoption & Succession",
    teluguName: "హిందూ సమాజ కుటుంబ వ్యవస్థ, వివాహాలు, దత్తత & వారసత్వ చట్టాలు",
    marks2023: "10 Qs",
    weightage: "6.7%",
    topics: "Traditional: 8 forms of Hindu marriage (Gandharva vivaha - Shakuntala & Dushyanta), Monogamy, Saptapadi ritual. Modern legislation: Hindu Marriage Act 1955, Hindu Succession Act 1956 (definition of Heir), Hindu Adoption and Maintenance Act 1956, Dowry Prohibition Act 1961, CARA statutory ministry (Ministry of Women & Child Development).",
  },
  {
    number: "10",
    name: "Temple Incomes, Funds & Financial Management (Act 30/87)",
    teluguName: "ఆలయ ఆదాయ వనరులు, నిధుల కేటాయింపు & ఆడిట్ (చట్టం 30/87)",
    marks2023: "12 Qs",
    weightage: "8.0%",
    topics: "Classification of temples based on annual income, Section 57 allocation of endowment funds, Section 69 Common Good Fund (transfer of surplus, payments), Section 144 (abolition of hereditary shares in Hundi & Rusums), Section 152 (Dharmika Parishad constituted by Government, Minister for Endowments as Chairman), Chapter VII (Budget, Accounts and Audit), Concurrent Audit mandatory when income exceeds ₹25 Lakhs.",
  },
  {
    number: "11",
    name: "Duties & Powers of Executive Officers (Sec 29 & Act 30/87)",
    teluguName: "ఎగ్జిక్యూటివ్ ఆఫీసర్ విధులు, అధికారాలు & బాధ్యతలు (సెక్షన్ 29)",
    marks2023: "8 Qs",
    weightage: "5.3%",
    topics: "Section 29: Appointment of Executive Officer, EO as Chief Administrative Officer in TTD, Section 110 extraordinary powers of EO, Archaka definition excludes EO, code of conduct prepared by Commissioner, maintenance of regular accounts of receipts and disbursements by EO.",
  },
  {
    number: "12",
    name: "Land Records & Law Relating to Endowments Lands (Sec 75-86)",
    teluguName: "దేవాదాయ భూములు, భూ రికార్డులు & ఆక్రమణల తొలగింపు (సెక్షన్ 75–86)",
    marks2023: "12 Qs",
    weightage: "8.0%",
    topics: "Section 77: Resumption of Inam Lands, Section 79: Prohibition of purchase of immovable property, Section 82: Cancellation of agricultural land leases (upheld in State of AP vs Nallamalli Ramireddy), Assistant Commissioner powers to determine landless poor cultivating tenants, Section 85: Encroachments removal (Deputy Commissioner), RDO resumption and appeal to District Collector, Section 15: Board of Trustees, Justice Challa Kondaiah Commission (1987).",
  },
];

// ── Endowments Act 30/1987 Key Sections Matrix ───────────

const ENDOWMENT_ACT_SECTIONS = [
  { section: "Section 15", subject: "Board of Trustees", detail: "Procedure and eligibility for appointing non-hereditary Board of Trustees for religious and charitable institutions." },
  { section: "Section 29", subject: "Appointment of Executive Officers", detail: "Empowers the Government or Commissioner to appoint Executive Officers for institutions and define administrative duties." },
  { section: "Section 57", subject: "Allocation of Temple Funds", detail: "Statutory provisions regulating the budget allocation, nitya dhoopa deepa naivedyams, and charitable expenditures." },
  { section: "Section 69", subject: "Common Good Fund & Surplus Transfer", detail: "Creation of the Common Good Fund; surplus temple revenue is mandatorily transferred to this fund for preservation of needy temples." },
  { section: "Section 77", subject: "Resumption of Inam Lands", detail: "Legal procedure for resuming service inams or alienated endowments lands by Revenue Divisional Officers (RDO)." },
  { section: "Section 79", subject: "Prohibition of Land Purchase", detail: "Strict prohibition preventing temple employees, trustees, and officials from purchasing immovable endowments properties." },
  { section: "Section 82", subject: "Cancellation of Agricultural Leases", detail: "Statutory termination of agricultural leases to protect temple assets; affirmed by High Court & Supreme Court in Nallamalli Ramireddy case." },
  { section: "Section 85", subject: "Eviction of Encroachments", detail: "Empowers the Deputy Commissioner to initiate eviction proceedings and issue orders against unauthorized occupants on temple lands." },
  { section: "Section 110", subject: "Extraordinary Powers of EO", detail: "Emergency powers vested in the Executive Officer to preserve temple rituals and safeguard properties during administrative deadlocks." },
  { section: "Section 144", subject: "Abolition of Hundi & Rusum Shares", detail: "Complete abolition of hereditary shares or private commissions in hundi collections, kanukas, and archakatvam rusums." },
  { section: "Section 152", subject: "Dharmika Parishad", detail: "Statutory constitution of Dharmika Parishad by the State Government, chaired by the Minister for Endowments." },
];

// ── CPT Practical Breakdown (100 Marks) ───────────────────

const CPT_PARTS = [
  { component: "Part-A: Computer Fundamentals MCQs", weightage: "20% (20 Marks)", format: "Objective MCQs", syllabus: "Computer components, ALU/RAM/ROM, Input/Output devices, OS (Windows/Linux/Mac), Internet protocols & IP address, Email client usage." },
  { component: "Part-B (1): Model Document Formatting & Mail Merge", weightage: "25% (25 Marks)", format: "Practical Hands-on", syllabus: "MS Word formatting, paragraph styles, inserting tables, WordArt, graphics, and configuring Mail Merge." },
  { component: "Part-B (2): Typing Speed Evaluation", weightage: "25% (25 Marks)", format: "Speed Typing Test", syllabus: "Evaluation of speed and accuracy in English/Telugu document typing within stipulated countdown." },
  { component: "Part-B (3): Excel Spreadsheet & Data Calculations", weightage: "20% (20 Marks)", format: "Practical Hands-on", syllabus: "Cell referencing, entering formulas, conditional formatting, data sorting, sub-totals, and creating charts." },
  { component: "Part-B (4): PowerPoint Presentation Layouts", weightage: "20% (20 Marks)", format: "Practical Hands-on", syllabus: "Preparing standard presentation slides, applying design themes, transition effects, object animation, and slide master setup." },
  { component: "Part-B (5): Object Insertion & Layout Organization", weightage: "15% (15 Marks)", format: "Practical Hands-on", syllabus: "Inserting and organizing shapes, pictures, flowcharts, hyperlinks, and document map alignment." },
];

const BILINGUAL_FAQS = [
  {
    question: "What is the official vacancy count and pay scale for AP Endowment Officer 2026?",
    answer: "APPSC Brief Notification No. 23/2026 sanctions 104 provisional vacancies for the post of Executive Officer Grade-III in A.P. Endowments Subordinate Service. The sanctioned Revised Pay Scale is ₹25,220 – ₹80,910, yielding an initial gross monthly salary of ~₹38,500 to ₹41,800 and a net in-hand take-home salary of ~₹33,500 to ₹36,500 per month.",
    teluguQuestion: "ఆంధ్రప్రదేశ్ ఎండోమెంట్ ఆఫీసర్ 2026 నోటిఫికేషన్‌లో ఖాళీల సంఖ్య మరియు పే స్కేల్ ఎంత?",
    teluguAnswer: "APPSC బ్రీఫ్ నోటిఫికేషన్ నెం. 23/2026 ప్రకారం ఏపీ దేవాదాయ సబార్డినేట్ సర్వీస్‌లో ఎగ్జిక్యూటివ్ ఆఫీసర్ గ్రేడ్-3 కింద మొత్తం 104 ఖాళీలను ప్రకటించారు. పే స్కేల్ ₹25,220 నుండి ₹80,910. డీఏ మరియు హెచ్‌ఆర్‌ఏ కలుపుకుని ప్రారంభ స్థూల వేతనం నెలకు సుమారు ₹38,500 నుండి ₹41,800 కాగా, చేతికి వచ్చే నికర శాలరీ నెలకు సుమారు ₹33,500 నుండి ₹36,500 వరకు ఉంటుంది.",
  },
  {
    question: "Is there a Screening Test for AP Endowment Officer Grade-III?",
    answer: "No. Paragraph 6 of the official notification clearly mandates that the examination shall consist of a single-level examination only, and no Screening Test shall be conducted irrespective of the number of applications received. The test will be conducted in Computer Based Recruitment Test (CBRT) mode.",
    teluguQuestion: "ఎండోమెంట్ ఆఫీసర్ రిక్రూట్‌మెంట్‌లో స్క్రీనింగ్ టెస్ట్ (ప్రిలిమ్స్) ఉంటుందా?",
    teluguAnswer: "లేదు. అభ్యర్థుల సంఖ్యతో సంబంధం లేకుండా ఈ నోటిఫికేషన్‌కు ఎటువంటి స్క్రీనింగ్ టెస్ట్ నిర్వహించబడదు. నేరుగా ఒకే స్థాయి కంప్యూటర్ ఆధారిత రాత పరీక్ష (CBRT) మాత్రమే నిర్వహించబడుతుంది.",
  },
  {
    question: "What is the exact examination pattern and negative marking for the written test?",
    answer: "The written test comprises two objective papers of Degree standard for a total of 300 marks: Paper-I (General Studies & Mental Ability - 150 Questions, 150 Minutes, 150 Marks) and Paper-II (Hindu Philosophy & Temple System - 150 Questions, 150 Minutes, 150 Marks). Under G.O. Ms No. 235, 1/3rd (0.33) marks are deducted for every wrong answer.",
    teluguQuestion: "రాత పరీక్ష విధానం మరియు నెగెటివ్ మార్కింగ్ నిబంధనలు ఏమిటి?",
    teluguAnswer: "రాత పరీక్ష మొత్తం 300 మార్కులకు డిగ్రీ స్థాయిలో ఉంటుంది. పేపర్-1: జనరల్ స్టడీస్ & మెంటల్ ఎబిలిటీ (150 ప్రశ్నలు, 150 నిమిషాలు, 150 మార్కులు) మరియు పేపర్-2: హిందూ ఫిలాసఫీ & దేవాలయ వ్యవస్థ (150 ప్రశ్నలు, 150 నిమిషాలు, 150 మార్కులు). జీవో నెం. 235 ప్రకారం ప్రతి తప్పు సమాధానానికి 1/3వ వంతు (0.33 మార్కులు) నెగెటివ్ మార్కింగ్ ఉంటుంది.",
  },
  {
    question: "What is the educational qualification and religious eligibility requirement?",
    answer: "Applicants must possess a Bachelor's Degree from a UGC-recognized University established by Central/State Act. Additionally, candidates must profess Hindu religion as mandated under Section 29 of the Andhra Pradesh Charitable and Hindu Religious Institutions and Endowments Act 30 of 1987.",
    teluguQuestion: "ఈ పోస్టుకు కావలసిన విద్యా అర్హత మరియు మతపరమైన నిబంధన ఏమిటి?",
    teluguAnswer: "అభ్యర్థులు తప్పనిసరిగా గుర్తింపు పొందిన విశ్వవిద్యాలయం నుండి ఏదైనా బ్యాచిలర్స్ డిగ్రీ ఉత్తీర్ణులై ఉండాలి. అంతేకాకుండా, దేవాదాయ చట్టం 30/1987 సెక్షన్ 29 నిబంధనల ప్రకారం అభ్యర్థి తప్పనిసరిగా హిందూ మతాన్ని అవలంబించేవారై ఉండాలి.",
  },
  {
    question: "What are the qualifying marks for the Computer Proficiency Test (CPT)?",
    answer: "As per G.O. Ms No. 26, the CPT is a mandatory practical examination for 100 marks (60 minutes duration). Minimum qualifying marks are: Open Competition (OC): 40 Marks (40%), Backward Classes (BC): 35 Marks (35%), and SC/ST/PBD candidates: 30 Marks (30%).",
    teluguQuestion: "కంప్యూటర్ ప్రొఫిషియన్సీ టెస్ట్ (CPT) లో క్వాలిఫైయింగ్ మార్కులు ఎంత?",
    teluguAnswer: "జీవో నెం. 26 ప్రకారం సీపీటీ 100 మార్కులకు 60 నిమిషాల వ్యవధిలో ప్రాక్టికల్ పరీక్షగా జరుగుతుంది. క్వాలిఫైయింగ్ మార్కులు: ఓసీ అభ్యర్థులకు 40 మార్కులు (40%), బీసీలకు 35 మార్కులు (35%), ఎస్సీ/ఎస్టీ/దివ్యాంగులకు 30 మార్కులు (30%).",
  },
  {
    question: "What are the highest weightage areas in Paper-II (Hindu Philosophy)?",
    answer: "Based on our empirical analysis of the 2023 previous paper: Vedic Culture & Upanishads carries 20 Questions (13.3%), Mahabharatam carries 18 Questions (12.0%), Ramayanam carries 16 Questions (10.7%), Philosophies & Gurus carries 15 Questions (10.0%), Bhagavatham & Puranas carry 14 Questions each (9.3%), and the Endowments Act 1987 (Finances, EO Duties & Land Laws) carries 32 Questions total (21.3%).",
    teluguQuestion: "పేపర్-2 హిందూ ఫిలాసఫీలో అత్యధిక వెయిటేజీ గల విభాగాలు ఏవి?",
    teluguAnswer: "2023 మునుపటి పేపర్ విశ్లేషణ ప్రకారం: వైదిక సంస్కృతి & ఉపనిషత్తులు - 20 ప్రశ్నలు (13.3%), మహాభారతం - 18 ప్రశ్నలు (12.0%), రామాయణం - 16 ప్రశ్నలు (10.7%), తాత్వికులు & ఆచార్యులు - 15 ప్రశ్నలు (10.0%), భాగవతం & పురాణాలు - చెరో 14 ప్రశ్నలు (9.3%), మరియు దేవాదాయ చట్టం 1987 సెక్షన్లు - మొత్తం 32 ప్రశ్నలు (21.3%).",
  },
  {
    question: "Which sections of the Endowments Act 1987 are most frequently tested?",
    answer: "The most tested sections are: Section 15 (Trustees), Section 29 (Executive Officers appointment & duties), Section 57 (Temple fund allocations), Section 69 (Common Good Fund), Section 77 (Resumption of Inams), Section 79 (Land purchase prohibitions), Section 82 (Lease cancellation), Section 85 (Encroachment eviction), Section 110 (Emergency powers of EO), Section 144 (Abolition of Hundi shares), and Section 152 (Dharmika Parishad).",
    teluguQuestion: "దేవాదాయ చట్టం 1987లో పరీక్షలలో తరచుగా అడిగే సెక్షన్లు ఏవి?",
    teluguAnswer: "అత్యంత ముఖ్యమైన సెక్షన్లు: సెక్షన్ 15 (ట్రస్టీల నియామకం), సెక్షన్ 29 (ఎగ్జిక్యూటివ్ ఆఫీసర్ నియామకం & విధులు), సెక్షన్ 57 (నిధుల కేటాయింపు), సెక్షన్ 69 (కామన్ గుడ్ ఫండ్), సెక్షన్ 77 (ఇనాం భూముల పునఃప్రారంభం), సెక్షన్ 79 (భూ కొనుగోలు నిషేధం), సెక్షన్ 82 (లీజుల రద్దు), సెక్షన్ 85 (ఆక్రమణల తొలగింపు), సెక్షన్ 110 (ఈఓ అత్యవసర అధికారాలు), సెక్షన్ 144 (హుండీ వాటాల రద్దు), మరియు సెక్షన్ 152 (ధార్మిక పరిషత్).",
  },
  {
    question: "Where can I practice free bilingual mock tests with genuine 1/3rd negative marking?",
    answer: "You can practice full-length CBRT mock tests for APPSC Endowment Officer with timed 150-minute countdowns, realistic 1/3rd negative marking, and exhaustive bilingual explanations directly on Varadhi Prep at varadhiprep.in/mock-tests/andhra-pradesh/appsc-endowment-officer-mock-test.",
    teluguQuestion: "నెగెటివ్ మార్కింగ్‌తో ఉచిత మాక్ టెస్ట్‌లను ఎక్కడ రాయవచ్చు?",
    teluguAnswer: "వరధి ప్రెప్‌లో ఎండోమెంట్ ఆఫీసర్ పూర్తి స్థాయి మాక్ టెస్టులను 150 నిమిషాల టైమర్, 1/3వ వంతు నెగెటివ్ మార్కింగ్ మరియు తెలుగు & ఇంగ్లీష్ వివరణలతో ఉచితంగా ప్రాక్టీస్ చేయవచ్చు.",
  },
];

export default function ApEndowmentOfficerNotificationPage() {
  const canonical = absoluteUrl(CANONICAL_PATH);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: "AP Endowment Officer Notification 2026: 104 Vacancies, Syllabus Weightage, Salary & PDF Download",
      description:
        "Official APPSC notification for 104 Executive Officer Grade-III vacancies in A.P. Endowments Subordinate Service with complete Paper-I and Paper-II marks-wise weightage, Endowments Act 30/1987 analysis, CPT practical format, salary scale, and official PDF download.",
      url: canonical,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonical,
      },
      image: [absoluteUrl("/opengraph-image")],
      datePublished: "2026-09-15T10:00:00+05:30",
      dateModified: new Date().toISOString(),
      inLanguage: ["en-IN", "te-IN"],
      articleSection: "Government Recruitment Notifications",
      keywords:
        "AP Endowment Officer Notification 2026, APPSC EO Grade 3 Notification, AP Endowment Officer Syllabus Weightage Marks, Hindu Philosophy Paper 2 Syllabus, AP Endowments Act 1987 Sections, Download Official PDF, AP Endowment Officer Salary In Hand, APPSC EO CPT Pattern",
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
        name: "APPSC Executive Officer Grade-III Notification 23/2026 Official Gazette PDF",
        encodingFormat: "application/pdf",
        url: absoluteUrl("/docs/appsc-endowment-officer-notification-2026-official.pdf"),
        contentSize: "427 KB",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: "Executive Officer Grade-III in A.P. Endowments Subordinate Service",
      description:
        "Direct recruitment to 104 posts of Executive Officer Grade-III in A.P. Endowments Subordinate Service (Brief Notification No. 23/2026) by Andhra Pradesh Public Service Commission (APPSC). Single-level CBRT examination degree standard.",
      identifier: {
        "@type": "PropertyValue",
        name: "APPSC",
        value: "APPSC Notification No. 23/2026",
      },
      datePosted: "2026-09-15",
      validThrough: "2026-11-05T23:59:59+05:30",
      employmentType: "FULL_TIME",
      industry: "Public Administration & Religious Endowments",
      directApply: true,
      hiringOrganization: {
        "@type": "Organization",
        name: "Andhra Pradesh Public Service Commission (APPSC)",
        sameAs: "https://psc.ap.gov.in",
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
        credentialCategory: "Bachelor's Degree from a recognized University",
      },
      experienceRequirements: "No experience required (Degree Freshers eligible)",
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
        { "@type": "ListItem", position: 3, name: "AP Endowment Officer Notification 2026", item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "AP Endowment Officer Notification 2026: EO Grade-III Syllabus Marks Wise, Weightage & Telugu PDF",
      url: canonical,
      description:
        "Comprehensive guide featuring AP Endowment Officer syllabus marks wise breakdown, Paper-I GS weightage, Paper-II Hindu Philosophy weightage, Endowments Act 1987 analysis, CPT pattern, and salary scale.",
      keywords:
        "ap endowment officer syllabus weightage marks, ap endowment officer syllabus marks wise, ap endowment officer hindu philosophy syllabus, ap endowment officer notification 2026",
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "article p:first-of-type"],
      },
    },
  ];

  return (
    <main className="min-h-screen w-full bg-[#eaf4fa] text-[#1a1a1a] antialiased">
      <JsonLd data={jsonLd} />

      {/* Preload Google Mandali Telugu Font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Mandali&display=swap"
      />

      {/* Top Banner Rule */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#0055a2] via-[#0055a2] to-[#fb8916]" />

      {/* BroadSheet Header */}
      <header className="border-b border-[#cde7f7] bg-white w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Varadhi Prep home">
            <BrandLockup />
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium text-slate-700">
            <span className="hidden sm:inline text-slate-600 font-sans font-semibold text-xs">APPSC Subordinate Service 2026</span>
            <a
              href="/docs/appsc-endowment-officer-notification-2026-official.pdf"
              download="APPSC-Endowment-Officer-Notification-23-2026-Official.pdf"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-3 py-2 font-bold transition text-xs sm:text-sm shadow-2xs"
              title="Download Official Notification PDF (427 KB)"
            >
              <svg className="w-4 h-4 text-red-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              <span>Download PDF</span>
            </a>
            <a
              href="https://psc.ap.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#0055a2] bg-white hover:bg-[#0055a2] text-[#0055a2] hover:text-white px-3.5 py-2 font-bold transition text-xs sm:text-sm shadow-2xs"
              title="Official APPSC Portal"
            >
              <svg className="w-4 h-4 text-slate-700 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4 4a1 1 0 10-2 0v2a1 1 0 102 0v-2z" clipRule="evenodd" />
              </svg>
              <span>APPSC Official Portal ↗</span>
            </a>
            <Link
              href="/mock-tests/andhra-pradesh/appsc-endowment-officer-mock-test"
              className="inline-flex items-center rounded-lg bg-[#fb8916] hover:bg-[#e2740a] text-white px-3.5 sm:px-4 py-2 font-bold transition text-xs sm:text-sm shadow-sm"
            >
              Practice Mock Tests &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Article Header & Editorial Hero */}
      <article className="border-b border-[#cde7f7] bg-[#eaf4fa] w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-6 sm:py-8">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumbs" className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
            <Link href="/" className="hover:text-[#0055a2] transition font-medium">Home</Link>
            <span>/</span>
            <span className="text-slate-600">Recruitment News</span>
            <span>/</span>
            <span className="font-bold text-slate-950">AP Endowment Officer Notification 2026</span>
          </nav>

          {/* Category Tag */}
          <div className="mt-3.5">
            <span className="text-xs font-black uppercase tracking-wider text-[#0055a2]">
              Andhra Pradesh Public Service Commission &bull; Brief Notification No. 23/2026
            </span>
          </div>

          {/* Headline & Telugu Title */}
          <div className="mt-2.5 max-w-6xl">
            <h1 className="font-brand text-2xl sm:text-3xl lg:text-[2.65rem] font-bold text-slate-950 leading-[1.2] tracking-tight">
              AP Endowment Officer Notification 2026: 104 Posts, EO Grade-III Pay Scale, Hindu Philosophy Weightage &amp; Exam Pattern
            </h1>
            <p lang="te" className="font-telugu text-lg sm:text-xl lg:text-2xl text-slate-900 mt-2.5 leading-[1.75] font-normal">
              ఆంధ్రప్రదేశ్ దేవాదాయ శాఖ ఎగ్జిక్యూటివ్ ఆఫీసర్ (గ్రేడ్-3) 104 పోస్టుల అధికారిక నోటిఫికేషన్, శాలరీ, హిందూ ఫిలాసఫీ వెయిటేజీ &amp; సీపీటీ విధానం
            </p>
          </div>

          {/* Byline */}
          <div className="mt-4 pt-3 border-t border-[#cde7f7]/80 flex flex-wrap items-center justify-between gap-y-2 text-xs sm:text-sm text-slate-700">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="font-bold text-slate-950">Varadhi News Desk</span>
              <span className="text-slate-400">&bull;</span>
              <span>Updated: Nov 15, 2026, 12:00 PM IST</span>
              <span className="text-slate-400">&bull;</span>
              <span>Degree Standard &bull; Single-Level CBRT</span>
            </div>
            <div className="text-slate-600 font-semibold">
              <span>7 min read</span>
            </div>
          </div>

          {/* Exam Snapshot (4 Key Cards) */}
          <div className="mt-8 rounded-xl border border-[#cde7f7] bg-white p-5 sm:p-7 w-full shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3.5 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#fb8916] ring-4 ring-[#ffe8cc]" />
                <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#0055a2]">
                  Key Highlights &amp; Exam Snapshot
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs self-start sm:self-auto">
                <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" />
                Notification No. 23/2026
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div className="rounded-xl border border-slate-200 bg-[#f4f9fd] p-4 sm:p-5 hover:border-[#cde7f7] hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Total Vacancies</span>
                <strong className="text-2xl sm:text-3xl font-black text-[#0055a2] block mt-1">{TOTAL_VACANCIES}</strong>
                <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">EO Grade-III Subordinate</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#f4f9fd] p-4 sm:p-5 hover:border-[#cde7f7] hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Scale of Pay</span>
                <strong className="text-xl sm:text-2xl font-black text-[#0055a2] block mt-1">₹25,220 – ₹80,910</strong>
                <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">Gross ~₹40,465/mo</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#f4f9fd] p-4 sm:p-5 hover:border-[#cde7f7] hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Exam Scheme</span>
                <strong className="text-xl sm:text-2xl font-black text-[#0055a2] block mt-1">Single-Level CBRT</strong>
                <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">No Screening Test</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#f4f9fd] p-4 sm:p-5 hover:border-[#cde7f7] hover:bg-white hover:shadow-xs transition">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Written Marks</span>
                <strong className="text-2xl sm:text-3xl font-black text-[#0055a2] block mt-1">300 Marks</strong>
                <span className="text-xs sm:text-sm text-slate-700 font-medium block mt-1">Paper-I 150 + Paper-II 150</span>
              </div>
            </div>

            {/* Official Gazette PDF Banner */}
            <div className="mt-5 pt-5 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="h-11 w-11 rounded-lg bg-red-100 border border-red-200 text-red-700 flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                  PDF
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-950">
                      Official APPSC Notification PDF (Brief No. 23/2026)
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-200">
                      Official 11 Pages • 427 KB
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    104 posts vacancy roster, Degree eligibility, Paper-I &amp; Paper-II syllabus, and CPT scheme.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <a
                  href="/docs/appsc-endowment-officer-notification-2026-official.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#0055a2] bg-white hover:bg-blue-50 text-[#0055a2] px-3.5 py-2 font-bold transition text-xs sm:text-sm shadow-2xs"
                >
                  <span>View PDF ↗</span>
                </a>
                <a
                  href="/docs/appsc-endowment-officer-notification-2026-official.pdf"
                  download="APPSC-Endowment-Officer-Notification-23-2026-Official.pdf"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0055a2] hover:bg-[#004280] text-white px-3.5 py-2 font-bold transition text-xs sm:text-sm shadow-xs"
                >
                  <svg className="w-4 h-4 text-white shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Main Content Layout */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Article Body */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Table of Contents Box */}
            <nav className="rounded-xl border border-[#cde7f7] bg-white p-5 sm:p-6 shadow-xs">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#0055a2] border-b border-slate-200 pb-3 mb-4">
                Table of Contents &bull; Quick Section Jump
              </h2>
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-800 font-medium">
                <li><a href="#schedule" className="hover:text-[#0055a2] hover:underline">1. Recruitment Schedule &amp; Dates</a></li>
                <li><a href="#vacancies" className="hover:text-[#0055a2] hover:underline">2. Vacancy Breakdown (104 Posts)</a></li>
                <li><a href="#salary" className="hover:text-[#0055a2] hover:underline">3. Salary Structure &amp; In-Hand Pay</a></li>
                <li><a href="#eligibility" className="hover:text-[#0055a2] hover:underline">4. Eligibility &amp; Religious Mandate</a></li>
                <li><a href="#age" className="hover:text-[#0055a2] hover:underline">5. Age Limit &amp; Relaxations</a></li>
                <li><a href="#selection" className="hover:text-[#0055a2] hover:underline">6. Selection Process Architecture</a></li>
                <li><a href="#pattern" className="hover:text-[#0055a2] hover:underline">7. Examination Pattern &amp; Negative Marks</a></li>
                <li><a href="#paper1-weightage" className="hover:text-[#0055a2] hover:underline">8. Paper-I GS Marks-Wise Weightage</a></li>
                <li><a href="#paper2-weightage" className="hover:text-[#0055a2] hover:underline">9. Paper-II Hindu Philosophy Weightage</a></li>
                <li><a href="#act-matrix" className="hover:text-[#0055a2] hover:underline">10. Endowments Act 1987 Sections Master</a></li>
                <li><a href="#cpt" className="hover:text-[#0055a2] hover:underline">11. Computer Proficiency Test (CPT)</a></li>
                <li><a href="#downloads" className="hover:text-[#0055a2] hover:underline">12. Official PDF Download Center</a></li>
                <li><a href="#faqs" className="hover:text-[#0055a2] hover:underline">13. Bilingual Frequently Asked Questions</a></li>
              </ol>
            </nav>

            {/* Section 1: Schedule */}
            <section id="schedule" className="scroll-mt-6">
              <div className="border-b-2 border-[#0055a2] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  1. Official Recruitment Schedule &amp; Important Dates
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                As per APPSC Brief Notification No. 23/2026 and Detailed Notification published on 16/10/2026, online applications for direct recruitment to the post of Executive Officer Grade-III concluded in mid-November 2026. The commission is now finalizing the Computer-Based Written Test (CBRT) examination timetable. Below is the updated official recruitment tracker:
              </p>
              <div className="rounded-xl border border-[#cde7f7] overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm sm:text-base">
                    <thead>
                      <tr className="border-b border-slate-200 bg-[#f1f5f9] text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wide">
                        <th className="px-4 py-3.5 border-r border-slate-200">Event / Activity</th>
                        <th className="px-4 py-3.5 border-r border-slate-200">తెలుగు వివరణ</th>
                        <th className="px-4 py-3.5 border-r border-slate-200">Official Date</th>
                        <th className="px-4 py-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {SCHEDULE_EVENTS.map((evt, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition">
                          <td className="px-4 py-3.5 font-bold text-slate-950 border-r border-slate-200">{evt.title}</td>
                          <td lang="te" className="px-4 py-3.5 font-telugu text-slate-900 border-r border-slate-200 text-sm font-medium">{evt.teluguTitle}</td>
                          <td className="px-4 py-3.5 font-semibold text-[#0055a2] border-r border-slate-200">{evt.date}</td>
                          <td className="px-4 py-3.5 text-right">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              evt.status === "Completed" || evt.status === "Concluded" || evt.status === "Reckoned"
                                ? "bg-slate-100 text-slate-700 border border-slate-200"
                                : evt.status === "Active Stage"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-blue-50 text-[#0055a2] border border-blue-200"
                            }`}>
                              {evt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 2: Vacancies */}
            <section id="vacancies" className="scroll-mt-6">
              <div className="border-b-2 border-[#0055a2] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  2. Post &amp; Cadre Breakdown: 104 Vacancies
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                The recruitment is conducted for Category-III executive positions under the Andhra Pradesh Endowments Subordinate Service. Provisional vacancies notified are subject to variation upon final confirmation from the Endowments Department:
              </p>
              <div className="rounded-xl border border-[#cde7f7] bg-white p-5 sm:p-6 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border-l-4 border-l-[#0055a2] pl-3 py-1">
                    <span className="text-xs text-slate-500 font-bold uppercase block">Name of the Post</span>
                    <strong className="text-base font-bold text-slate-950 block mt-0.5">Executive Officer Grade-III</strong>
                    <span lang="te" className="font-telugu text-xs text-slate-700">ఎగ్జిక్యూటివ్ ఆఫీసర్ గ్రేడ్-3</span>
                  </div>
                  <div className="border-l-4 border-l-emerald-600 pl-3 py-1">
                    <span className="text-xs text-slate-500 font-bold uppercase block">Cadre &amp; Service</span>
                    <strong className="text-base font-bold text-slate-950 block mt-0.5">A.P. Endowments Subordinate Service</strong>
                    <span lang="te" className="font-telugu text-xs text-slate-700">ఆంధ్రప్రదేశ్ దేవాదాయ సబార్డినేట్ సర్వీస్</span>
                  </div>
                  <div className="border-l-4 border-l-[#fb8916] pl-3 py-1">
                    <span className="text-xs text-slate-500 font-bold uppercase block">Total Vacancies</span>
                    <strong className="text-2xl font-black text-[#0055a2] block mt-0.5">104 Posts</strong>
                    <span className="text-xs text-slate-600 font-medium">General Recruitment</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Salary */}
            <section id="salary" className="scroll-mt-6">
              <div className="border-b-2 border-[#0055a2] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  3. Pay Scale &amp; Monthly In-Hand Salary Breakdown
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                As notified in Notification No. 23/2026, the sanctioned pay scale is <strong>₹25,220 – ₹80,910</strong>. Here is the realistic monthly gross earnings and net take-home pay calculation factoring in applicable AP State DA, HRA, and statutory deductions:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="rounded-xl border border-[#cde7f7] bg-white overflow-hidden shadow-xs">
                  <div className="bg-[#f1f5f9] px-4 py-3 font-bold text-xs sm:text-sm text-slate-950 uppercase border-b border-slate-200">
                    Gross Monthly Earnings Breakdown
                  </div>
                  <ul className="divide-y divide-slate-200 text-xs sm:text-sm">
                    {SALARY_COMPONENTS.map((item, idx) => (
                      <li key={idx} className="p-3.5 flex items-center justify-between">
                        <div>
                          <strong className="text-slate-950 block">{item.item}</strong>
                          <span className="text-xs text-slate-500 font-medium">{item.note}</span>
                        </div>
                        <span className="font-mono font-bold text-[#0055a2] shrink-0 text-sm">{item.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#cde7f7] bg-white overflow-hidden shadow-xs">
                  <div className="bg-[#f1f5f9] px-4 py-3 font-bold text-xs sm:text-sm text-slate-950 uppercase border-b border-slate-200">
                    Mandatory Deductions &amp; Take-Home Salary
                  </div>
                  <ul className="divide-y divide-slate-200 text-xs sm:text-sm">
                    {SALARY_DEDUCTIONS.map((item, idx) => (
                      <li key={idx} className="p-3.5 flex items-center justify-between">
                        <div>
                          <strong className="text-slate-950 block">{item.item}</strong>
                          <span className="text-xs text-slate-500 font-medium">{item.note}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-700 shrink-0 text-sm">{item.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4: Eligibility & Religious Mandate */}
            <section id="eligibility" className="scroll-mt-6">
              <div className="border-b-2 border-[#0055a2] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  4. Educational Qualifications &amp; Statutory Religious Mandate
                </h2>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-[#cde7f7] bg-white p-5 shadow-xs">
                  <h3 className="text-base font-bold text-slate-950 mb-2">1. Educational Qualification (Degree Standard)</h3>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                    Must possess a <strong>Bachelor&apos;s Degree</strong> from a University in India established or incorporated by or under a Central Act or a State Act or Provincial Act or any other Institution recognized by the University Grants Commission (UGC) or any other equivalent qualifications.
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs">
                  <div className="flex items-start gap-3">
                    <span className="rounded-full bg-amber-600 text-white p-1 text-xs font-black">!</span>
                    <div>
                      <h3 className="text-base font-bold text-amber-950 mb-1">2. Mandatory Religious Requirement (Section 29 of Act 30/1987)</h3>
                      <p className="text-sm sm:text-base text-amber-900 leading-relaxed">
                        Under Section 29 of the Andhra Pradesh Charitable and Hindu Religious Institutions and Endowments Act 1987, any person appointed as an Executive Officer to manage Hindu temples and religious endowments <strong>must profess the Hindu religion</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Age Limits */}
            <section id="age" className="scroll-mt-6">
              <div className="border-b-2 border-[#0055a2] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  5. Age Limits &amp; Statutory Category Relaxations
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                The minimum age is 18 years and maximum age is 42 years as of the crucial date specified in the detailed notification. Statutory category relaxations apply as per AP State and Subordinate Service Rules:
              </p>
              <div className="rounded-xl border border-[#cde7f7] overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm sm:text-base">
                    <thead>
                      <tr className="border-b border-slate-200 bg-[#f1f5f9] text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wide">
                        <th className="px-4 py-3.5 border-r border-slate-200">Candidate Category</th>
                        <th className="px-4 py-3.5 border-r border-slate-200">Permissible Age Range</th>
                        <th className="px-4 py-3.5">Relaxation Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {AGE_LIMITS.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition">
                          <td className="px-4 py-3.5 font-bold text-slate-950 border-r border-slate-200">{row.category}</td>
                          <td className="px-4 py-3.5 font-semibold text-[#0055a2] border-r border-slate-200">{row.ageRange}</td>
                          <td className="px-4 py-3.5 text-slate-600 text-xs sm:text-sm">{row.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 6: Selection Process */}
            <section id="selection" className="scroll-mt-6">
              <div className="border-b-2 border-[#0055a2] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  6. Selection Process Architecture: Single-Level CBRT
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Paragraph 6 of Brief Notification No. 23/2026 establishes an important rule: <strong>The examination for this recruitment shall consist of a single-level examination only, and no Screening Test shall be conducted</strong> irrespective of the number of applications received.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-[#cde7f7] bg-white p-5 shadow-xs">
                  <span className="rounded bg-[#0055a2]/10 text-[#0055a2] text-xs font-bold px-2 py-0.5">Stage 1</span>
                  <h3 className="font-brand font-bold text-slate-950 text-base mt-2">Single-Level Written Exam (CBRT)</h3>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                    300 Marks objective test (Paper-I: 150M + Paper-II: 150M). Normalization procedure adopted if conducted in multiple sessions.
                  </p>
                </div>
                <div className="rounded-xl border border-[#cde7f7] bg-white p-5 shadow-xs">
                  <span className="rounded bg-[#fb8916]/10 text-[#fb8916] text-xs font-bold px-2 py-0.5">Stage 2</span>
                  <h3 className="font-brand font-bold text-slate-950 text-base mt-2">Computer Proficiency Test (CPT)</h3>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                    60-minute practical evaluation (100 Marks) in Office Automation. Mandatory qualifying test for final selection list.
                  </p>
                </div>
                <div className="rounded-xl border border-[#cde7f7] bg-white p-5 shadow-xs">
                  <span className="rounded bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5">Stage 3</span>
                  <h3 className="font-brand font-bold text-slate-950 text-base mt-2">Certificate Verification &amp; Merit</h3>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                    Original document verification, local status certificate scrutiny, and appointment order issuance.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7: Pattern & Negative Marking */}
            <section id="pattern" className="scroll-mt-6">
              <div className="border-b-2 border-[#0055a2] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  7. Examination Pattern &amp; Negative Marking Rule
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                The written examination consists of two papers of Degree standard as prescribed under G.O. Ms No. 201, Finance Dept.
              </p>
              <div className="rounded-xl border border-[#cde7f7] overflow-hidden bg-white shadow-xs mb-4">
                <table className="w-full text-left text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#f1f5f9] text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wide">
                      <th className="px-4 py-3.5 border-r border-slate-200">Paper</th>
                      <th className="px-4 py-3.5 border-r border-slate-200">Subject</th>
                      <th className="px-4 py-3.5 border-r border-slate-200 text-center">Questions</th>
                      <th className="px-4 py-3.5 border-r border-slate-200 text-center">Duration</th>
                      <th className="px-4 py-3.5 text-right">Max Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    <tr className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-600 border-r border-slate-200">PAPER-I</td>
                      <td className="px-4 py-3.5 font-bold text-slate-950 border-r border-slate-200">General Studies &amp; Mental Ability</td>
                      <td className="px-4 py-3.5 text-center font-semibold border-r border-slate-200">150</td>
                      <td className="px-4 py-3.5 text-center text-slate-600 border-r border-slate-200">150 Mins</td>
                      <td className="px-4 py-3.5 text-right font-black text-[#0055a2]">150 Marks</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-600 border-r border-slate-200">PAPER-II</td>
                      <td className="px-4 py-3.5 font-bold text-slate-950 border-r border-slate-200">Hindu Philosophy &amp; Temple System</td>
                      <td className="px-4 py-3.5 text-center font-semibold border-r border-slate-200">150</td>
                      <td className="px-4 py-3.5 text-center text-slate-600 border-r border-slate-200">150 Mins</td>
                      <td className="px-4 py-3.5 text-right font-black text-[#0055a2]">150 Marks</td>
                    </tr>
                    <tr className="bg-[#0055a2]/5 font-bold text-[#0055a2] border-t-2 border-[#0055a2]/20">
                      <td colSpan={2} className="px-4 py-3.5 uppercase tracking-wider text-xs sm:text-sm font-extrabold border-r border-[#0055a2]/20">
                        Total Written Examination
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold border-r border-[#0055a2]/20">300 Questions</td>
                      <td className="px-4 py-3.5 text-center font-bold border-r border-[#0055a2]/20">300 Mins (5 Hrs)</td>
                      <td className="px-4 py-3.5 text-right font-black text-lg text-[#0055a2]">300 Marks</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 text-xs sm:text-sm text-red-950 leading-relaxed">
                <strong>Mandatory Negative Marking Rule:</strong> As per G.O. Ms No. 235, Finance (HR-I, Plg &amp; Policy) Dept., dated 06/12/2016, each wrong answer is penalized with <strong>1/3rd (0.33) of the mark</strong> prescribed for that question. Blind guessing will severely erode your rank.
              </div>
            </section>

            {/* Section 8: Paper-I Weightage */}
            <section id="paper1-weightage" className="scroll-mt-6">
              <div className="border-b-2 border-[#0055a2] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  8. Paper-I: General Studies &amp; Mental Ability Marks-Wise Weightage
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Based on our rigorous empirical question-by-question analysis of the actual APPSC Endowment Officer Paper-I held on <strong>17 February 2023</strong>, below is the exact question distribution across all 10 syllabus units:
              </p>
              <div className="rounded-xl border border-[#cde7f7] overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm sm:text-base">
                    <thead>
                      <tr className="border-b border-slate-200 bg-[#f1f5f9] text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wide">
                        <th className="px-3.5 py-3 border-r border-slate-200">Unit</th>
                        <th className="px-3.5 py-3 border-r border-slate-200">Syllabus Topic</th>
                        <th className="px-3.5 py-3 border-r border-slate-200">తెలుగు శీర్షిక</th>
                        <th className="px-3.5 py-3 border-r border-slate-200 text-center">2023 Paper Qs</th>
                        <th className="px-3.5 py-3 text-right">Weightage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {PAPER_1_SUBJECTS.map((item) => (
                        <tr key={item.number} className="hover:bg-slate-50/60 transition">
                          <td className="px-3.5 py-3 font-mono font-bold text-slate-500 border-r border-slate-200 text-xs">{item.number}</td>
                          <td className="px-3.5 py-3 font-bold text-slate-950 border-r border-slate-200 text-xs sm:text-sm">{item.name}</td>
                          <td lang="te" className="px-3.5 py-3 font-telugu text-slate-800 border-r border-slate-200 text-xs sm:text-sm font-medium">{item.teluguName}</td>
                          <td className="px-3.5 py-3 text-center font-black text-[#0055a2] border-r border-slate-200">{item.marks2023}</td>
                          <td className="px-3.5 py-3 text-right font-bold text-slate-700">{item.weightage}</td>
                        </tr>
                      ))}
                      <tr className="bg-[#0055a2]/5 font-bold text-[#0055a2] border-t-2 border-[#0055a2]/20">
                        <td colSpan={3} className="px-4 py-3.5 uppercase tracking-wider text-xs sm:text-sm font-extrabold border-r border-[#0055a2]/20">
                          Total Paper-I Distribution
                        </td>
                        <td className="px-4 py-3.5 text-center font-black text-[#0055a2] border-r border-[#0055a2]/20">150 Questions</td>
                        <td className="px-4 py-3.5 text-right font-black text-[#0055a2]">100% (150 Marks)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 9: Paper-II Weightage */}
            <section id="paper2-weightage" className="scroll-mt-6">
              <div className="border-b-2 border-[#0055a2] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  9. Paper-II: Hindu Philosophy &amp; Temple System Marks-Wise Weightage
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Paper-II is the game-changer for AP Endowment Officer aspirants. Here is the comprehensive question distribution from the official 17 February 2023 question paper mapped directly to the 12 syllabus sections:
              </p>
              <div className="rounded-xl border border-[#cde7f7] overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm sm:text-base">
                    <thead>
                      <tr className="border-b border-slate-200 bg-[#f1f5f9] text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wide">
                        <th className="px-3.5 py-3 border-r border-slate-200">#</th>
                        <th className="px-3.5 py-3 border-r border-slate-200">Syllabus Topic</th>
                        <th className="px-3.5 py-3 border-r border-slate-200">తెలుగు శీర్షిక</th>
                        <th className="px-3.5 py-3 border-r border-slate-200 text-center">2023 Paper Qs</th>
                        <th className="px-3.5 py-3 text-right">Weightage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {PAPER_2_SUBJECTS.map((item) => (
                        <tr key={item.number} className="hover:bg-slate-50/60 transition">
                          <td className="px-3.5 py-3 font-mono font-bold text-slate-500 border-r border-slate-200 text-xs">{item.number}</td>
                          <td className="px-3.5 py-3 font-bold text-slate-950 border-r border-slate-200 text-xs sm:text-sm">{item.name}</td>
                          <td lang="te" className="px-3.5 py-3 font-telugu text-slate-800 border-r border-slate-200 text-xs sm:text-sm font-medium">{item.teluguName}</td>
                          <td className="px-3.5 py-3 text-center font-black text-[#0055a2] border-r border-slate-200">{item.marks2023}</td>
                          <td className="px-3.5 py-3 text-right font-bold text-slate-700">{item.weightage}</td>
                        </tr>
                      ))}
                      <tr className="bg-[#0055a2]/5 font-bold text-[#0055a2] border-t-2 border-[#0055a2]/20">
                        <td colSpan={3} className="px-4 py-3.5 uppercase tracking-wider text-xs sm:text-sm font-extrabold border-r border-[#0055a2]/20">
                          Total Paper-II Distribution
                        </td>
                        <td className="px-4 py-3.5 text-center font-black text-[#0055a2] border-r border-[#0055a2]/20">150 Questions</td>
                        <td className="px-4 py-3.5 text-right font-black text-[#0055a2]">100% (150 Marks)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 10: Endowments Act Matrix */}
            <section id="act-matrix" className="scroll-mt-6">
              <div className="border-b-2 border-[#0055a2] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  10. Endowments Act (Act 30 of 1987): High-Yield Sections Master Matrix
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Over 32 questions (21.3% of Paper-II) in the 2023 examination were directly drawn from the <strong>A.P. Charitable and Hindu Religious Institutions and Endowments Act, 1987 (Act 30/1987)</strong>. The table below lists the most vital statutory sections tested:
              </p>
              <div className="rounded-xl border border-[#cde7f7] overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm sm:text-base">
                    <thead>
                      <tr className="border-b border-slate-200 bg-[#f1f5f9] text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wide">
                        <th className="px-4 py-3.5 border-r border-slate-200">Act Section</th>
                        <th className="px-4 py-3.5 border-r border-slate-200">Legal Subject</th>
                        <th className="px-4 py-3.5">Core Statutory Rule &amp; Examination Implication</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {ENDOWMENT_ACT_SECTIONS.map((sec, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition">
                          <td className="px-4 py-3 font-mono font-bold text-[#0055a2] border-r border-slate-200 shrink-0">{sec.section}</td>
                          <td className="px-4 py-3 font-bold text-slate-950 border-r border-slate-200 text-sm">{sec.subject}</td>
                          <td className="px-4 py-3 text-slate-700 text-xs sm:text-sm">{sec.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 11: CPT */}
            <section id="cpt" className="scroll-mt-6">
              <div className="border-b-2 border-[#0055a2] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  11. Computer Proficiency Test (CPT) Complete Blueprint
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                As per G.O. Ms No. 26, G.A. (Ser.B) Dept., dated 24.02.2023, the practical Computer Proficiency Test is conducted for 100 marks (60 minutes). It consists of Part-A (20% MCQs) and Part-B (80% Hands-on Assessment):
              </p>
              <div className="rounded-xl border border-[#cde7f7] overflow-hidden bg-white shadow-xs mb-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm sm:text-base">
                    <thead>
                      <tr className="border-b border-slate-200 bg-[#f1f5f9] text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wide">
                        <th className="px-4 py-3.5 border-r border-slate-200">Assessment Module</th>
                        <th className="px-4 py-3.5 border-r border-slate-200">Marks Share</th>
                        <th className="px-4 py-3.5 border-r border-slate-200">Test Format</th>
                        <th className="px-4 py-3.5">Curriculum &amp; Practical Competencies</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {CPT_PARTS.map((cpt, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition">
                          <td className="px-4 py-3 font-bold text-slate-950 border-r border-slate-200 text-xs sm:text-sm">{cpt.component}</td>
                          <td className="px-4 py-3 font-mono font-bold text-[#0055a2] border-r border-slate-200 text-sm">{cpt.weightage}</td>
                          <td className="px-4 py-3 text-slate-700 border-r border-slate-200 text-xs sm:text-sm font-medium">{cpt.format}</td>
                          <td className="px-4 py-3 text-slate-600 text-xs sm:text-sm">{cpt.syllabus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <span className="text-xs sm:text-sm font-bold text-slate-900 uppercase">Minimum Qualifying Marks for CPT:</span>
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-slate-100 px-3 py-1 font-bold text-xs text-slate-800 border border-slate-200">SC/ST/PBD: 30 Marks (30%)</span>
                  <span className="rounded-md bg-blue-50 px-3 py-1 font-bold text-xs text-[#0055a2] border border-blue-200">BC: 35 Marks (35%)</span>
                  <span className="rounded-md bg-emerald-50 px-3 py-1 font-bold text-xs text-emerald-800 border border-emerald-200">OC: 40 Marks (40%)</span>
                </div>
              </div>
            </section>

            {/* Section 12: Downloads */}
            <section id="downloads" className="scroll-mt-6">
              <div className="border-b-2 border-[#0055a2] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  12. Official Gazette PDF &amp; Document Download Center
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 mb-5 leading-relaxed">
                Access the official APPSC Brief Notification No. 23/2026 directly on Varadhi Prep. You can view the complete 11-page Gazette document in a new tab or download it directly to your device for offline reference:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#cde7f7] bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-[#0055a2] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">Official Gazette</span>
                      <span className="text-xs font-bold text-slate-500">11 Pages • 427 KB</span>
                    </div>
                    <h3 className="font-brand font-bold text-slate-950 text-base mt-2">Brief Notification No. 23/2026 PDF</h3>
                    <p className="text-xs text-slate-600 mt-1">Official APPSC notification with complete scheme, zone-wise vacancy roster, syllabus annexures, and CPT pattern.</p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      href="/docs/appsc-endowment-officer-notification-2026-official.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#0055a2] bg-white hover:bg-blue-50 text-[#0055a2] px-3.5 py-2 text-xs sm:text-sm font-bold transition shadow-2xs"
                    >
                      <span>View PDF ↗</span>
                    </a>
                    <a
                      href="/docs/appsc-endowment-officer-notification-2026-official.pdf"
                      download="APPSC-Endowment-Officer-Notification-23-2026-Official.pdf"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0055a2] hover:bg-[#004280] text-white px-3.5 py-2 text-xs sm:text-sm font-bold transition shadow-xs"
                    >
                      <svg className="w-4 h-4 text-white shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>

                <div className="rounded-xl border border-[#cde7f7] bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="rounded bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">Previous Papers</span>
                    <h3 className="font-brand font-bold text-slate-950 text-base mt-2">2023 Previous Question Papers with Keys</h3>
                    <p className="text-xs text-slate-600 mt-1">Paper-I General Studies and Paper-II Hindu Philosophy actual CBRT papers with official keys.</p>
                  </div>
                  <Link
                    href="/mock-tests/andhra-pradesh/appsc-endowment-officer-mock-test"
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[#fb8916] hover:bg-[#e2740a] text-white px-4 py-2 text-xs sm:text-sm font-bold transition shadow-xs"
                  >
                    Solve 2023 Papers as Mock Tests &rarr;
                  </Link>
                </div>
              </div>
            </section>

            {/* Section 13: FAQs */}
            <section id="faqs" className="scroll-mt-6">
              <div className="border-b-2 border-[#0055a2] pb-2 mb-4">
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  13. Frequently Asked Questions (Bilingual FAQs)
                </h2>
              </div>
              <div className="space-y-4">
                {BILINGUAL_FAQS.map((faq, idx) => (
                  <details key={idx} className="group rounded-xl border border-[#cde7f7] bg-white p-5 shadow-xs transition open:border-[#0055a2]/50">
                    <summary className="font-bold text-slate-950 cursor-pointer list-none flex items-center justify-between text-sm sm:text-base">
                      <span>{faq.question}</span>
                      <span className="text-[#0055a2] font-mono text-lg transition-transform group-open:rotate-180">↓</span>
                    </summary>
                    <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
                      <p>{faq.answer}</p>
                      {faq.teluguQuestion && (
                        <div className="bg-[#f4f9fd] p-3 rounded-lg border border-[#cde7f7] text-slate-900 mt-2">
                          <strong lang="te" className="font-telugu text-slate-950 block text-xs sm:text-sm mb-1">{faq.teluguQuestion}</strong>
                          <p lang="te" className="font-telugu text-xs sm:text-sm text-slate-800">{faq.teluguAnswer}</p>
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* Editorial Footer Note */}
            <div className="rounded-xl border border-[#cde7f7] bg-white p-5 sm:p-6 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-xs">
              <strong>Editorial Disclaimer:</strong> This recruitment guide has been compiled by the Varadhi Prep Editorial Desk utilizing official APPSC Brief Notification No. 23/2026, G.O. Ms No. 201 Finance Department, G.O. Ms No. 235 Negative Marking rules, G.O. Ms No. 26 CPT guidelines, and verified data from the official 17 February 2023 question papers. For institutional registration and official submissions, always refer to the official APPSC portal at <a href="https://psc.ap.gov.in" target="_blank" rel="noopener noreferrer" className="text-[#0055a2] underline font-bold">psc.ap.gov.in</a>.
            </div>

          </div>

          {/* Sticky Right Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Free Mock Test Card */}
            <div className="rounded-xl border border-[#cde7f7] bg-gradient-to-br from-[#0055a2] to-[#003b70] p-6 text-white shadow-md">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider inline-block">
                Exclusive Test Series
              </span>
              <h3 className="font-brand text-xl font-bold mt-3 leading-snug">
                APPSC Endowment Officer Free Mock Test Series
              </h3>
              <p className="text-xs text-blue-100 mt-2 leading-relaxed">
                Practice full-length CBRT tests with exact 1/3rd negative marking, 150-minute timers, and complete bilingual Telugu &amp; English solutions.
              </p>
              <div className="mt-4 pt-4 border-t border-white/20 space-y-2 text-xs font-medium text-blue-100">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Paper-I: General Studies &amp; Mental Ability</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Paper-II: Hindu Philosophy &amp; Temple System</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Act 30/1987 Section-wise Quizzes</span>
                </div>
              </div>
              <Link
                href="/mock-tests/andhra-pradesh/appsc-endowment-officer-mock-test"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#fb8916] hover:bg-[#e2740a] text-white py-3 px-4 font-bold text-sm shadow-sm transition"
              >
                <span>Start Free Mock Test Now &rarr;</span>
              </Link>
            </div>

            {/* Official PDF Document Card */}
            <div className="rounded-xl border border-red-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
                <span className="rounded bg-red-600 text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wide">
                  Official PDF
                </span>
                <span className="text-xs font-bold text-slate-500">11 Pages • 427 KB</span>
              </div>
              <h3 className="font-brand font-bold text-slate-950 text-sm leading-snug">
                APPSC EO Grade-III Notification No. 23/2026
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Complete Gazette document with 104 vacancies, RPS pay scale, Paper 1 &amp; 2 syllabus, and CPT scheme.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <a
                  href="/docs/appsc-endowment-officer-notification-2026-official.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#0055a2] bg-white hover:bg-blue-50 text-[#0055a2] py-2 px-3 font-bold text-xs transition shadow-2xs"
                >
                  <span>View PDF ↗</span>
                </a>
                <a
                  href="/docs/appsc-endowment-officer-notification-2026-official.pdf"
                  download="APPSC-Endowment-Officer-Notification-23-2026-Official.pdf"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0055a2] hover:bg-[#004280] text-white py-2 px-3 font-bold text-xs transition shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Download ↓</span>
                </a>
              </div>
            </div>

            {/* Quick Facts Card */}
            <div className="rounded-xl border border-[#cde7f7] bg-white p-5 shadow-xs">
              <h3 className="font-brand text-sm font-extrabold uppercase tracking-wider text-[#0055a2] border-b border-slate-200 pb-2 mb-3">
                Key Notification Facts
              </h3>
              <dl className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 font-medium">Recruiting Agency</dt>
                  <dd className="font-bold text-slate-950">APPSC (Vijayawada)</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 font-medium">Notification Number</dt>
                  <dd className="font-bold text-[#0055a2]">No. 23/2026</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 font-medium">Total Posts</dt>
                  <dd className="font-bold text-slate-950">104 Vacancies</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 font-medium">Scale of Pay</dt>
                  <dd className="font-bold text-slate-950">₹25,220 – ₹80,910</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 font-medium">Exam Type</dt>
                  <dd className="font-bold text-emerald-700">Single-Level CBRT</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 font-medium">Negative Marking</dt>
                  <dd className="font-bold text-red-700">1/3rd (0.33) Marks</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 font-medium">Qualifying CPT</dt>
                  <dd className="font-bold text-slate-950">100 Marks (60 Mins)</dd>
                </div>
              </dl>
            </div>

            {/* External Links Card */}
            <div className="rounded-xl border border-[#cde7f7] bg-white p-5 shadow-xs">
              <h3 className="font-brand text-sm font-extrabold uppercase tracking-wider text-[#0055a2] border-b border-slate-200 pb-2 mb-3">
                Official Links &amp; Portals
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm font-semibold">
                <li>
                  <a href="https://psc.ap.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-slate-800 hover:text-[#0055a2] transition p-2 rounded-lg hover:bg-slate-50">
                    <span>APPSC Commission Website</span>
                    <span>↗</span>
                  </a>
                </li>
                <li>
                  <Link href="/mock-tests/andhra-pradesh" className="flex items-center justify-between text-slate-800 hover:text-[#0055a2] transition p-2 rounded-lg hover:bg-slate-50">
                    <span>AP Competitive Exams Catalog</span>
                    <span>&rarr;</span>
                  </Link>
                </li>
                <li>
                  <Link href="/news/telangana-police-constable-notification-2026" className="flex items-center justify-between text-slate-800 hover:text-[#0055a2] transition p-2 rounded-lg hover:bg-slate-50">
                    <span>TS Police Constable Notification</span>
                    <span>&rarr;</span>
                  </Link>
                </li>
              </ul>
            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}
