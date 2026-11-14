export type VacancyDetail = {
  postCode: string;
  postName: string;
  department: string;
  vacancies: number;
  payScale: string;
  genderEligibility: string;
};

export type QualifyingMarkDetail = {
  category: string;
  pwtPercentage: string;
  pwtMarks: string;
  fwePercentage: string;
  fweMarks: string;
};

export type PhysicalStandardDetail = {
  event: string;
  menStandard: string;
  womenStandard: string;
  nature: string;
};

export type AgeLimitDetail = {
  category: string;
  ageRange: string;
  basis: string;
};

export type ExamPatternInfo = {
  authority: string;
  totalQuestions?: number | null;
  totalMarks?: number | null;
  durationMinutes?: number | null;
  negativeMarking: string;
  medium: string;
  mode: string;
  stages: string[];
  subjects: Array<{
    name: string;
    teluguName: string;
    description: string;
  }>;
  qualifyingMarks?: QualifyingMarkDetail[];
  physicalStandards?: PhysicalStandardDetail[];
};

export type ExamScheduleInfo = {
  authority: string;
  postName: string;
  prelimsExamDate: string;
  prelimsSession: string;
  prelimsDuration: string;
  hallTicketRelease: string;
  officialWebsite: string;
  notificationNumber?: string;
  notificationDate?: string;
  totalVacancies?: number;
  vacancies?: VacancyDetail[];
  ageLimits?: AgeLimitDetail[];
  notificationRelease?: string;
  applicationStart?: string;
  applicationEnd?: string;
  resultDeclaration?: string;
  events: Array<{
    title: string;
    teluguTitle: string;
    date: string;
    status: "Upcoming" | "Active" | "Completed" | "Tentative";
    detail: string;
  }>;
};

export type ExamJobProfileInfo = {
  roleTitle: string;
  department: string;
  payScale: string;
  grossSalaryMonthly: string;
  eligibility: {
    ageLimit: string;
    education: string;
    physicalStandards?: string;
  };
  duties: Array<{
    title: string;
    teluguTitle?: string;
    description: string;
  }>;
  careerGrowth?: string[];
};

export type ExamTeluguSeo = {
  teluguName: string;
  teluguTitle: string;
  bilingualPageTitle: string;
  bilingualDescription: string;
  keywords: string[];
  teluguFaqs: Array<{ question: string; answer: string }>;
  englishFaqs?: Array<{ question: string; answer: string }>;
  pattern?: ExamPatternInfo;
  schedule?: ExamScheduleInfo;
  jobProfile?: ExamJobProfileInfo;
};

