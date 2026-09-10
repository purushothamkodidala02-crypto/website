import { absoluteUrl } from "@/lib/site";

export type ExamGuideFeature = {
  title: string;
  description: string;
  icon: "test" | "pyp" | "analytics" | "bilingual" | "timer" | "review";
};

export type ExamPatternRow = {
  subject: string;
  prelimsQuestions: string;
  mainsQuestions: string;
  weightage: string;
  syllabusHighlights: string;
};

export type ExamGuideFaq = {
  question: string;
  answer: string;
};

export type ExamGuide = {
  slug: string;
  h1Title: string;
  seoTitle: string;
  seoDescription: string;
  heroBadge: string;
  heroSubtext: string;
  socialProof: {
    studentCount: string;
    rating: string;
    verifiedBadge: string;
    avgTime: string;
    languages: string;
  };
  featuresHeading: string;
  features: ExamGuideFeature[];
  patternHeading: string;
  patternSummary: {
    prelimsTotal: string;
    mainsTotal: string;
    markingScheme: string;
    mode: string;
  };
  patternRows: ExamPatternRow[];
  pypHeading: string;
  pypDescription: string;
  pypHighlights: Array<{ year: string; title: string; takeaway: string }>;
  tipsHeading: string;
  prelimsMainsDiffHeading: string;
  tips: Array<{ title: string; detail: string }>;
  faqs: ExamGuideFaq[];
};

