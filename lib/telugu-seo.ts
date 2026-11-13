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
};

export type ExamScheduleInfo = {
  authority: string;
  postName: string;
  prelimsExamDate: string;
  prelimsSession: string;
  prelimsDuration: string;
  hallTicketRelease: string;
  officialWebsite: string;
  events: Array<{
    title: string;
    teluguTitle: string;
    date: string;
    status: "Upcoming" | "Active" | "Completed" | "Tentative";
    detail: string;
  }>;
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
};

const POLICE_CONSTABLE_SEO: ExamTeluguSeo = {
  teluguName: "తెలంగాణ పోలీస్ కానిస్టేబుల్",
  teluguTitle: "తెలంగాణ పోలీస్ కానిస్టేబుల్ ఉచిత మాక్ టెస్ట్, సిలబస్ & పరీక్ష తేదీ 2026 (TGPRB OMR విధానం)",
  bilingualPageTitle: "Telangana Police / TG Police Constable Free Mock Test 2026, Syllabus & Exam Date | తెలంగాణ పోలీస్ కానిస్టేబుల్ మాక్ టెస్ట్",
  bilingualDescription:
    "TG Police Constable exam syllabus 2026, PWT exam date (20 Dec 2026), OMR pattern & free mock tests in Telugu & English. తెలంగాణ పోలీస్ కానిస్టేబుల్ సిలబస్, పరీక్ష తేదీ & మాక్ టెస్ట్‌లు.",
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
  ],
  schedule: {
    authority: "TGPRB (Telangana State Level Police Recruitment Board)",
    postName: "SCT Police Constable (Civil / AR / TSRTC / TSSP)",
    prelimsExamDate: "20 December 2026 (Sunday)",
    prelimsSession: "Forenoon Session (10:00 AM – 1:00 PM)",
    prelimsDuration: "3 Hours (180 Minutes)",
    hallTicketRelease: "7–10 Days Before PWT Exam Date",
    officialWebsite: "https://www.tgprb.in",
    events: [
      {
        title: "Official Notification & Online Applications",
        teluguTitle: "అధికారిక నోటిఫికేషన్ & దరఖాస్తుల ప్రక్రియ",
        date: "Released by TGPRB",
        status: "Completed",
        detail: "Online registration completed on the official tgprb.in portal.",
      },
      {
        title: "Preliminary Written Test (PWT) Hall Ticket Download",
        teluguTitle: "ప్రిలిమినరీ రాత పరీక్ష హాల్ టికెట్ విడుదల",
        date: "December 2026 (7-10 days prior)",
        status: "Upcoming",
        detail: "Admit cards downloadable online via mobile number and registration login.",
      },
      {
        title: "Preliminary Written Test (PWT) Exam Date",
        teluguTitle: "ప్రిలిమినరీ రాత పరీక్ష (PWT) నిర్వహణ తేదీ",
        date: "20 December 2026 (Sunday)",
        status: "Upcoming",
        detail: "Offline OMR Based Written Test, 200 Questions, 200 Marks, 0.25 Negative Marking.",
      },
      {
        title: "Physical Measurement Test (PMT) & Physical Efficiency Test (PET)",
        teluguTitle: "శారీరక కొలతలు & దేహదారుఢ్య పరీక్షలు (PMT / PET)",
        date: "Scheduled post PWT results",
        status: "Upcoming",
        detail: "1600m / 800m running, long jump, and shot put for qualified candidates.",
      },
      {
        title: "Final Written Examination (FWE)",
        teluguTitle: "తుది రాత పరీక్ష (Final Written Exam)",
        date: "Post-PMT/PET Timeline",
        status: "Upcoming",
        detail: "Final merit ranking and selection examination stage.",
      },
    ],
  },
  pattern: {
    authority: "TGPRB (Telangana State Level Police Recruitment Board)",
    totalQuestions: 200,
    totalMarks: 200,
    durationMinutes: 180,
    negativeMarking: "0.25 (1/4 mark deducted per wrong answer)",
    medium: "Bilingual (Telugu & English)",
    mode: "OMR Based Written Test (Offline OMR Sheet)",
    stages: [
      "Stage 1: Preliminary Written Test (PWT) - 200 Marks (Offline OMR Sheet)",
      "Stage 2: Physical Measurement Test (PMT) & Physical Efficiency Test (PET)",
      "Stage 3: Final Written Examination (FWE) - Offline OMR Sheet",
    ],
    subjects: [
      {
        name: "Arithmetic & Quantitative Aptitude",
        teluguName: "అర్థమెటిక్ & సంఖ్యా సామర్థ్యం",
        description: "Number systems, percentages, averages, ratio & proportion, profit & loss, time & work, simple & compound interest, data interpretation.",
      },
      {
        name: "Test of Reasoning & Mental Ability",
        teluguName: "రీజనింగ్ & మెంటల్ ఎబిలిటీ",
        description: "Analogy, series completion, coding-decoding, blood relations, direction sense, syllogisms, puzzle tests, non-verbal reasoning.",
      },
      {
        name: "General Science",
        teluguName: "జనరల్ సైన్స్",
        description: "Everyday science observation, basic concepts of physics, chemistry, biology, scientific inventions, environmental studies.",
      },
      {
        name: "History of India & Indian Culture",
        teluguName: "భారత దేశ చరిత్ర & సంస్కృతి",
        description: "Ancient, medieval, and modern Indian history, socio-cultural movements, freedom struggle, prominent national leaders.",
      },
      {
        name: "Telangana History, Movement & State Formation",
        teluguName: "తెలంగాణ చరిత్ర, ఉద్యమం & రాష్ట్ర ఆవిర్భావం",
        description: "Satavahanas, Kakatiyas, Asaf Jahis, Telangana Armed Struggle, 1969 agitation, Telangana statehood movement & cultural heritage.",
      },
      {
        name: "Indian Geography, Polity & Economy",
        teluguName: "భారత భూగోళశాస్త్రం, రాజనీతి & ఆర్థిక వ్యవస్థ",
        description: "Physical geography of India & Telangana, Indian Constitution, political system, fundamental rights, economic planning & development.",
      },
      {
        name: "Current Events of National & International Importance",
        teluguName: "సమకాలీన అంశాలు (కరెంట్ అఫైర్స్)",
        description: "Recent national & global developments, awards, sports, appointments, science & tech milestones, state welfare schemes.",
      },
    ],
  },
  englishFaqs: [
    {
      question: "What is the Telangana Police Constable exam date for 2026?",
      answer:
        "The Telangana State Level Police Recruitment Board (TGPRB / TSLPRB) Preliminary Written Test (PWT) for SCT Police Constable (Civil and equivalent) is scheduled for 20 December 2026 (Sunday) in the forenoon session (10:00 AM – 1:00 PM). Candidates should practice full-length 200-question timed mock tests on Varadhi Prep to prepare for the offline OMR sheet format.",
    },
    {
      question: "When will the Telangana Police Constable hall ticket 2026 be released?",
      answer:
        "The TGPRB Police Constable Preliminary Written Test admit card / hall ticket will be made available for download on the official website (tgprb.in / tslprb.in) approximately 7 to 10 days before the exam date. Registered candidates can log in with their phone number and password to print their hall ticket.",
    },
    {
      question: "What is the official syllabus for Telangana Police Constable Preliminary Written Test (PWT)?",
      answer:
        "The official PWT syllabus comprises 200 objective multiple-choice questions for 200 marks (3 hours duration) across: (1) Arithmetic and Test of Reasoning / Mental Ability (approx. 100 questions); and (2) General Studies (approx. 100 questions) including General Science, Indian History, Telangana Movement and State Formation, Indian Geography, Polity, Economy, and Current Affairs. Negative marking of 0.25 is deducted for each incorrect answer.",
    },
    {
      question: "Is the official Telangana Police Constable exam conducted online (CBT) or offline (OMR)?",
      answer:
        "The official Telangana Police Constable Preliminary Written Test (PWT) and Final Written Examination (FWE) conducted by TGPRB (TSLPRB) are offline OMR-based written tests where candidates bubble answers on an OMR answer sheet. Varadhi Prep provides online mock tests strictly modeled after the official 200-question, 3-hour, 0.25-negative-marking OMR pattern to build speed, accuracy, and exam discipline.",
    },
    {
      question: "How can I practice Telangana Police Constable mock tests for free on Varadhi Prep?",
      answer:
        "Select the Telangana Police Constable exam on Varadhi Prep, choose the Preliminary Written Test (PWT) paper, and click on any published mock test to start practicing immediately with full timer and instant bilingual explanations without any payment.",
    },
    {
      question: "What is the exam pattern for Telangana Police Constable Preliminary Written Test (PWT)?",
      answer:
        "The PWT consists of 200 objective multiple-choice questions for 200 marks with a duration of 3 hours (180 minutes) on an offline OMR sheet. There is a negative marking of 0.25 marks for every incorrect answer.",
    },
    {
      question: "Are the mock test questions available in both Telugu and English?",
      answer:
        "Yes, every mock test on Varadhi Prep features full bilingual support. You can toggle between Telugu and English question views and review detailed explanations in both languages.",
    },
    {
      question: "Is there negative marking in the Telangana Police Constable mock tests?",
      answer:
        "Yes, all Varadhi Prep Telangana Police Constable mock tests accurately simulate the official TGPRB/TSLPRB rule of 0.25 negative marks per incorrect attempt, ensuring realistic score estimation.",
    },
    {
      question: "What subjects are covered in the Telangana Police Constable mock test series?",
      answer:
        "The test series covers Arithmetic, Test of Reasoning, General Science, History of India, Telangana History & Movement, Indian Geography, Polity, Economy, and Current Affairs as per the official TGPRB syllabus.",
    },
    {
      question: "Are these mock tests updated according to the latest TG Police Constable notification and syllabus?",
      answer:
        "Yes, all mock tests on Varadhi Prep are strictly mapped to the latest TGPRB notification syllabus, including 200 objective questions, 3-hour duration, and official 0.25 negative marking rules.",
    },
  ],
  teluguFaqs: [
    {
      question: "తెలంగాణ పోలీస్ కానిస్టేబుల్ పరీక్ష తేదీ (Exam Date 2026) ఎప్పుడు?",
      answer:
        "తెలంగాణ స్టేట్ లెవల్ పోలీస్ రిక్రూట్‌మెంట్ బోర్డ్ (TGPRB/TSLPRB) కానిస్టేబుల్ ప్రిలిమినరీ రాత పరీక్ష (PWT) 20 డిసెంబర్ 2026 (ఆదివారం) ఉదయం సెషన్‌లో నిర్వహించబడుతుంది. అభ్యర్థులు అధికారిక ఓఎంఆర్ విధానం ప్రకారం 200 ప్రశ్నలు, 3 గంటల సమయం మరియు 0.25 నెగెటివ్ మార్కింగ్ గల పూర్తి మాక్ టెస్ట్‌లను వరధి ప్రెప్‌లో ఉచితంగా సాధన చేయవచ్చు.",
    },
    {
      question: "తెలంగాణ పోలీస్ కానిస్టేబుల్ హాల్ టికెట్లు ఎప్పుడు విడుదలవుతాయి?",
      answer:
        "అధికారిక TGPRB నిబంధనల ప్రకారం పరీక్ష తేదీకి సుమారు 7 నుండి 10 రోజుల ముందు అధికారిక పోర్టల్ (tgprb.in) లో పోలీస్ కానిస్టేబుల్ హాల్ టికెట్లు అందుబాటులో ఉంచబడతాయి. అభ్యర్థులు తమ మొబైల్ నంబర్ మరియు పాస్‌వర్డ్ ద్వారా లాగిన్ అయి అడ్మిట్ కార్డును డౌన్‌లోడ్ చేసుకోవచ్చు.",
    },
    {
      question: "తెలంగాణ పోలీస్ కానిస్టేబుల్ ప్రిలిమ్స్ సిలబస్ మరియు మార్కుల కేటాయింపు ఏమిటి?",
      answer:
        "ప్రిలిమ్స్ (PWT) పరీక్ష మొత్తం 200 మార్కులకు (200 ప్రశ్నలు) 3 గంటల వ్యవధిలో జరుగుతుంది. ఇందులో అర్థమెటిక్ & రీజనింగ్ (దాదాపు 100 ప్రశ్నలు), జనరల్ సైన్స్, భారత దేశ చరిత్ర, తెలంగాణ ఉద్యమం & రాష్ట్ర ఆవిర్భావం, భూగోళశాస్త్రం, రాజ్యాంగం, ఆర్థిక వ్యవస్థ మరియు కరెంట్ అఫైర్స్ (దాదాపు 100 ప్రశ్నలు) ఉంటాయి. ప్రతి తప్పు సమాధానానికి 0.25 నెగెటివ్ మార్కు ఉంటుంది.",
    },
    {
      question: "తెలంగాణ పోలీస్ కానిస్టేబుల్ పరీక్ష విధానం ఏమిటి? ఇది ఆన్‌లైన్ (CBT) పరీక్షా లేక OMR పరీక్షా?",
      answer:
        "తెలంగాణ స్టేట్ లెవల్ పోలీస్ రిక్రూట్‌మెంట్ బోర్డ్ (TGPRB/TSLPRB) నిర్వహించే కానిస్టేబుల్ ప్రిలిమ్స్ (PWT) మరియు మెయిన్స్ (FWE) పరీక్షలు ఆఫ్‌లైన్ OMR షీట్ ఆధారిత రాత పరీక్షలు (Offline OMR Based Exam). అభ్యర్థులు ఓఎంఆర్ షీట్‌పై సరైన సమాధానాలను బబ్లింగ్ చేయాల్సి ఉంటుంది. వరధి ప్రెప్ (Varadhi Prep) ఈ పరీక్ష సిలబస్, 200 ప్రశ్నలు, 3 గంటల సమయం మరియు 0.25 నెగెటివ్ మార్కింగ్ నిబంధనలకు అనుగుణంగా ఆన్‌లైన్ ప్రాక్టీస్ టెస్టులను ఉచితంగా అందిస్తుంది.",
    },
    {
      question: "ఈ పోలీస్ కానిస్టేబుల్ మాక్ టెస్ట్‌లు తెలుగు మాధ్యమంలో అందుబాటులో ఉన్నాయా?",
      answer:
        "అవును, వరధి ప్రెప్ (Varadhi Prep) లోని అన్ని పోలీస్ కానిస్టేబుల్ మాక్ టెస్ట్‌లు తెలుగు మరియు ఇంగ్లీష్ (Bilingual) మాధ్యమంలో ప్రశ్నలు మరియు పూర్తి వివరణాత్మక సమాధానాలతో లభిస్తాయి.",
    },
    {
      question: "తెలంగాణ పోలీస్ కానిస్టేబుల్ సిలబస్ మరియు నోటిఫికేషన్ వివరాలు ఏమిటి?",
      answer:
        "TGPRB తాజా నిబంధనల ప్రకారం ప్రిలిమినరీ పరీక్ష (PWT) లో 200 ప్రశ్నలు, 200 మార్కులు ఉంటాయి. సమయం 3 గంటలు. ఇందులో అర్థమెటిక్, రీజనింగ్, జనరల్ సైన్స్, భారత దేశ చరిత్ర, తెలంగాణ ఉద్యమం & చరిత్ర, భూగోళశాస్త్రం, రాజ్యాంగం మరియు కరెంట్ అఫైర్స్ సిలబస్‌గా ఉంటాయి.",
    },
    {
      question: "తెలంగాణ పోలీస్ కానిస్టేబుల్ ప్రిలిమ్స్ (PWT) లో నెగెటివ్ మార్కింగ్ విధానం ఉందా?",
      answer:
        "అవును. అధికారిక TGPRB నిబంధనల ప్రకారం ప్రతి తప్పు సమాధానానికి 0.25 (1/4 వంతు) నెగెటివ్ మార్కు తీసివేయబడుతుంది. మా టెస్ట్‌లలో కూడా ఈ నెగెటివ్ మార్కింగ్ అమలు చేయబడుతుంది.",
    },
    {
      question: "పోలీస్ కానిస్టేబుల్ పేపర్ 1 లో ఏయే సబ్జెక్టులు ఉంటాయి?",
      answer:
        "పేపర్ 1 లో అర్థమెటిక్, రీజనింగ్, జనరల్ సైన్స్, భారత దేశ చరిత్ర, తెలంగాణ చరిత్ర & ఉద్యమం, భారత రాజ్యాంగం మరియు కరెంట్ అఫైర్స్ సబ్జెక్టులు ఉంటాయి. ప్రతి సబ్జెక్ట్‌కు ప్రత్యేక ప్రాక్టీస్ టెస్ట్‌లు కూడా అందుబాటులో ఉన్నాయి.",
    },
    {
      question: "టెస్ట్ రాసిన వెంటనే మార్కులు మరియు వివరణలు తెలుసుకోవచ్చా?",
      answer:
        "అవును. టెస్ట్ సబ్మిట్ చేసిన వెంటనే మీ మొత్తం స్కోర్, సమయం, సబ్జెక్ట్ వారీగా సాధించిన మార్కులు మరియు ప్రతి ప్రశ్నకు స్పష్టమైన వివరణలు మీ స్టూడెంట్ డ్యాష్‌బోర్డ్‌లో చూడవచ్చు.",
    },
    {
      question: "వరధి ప్రెప్‌లో పోలీస్ కానిస్టేబుల్ మాక్ టెస్ట్‌లు ఉచితంగా రాయవచ్చా?",
      answer:
        "అవును! వరధి ప్రెప్‌లో పోలీస్ కానిస్టేబుల్ ప్రాక్టీస్ టెస్ట్‌లు మరియు మునుపటి పేపర్ల ఆధారిత మోడల్ టెస్ట్‌లు అభ్యర్థులందరికీ ఉచితంగా అందుబాటులో ఉన్నాయి.",
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
  "tg-tet": {
    teluguName: "తెలంగాణ టెట్ (TG-TET 2026)",
    teluguTitle: "తెలంగాణ టెట్ 2026 ఉచిత ఆన్‌లైన్ మాక్ టెస్ట్ సిరీస్",
    bilingualPageTitle: "TG-TET 2026 Free Mock Test Papers | తెలంగాణ టెట్ మాక్ టెస్ట్ తెలుగు",
    bilingualDescription:
      "TG-TET 2026 ఉపాధ్యాయ అర్హత పరీక్ష పేపర్ 1 మరియు పేపర్ 2 కోసం ఉచిత ఆన్‌లైన్ మాక్ టెస్ట్‌లు. Practise TG TET mock tests in Telugu and English with detailed answers.",
    keywords: [
      "టీజీ టెట్ మాక్ టెస్ట్ 2026",
      "తెలంగాణ టెట్ ప్రాక్టీస్ పేపర్స్ తెలుగు",
      "TG TET paper 1 mock test in telugu",
      "TG TET paper 2 model papers telugu",
      "Telangana TET online test series free",
      "TG-TET child development pedagogy questions in telugu",
    ],
    teluguFaqs: [
      {
        question: "టీజీ టెట్ (TG-TET 2026) పేపర్ 1 & 2 మాక్ టెస్ట్‌లు ఉచితంగా ప్రాక్టీస్ చేయవచ్చా?",
        answer:
          "అవును, వరధి ప్రెప్‌లో TG-TET పరీక్షకు సంబంధించిన పేపర్ 1 మరియు పేపర్ 2 పూర్తి సిలబస్ ప్రకారం ఉచిత మాక్ టెస్ట్‌లు అందుబాటులో ఉన్నాయి.",
      },
      {
        question: "టెట్ మాక్ టెస్ట్‌లలో సైకాలజీ మరియు పెడగాజి ప్రశ్నలు ఉన్నాయా?",
        answer:
          "అవును. తాజా సిలబస్ ప్రకారం చైల్డ్ డెవలప్‌మెంట్, పెడగాజి, తెలుగు, ఇంగ్లీష్, గణితం మరియు ఈవీఎస్ అంశాలతో కూడిన ప్రశ్నలు సమగ్ర వివరణలతో ఉన్నాయి.",
      },
    ],
  },
  "tg-tet-2026": {
    teluguName: "తెలంగాణ టెట్ (TG-TET 2026)",
    teluguTitle: "తెలంగాణ టెట్ 2026 ఉచిత ఆన్‌లైన్ మాక్ టెస్ట్ సిరీస్",
    bilingualPageTitle: "TG-TET 2026 Free Mock Test Papers | తెలంగాణ టెట్ మాక్ టెస్ట్ తెలుగు",
    bilingualDescription:
      "TG-TET 2026 ఉపాధ్యాయ అర్హత పరీక్ష పేపర్ 1 మరియు పేపర్ 2 కోసం ఉచిత ఆన్‌లైన్ మాక్ టెస్ట్‌లు. Practise TG TET mock tests in Telugu and English with detailed answers.",
    keywords: [
      "టీజీ టెట్ మాక్ టెస్ట్ 2026",
      "తెలంగాణ టెట్ ప్రాక్టీస్ పేపర్స్ తెలుగు",
      "TG TET paper 1 mock test in telugu",
      "TG TET paper 2 model papers telugu",
      "Telangana TET online test series free",
    ],
    teluguFaqs: [
      {
        question: "టీజీ టెట్ (TG-TET 2026) పేపర్ 1 & 2 మాక్ టెస్ట్‌లు ఉచితంగా ప్రాక్టీస్ చేయవచ్చా?",
        answer:
          "అవును, వరధి ప్రెప్‌లో TG-TET పరీక్షకు సంబంధించిన పేపర్ 1 మరియు పేపర్ 2 పూర్తి సిలబస్ ప్రకారం ఉచిత మాక్ టెస్ట్‌లు అందుబాటులో ఉన్నాయి.",
      },
    ],
  },
  "endowment-officer": {
    teluguName: "ఎండోమెంట్ ఆఫీసర్ (Endowment Officer)",
    teluguTitle: "తెలంగాణ ఎండోమెంట్ ఆఫీసర్ ఉచిత మాక్ టెస్ట్‌లు",
    bilingualPageTitle: "TGPSC Endowment Officer Mock Test | ఎండోమెంట్ ఆఫీసర్ ఆన్‌లైన్ టెస్ట్",
    bilingualDescription:
      "TGPSC ఎండోమెంట్ ఆఫీసర్ (గ్రేడ్ 3) పరీక్ష పేపర్ 1 జనరల్ స్టడీస్ మరియు పేపర్ 2 హిందూ ఫిలాసఫీ & దేవాలయ వ్యవస్థ కోసం ఉచిత ఆన్‌లైన్ మాక్ టెస్ట్‌లు.",
    keywords: [
      "ఎండోమెంట్ ఆఫీసర్ మాక్ టెస్ట్",
      "APPSC endowment officer mock test in telugu",
      "TGPSC endowment officer mock test in telugu",
      "హిందూ ఫిలాసఫీ మాక్ టెస్ట్ పేపర్స్",
      "Endowment officer grade 3 online test series",
    ],
    pattern: {
      authority: "APPSC / TGPSC Endowments Commission",
      totalQuestions: null,
      totalMarks: 300,
      durationMinutes: 300,
      negativeMarking: "0.33 (1/3rd penalty per wrong answer)",
      medium: "Bilingual (Telugu & English)",
      mode: "CBT / OMR Sheet",
      stages: [
        "Stage 1: Written Examination (Paper 1: GS + Paper 2: Hindu Philosophy)",
        "Stage 2: Certificate & Document Verification",
        "Stage 3: Final Selection & Appointment",
      ],
      subjects: [
        {
          name: "General Studies & Mental Ability",
          teluguName: "జనరల్ స్టడీస్ & మెంటల్ ఎబిలిటీ (పేపర్ 1)",
          description:
            "National & AP Current Events, General Science, History of India & AP, Geography, Indian Polity, Economy, and Logical Reasoning.",
        },
        {
          name: "Hindu Philosophy & Temple System",
          teluguName: "హిందూ ఫిలాసఫీ & దేవాలయ వ్యవస్థ (పేపర్ 2)",
          description:
            "Ramayana, Mahabharata, Bhagavatam, Hindu Puranams, Temple Architecture, Agamas, Festivals, and AP Endowments Act 1987.",
        },
      ],
    },
    teluguFaqs: [
      {
        question: "ఎండోమెంట్ ఆఫీసర్ పేపర్ 2 (హిందూ ఫిలాసఫీ & దేవాలయ వ్యవస్థ) ప్రశ్నలు ఉన్నాయా?",
        answer:
          "అవును, ఎండోమెంట్ పరీక్ష పేపర్ 2 కు సంబంధించిన హిందూ మతం, పురాణాలు మరియు ఆలయ పరిపాలనపై ప్రత్యేక ప్రాక్టీస్ టెస్ట్‌లు మరియు సమాధానాల విశ్లేషణ ఇక్కడ లభిస్తాయి.",
      },
    ],
  },
  aee: {
    teluguName: "అసిస్టెంట్ ఎగ్జిక్యూటివ్ ఇంజనీర్ (AEE)",
    teluguTitle: "TGPSC AEE ఉచిత మాక్ టెస్ట్ సిరీస్",
    bilingualPageTitle: "TGPSC AEE General Studies Mock Test | ఏఈఈ ఆన్‌లైన్ టెస్ట్",
    bilingualDescription:
      "TGPSC AEE పేపర్ 1 జనరల్ స్టడీస్ మరియు మెంటల్ ఎబిలిటీ పరీక్ష కోసం ఉచిత ఆన్‌లైన్ మాక్ టెస్ట్‌లు తెలుగు మరియు ఇంగ్లీష్‌లో.",
    keywords: [
      "TGPSC AEE mock test in telugu",
      "AEE జనరల్ స్టడీస్ ప్రాక్టీస్ పేపర్స్",
      "Telangana AEE online test series free",
    ],
    teluguFaqs: [
      {
        question: "AEE పేపర్ 1 జనరల్ స్టడీస్ మాక్ టెస్ట్‌లు తెలుగులో ప్రాక్టీస్ చేయవచ్చా?",
        answer:
          "అవును, TGPSC AEE పేపర్ 1 కు సంబంధించిన జనరల్ స్టడీస్ మరియు మెంటల్ ఎబిలిటీ ప్రశ్నలు తెలుగు మరియు ఇంగ్లీష్ మాధ్యమంలో పూర్తి వివరణలతో ప్రాక్టీస్ చేయవచ్చు.",
      },
    ],
  },
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
    return TELUGU_EXAMS["endowment-officer"];
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