const POLICE_CONSTABLE_SEO: ExamTeluguSeo = {
  teluguName: "తెలంగాణ పోలీస్ కానిస్టేబుల్",
  teluguTitle: "తెలంగాణ పోలీస్ కానిస్టేబుల్ 7,112 పోస్టుల నోటిఫికేషన్, సిలబస్, పరీక్ష తేదీ & ఉచిత మాక్ టెస్ట్ 2026 (TSLPRB OMR విధానం)",
  bilingualPageTitle: "Telangana Police / TG Police Constable Free Mock Test 2026, Syllabus & Exam Date | తెలంగాణ పోలీస్ కానిస్టేబుల్ మాక్ టెస్ట్",
  bilingualDescription:
    "TS Police Constable Notification 2026 (Rc No. 189/Rect./Rect.2/2026) for 7,112 vacancies. Official PWT syllabus, OMR pattern, age limit (GO Ms 87), physical standards & free bilingual mock tests in Telugu & English. తెలంగాణ పోలీస్ కానిస్టేబుల్ సిలబస్, పరీక్ష తేదీ & మాక్ టెస్ట్‌లు.",
  keywords: [
    "Telangana constable exam date",
    "Telangana police mock test",
    "Telangana police syllabus",
    "Telangana constable mock test",
    "Telangana police exam mock test",
    "Telangana police exam date",
    "Telangana police constable exam date 2026",
    "tg police exam date",
    "tg police exam syllabus",
    "tg police syllabus 2026",
    "ts police exam syllabus",
    "telangana police exam syllabus",
    "ts police exam date",
    "tslprb police constable exam date",
    "tgprb constable exam date 2026",
    "tgprb pwt exam date",
    "telangana police hall ticket release date",
    "TG Police Constable exam syllabus 2026",
    "TG Police Constable OMR exam pattern",
    "Telangana police constable OMR test",
    "TG police constable OMR sheet practice",
    "TG Police Constable mock test in Telugu",
    "TG Police Constable syllabus 2026",
    "Telangana police constable syllabus in telugu",
    "TGPRB police constable notification mock test",
    "TGPRB police constable syllabus",
    "TG Police Constable notification 2026 exam pattern",
    "TS police constable mock test in telugu free",
    "TGPRB police constable mock test 2026",
    "TSLPRB police constable test series",
    "Telangana police constable preliminary written test mock test",
    "free tg constable mock test online",
    "Telangana police constable grand test",
    "TG Police Constable paper 1 mock test telugu",
    "police constable model papers with solutions in telugu",
    "TG Police Constable online test series",
    "Telangana police constable previous papers online",
    "TS Police Constable Notification 2026 PDF",
    "TSLPRB Constable 7112 Vacancies",
    "Telangana Police Constable Notification 2026",
    "TS Police Constable Syllabus in Telugu PDF",
    "TS Police Constable Exam Pattern 200 Questions",
    "TS Police Constable Age Limit GO Ms 87",
    "TS Police Constable Negative Marking 20%",
    "TS Police Constable Qualifying Marks 2026",
    "TS Police Constable PET PMT Standards",
    "TS Police Constable 1600 meters Run Time",
    "TS Police Constable Pay Scale 24280-72850",
    "TS Police Constable Selection Process PWT PMT PET FWE",
    "TSLPRB Police Constable Free Mock Test 2026",
    "tgprb.in police constable notification download",
    "Telangana police constable qualifying marks PWT FWE",
    "Telangana police constable duties and responsibilities",
    "TG police constable salary and pay scale",
    "Telangana constable job profile",
    "Telangana police constable eligibility criteria age limit",
    "తెలంగాణ పోలీస్ కానిస్టేబుల్ మాక్ టెస్ట్",
    "తెలంగాణ కానిస్టేబుల్ ఆన్‌లైన్ టెస్ట్ 2026",
    "తెలంగాణ పోలీస్ కానిస్టేబుల్ సిలబస్ 2026",
    "తెలంగాణ పోలీస్ ఎగ్జామ్ సిలబస్",
    "తెలంగాణ పోలీస్ కానిస్టేబుల్ పరీక్ష తేదీ 2026",
    "తెలంగాణ పోలీస్ ఎగ్జామ్ డేట్",
    "తెలంగాణ కానిస్టేబుల్ పరీక్ష తేదీ",
    "టీజీ పోలీస్ కానిస్టేబుల్ పరీక్ష తేదీ",
    "టీజీ పోలీస్ సిలబస్",
    "టీజీ పోలీస్ కానిస్టేబుల్ నోటిఫికేషన్ వివరాలు",
    "టీజీ పోలీస్ కానిస్టేబుల్ ప్రాక్టీస్ పేపర్స్",
    "పోలీస్ కానిస్టేబుల్ ప్రిలిమ్స్ మోడల్ పేపర్స్ తెలుగు",
    "తెలంగాణ పోలీస్ ఎగ్జామ్ టెస్ట్ సిరీస్",
    "తెలంగాణ పోలీస్ OMR పరీక్ష విధానం",
    "TG police constable offline OMR mock test",
    "తెలంగాణ పోలీస్ కానిస్టేబుల్ నోటిఫికేషన్ 2026",
    "తెలంగాణ కానిస్టేబుల్ 7112 పోస్టుల వివరాలు",
    "తెలంగాణ కానిస్టేబుల్ సిలబస్ తెలుగులో 200 ప్రశ్నలు",
    "తెలంగాణ పోలీస్ ఈవెంట్స్ 1600 మీటర్లు రన్ టైమింగ్స్",
    "తెలంగాణ పోలీస్ కానిస్టేబుల్ అర్హతలు వయోపరిమితి జీతం",
    "తెలంగాణ పోలీస్ కానిస్టేబుల్ విధులు జీతం",
    "తెలంగాణ కానిస్టేబుల్ జాబ్ ప్రొఫైల్ అర్హతలు",
  ],
  jobProfile: {
    roleTitle: "SCT Police Constable (Civil / AR / SAR CPL / SPF / Fire / Warder)",
    department: "Telangana State Police & Allied Departments (Home Department)",
    payScale: "₹24,280 – ₹72,850",
    grossSalaryMonthly: "₹34,000 – ₹39,000 / month (approx. with DA, HRA & Allowances)",
    eligibility: {
      ageLimit: "18 to 27 Years for General/OC (Prescribed 18–22 + 5 years relaxation under GO Ms No. 87). Up to 32 years for BC/SC/ST/EWS.",
      education: "Must have passed Intermediate (10+2) or equivalent recognized by State Government as on 29th July 2026. Higher qualifications allowed on par. Valid LMV license required for Fire Fighter.",
      physicalStandards: "Men: Height ≥ 167.6 cm (160 cm for Agency ST). Women: Height ≥ 152.5 cm (150 cm for Agency ST). PET: 1600m / 800m run, Long Jump, Shot Put.",
    },
    duties: [
      {
        title: "Law & Order Maintenance & Beat Patrolling",
        teluguTitle: "శాంతిభద్రతల పరిరక్షణ & బీట్ పెట్రోలింగ్",
        description: "Executing regular day and night foot and mobile beats in station jurisdiction, surveillance on anti-social elements, crime prevention, and maintaining public order during festivals, rallies, and elections.",
      },
      {
        title: "Crime Scene Support & Station Sentry Duty",
        teluguTitle: "నేర పరిశోధన సహాయం & స్టేషన్ భద్రత",
        description: "Assisting Station House Officers (SHO) and Sub-Inspectors during crime scene cordoning, evidence preservation, inquest panchanama, and guarding station lockups, records, and armory as station sentry.",
      },
      {
        title: "Emergency Response & Dial 100 / 112 Mobile Patrol",
        teluguTitle: "డయల్ 100 అత్యవసర ప్రతిస్పందన",
        description: "Serving as frontline emergency responders in Blue Colts and Patrol Mobiles, reaching distress locations swiftly upon receiving Dial 100 calls to provide immediate citizen assistance.",
      },
      {
        title: "Court Duty, Summons Delivery & Prisoner Escort",
        teluguTitle: "కోర్టు విధులు, సమన్లు జారీ & ఖైదీల ఎస్కార్ట్",
        description: "Delivering court summons and warrants to witnesses and accused, escorting under-trial prisoners between central prisons and courts, and producing case evidence before judicial magistrates.",
      },
      {
        title: "Traffic Regulation & Road Safety Checkpoints",
        teluguTitle: "ట్రాఫిక్ క్రమబద్ధీకరణ & రహదారి భద్రత",
        description: "Regulating traffic flow at congested intersections, conducting vehicle document and drunk driving checks during nakabandi operations, and assisting victims during road accidents.",
      },
    ],
    careerGrowth: [
      "Police Constable (Entry Level)",
      "Head Constable (Promoted after 5–8 years or via departmental qualifying exam)",
      "Assistant Sub-Inspector (ASI)",
      "Sub-Inspector of Police (SI - Station Incharge)",
      "Circle Inspector of Police (CI)",
    ],
  },
  schedule: {
    authority: "TSLPRB (Telangana State Level Police Recruitment Board)",
    postName: "SCT Police Constable (Civil / AR / SAR CPL), TGSPF Constable, Fire Fighter & Warders",
    notificationNumber: "Rc No. 189 / Rect. / Rect.2 / 2026",
    notificationDate: "29th July 2026",
    totalVacancies: 7112,
    prelimsExamDate: "20 December 2026 (Sunday)",
    prelimsSession: "Forenoon Session (10:00 AM – 1:00 PM)",
    prelimsDuration: "3 Hours (180 Minutes)",
    hallTicketRelease: "7–10 Days Before PWT Exam Date",
    officialWebsite: "https://www.tgprb.in",
    vacancies: [
      {
        postCode: "21",
        postName: "SCT Police Constable (Civil)",
        department: "Telangana Police Department",
        vacancies: 3697,
        payScale: "₹24,280 – ₹72,850",
        genderEligibility: "Men & Women",
      },
      {
        postCode: "22",
        postName: "SCT Police Constable (AR)",
        department: "Telangana Police Department",
        vacancies: 1052,
        payScale: "₹24,280 – ₹72,850",
        genderEligibility: "Men & Women",
      },
      {
        postCode: "23",
        postName: "SCT Police Constable (SAR CPL)",
        department: "Telangana Police Department",
        vacancies: 24,
        payScale: "₹24,280 – ₹72,850",
        genderEligibility: "Men Only",
      },
      {
        postCode: "25",
        postName: "SCT Constable",
        department: "Telangana Special Protection Force (TGSPF)",
        vacancies: 1380,
        payScale: "₹24,280 – ₹72,850",
        genderEligibility: "Men & Women",
      },
      {
        postCode: "26",
        postName: "Fire Fighter",
        department: "Telangana Disaster Response & Fire Services",
        vacancies: 751,
        payScale: "₹24,280 – ₹72,850",
        genderEligibility: "Men & Women (Requires LMV License)",
      },
      {
        postCode: "27",
        postName: "Warder (Male)",
        department: "Telangana Prisons & Correctional Services",
        vacancies: 196,
        payScale: "₹24,280 – ₹72,850",
        genderEligibility: "Men Only",
      },
      {
        postCode: "28",
        postName: "Warder (Female)",
        department: "Telangana Prisons & Correctional Services",
        vacancies: 12,
        payScale: "₹24,280 – ₹72,850",
        genderEligibility: "Women Only",
      },
    ],
    ageLimits: [
      {
        category: "General / Open Competition (OC)",
        ageRange: "18 to 27 Years",
        basis: "Base 18–22 years as on 01-07-2026 + 5 years general relaxation under GO Ms No. 87 dated 18-05-2026",
      },
      {
        category: "BC, SC, ST & EWS Candidates",
        ageRange: "18 to 32 Years",
        basis: "5 years additional statutory reservation relaxation on top of GO Ms No. 87",
      },
      {
        category: "Home Guards (Min. 360 days in 2 years)",
        ageRange: "18 to 45 Years",
        basis: "Base 18–40 years + 5 years general relaxation under GO Ms No. 87",
      },
      {
        category: "Telangana State Govt Employees",
        ageRange: "Up to 5 Years Relaxation",
        basis: "Length of regular service (excluding Corporations/Public Undertakings)",
      },
      {
        category: "Ex-Servicemen & NCC Instructors",
        ageRange: "3 Years + Length of Service",
        basis: "Rendered in Armed Forces / whole-time NCC Cadet Corps Instructors",
      },
      {
        category: "Widows & Divorced Women (Unremarried)",
        ageRange: "Up to 40 Years (45 for SC/ST)",
        basis: "Eligible for Post Codes 21, 22, 25, 26 and 28 under rules",
      },
    ],
    events: [
      {
        title: "Official Notification (Rc No. 189/Rect./Rect.2/2026)",
        teluguTitle: "అధికారిక నోటిఫికేషన్ విడుదల (7,112 ఖాళీలు)",
        date: "29 July 2026",
        status: "Completed",
        detail: "TSLPRB issued notification for 7,112 posts across Police, TGSPF, Fire Services & Prisons.",
      },
      {
        title: "Online Application Registration (www.tgprb.in)",
        teluguTitle: "ఆన్‌లైన్ దరఖాస్తుల నమోదు ప్రక్రియ",
        date: "Completed on Portal",
        status: "Completed",
        detail: "Part-I online registration completed using Mobile Number as User ID.",
      },
      {
        title: "Preliminary Written Test (PWT) Hall Ticket Download",
        teluguTitle: "ప్రిలిమినరీ రాత పరీక్ష హాల్ టికెట్ విడుదల",
        date: "December 2026 (7-10 days prior)",
        status: "Upcoming",
        detail: "Admit cards downloadable online via mobile number and registration login on tgprb.in.",
      },
      {
        title: "Preliminary Written Test (PWT) Exam Date",
        teluguTitle: "ప్రిలిమినరీ రాత పరీక్ష (PWT) నిర్వహణ తేదీ",
        date: "20 December 2026 (Sunday)",
        status: "Upcoming",
        detail: "Offline OMR Written Test, 200 Questions, 200 Marks, 3 Hours, 20% negative marking.",
      },
      {
        title: "Physical Measurement Test (PMT) & Physical Efficiency Test (PET)",
        teluguTitle: "శారీరక కొలతలు & దేహదారుఢ్య పరీక్షలు (PMT / PET)",
        date: "Scheduled post PWT results",
        status: "Upcoming",
        detail: "1600m / 800m run, Long Jump (4m/2.5m), and Shot Put (6m/4m) for PWT qualified candidates.",
      },
      {
        title: "Final Written Examination (FWE)",
        teluguTitle: "తుది రాత పరీక్ష (Final Written Exam)",
        date: "Post-PMT/PET Timeline",
        status: "Upcoming",
        detail: "Final merit ranking examination: 200 Marks for Civil/Fire/Warder, 100 Marks for AR/SPF.",
      },
    ],
  },
  pattern: {
    authority: "TSLPRB (Telangana State Level Police Recruitment Board)",
    totalQuestions: 200,
    totalMarks: 200,
    durationMinutes: 180,
    negativeMarking: "0.20 (20% negative mark per wrong answer)",
    medium: "Bilingual (English & Telugu / Urdu)",
    mode: "OMR Based Written Test (Offline OMR Sheet with Ball Point Pen)",
    stages: [
      "Stage 1: Preliminary Written Test (PWT) - 200 Marks (1 Paper, 3 Hours, Offline OMR)",
      "Stage 2: Physical Measurement Test (PMT) & Physical Efficiency Test (PET)",
      "Stage 3: Final Written Examination (FWE) - 200 Marks (Civil/Fire/Warder) / 100 Marks (AR/SPF)",
    ],
    qualifyingMarks: [
      {
        category: "Open Competition (OC) & EWS",
        pwtPercentage: "30%",
        pwtMarks: "60 Marks / 200",
        fwePercentage: "40%",
        fweMarks: "80 Marks / 200 (Civil/Fire) | 40 Marks / 100 (AR/SPF)",
      },
      {
        category: "Backward Classes (BC)",
        pwtPercentage: "25%",
        pwtMarks: "50 Marks / 200",
        fwePercentage: "35%",
        fweMarks: "70 Marks / 200 (Civil/Fire) | 35 Marks / 100 (AR/SPF)",
      },
      {
        category: "SC / ST / Ex-Servicemen / Home Guards",
        pwtPercentage: "20%",
        pwtMarks: "40 Marks / 200",
        fwePercentage: "30%",
        fweMarks: "60 Marks / 200 (Civil/Fire) | 30 Marks / 100 (AR/SPF)",
      },
    ],
    physicalStandards: [
      {
        event: "Height (General Candidates)",
        menStandard: "Minimum 167.6 cms",
        womenStandard: "Minimum 152.5 cms",
        nature: "Physical Measurement Test (PMT)",
      },
      {
        event: "Height (ST & Aboriginals in Agency Areas)",
        menStandard: "Minimum 160.0 cms",
        womenStandard: "Minimum 150.0 cms",
        nature: "Relaxed PMT Standard (GO Ms No. 24)",
      },
      {
        event: "1600m Run (Men) / 800m Run (Women)",
        menStandard: "Max 7 mins 15 secs (Ex-SM: 9m 30s)",
        womenStandard: "Max 5 mins 20 secs",
        nature: "Qualifying (Civil/Fire/Warder) | Graded up to 100 Marks (AR/SAR/TGSPF)",
      },
      {
        event: "Long Jump",
        menStandard: "Minimum 4.00 meters (Ex-SM: 3.50m)",
        womenStandard: "Minimum 2.50 meters",
        nature: "Qualifying in nature",
      },
      {
        event: "Shot Put",
        menStandard: "Minimum 6.00 meters (Weight: 7.26 Kgs)",
        womenStandard: "Minimum 4.00 meters (Weight: 4.00 Kgs)",
        nature: "Qualifying in nature",
      },
      {
        event: "Medical Eye Sight",
        menStandard: "Distant 6/6, Near 0/5 (Snellen)",
        womenStandard: "Distant 6/6, Near 0/5 (Snellen)",
        nature: "Free from colour blindness & morbid conditions",
      },
    ],
    subjects: [
      {
        name: "English",
        teluguName: "ఇంగ్లీష్ లాంగ్వేజ్ (ఆబ్జెక్టివ్)",
        description: "Comprehension passage, vocabulary, synonyms & antonyms, spotting errors, grammar rules, prepositions, active & passive voice, sentence correction.",
      },
      {
        name: "Arithmetic",
        teluguName: "అర్థమెటిక్ & సంఖ్యా సామర్థ్యం",
        description: "Number systems, LCM & HCF, fractions & decimals, percentages, averages, ratio & proportion, profit & loss, simple & compound interest, time & work, time & distance.",
      },
      {
        name: "General Science",
        teluguName: "జనరల్ సైన్స్",
        description: "Everyday science observations, fundamental physics, chemistry in daily life, human anatomy, diseases & prevention, botany, zoology, environmental science.",
      },
      {
        name: "History of India, Indian Culture & Indian National Movement",
        teluguName: "భారత దేశ చరిత్ర, సంస్కృతి & జాతీయోద్యమం",
        description: "Ancient civilizations, medieval India, Mughal administration, British rule, 1857 Revolt, socio-religious movements, freedom struggle, prominent national leaders.",
      },
      {
        name: "Principles of Geography, Indian Geography, Polity & Economy",
        teluguName: "భౌగోళిక సూత్రాలు, భారత భూగోళం, రాజనీతి & ఆర్థిక వ్యవస్థ",
        description: "Physical geography, Indian physiography, rivers, climate, Constitution of India, fundamental rights & duties, Parliament, Judiciary, planning & Indian economy.",
      },
      {
        name: "Current Events of National & International Importance",
        teluguName: "సమకాలీన అంశాలు (జాతీయ & అంతర్జాతీయ కరెంట్ అఫైర్స్)",
        description: "Recent national & international developments, major summits, sports tournaments, prestigious awards, science & technology breakthroughs, government welfare schemes.",
      },
      {
        name: "Test of Reasoning / Mental Ability",
        teluguName: "రీజనింగ్ & మెంటల్ ఎబిలిటీ",
        description: "Analogy, series completion, coding-decoding, blood relations, direction sense, syllogisms, Venn diagrams, non-verbal patterns, spatial visualization.",
      },
      {
        name: "Contents Pertaining to the State of Telangana",
        teluguName: "తెలంగాణ చరిత్ర, ఉద్యమం, సంస్కృతి & ప్రత్యేకతలు",
        description: "History of Telangana (Satavahanas, Kakatiyas, Qutb Shahis, Asaf Jahis), Telangana armed struggle, 1969 agitation, statehood movement (1948–2014), art, literature, fairs, festivals, geography & state schemes.",
      },
      {
        name: "Personality Test (Ethics & Sensitivity - FWE Stage)",
        teluguName: "వ్యక్తిత్వ పరీక్ష (ఎథిక్స్ & సామాజిక అవగాహన)",
        description: "Ethics, sensitivity to gender and weaker sections, social awareness, emotional intelligence, empathetic public policing demeanor.",
      },
    ],
  },
  englishFaqs: [
    {
      question: "How many total vacancies are announced in the TS Police Constable Notification 2026?",
      answer:
        "The Telangana State Level Police Recruitment Board (TSLPRB) notification (Rc No. 189 / Rect. / Rect.2 / 2026) announces a total of 7,112 vacancies: 3,697 SCT Police Constable (Civil), 1,052 SCT Police Constable (AR), 24 SCT Police Constable (SAR CPL), 1,380 SCT Constable in TGSPF, 751 Fire Fighters, and 208 Warders in Prisons Department.",
    },
    {
      question: "What is the pay scale for Telangana Police Constable posts?",
      answer:
        "As officially notified, the revised pay scale for SCT Police Constable (Civil/AR/SAR CPL), TGSPF Constable, Fire Fighter, and Warders is ₹24,280 – ₹72,850. The gross monthly salary is approximately ₹34,000 to ₹39,000 per month including DA, HRA, and state police allowances.",
    },
    {
      question: "What is the age limit for TS Police Constable 2026? Is there any age relaxation?",
      answer:
        "Candidates must be between 18 to 22 years of age as on 1st July 2026. However, the Government of Telangana vide GO Ms No. 87, GA (Services-A) Dept dated 18-05-2026 has raised the upper age limit by 5 years for direct recruitment to uniformed services. Thus, General/OC candidates can apply up to 27 years. SC, ST, BC, and EWS candidates receive an additional 5-year relaxation up to 32 years. Home Guards can apply up to 45 years.",
    },
    {
      question: "What is the official exam pattern for TS Police Constable Preliminary Written Test (PWT)?",
      answer:
        "The PWT consists of 1 paper with 200 objective multiple-choice questions for 200 marks, with a duration of 3 hours (180 minutes). The exam is conducted offline on an OMR sheet using blue or black ballpoint pen. For each incorrect answer, 20% of full marks (0.20 marks) is deducted as negative marking.",
    },
    {
      question: "What are the minimum qualifying marks in TS Police Constable PWT and FWE?",
      answer:
        "For the Preliminary Written Test (PWT): 30% for OC and EWS (60 marks out of 200); 25% for BC (50 marks); and 20% for SC, ST, Ex-Servicemen, and Home Guards (40 marks). For the Final Written Examination (FWE): 40% for OC/EWS, 35% for BC, and 30% for SC/ST/Ex-Servicemen.",
    },
    {
      question: "What are the physical standards and events for TS Police Constable PMT & PET?",
      answer:
        "Men must meet a minimum height of 167.6 cm (160 cm for Agency ST) and qualify the 1600m Run in 7 mins 15 secs (Ex-SM: 9m 30s), Long Jump of 4.00 meters, and Shot Put (7.26 kg) of 6.00 meters. Women must meet a minimum height of 152.5 cm (150 cm for Agency ST) and qualify the 800m Run in 5 mins 20 secs, Long Jump of 2.50 meters, and Shot Put (4 kg) of 4.00 meters.",
    },
    {
      question: "What is the syllabus for the TS Police Constable Preliminary Written Test (Annexure II)?",
      answer:
        "The PWT syllabus (Intermediate Standard) covers 8 subjects: (1) English, (2) Arithmetic, (3) General Science, (4) History of India & Indian Culture, (5) Principles of Geography, Indian Geography, Polity & Economy, (6) Current Events of National & International Importance, (7) Test of Reasoning / Mental Ability, and (8) Contents pertaining to the State of Telangana.",
    },
    {
      question: "Is there negative marking in the Telangana Police Constable exam?",
      answer:
        "Yes. As per Para 16(A)(3) of the official TSLPRB notification, 20% of full marks (0.20 mark) is deducted as negative mark for each wrong bubble on the OMR answer sheet. Unanswered questions receive zero marks.",
    },
    {
      question: "How can I practice TS Police Constable mock tests for free on Varadhi Prep?",
      answer:
        "Select the Telangana Police Constable exam on Varadhi Prep, choose the Preliminary Written Test (PWT) paper, and practice timed 200-question bilingual mock tests strictly matching the official TSLPRB OMR scheme with instant explanations at zero cost.",
    },
  ],
  teluguFaqs: [
    {
      question: "తెలంగాణ పోలీస్ కానిస్టేబుల్ నోటిఫికేషన్ 2026 లో మొత్తం ఎన్ని ఖాళీలు ఉన్నాయి?",
      answer:
        "తెలంగాణ స్టేట్ లెవల్ పోలీస్ రిక్రూట్‌మెంట్ బోర్డ్ (TSLPRB నోటిఫికేషన్ Rc No. 189/Rect./Rect.2/2026) ప్రకారం మొత్తం 7,112 పోస్టులు భర్తీ చేయబడుతున్నాయి. ఇందులో పోలీస్ కానిస్టేబుల్ సివిల్ 3,697, ఏఆర్ 1,052, ఎస్ఏఆర్ సిపీఎల్ 24, టిజిఎస్పీఎఫ్ కానిస్టేబుల్ 1,380, ఫైర్ ఫైటర్ 751, జైళ్ల శాఖ వార్డర్ పోస్టులు 208 ఉన్నాయి.",
    },
    {
      question: "తెలంగాణ పోలీస్ కానిస్టేబుల్ వేతన స్కేలు (Pay Scale & Salary) ఎంత?",
      answer:
        "అధికారిక నోటిఫికేషన్ ప్రకారం పోలీస్ కానిస్టేబుల్, ఎస్పీఎఫ్, ఫైర్ ఫైటర్ మరియు వార్డర్ పోస్టులన్నింటికీ అధికారిక పే స్కేలు ₹24,280 – ₹72,850. డీఏ, హెచ్ఆర్ఏ మరియు పోలీస్ అలవెన్సులతో కలిపి ప్రారంభ స్థూల వేతనం నెలకు సుమారు ₹34,000 నుండి ₹39,000 వరకు ఉంటుంది.",
    },
    {
      question: "తెలంగాణ కానిస్టేబుల్ వయోపరిమితి ఎంత? జీవో 87 ప్రకారం ఎంత సడలింపు ఉంది?",
      answer:
        "సాధారణ నిబంధనల ప్రకారం 01-07-2026 నాటికి 18 నుండి 22 సంవత్సరాలు ఉండాలి. అయితే తెలంగాణ ప్రభుత్వం జీవో ఎంఎస్ నం. 87 (తేదీ: 18-05-2026) ద్వారా యూనిఫామ్ సర్వీసుల అభ్యర్థులకు గరిష్ట వయోపరిమితిని 5 సంవత్సరాలు పెంచింది. దీనితో జనరల్/ఓసీ అభ్యర్థులు 27 సంవత్సరాల వరకు దరఖాస్తు చేసుకోవచ్చు. బీసీ, ఎస్సీ, ఎస్టీ, ఈడబ్ల్యూఎస్ అభ్యర్థులకు అదనంగా మరో 5 ఏళ్ల సడలింపుతో 32 సంవత్సరాల వరకు అర్హత ఉంటుంది.",
    },
    {
      question: "తెలంగాణ పోలీస్ కానిస్టేబుల్ ప్రిలిమ్స్ (PWT) పరీక్ష విధానం మరియు నెగెటివ్ మార్కింగ్ ఎంత?",
      answer:
        "ప్రిలిమ్స్ రాత పరీక్ష (PWT) ఒకే పేపర్‌గా 200 ఆబ్జెక్టివ్ ప్రశ్నలతో 200 మార్కులకు 3 గంటల (180 నిమిషాలు) వ్యవధిలో ఆఫ్‌లైన్ ఓఎంఆర్ షీట్‌పై నిర్వహించబడుతుంది. ప్రతి తప్పు సమాధానానికి 20% మార్కులు (అంటే 0.20 మార్కు) నెగెటివ్ మార్కింగ్‌గా తీసివేయబడుతుంది.",
    },
    {
      question: "ప్రిలిమ్స్ (PWT) మరియు మెయిన్స్ (FWE) పరీక్షల్లో క్వాలిఫైయింగ్ మార్కులు ఎంత?",
      answer:
        "ప్రిలిమ్స్ రాత పరీక్షలో కనీస అర్హత మార్కులు: ఓసీ & ఈడబ్ల్యూఎస్ అభ్యర్థులకు 30% (60 మార్కులు); బీసీలకు 25% (50 మార్కులు); ఎస్సీ, ఎస్టీ, మాజీ సైనికులు, హోంగార్డులకు 20% (40 మార్కులు). మెయిన్స్ పరీక్షలో ఓసీలకు 40%, బీసీలకు 35%, ఎస్సీ/ఎస్టీలకు 30% మార్కులు సాధించాలి.",
    },
    {
      question: "పోలీస్ ఈవెంట్స్ (PMT & PET) శారీరక కొలతలు మరియు ఈవెంట్స్ ప్రమాణాలు ఏమిటి?",
      answer:
        "పురుష అభ్యర్థుల ఎత్తు కనీసం 167.6 సెం.మీ (ఏజెన్సీ ఎస్టీలకు 160 సెం.మీ). 1600 మీటర్ల పరుగును 7 నిమిషాల 15 సెకన్లలో పూర్తి చేయాలి. లాంగ్ జంప్ 4.00 మీటర్లు, షాట్‌పుట్ (7.26 కేజీలు) 6.00 మీటర్లు వేయాలి. మహిళా అభ్యర్థుల ఎత్తు కనీసం 152.5 సెం.మీ (ఏజెన్సీ ఎస్టీలకు 150 సెం.మీ). 800 మీటర్ల పరుగును 5 నిమిషాల 20 సెకన్లలో, లాంగ్ జంప్ 2.50 మీటర్లు, షాట్‌పుట్ (4 కేజీలు) 4.00 మీటర్లు సాధించాలి.",
    },
    {
      question: "వరధి ప్రెప్‌లో తెలంగాణ పోలీస్ కానిస్టేబుల్ ఉచిత మాక్ టెస్ట్‌లు ఎలా రాయాలి?",
      answer:
        "వరధి ప్రెప్ (Varadhi Prep) వెబ్‌సైట్‌లో తెలంగాణ పోలీస్ కానిస్టేబుల్ పేజీకి వెళ్లి, ప్రిలిమినరీ రాత పరీక్ష (PWT) పేపర్‌ను ఎంచుకుని, అధికారిక 200 ప్రశ్నలు, 3 గంటల టైమర్ మరియు 0.20 నెగెటివ్ మార్కింగ్ గల టెస్ట్‌లను తెలుగు & ఇంగ్లీష్ మాధ్యమాల్లో ఉచితంగా సాధన చేయవచ్చు.",
    },
  ],
};

