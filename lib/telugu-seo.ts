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
  ageLimits?: AgeLimitDetail[];
};

const POLICE_CONSTABLE_SEO: ExamTeluguSeo = {
  teluguName: "తెలంగాణ పోలీస్ కానిస్టేబుల్",
  teluguTitle: "తెలంగాణ పోలీస్ కానిస్టేబుల్ ఉచిత మాక్ టెస్ట్",
  bilingualPageTitle: "Telangana Police / TG Police Constable Free Mock Test 2026 | తెలంగాణ పోలీస్ కానిస్టేబుల్ మాక్ టెస్ట్",
  bilingualDescription:
    "Telangana Police Constable free bilingual mock tests in Telugu and English. తెలంగాణ పోలీస్ కానిస్టేబుల్ ఉచిత మాక్ టెస్ట్‌లు.",
  keywords: [
    "police constable mock test",
    "police test online",
    "Telangana police mock test",
    "Telangana constable mock test",
    "Telangana police exam mock test",
    "tg police mock test",
    "ts police exam mock test",
    "telangana police free mock test",
    "telangana police syllabus",
    "tg police syllabus",
    "TG Police Constable mock test in Telugu",
    "TG Police Constable mock test",
    "TS police constable mock test in telugu free",
    "Telangana police constable preliminary written test mock test",
    "free tg constable mock test online",
    "Telangana police constable grand test",
    "TG Police Constable paper 1 mock test telugu",
    "police constable model papers with solutions in telugu",
    "TG Police Constable online test series",
    "Telangana police constable previous papers online",
    "తెలంగాణ పోలీస్ కానిస్టేబుల్ మాక్ టెస్ట్",
    "తెలంగాణ పోలీస్ సిలబస్",
    "తెలంగాణ కానిస్టేబుల్ ఆన్‌లైన్ టెస్ట్",
    "టీజీ పోలీస్ కానిస్టేబుల్ ప్రాక్టీస్ పేపర్స్",
    "పోలీస్ కానిస్టేబుల్ ప్రిలిమ్స్ మోడల్ పేపర్స్ తెలుగు",
    "తెలంగాణ పోలీస్ ఎగ్జామ్ టెస్ట్ సిరీస్",
  ],
  teluguFaqs: [
    {
      question: "వరధి ప్రెప్‌లో తెలంగాణ పోలీస్ కానిస్టేబుల్ ఉచిత మాక్ టెస్ట్‌లు ఎలా రాయాలి?",
      answer:
        "వరధి ప్రెప్ (Varadhi Prep) వెబ్‌సైట్‌లో తెలంగాణ పోలీస్ కానిస్టేబుల్ పేజీకి వెళ్లి, ప్రిలిమినరీ రాత పరీక్ష (PWT) పేపర్‌ను ఎంచుకుని, ఆన్‌లైన్ మాక్ టెస్ట్‌లను తెలుగు & ఇంగ్లీష్ మాధ్యమాల్లో ఉచితంగా ప్రాక్టీస్ చేయవచ్చు.",
    },
    {
      question: "మాక్ టెస్ట్ రాసిన తర్వాత సమాధానాలు మరియు వివరణలు చూసుకోవచ్చా?",
      answer:
        "అవును. టెస్ట్ సబ్మిట్ చేసిన వెంటనే మీ స్కోరు, సరైన సమాధానాలు మరియు తెలుగు & ఇంగ్లీష్ వివరణలను మీ డ్యాష్‌బోర్డులో సమీక్షించుకోవచ్చు.",
    },
  ],
  englishFaqs: [
    {
      question: "Where can I take Telangana Police Constable mock tests for free?",
      answer:
        "Select the Telangana Police Constable exam on Varadhi Prep, choose the Preliminary Written Test (PWT) paper, and practice timed bilingual mock tests with instant explanations at zero cost.",
    },
    {
      question: "Can I review my answers after submitting a test?",
      answer:
        "Yes. After submitting any test, you can instantly review your detailed score, correct answers, and bilingual step-by-step explanations.",
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
    "వరధి ప్రెప్ టెట్ మాక్ టెస్ట్",
    "TG TET model papers in telugu",
    "తెలంగాణ టెట్ ఆన్‌లైన్ టెస్ట్",
  ],
  teluguFaqs: [
    {
      question: "వరధి ప్రెప్‌లో తెలంగాణ టెట్ (TG-TET) ఉచిత మాక్ టెస్ట్‌లు ఎలా రాయాలి?",
      answer:
        "వరధి ప్రెప్ (Varadhi Prep) వెబ్‌సైట్‌లో తెలంగాణ టెట్ పేజీకి వెళ్లి, పేపర్ 1 లేదా పేపర్ 2 ఎంచుకుని, ఆన్‌లైన్ మాక్ టెస్ట్‌లను తెలుగు మరియు ఇంగ్లీష్ మాధ్యమాల్లో ఉచితంగా సాధన చేయవచ్చు.",
    },
    {
      question: "మాక్ టెస్ట్ రాసిన తర్వాత సమాధానాలు మరియు వివరణలు చూసుకోవచ్చా?",
      answer:
        "అవును. టెస్ట్ సబ్మిట్ చేసిన వెంటనే మీ స్కోరు, సరైన సమాధానాలు మరియు సమగ్ర వివరణలను మీ డ్యాష్‌బోర్డులో సమీక్షించుకోవచ్చు.",
    },
    {
      question: "టెట్ మాక్ టెస్ట్‌లలో సైకాలజీ మరియు పెడగాజి ప్రశ్నలు ఉన్నాయా?",
      answer:
        "అవును. నూతన సిలబస్ ప్రకారం చైల్డ్ డెవలప్‌మెంట్ & పెడగాజి, తెలుగు, ఇంగ్లీష్, గణితం మరియు పరిసరాల విజ్ఞానం (EVS) అంశాలతో కూడిన ప్రశ్నలు సమగ్ర వివరణలతో వరధి ప్రెప్‌లో లభిస్తాయి.",
    },
  ],
  englishFaqs: [
    {
      question: "Where can I take TG-TET mock tests for free?",
      answer:
        "Select the TG-TET exam on Varadhi Prep, choose Paper 1 or Paper 2, and practice timed bilingual mock tests with detailed solutions at zero cost.",
    },
    {
      question: "Can I review my answers after submitting a TG-TET mock test?",
      answer:
        "Yes. After submitting any test, you can instantly review your detailed score breakdown, correct answers, and bilingual step-by-step explanations on your dashboard.",
    },
    {
      question: "Are questions available in both Telugu and English?",
      answer:
        "Yes, all mock tests on Varadhi Prep are provided bilingually with questions, options, and explanations in both Telugu and English.",
    },
  ],
};

export const APPSC_ENDOWMENT_SEO: ExamTeluguSeo = {
  teluguName: "ఎండోమెంట్ ఆఫీసర్ (APPSC Endowment Officer)",
  teluguTitle: "ఆంధ్రప్రదేశ్ ఎండోమెంట్ ఆఫీసర్ ఉచిత మాక్ టెస్ట్‌లు",
  bilingualPageTitle: "APPSC Endowment Officer Free Mock Test | ఎండోమెంట్ ఆఫీసర్ ఆన్‌లైన్ టెస్ట్",
  bilingualDescription:
    "Free APPSC Endowment Officer (Grade 3) mock tests in Telugu & English. Practice Paper 1 GS & Paper 2 Hindu Philosophy. ఎండోమెంట్ ఆఫీసర్ ఆన్‌లైన్ మాక్ టెస్ట్‌లు.",
  keywords: [
    "APPSC Endowment Officer mock test",
    "APPSC Endowment Officer free mock test",
    "APPSC EO Grade 3 mock test 2026",
    "APPSC Endowment Officer online test series",
    "APPSC EO Paper 1 mock test General Studies",
    "APPSC EO Paper 2 mock test Hindu Philosophy",
    "APPSC Executive Officer Grade 3 mock test in Telugu",
    "APPSC Endowment Officer previous papers with answers",
    "APPSC EO syllabus and exam pattern in Telugu",
    "APPSC EO model papers in Telugu",
    "APPSC endowment officer mock test in telugu",
    "Andhra Pradesh endowment officer mock test",
    "AP endowment officer grade 3 online test series",
    "AP endowment officer duties and salary",
    "APPSC EO grade 3 eligibility and qualifications",
    "Hindu philosophy and temple system mock test",
    "Hindu philosophy practice questions Telugu",
    "AP Endowments Act 1987 questions and answers",
    "ఎండోమెంట్ ఆఫీసర్ మాక్ టెస్ట్",
    "ఆంధ్రప్రదేశ్ ఎండోమెంట్ ఆఫీసర్ ఆన్‌లైన్ టెస్ట్",
    "APPSC ఎండోమెంట్ ఆఫీసర్ ఉచిత మాక్ టెస్ట్",
    "హిందూ ఫిలాసఫీ మరియు దేవాలయ వ్యవస్థ మాక్ టెస్ట్",
    "ఆంధ్రప్రదేశ్ దేవాదాయ శాఖ ఎగ్జిక్యూటివ్ ఆఫీసర్ పరీక్ష",
    "ఎండోమెంట్ ఆఫీసర్ పేపర్ 2 మోడల్ పేపర్స్",
    "వరధి ప్రెప్ ఎండోమెంట్ ఆఫీసర్ మాక్ టెస్ట్",
  ],
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