export const EXAM_GUIDES: Record<string, ExamGuide> = {
  "police-constable": {
    slug: "police-constable",
    h1Title: "Telangana Police Constable Mock Test Series 2026",
    seoTitle: "Telangana Police Constable Mock Test Series 2026 | Free",
    seoDescription:
      "Practice the latest Telangana Police Constable Mock Test 2026 for free. Get bilingual questions, detailed solutions, and instant performance analytics. Start now!",
    heroBadge: "1,000+ Students Practicing · Verified TGPRB 2026 Pattern",
    heroSubtext:
      "Prepare for Telangana State Police Constable (Civil, AR, SAR CPL, TSSP, Constable Drivers, Mechanics) with full-length bilingual mock tests, official Previous Year Papers (PYPs), subject practice, and instant rank analytics.",
    socialProof: {
      studentCount: "1,000+ Active Aspirants",
      rating: "4.9 / 5.0 Rating",
      verifiedBadge: "100% TGPRB Syllabus Aligned",
      avgTime: "160 Mins Avg Completion",
      languages: "Bilingual (English + తెలుగు)",
    },
    featuresHeading: "What is Included in our Telangana Police Constable Mock Test Series?",
    features: [
      {
        title: "Full-Length Prelims & Mains Mocks",
        description:
          "200-question timed tests simulating the real 3-hour TGPRB exam hall environment with automatic countdown and pause/resume.",
        icon: "test",
      },
      {
        title: "Previous Year Papers (2022–2025)",
        description:
          "Official Telangana Police Constable previous exam questions categorized with detailed answer keys and step-by-step explanations.",
        icon: "pyp",
      },
      {
        title: "Instant Performance Analytics & Rank Predictor",
        description:
          "Get immediate scorecards, negative-mark impact, subject-wise accuracy breakdowns, and simulated state rank predictions.",
        icon: "analytics",
      },
      {
        title: "Bilingual English & Telugu Format",
        description:
          "Read questions side-by-side or in either language seamlessly, matching the official bilingual TGPRB question booklet.",
        icon: "bilingual",
      },
    ],
    patternHeading: "Understanding the Exam Pattern",
    patternSummary: {
      prelimsTotal: "200 Questions · 200 Marks · 3 Hours (Qualifying)",
      mainsTotal: "200 Questions · 200 Marks · 3 Hours (Merit Selection)",
      markingScheme: "1 Mark for Correct Answer (Objective Multiple Choice)",
      mode: "Offline OMR / Computer-Based Test Simulation",
    },
    patternRows: [
      {
        subject: "Arithmetic & Mental Ability / Reasoning",
        prelimsQuestions: "50–60 Qs",
        mainsQuestions: "50–60 Qs",
        weightage: "High Weightage",
        syllabusHighlights:
          "Number Systems, Simplification, Percentages, Ratio & Proportion, Time & Work, Speed & Distance, Coding-Decoding, Blood Relations, Series, Venn Diagrams.",
      },
      {
        subject: "History of India & Telangana Movement / Culture",
        prelimsQuestions: "40–50 Qs",
        mainsQuestions: "40–50 Qs",
        weightage: "High Weightage",
        syllabusHighlights:
          "Indian National Movement, Ancient & Medieval India, Hyderabad State, 1969 Agitation, Telangana State Formation Movement, Art, Literature & Festivals.",
      },
      {
        subject: "General Science & Environment",
        prelimsQuestions: "25–30 Qs",
        mainsQuestions: "25–30 Qs",
        weightage: "Medium Weightage",
        syllabusHighlights:
          "Everyday Science, Physics, Chemistry, Biology, Environmental Ecology, Scientific Inventions and Applications.",
      },
      {
        subject: "Indian Geography, Polity & Economy",
        prelimsQuestions: "30–35 Qs",
        mainsQuestions: "30–35 Qs",
        weightage: "Medium Weightage",
        syllabusHighlights:
          "Physical Geography of India & Telangana, Constitution of India, Fundamental Rights, Panchayati Raj, Telangana Government Welfare Schemes & Economy.",
      },
      {
        subject: "Current Affairs & English Language",
        prelimsQuestions: "25–30 Qs",
        mainsQuestions: "25–30 Qs",
        weightage: "Medium Weightage",
        syllabusHighlights:
          "National & International Events, Awards, Sports, Vocabulary, Grammar, Reading Comprehension, Synonyms & Antonyms.",
      },
    ],
    pypHeading: "Telangana Police Constable Previous Year Papers",
    pypDescription:
      "Solving Previous Year Papers (PYPs) is the single most reliable method to understand question depth, recurring patterns, and high-frequency topics tested by the Telangana State Level Police Recruitment Board (TGPRB).",
    pypHighlights: [
      {
        year: "2024–2025 Pattern",
        title: "Analytical & Statement-Based Reasoning",
        takeaway:
          "Recent exams feature multi-statement reasoning, assertion-reason, and application-based Telangana history questions rather than direct one-liners.",
      },
      {
        year: "2022 Official Paper",
        title: "Arithmetic Speed & Mental Toughness",
        takeaway:
          "Focus on time-saving shortcuts in Arithmetic, percentages, and data interpretation to finish all 200 questions within the 180-minute limit.",
      },
      {
        year: "Archived Papers",
        title: "Telangana Movement & Statehood Milestones",
        takeaway:
          "Guaranteed 25+ questions specifically centered on key phases of the Telangana struggle, committee reports, and historic agreements.",
      },
    ],
    tipsHeading: "Tips to Ace the Telangana Police Constable Exam",
    prelimsMainsDiffHeading: "Prelims vs. Mains: Understanding the Differences",
    tips: [
      {
        title: "Master Arithmetic & Reasoning First",
        detail:
          "Math and mental ability provide 50–60 non-ambiguous marks. Practise 30 calculations daily to build raw speed without relying on calculators.",
      },
      {
        title: "Dedicated Focus on Telangana Movement",
        detail:
          "Telangana culture, history, and statehood struggle carry significant weightage. Revise chronological events, treaties, and socio-cultural movements.",
      },
      {
        title: "Timed Full-Length Mock Testing",
        detail:
          "Answering 200 questions in 180 minutes leaves under 54 seconds per question. Regular timed mock tests train your pace, question selection, and stamina.",
      },
      {
        title: "Learn From Mistake Analysis",
        detail:
          "Every Varadhi Prep attempt records incorrect answers into your personal Mistake Book so you can revisit weak topics before the actual exam day.",
      },
    ],
    faqs: [
      {
        question: "How to prepare for TG Police Constable?",
        answer:
          "Start by mastering the official TGPRB syllabus across Arithmetic, Reasoning, General Studies, and Telangana Movement. Follow a three-step routine: complete foundational subject revision, practice Previous Year Papers to recognize question trends, and take full-length timed mock tests on Varadhi Prep to build 3-hour exam endurance.",
      },
      {
        question: "What is the exam pattern for Telangana Police Constable Prelims and Mains?",
        answer:
          "Both the Preliminary Written Test (PWT) and Final Written Examination (FWE) consist of 200 objective multiple-choice questions for 200 marks with a duration of 3 hours (180 minutes). The Prelims is qualifying in nature, whereas your score in the Mains exam determines your final selection merit.",
      },
      {
        question: "Is there negative marking in the Telangana Police Constable exam?",
        answer:
          "Official TGPRB notifications specify the exact marking scheme for each recruitment cycle. In standard patterns, correct answers receive 1 mark. Any applicable negative marking rule is mirrored precisely in Varadhi Prep mock tests so you practice under authentic exam conditions.",
      },
      {
        question: "Can I attempt mock tests in Telugu and English?",
        answer:
          "Yes! All Telangana Police Constable mock tests on Varadhi Prep are bilingual in Telugu and English. You can view questions and answers side-by-side or switch languages at any moment during the test.",
      },
      {
        question: "How do Previous Year Papers help in cracking the Police Constable exam?",
        answer:
          "Previous Year Papers reveal exact question difficulty, recurring themes (especially in Telangana Movement and Indian Polity), and help you gauge your pace. Practicing PYPs on Varadhi Prep gives you instant scorecards and detailed explanatory solutions for every question.",
      },
      {
        question: "Does Varadhi Prep provide instant performance analytics and rank prediction?",
        answer:
          "Yes. Immediately after submitting a mock test, you receive your total score, accuracy percentage, time spent per question, topic-wise strength and weakness analysis, and simulated rank among fellow aspirants.",
      },
    ],
  },
};

export function getExamGuide(slug: string): ExamGuide | null {
  return EXAM_GUIDES[slug] ?? null;
}

export function buildQuizStructuredData({
  name,
  description,
  canonicalUrl,
  timeMinutes = 180,
  questionCount = 200,
}: {
  name: string;
  description: string;
  canonicalUrl: string;
  timeMinutes?: number;
  questionCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name,
    description,
    url: absoluteUrl(canonicalUrl),
    educationalUse: "Practice",
    learningResourceType: "Mock Test Series",
    timeRequired: `PT${timeMinutes}M`,
    typicalAgeRange: "18-35",
    inLanguage: ["en-IN", "te-IN"],
    provider: {
      "@type": "Organization",
      name: "Varadhi Prep",
      url: absoluteUrl("/"),
    },
    about: {
      "@type": "Thing",
      name: name,
    },
    hasPart: [
      {
        "@type": "Question",
        eduQuestionType: "Multiple choice",
        text: `Full-length ${questionCount}-question mock test paper under timed conditions`,
      },
    ],
  };
}