const TG_TET_SEO: ExamTeluguSeo = {
  teluguName: "తెలంగాణ టెట్ (TG-TET 2026)",
  teluguTitle: "తెలంగాణ టెట్ 2026 ఉచిత ఆన్‌లైన్ మాక్ టెస్ట్ సిరీస్ & సిలబస్",
  bilingualPageTitle: "TG-TET 2026 Free Mock Test & Syllabus | తెలంగాణ టెట్ మాక్ టెస్ట్ తెలుగు",
  bilingualDescription:
    "TG-TET 2026 ఉపాధ్యాయ అర్హత పరీక్ష పేపర్ 1 మరియు పేపర్ 2 కోసం ఉచిత ఆన్‌లైన్ మాక్ టెస్ట్‌లు, పూర్తి సిలబస్, పరీక్ష తేదీలు, ఉపాధ్యాయ విధులు మరియు అర్హతలు.",
  keywords: [
    "టీజీ టెట్ మాక్ టెస్ట్ 2026",
    "తెలంగాణ టెట్ ప్రాక్టీస్ పేపర్స్ తెలుగు",
    "TG TET paper 1 mock test in telugu",
    "TG TET paper 2 model papers telugu",
    "Telangana TET online test series free",
    "TG-TET child development pedagogy questions in telugu",
    "TG TET syllabus 2026 in telugu",
    "తెలంగాణ టెట్ సిలబస్ 2026",
    "TG TET exam date 2026 hall tickets",
    "తెలంగాణ టెట్ పరీక్ష తేదీ",
    "TG TET qualifying marks cut off",
    "SGT School Assistant duties and salary",
    "తెలంగాణ టీచర్ జీతం విధులు DSC weightage",
    "TG TET child development and pedagogy mock test",
    "Telangana teacher eligibility test paper 1 paper 2",
    "TG TET negative marking rules",
  ],
  schedule: {
    authority: "Department of School Education, Government of Telangana",
    postName: "Telangana Teacher Eligibility Test (TG-TET Paper-I & Paper-II)",
    officialWebsite: "https://tgtet2026.cgg.gov.in",
    notificationRelease: "March 2026",
    applicationStart: "March 2026",
    applicationEnd: "April 2026",
    hallTicketRelease: "May 2026 (7 days prior)",
    prelimsExamDate: "May 2026 (CBT Online Multi-session)",
    prelimsSession: "Two Shifts (Paper-1: 9:00 AM – 11:30 AM, Paper-2: 2:00 PM – 4:30 PM)",
    prelimsDuration: "150 Minutes (2.5 Hours per Paper)",
    resultDeclaration: "June 2026",
    events: [
      {
        title: "Official Notification Release",
        teluguTitle: "అధికారిక నోటిఫికేషన్ విడుదల",
        date: "March 2026",
        status: "Upcoming",
        detail: "Release of TG-TET information bulletin and application schedule on CGG portal.",
      },
      {
        title: "Online Application Window",
        teluguTitle: "ఆన్‌లైన్ దరఖాస్తుల స్వీకరణ",
        date: "March – April 2026",
        status: "Upcoming",
        detail: "Submission of online applications and payment of examination fees.",
      },
      {
        title: "Hall Ticket Download Window",
        teluguTitle: "హాల్ టికెట్ డౌన్‌లోడ్",
        date: "May 2026 (7 days prior to exam)",
        status: "Upcoming",
        detail: "Admit cards made available on tgtet2026.cgg.gov.in using Candidate Journal Number.",
      },
      {
        title: "Computer Based Test (CBT) Conduct",
        teluguTitle: "కంప్యూటర్ ఆధారిత పరీక్ష (CBT) నిర్వహణ",
        date: "May 2026 (Multi-day sessions)",
        status: "Upcoming",
        detail: "Objective CBT examination for Paper 1 (Primary) and Paper 2 (Elementary) across designated centers.",
      },
      {
        title: "Provisional Key & Objections",
        teluguTitle: "ప్రాథమిక కీ & అభ్యంతరాల స్వీకరణ",
        date: "May 2026 (Post Examination)",
        status: "Upcoming",
        detail: "Publishing of master question paper and candidate response sheets for objection filing.",
      },
      {
        title: "Final Results & Lifetime Certificate Release",
        teluguTitle: "తుది ఫలితాలు & లైఫ్‌టైమ్ సర్టిఫికేట్ విడుదల",
        date: "June 2026",
        status: "Upcoming",
        detail: "Declaration of official ranks and downloadable digital TET pass certificate with lifetime validity.",
      },
    ],
  },
  pattern: {
    authority: "School Education Department, Government of Telangana",
    totalQuestions: 150,
    totalMarks: 150,
    durationMinutes: 150,
    negativeMarking: "No Negative Marking (0 marks deducted for wrong answers)",
    medium: "Bilingual (Telugu & English)",
    mode: "Computer Based Test (CBT Online Exam)",
    stages: [
      "Paper 1: Primary Stage (Classes I to V) – 150 Questions, 150 Marks (150 Mins)",
      "Paper 2: Upper Primary Stage (Classes VI to VIII) – 150 Questions, 150 Marks (150 Mins)",
      "TET Certificate Validity: Lifetime validity with 20% weightage in TRT/DSC teacher recruitments",
    ],
    subjects: [
      {
        name: "Child Development and Pedagogy",
        teluguName: "శిశు వికాసం మరియు పెడగాజి",
        description: "Development of child, understanding learning processes, individual differences, personality, guidance & counselling, learning theories (Piaget, Kohlberg, Vygotsky), and pedagogical methods.",
      },
      {
        name: "Language I – Telugu",
        teluguName: "భాష I – తెలుగు",
        description: "పఠనావగాహన (గద్యం, పద్యం), తెలంగాణ సాహిత్యం, కవులు-రచయితలు, వ్యాకరణ అంశాలు (సంధులు, సమాసాలు, ఛందస్సు, అలంకారాలు, విభక్తులు) మరియు తెలుగు బోధనా పద్ధతులు (మెథడాలజీ).",
      },
      {
        name: "Language II – English",
        teluguName: "భాష II – ఇంగ్లీష్",
        description: "Reading comprehension, parts of speech, tenses, active/passive voice, direct/indirect speech, degrees of comparison, vocabulary (synonyms, antonyms, idioms), and pedagogy of English language teaching.",
      },
      {
        name: "Mathematics",
        teluguName: "గణితం & బోధనా పద్ధతులు",
        description: "Number system, fractions, arithmetic (percentages, profit & loss, ratio), geometry, mensuration, algebra, statistics, data handling, and mathematics teaching methods.",
      },
      {
        name: "Environmental Studies (Science & Social)",
        teluguName: "పరిసరాల విజ్ఞానం (సైన్స్ & సోషల్)",
        description: "Living world, plants & animals, human body & health, food & nutrition, water & air, Indian & Telangana history, geography, constitution & government, environment protection, and EVS pedagogical methods.",
      },
    ],
  },
  jobProfile: {
    roleTitle: "Government School Teacher (SGT / School Assistant via DSC with TET)",
    department: "Department of School Education, Government of Telangana",
    payScale: "₹31,040 – ₹92,050 (RPS Pay Scale for SGT / SA)",
    grossSalaryMonthly: "₹42,000 – ₹55,000 / month (approx. starting pay including DA & HRA)",
    eligibility: {
      ageLimit: "18 to 44 Years (upper age relaxation of 5 years for BC/SC/ST/EWS and up to 10 years for Physically Handicapped candidates).",
      education: "Paper 1: Intermediate with D.El.Ed / D.Ed with at least 50% marks (45% for reserved). Paper 2: Graduation with B.Ed / B.El.Ed. Qualifying TET is mandatory to appear for DSC teacher recruitment.",
    },
    duties: [
      {
        title: "Classroom Teaching & Concept Delivery",
        teluguTitle: "తరగతి గది బోధన & పాఠ్య ప్రణాళిక",
        description: "Preparing annual, unit, and period lesson plans, utilizing innovative teaching-learning materials (TLM) and digital aids to impart quality education to primary and upper primary students.",
      },
      {
        title: "Continuous and Comprehensive Evaluation (CCE)",
        teluguTitle: "నిరంతర సమగ్ర మూల్యాంకనం (CCE)",
        description: "Conducting regular formative assessments (FA 1-4) and summative assessments (SA 1-2), analyzing learning outcomes, identifying slow learners, and conducting remedial teaching.",
      },
      {
        title: "Mid-day Meal & Student Health Monitoring",
        teluguTitle: "మధ్యాహ్న భోజనం & విద్యార్థుల ఆరోగ్యం పర్యవేక్షణ",
        description: "Supervising mid-day meal cleanliness, nutritional quality, daily student attendance, distributing free textbooks, uniforms, and coordinating with health workers for periodic health checks.",
      },
      {
        title: "School Management Committee (SMC) & Parent Engagement",
        teluguTitle: "SMC సమావేశాలు & తల్లిదండ్రుల సమన్వయం",
        description: "Organizing periodic parent-teacher meetings, reviewing student progress, encouraging girl-child education, curbing dropouts, and mobilizing community support for school infrastructure.",
      },
      {
        title: "Academic Records, UDISE+ & Student Database Maintenance",
        teluguTitle: "స్కూల్ రికార్డులు & డేటాబేస్ నిర్వహణ",
        description: "Maintaining child admission registers, student cumulative records, examination marks ledgers, and updating the government UDISE+ and Child Info portals.",
      },
    ],
    careerGrowth: [
      "Secondary Grade Teacher (SGT)",
      "School Assistant (SA)",
      "High School Headmaster (HM Gr-II)",
      "Mandal Educational Officer (MEO) / Gazetted Headmaster",
      "Deputy Educational Officer (Dy. EO)",
      "District Educational Officer (DEO)",
    ],
  },
  englishFaqs: [
    {
      question: "What is the qualifying marks cutoff for TG-TET 2026?",
      answer:
        "General category candidates must secure at least 60% (90 marks out of 150). BC category candidates need 50% (75 marks out of 150), and SC, ST, and Differently-abled (PH) candidates need 40% (60 marks out of 150) to qualify TG-TET.",
    },
    {
      question: "What is the validity period of the TG-TET certificate?",
      answer:
        "The TG-TET qualifying certificate has lifetime validity. Aspirants can also reappear in future TET exams to improve their marks, as TET score carries a 20% weightage in Telangana Teacher Recruitment Test (DSC).",
    },
    {
      question: "Is there any negative marking in Telangana TET?",
      answer:
        "No, there is no negative marking in the Telangana Teacher Eligibility Test (TG-TET). Each correct answer is awarded 1 mark, and zero marks are deducted for incorrect or unattempted questions.",
    },
    {
      question: "What is the exam structure for TG-TET Paper-1 and Paper-2?",
      answer:
        "Both Paper 1 (for teaching classes I to V) and Paper 2 (for classes VI to VIII) contain 150 objective multiple-choice questions for 150 marks with a duration of 150 minutes (2.5 hours) conducted in Computer Based Test (CBT) online format.",
    },
    {
      question: "What is the salary and role of a teacher recruited after qualifying TG-TET?",
      answer:
        "Teachers recruited through DSC with TG-TET qualification join as Secondary Grade Teachers (SGT) or School Assistants (SA) with an initial gross salary of approximately ₹42,000 to ₹55,000 per month under the Revised Pay Scale (RPS) ₹31,040 – ₹92,050.",
    },
  ],
  teluguFaqs: [
    {
      question: "తెలంగాణ టెట్ (TG-TET 2026) క్వాలిఫైయింగ్ మార్కులు ఎంత?",
      answer:
        "జనరల్ అభ్యర్థులకు 60% (150 కి 90 మార్కులు), బీసీ అభ్యర్థులకు 50% (150 కి 75 మార్కులు), మరియు ఎస్సీ, ఎస్టీ, దివ్యాంగులకు 40% (150 కి 60 మార్కులు) వస్తే అర్హత సాధించినట్లుగా పరిగణిస్తారు.",
    },
    {
      question: "టెట్ సర్టిఫికేట్ కాలపరిమితి (Validity) ఎంతకాలం ఉంటుంది?",
      answer:
        "నేషనల్ కౌన్సిల్ ఫర్ టీచర్ ఎడ్యుకేషన్ (NCTE) నిబంధనల ప్రకారం టెట్ సర్టిఫికేట్ జీవితకాల చెల్లుబాటు (Lifetime Validity) కలిగి ఉంటుంది. డీఎస్సీ ఉపాధ్యాయ నియామకాల్లో టెట్ మార్కులకు 20 శాతం వెయిటేజీ ఉంటుంది.",
    },
    {
      question: "తెలంగాణ టెట్ పరీక్షలో నెగెటివ్ మార్కింగ్ ఉందా?",
      answer:
        "లేదు. తెలంగాణ టెట్ పరీక్షలో ఎలాంటి నెగెటివ్ మార్కింగ్ ఉండదు. ప్రతి సరైన జవాబుకు 1 మార్కు లభిస్తుంది. తప్పు జవాబులకు ఎలాంటి మార్కులు తీసివేయబడవు.",
    },
    {
      question: "టెట్ మాక్ టెస్ట్‌లలో సైకాలజీ మరియు పెడగాజి ప్రశ్నలు ఉన్నాయా?",
      answer:
        "అవును. తాజా సిలబస్ ప్రకారం చైల్డ్ డెవలప్‌మెంట్, పెడగాజి, తెలుగు, ఇంగ్లీష్, గణితం మరియు ఈవీఎస్ అంశాలతో కూడిన ప్రశ్నలు సమగ్ర వివరణలతో వరధి ప్రెప్‌లో లభిస్తాయి.",
    },
    {
      question: "టెట్ అర్హతతో ఉపాధ్యాయునిగా ఎంపికైతే జీతం మరియు విధులు ఎలా ఉంటాయి?",
      answer:
        "టెట్ అర్హత మరియు డీఎస్సీ ద్వారా ఎంపికైన ఎస్జీటీ (SGT) మరియు స్కూల్ అసిస్టెంట్ (SA) ఉపాధ్యాయులకు ప్రారంభ గ్రాస్ జీతం నెలకు సుమారు ₹42,000 నుండి ₹55,000 వరకు ఉంటుంది. వీరు ప్రభుత్వ పాఠశాలల్లో నాణ్యమైన విద్యాబోధన, మూల్యాంకనం మరియు విద్యార్థుల సమగ్ర వికాసానికి బాధ్యత వహిస్తారు.",
    },
  ],
};

export const APPSC_ENDOWMENT_SEO: ExamTeluguSeo = {
  teluguName: "ఎండోమెంట్ ఆఫీసర్ (APPSC Endowment Officer)",
  teluguTitle: "ఆంధ్రప్రదేశ్ ఎండోమెంట్ ఆఫీసర్ ఉచిత మాక్ టెస్ట్‌లు & జాబ్ ప్రొఫైల్",
  bilingualPageTitle: "APPSC Endowment Officer Mock Test | ఎండోమెంట్ ఆఫీసర్ ఆన్‌లైన్ టెస్ట్",
  bilingualDescription:
    "APPSC ఎండోమెంట్ ఆఫీసర్ (గ్రేడ్ 3) పరీక్ష పేపర్ 1 జనరల్ స్టడీస్ మరియు పేపర్ 2 హిందూ ఫిలాసఫీ & దేవాలయ వ్యవస్థ కోసం ఉచిత ఆన్‌లైన్ మాక్ టెస్ట్‌లు, విధులు మరియు జీతం వివరాలు.",
  keywords: [
    "APPSC ఎండోమెంట్ ఆఫీసర్ మాక్ టెస్ట్",
    "APPSC endowment officer mock test in telugu",
    "ఆంధ్రప్రదేశ్ ఎండోమెంట్ ఆఫీసర్ సిలబస్",
    "హిందూ ఫిలాసఫీ మాక్ టెస్ట్ పేపర్స్",
    "AP Endowment officer grade 3 online test series",
    "endowment officer duties and responsibilities in telugu",
    "AP endowment officer salary and pay scale",
    "APPSC EO grade 3 eligibility age limit",
    "ఆంధ్రప్రదేశ్ దేవాదాయ శాఖ ఎగ్జిక్యూటివ్ ఆఫీసర్ విధులు జీతం",
    "దేవాలయాల పరిపాలన హిందూ ఫిలాసఫీ సిలబస్",
  ],
  jobProfile: {
    roleTitle: "Executive Officer Grade-III (దేవాదాయ శాఖ ఎగ్జిక్యూటివ్ ఆఫీసర్)",
    department: "Endowments Department, Government of Andhra Pradesh",
    payScale: "₹25,220 – ₹80,910 (RPS Pay Scale)",
    grossSalaryMonthly: "₹36,000 – ₹42,000 / month (approx. starting pay with DA & HRA)",
    eligibility: {
      ageLimit: "18 to 42 Years (standard age relaxation up to 5 years for BC/SC/ST/EWS candidates).",
      education: "Must possess a Bachelor's Degree from a recognized University. Candidates must profess Hindu religion as mandated under Section 29 of the Endowments Act 30 of 1987.",
    },
    duties: [
      {
        title: "Temple Administration & Agama Ritual Oversight",
        teluguTitle: "ఆలయ పరిపాలన & నిత్యపూజా కైంకర్యాల పర్యవేక్షణ",
        description: "Managing daily administrative functioning of designated Category-III Hindu temples, ensuring strict adherence to Agama shastras and hereditary temple customs during daily nitya pujas, archanas, and special festive utsavams.",
      },
      {
        title: "Hundi Opening, Cash Chest & Accounts Audit",
        teluguTitle: "హుండీ లెక్కింపు, ఆదాయం & ఆడిట్ రికార్డులు",
        description: "Supervising scheduled opening of temple hundis in the presence of official panchas and bank personnel, ensuring secure transit of cash and gold offerings to designated temple bank accounts, and maintaining accounts for statutory government audits.",
      },
      {
        title: "Temple Agricultural Lands & Real Estate Protection",
        teluguTitle: "ఆలయ భూములు, స్థిరాస్తుల రక్షణ & లీజుల వేలం",
        description: "Safeguarding endowments agricultural lands, commercial complexes, and kalyana mandapams from illegal encroachments, maintaining the temple asset register, and conducting transparent public lease auctions.",
      },
      {
        title: "Pilgrim Amenities, Queue Lines & Festival Arrangements",
        teluguTitle: "యాత్రికుల సౌకర్యాలు, దర్శన క్యూలైన్లు & తిరునాళ్ల నిర్వహణ",
        description: "Overseeing drinking water facilities, hygienic sanitation, free prasadam preparation, smooth darshan queue management, and coordination with police and revenue officials during Brahmotsavams and major jatras.",
      },
      {
        title: "Nitya Annadanam Scheme & Donor Relations",
        teluguTitle: "నిత్యాన్నదానం ట్రస్ట్ నిర్వహణ & దాతల సమన్వయం",
        description: "Managing permanent endowment deposits (Sashwatha Annadanam), supervising clean and hygienic food preparation in free feeding halls, issuing official receipts to devotees, and maintaining transparent donor registers.",
      },
    ],
    careerGrowth: [
      "Executive Officer Grade-III",
      "Executive Officer Grade-II",
      "Executive Officer Grade-I",
      "Assistant Commissioner of Endowments",
      "Deputy Commissioner of Endowments",
      "Joint Commissioner of Endowments",
    ],
  },
  englishFaqs: [
    {
      question: "What are the job duties and responsibilities of an APPSC Endowment Officer (Grade-III)?",
      answer:
        "An Executive Officer Grade-III in the Endowments Department manages the administration of Group-III temples, supervises daily Agama pujas, oversees hundi opening and accounting, protects temple properties and lands from encroachment, organizes pilgrim facilities during festivals, and manages the Nitya Annadanam trust.",
    },
    {
      question: "What is the pay scale and monthly salary of an Endowment Officer Grade-III?",
      answer:
        "The pay scale for APPSC Endowment Officer Grade-III is ₹25,220 – ₹80,910. The initial monthly gross salary is approximately ₹36,000 to ₹42,000 including DA, HRA, and applicable state allowances.",
    },
    {
      question: "What is the religious eligibility requirement for the Endowment Officer post?",
      answer:
        "As per Section 29 of the Andhra Pradesh Charitable and Hindu Religious Institutions and Endowments Act 30 of 1987, only candidates professing Hindu religion are eligible for recruitment to executive posts in the Endowments Department.",
    },
    {
      question: "What are the two papers in the APPSC Endowment Officer examination?",
      answer:
        "The examination comprises Paper 1: General Studies & Mental Ability (150 Marks) and Paper 2: Hindu Philosophy and Temple System (150 Marks) covering Ramayana, Mahabharata, Bhagavatam, Vedas, Upanishads, Agamas, and Temple Customs.",
    },
  ],
  teluguFaqs: [
    {
      question: "ఎండోమెంట్ ఆఫీసర్ (గ్రేడ్ 3) విధులు, బాధ్యతలు మరియు జీతం వివరాలు ఏమిటి?",
      answer:
        "దేవాదాయ శాఖ ఎగ్జిక్యూటివ్ ఆఫీసర్ గ్రేడ్-3 ఆలయ పరిపాలన, నిత్యపూజల పర్యవేక్షణ, హుండీ లెక్కింపు, ఆలయ భూముల పరిరక్షణ, భక్తులకు వసతులు మరియు నిత్యాన్నదాన నిర్వహణకు బాధ్యత వహిస్తారు. ప్రారంభ వేతన స్కేల్ ₹25,220 – ₹80,910 తో నెలకు సుమారు ₹36,000 నుండి ₹42,000 వరకు గ్రాస్ జీతం లభిస్తుంది.",
    },
    {
      question: "ఎండోమెంట్ ఆఫీసర్ పేపర్ 2 (హిందూ ఫిలాసఫీ & దేవాలయ వ్యవస్థ) ప్రశ్నలు ఉన్నాయా?",
      answer:
        "అవును, ఎండోమెంట్ పరీక్ష పేపర్ 2 కు సంబంధించిన హిందూ మతం, పురాణాలు మరియు ఆలయ పరిపాలనపై ప్రత్యేక ప్రాక్టీస్ టెస్ట్‌లు మరియు సమాధానాల విశ్లేషణ ఇక్కడ లభిస్తాయి.",
    },
    {
      question: "ఈ పరీక్షకు దరఖాస్తు చేయడానికి ప్రత్యేక అర్హత లేదా మతపరమైన నిబంధన ఉందా?",
      answer:
        "అవును. దేవాదాయ చట్టం (Act 30/1987) సెక్షన్ 29 నిబంధనల ప్రకారం అభ్యర్థులు డిగ్రీ ఉత్తీర్ణతతో పాటు తప్పనిసరిగా హిందూ మతాన్ని అవలంబిస్తూ ఉండాలి.",
    },
  ],
};

export const TG_ENDOWMENT_SEO: ExamTeluguSeo = {
  teluguName: "ఎండోమెంట్ ఆఫీసర్ (Endowment Officer)",
  teluguTitle: "తెలంగాణ ఎండోమెంట్ ఆఫీసర్ ఉచిత మాక్ టెస్ట్‌లు & జాబ్ ప్రొఫైల్",
  bilingualPageTitle: "TGPSC Endowment Officer Mock Test | ఎండోమెంట్ ఆఫీసర్ ఆన్‌లైన్ టెస్ట్",
  bilingualDescription:
    "TGPSC ఎండోమెంట్ ఆఫీసర్ (గ్రేడ్ 3) పరీక్ష పేపర్ 1 జనరల్ స్టడీస్ మరియు పేపర్ 2 హిందూ ఫిలాసఫీ & దేవాలయ వ్యవస్థ కోసం ఉచిత ఆన్‌లైన్ మాక్ టెస్ట్‌లు, విధులు మరియు జీతం వివరాలు.",
  keywords: [
    "ఎండోమెంట్ ఆఫీసర్ మాక్ టెస్ట్",
    "APPSC endowment officer mock test in telugu",
    "TGPSC endowment officer mock test in telugu",
    "హిందూ ఫిలాసఫీ మాక్ టెస్ట్ పేపర్స్",
    "Endowment officer grade 3 online test series",
    "Telangana endowment officer duties and salary",
    "తెలంగాణ దేవాదాయ శాఖ ఎగ్జిక్యూటివ్ ఆఫీసర్ విధులు జీతం",
    "TGPSC EO syllabus and exam dates",
  ],
  jobProfile: {
    roleTitle: "Executive Officer Grade-III (దేవాదాయ శాఖ ఎగ్జిక్యూటివ్ ఆఫీసర్)",
    department: "Endowments Department, Government of Telangana",
    payScale: "₹25,220 – ₹80,910 (RPS Pay Scale)",
    grossSalaryMonthly: "₹36,000 – ₹42,000 / month (approx. starting pay with DA & HRA)",
    eligibility: {
      ageLimit: "18 to 44 Years (standard age relaxation up to 5 years for BC/SC/ST/EWS candidates).",
      education: "Must possess a Bachelor's Degree from a recognized University. Candidates must profess Hindu religion as mandated under statutory rules of the Endowments Department.",
    },
    duties: [
      {
        title: "Temple Administration & Agama Ritual Oversight",
        teluguTitle: "ఆలయ పరిపాలన & నిత్యపూజా కైంకర్యాల పర్యవేక్షణ",
        description: "Managing daily administrative functioning of designated Category-III Hindu temples, ensuring strict adherence to Agama shastras and hereditary temple customs during daily nitya pujas, archanas, and special festive utsavams.",
      },
      {
        title: "Hundi Opening, Cash Chest & Accounts Audit",
        teluguTitle: "హుండీ లెక్కింపు, ఆదాయం & ఆడిట్ రికార్డులు",
        description: "Supervising scheduled opening of temple hundis in the presence of official panchas and bank personnel, ensuring secure transit of cash and gold offerings to designated temple bank accounts, and maintaining accounts for statutory government audits.",
      },
      {
        title: "Temple Agricultural Lands & Real Estate Protection",
        teluguTitle: "ఆలయ భూములు, స్థిరాస్తుల రక్షణ & లీజుల వేలం",
        description: "Safeguarding endowments agricultural lands, commercial complexes, and kalyana mandapams from illegal encroachments, maintaining the temple asset register, and conducting transparent public lease auctions.",
      },
      {
        title: "Pilgrim Amenities, Queue Lines & Festival Arrangements",
        teluguTitle: "యాత్రికుల సౌకర్యాలు, దర్శన క్యూలైన్లు & తిరునాళ్ల నిర్వహణ",
        description: "Overseeing drinking water facilities, hygienic sanitation, free prasadam preparation, smooth darshan queue management, and coordination with police and revenue officials during Brahmotsavams and major jatras.",
      },
      {
        title: "Nitya Annadanam Scheme & Donor Relations",
        teluguTitle: "నిత్యాన్నదానం ట్రస్ట్ నిర్వహణ & దాతల సమన్వయం",
        description: "Managing permanent endowment deposits (Sashwatha Annadanam), supervising clean and hygienic food preparation in free feeding halls, issuing official receipts to devotees, and maintaining transparent donor registers.",
      },
    ],
    careerGrowth: [
      "Executive Officer Grade-III",
      "Executive Officer Grade-II",
      "Executive Officer Grade-I",
      "Assistant Commissioner of Endowments",
      "Deputy Commissioner of Endowments",
      "Joint Commissioner of Endowments",
    ],
  },
  englishFaqs: [
    {
      question: "What are the job duties of a Telangana Endowment Officer Grade-III?",
      answer:
        "An Executive Officer Grade-III oversees temple day-to-day administration, ensures observance of sacred rituals as per temple customs, manages hundi counting, safeguards temple lands, and arranges facilities for devotees during major festivals.",
    },
    {
      question: "What is the monthly salary of an Executive Officer in Telangana Endowments?",
      answer:
        "The pay scale is ₹25,220 – ₹80,910 with a starting monthly gross remuneration of approximately ₹36,000 to ₹42,000 including DA and HRA allowances.",
    },
  ],
  teluguFaqs: [
    {
      question: "ఎండోమెంట్ ఆఫీసర్ పేపర్ 2 (హిందూ ఫిలాసఫీ & దేవాలయ వ్యవస్థ) ప్రశ్నలు ఉన్నాయా?",
      answer:
        "అవును, ఎండోమెంట్ పరీక్ష పేపర్ 2 కు సంబంధించిన హిందూ మతం, పురాణాలు మరియు ఆలయ పరిపాలనపై ప్రత్యేక ప్రాక్టీస్ టెస్ట్‌లు మరియు సమాధానాల విశ్లేషణ ఇక్కడ లభిస్తాయి.",
    },
    {
      question: "తెలంగాణ ఎండోమెంట్ ఆఫీసర్ విధులు మరియు జీతం ఎలా ఉంటాయి?",
      answer:
        "ఎండోమెంట్ ఆఫీసర్ ఆలయ పరిపాలన, ఆస్తుల పరిరక్షణ, హుండీ లెక్కింపు, భక్తుల సౌకర్యాలను పర్యవేక్షిస్తారు. ప్రారంభ జీతం నెలకు దాదాపు ₹36,000 నుండి ₹42,000 వరకు ఉంటుంది.",
    },
  ],
};

export const AEE_SEO: ExamTeluguSeo = {
  teluguName: "అసిస్టెంట్ ఎగ్జిక్యూటివ్ ఇంజనీర్ (AEE)",
  teluguTitle: "TGPSC / APPSC AEE ఉచిత మాక్ టెస్ట్ సిరీస్ & సిలబస్",
  bilingualPageTitle: "TGPSC AEE General Studies Mock Test | ఏఈఈ ఆన్‌లైన్ టెస్ట్ & సిలబస్",
  bilingualDescription:
    "TGPSC / APPSC AEE పేపర్ 1 జనరల్ స్టడీస్ మరియు ఇంజనీరింగ్ సబ్జెక్టుల కోసం ఉచిత ఆన్‌లైన్ మాక్ టెస్ట్‌లు, పరీక్ష సరళి, సిలబస్ మరియు ఏఈఈ జాబ్ విధులు.",
  keywords: [
    "TGPSC AEE mock test in telugu",
    "AEE జనరల్ స్టడీస్ ప్రాక్టీస్ పేపర్స్",
    "Telangana AEE online test series free",
    "AEE syllabus and exam pattern in telugu",
    "తెలంగాణ ఏఈఈ సిలబస్ 2026",
    "AEE salary and job duties telangana",
    "అసిస్టెంట్ ఎగ్జిక్యూటివ్ ఇంజనీర్ విధులు జీతం",
    "APPSC AEE civil mock test free",
    "TGPSC engineering services general studies",
  ],
  pattern: {
    authority: "TGPSC / APPSC (Engineering Services)",
    totalQuestions: 300,
    totalMarks: 450,
    durationMinutes: 300,
    negativeMarking: "0.25 (1/4 mark deducted per wrong answer)",
    medium: "Paper 1 Bilingual (English & Telugu), Paper 2 English",
    mode: "Computer Based Recruitment Test (CBRT) / Offline OMR",
    stages: [
      "Paper 1: General Studies & General Abilities - 150 Questions, 150 Marks (150 Mins)",
      "Paper 2: Engineering Discipline (Civil / Mechanical / Electrical) - 150 Questions, 300 Marks (150 Mins)",
      "Document Verification & Selection",
    ],
    subjects: [
      {
        name: "General Studies & General Abilities",
        teluguName: "జనరల్ స్టడీస్ & రీజనింగ్",
        description: "Current affairs, international relations, general science, environmental issues, Indian and Telangana history, polity, economy, logical reasoning and analytical abilities.",
      },
      {
        name: "Engineering Discipline (Core Technical)",
        teluguName: "కోర్ ఇంజనీరింగ్ సబ్జెక్టులు (సివిల్ / మెక్ / ఈఈఈ)",
        description: "Core technical engineering subjects: Strength of materials, structural analysis, fluid mechanics, hydraulics, surveying, environmental engineering, geotechnical engineering, hydrology and irrigation engineering.",
      },
    ],
  },
  jobProfile: {
    roleTitle: "Assistant Executive Engineer (AEE - Gazetted Engineering Service)",
    department: "Irrigation & CAD, Roads & Buildings (R&B), Panchayat Raj Engineering, and Tribal Welfare",
    payScale: "₹54,220 – ₹1,33,630 (Gazetted Grade)",
    grossSalaryMonthly: "₹75,000 – ₹85,000 / month (approx. starting gross salary with DA, HRA & allowances)",
    eligibility: {
      ageLimit: "18 to 44 Years (with standard relaxation for reserved categories as per state public service rules).",
      education: "Bachelor's Degree in Engineering (B.E. / B.Tech) in Civil, Mechanical, or Electrical from a recognized University or AICTE approved institution.",
    },
    duties: [
      {
        title: "Field Investigation, Site Surveys & Technical Estimates",
        teluguTitle: "ప్రాజెక్ట్ సర్వేలు & సాంకేతిక అంచనాల రూపకల్పన",
        description: "Conducting technical field surveys for canals, barrages, lift irrigation schemes, bridges, and highways, preparing Detailed Project Reports (DPR), and formulating engineering work estimates.",
      },
      {
        title: "Construction Quality Assurance & On-Site Supervision",
        teluguTitle: "నిర్మాణ నాణ్యత పర్యవేక్షణ & నిబంధనల అమలు",
        description: "Supervising ongoing government construction works, enforcing compliance with Indian Standard (IS) codes, conducting soil and concrete compressive tests, and verifying reinforcement placement.",
      },
      {
        title: "Measurement Book (M-Book) Recording & Contractor Billing",
        teluguTitle: "M-Book కొలతలు నమోదు & బిల్లింగ్ పరిశీలన",
        description: "Taking precise on-site physical measurements of completed work items, recording entries in official Measurement Books (M-Book), and processing running account bills for contractors.",
      },
      {
        title: "Irrigation Structure Maintenance & Monsoon Flood Operations",
        teluguTitle: "సాగునీటి కాల్వల నిర్వహణ & వరద నియంత్రణ విధులు",
        description: "Inspecting barrage crest gates, canal de-silting, reservoir inflow-outflow regulation, ensuring ayacut water supply to farmers, and managing emergency flood control duties during monsoons.",
      },
      {
        title: "Public Infrastructure Scrutiny & Safety Inspections",
        teluguTitle: "ప్రజా మౌలిక సదుపాయాల తనిఖీ & భద్రతా పరిశీలన",
        description: "Carrying out periodic structural safety audits of public roads, government school and hospital buildings, checking culvert safety, and attending technical review meetings.",
      },
    ],
    careerGrowth: [
      "Assistant Executive Engineer (AEE)",
      "Deputy Executive Engineer (Dy. EE)",
      "Executive Engineer (EE)",
      "Superintending Engineer (SE)",
      "Chief Engineer (CE) / Engineer-in-Chief (ENC)",
    ],
  },
  englishFaqs: [
    {
      question: "What is the exam pattern for TGPSC / APPSC AEE recruitment?",
      answer:
        "The AEE examination consists of two papers totaling 450 marks: Paper 1 General Studies & Mental Ability (150 questions, 150 marks, 150 minutes) and Paper 2 Core Engineering Discipline (150 questions, 300 marks, 150 minutes with 2 marks per question). There is a negative marking of 0.25 marks per wrong answer.",
    },
    {
      question: "What is the job role and starting salary of an Assistant Executive Engineer (AEE)?",
      answer:
        "An AEE is a Gazetted engineering officer in state government departments (Irrigation, R&B, Panchayat Raj) responsible for project survey, construction quality control, and contractor M-Book billing. The starting pay scale is ₹54,220 – ₹1,33,630 with an approximate monthly gross salary of ₹75,000 to ₹85,000 including DA and HRA.",
    },
  ],
  teluguFaqs: [
    {
      question: "AEE పేపర్ 1 జనరల్ స్టడీస్ మాక్ టెస్ట్‌లు తెలుగులో ప్రాక్టీస్ చేయవచ్చా?",
      answer:
        "అవును, TGPSC/APPSC AEE పేపర్ 1 కు సంబంధించిన జనరల్ స్టడీస్ మరియు మెంటల్ ఎబిలిటీ ప్రశ్నలు తెలుగు మరియు ఇంగ్లీష్ మాధ్యమంలో పూర్తి వివరణలతో ప్రాక్టీస్ చేయవచ్చు.",
    },
    {
      question: "అసిస్టెంట్ ఎగ్జిక్యూటివ్ ఇంజనీర్ (AEE) విధులు మరియు జీతం వివరాలు ఏమిటి?",
      answer:
        "ఏఈఈ గెజిటెడ్ అధికారి హోదాలో ఇరిగేషన్, రోడ్లు & భవనాలు, పంచాయతీ రాజ్ ఇంజనీరింగ్ శాఖలలో ప్రాజెక్ట్ సర్వేలు, పనుల నాణ్యత పర్యవేక్షణ, మరియు ఎం-బుక్ రికార్డింగ్ నిర్వహిస్తారు. ప్రారంభ వేతన స్కేల్ ₹54,220 – ₹1,33,630 తో నెలకు దాదాపు ₹75,000 నుండి ₹85,000 వరకు గ్రాస్ జీతం లభిస్తుంది.",
    },
  ],
};

const TELUGU_EXAMS: Record<string, ExamTeluguSeo> = {
  "police-constable": POLICE_CONSTABLE_SEO,
  "police-constable-free-mock-test": POLICE_CONSTABLE_SEO,
  "tg-police-constable-mock-test": POLICE_CONSTABLE_SEO,
  "telangana-police-mock-test": POLICE_CONSTABLE_SEO,
  "telangana-police-exam": POLICE_CONSTABLE_SEO,
  "police-exam": POLICE_CONSTABLE_SEO,
  "police-constable-mock-tests": POLICE_CONSTABLE_SEO,
  "tg-tet": TG_TET_SEO,
  "tg-tet-2026": TG_TET_SEO,
  "appsc-endowment-officer-mock-test": APPSC_ENDOWMENT_SEO,
  "endowment-officer": TG_ENDOWMENT_SEO,
  aee: AEE_SEO,
};

export function getExamTeluguMetadata(
  examSlug: string,
  examName: string,
  stateSlug: string,
): ExamTeluguSeo | null {
  const normalizedSlug = examSlug.toLowerCase().trim();
  const normalizedName = examName.toLowerCase().trim();

  // 1. Direct match in dictionary
  if (TELUGU_EXAMS[normalizedSlug]) {
    return TELUGU_EXAMS[normalizedSlug];
  }

  // 2. Fuzzy match for Police Constable
  if (
    normalizedSlug.includes("police") ||
    normalizedSlug.includes("constable") ||
    normalizedName.includes("police") ||
    normalizedName.includes("constable")
  ) {
    return POLICE_CONSTABLE_SEO;
  }

  // 3. Fuzzy match for TG TET
  if (normalizedSlug.includes("tet") || normalizedName.includes("tet")) {
    return TELUGU_EXAMS["tg-tet-2026"] || TELUGU_EXAMS["tg-tet"];
  }

  // 4. Fuzzy match for Endowment Officer
  if (normalizedSlug.includes("endowment") || normalizedName.includes("endowment")) {
    const isAp = stateSlug === "ap" || stateSlug === "andhra-pradesh" || normalizedSlug.includes("appsc");
    return isAp ? TELUGU_EXAMS["appsc-endowment-officer-mock-test"] : TELUGU_EXAMS["endowment-officer"];
  }

  // 5. Fuzzy match for AEE
  if (normalizedSlug.includes("aee") || normalizedName.includes("aee")) {
    return TELUGU_EXAMS["aee"];
  }

  // If exam is in Telangana or Andhra Pradesh, generate dynamic Telugu search metadata
  const isTeluguState =
    stateSlug === "tg" ||
    stateSlug === "ap" ||
    stateSlug === "telangana" ||
    stateSlug === "andhra-pradesh";
  if (!isTeluguState) return null;

  const statePrefix =
    stateSlug === "ap" || stateSlug === "andhra-pradesh" ? "ఆంధ్రప్రదేశ్" : "తెలంగాణ";
  const stateCode = stateSlug === "ap" || stateSlug === "andhra-pradesh" ? "AP" : "TG";

  return {
    teluguName: `${statePrefix} ${examName}`,
    teluguTitle: `${statePrefix} ${examName} ఉచిత ఆన్‌లైన్ మాక్ టెస్ట్ సిరీస్`,
    bilingualPageTitle: `${stateCode} ${examName} Free Mock Test | ${statePrefix} ${examName} ప్రాక్టీస్ టెస్ట్`,
    bilingualDescription: `Practise ${stateCode} ${examName} free online mock tests in Telugu & English. ${statePrefix} ${examName} పరీక్షల కోసం ఉచిత ఆన్‌లైన్ ప్రాక్టీస్ టెస్ట్‌లు, పూర్తి సమాధానాలు మరియు వివరణలతో.`,
    keywords: [
      `${statePrefix} ${examName} మాక్ టెస్ట్`,
      `${statePrefix} ${examName} సిలబస్`,
      `${stateCode} ${examName} mock test in Telugu`,
      `${stateCode} ${examName} exam syllabus`,
      `${examName} syllabus & exam pattern`,
      `${examName} online test series free`,
      `${statePrefix} పోటీ పరీక్షల మాక్ టెస్ట్‌లు`,
    ],
    teluguFaqs: [
      {
        question: `ఈ ${examName} మాక్ టెస్ట్‌లు తెలుగులో అందుబాటులో ఉన్నాయా?`,
        answer: `అవును, వరధి ప్రెప్ (Varadhi Prep) లోని అన్ని టెస్ట్‌లు తెలుగు మరియు ఇంగ్లీష్ (Bilingual) మాధ్యమంలో ప్రశ్నలు మరియు పూర్తి వివరణలతో సాధన చేయవచ్చు.`,
      },
      {
        question: `టెస్ట్ రాసిన తర్వాత మార్కులు మరియు సమాధానాల విశ్లేషణ చూడవచ్చా?`,
        answer: `అవును. టెస్ట్ సబ్మిట్ చేసిన వెంటనే మీ స్కోర్, సమయం, మరియు ప్రతి ప్రశ్నకు సరైన సమాధానం మరియు వివరణ స్టూడెంట్ డ్యాష్‌బోర్డ్‌లో లభిస్తాయి.`,
      },
    ],
  };
}
