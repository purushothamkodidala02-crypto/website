export type SurveyFormType = "survey" | "growth_support" | "announcement";

export type SurveyThemeColor = "teal" | "emerald" | "blue" | "amber" | "rose" | "indigo";

export type SurveyTargetRoutes = {
  all?: boolean;
  dashboard?: boolean;
  mockTests?: boolean;
  testReview?: boolean;
  exams?: boolean;
  home?: boolean;
  customPath?: string;
};

export type SurveyAudienceCriteria = {
  // Mock Test Count Filter
  testCondition: "any" | "zero_tests" | "one_to_four" | "five_plus" | "custom_range";
  minTests?: number;
  maxTests?: number;

  // Registration Date Filter
  registrationCondition: "all" | "last_7_days" | "last_30_days" | "registered_after" | "registered_before";
  registeredAfterDate?: string | null;
  registeredBeforeDate?: string | null;

  // Exam Scope / Category
  targetExam: "all" | "ap_endowment" | "tg_police" | "appsc" | "tgpsc" | "dsc";
  requireAuth: boolean;
};

export type SurveyContributionConfig = {
  headline?: string;
  message?: string;
  suggestedAmounts?: number[];
  upiId?: string;
  upiName?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
};

export type SurveySettings = {
  // Form Type & Visual App Styling
  formType: SurveyFormType;
  appIcon: string; // e.g. "🤝", "📝", "💖", "🌱", "🎯", "⭐", "🚀", "📢", "🎁"
  badgeText: string; // e.g. "Help Us Grow Varadhi", "Quick Feedback", "100% Free"
  themeColor: SurveyThemeColor;
  displayMode: "page_only" | "popup_modal" | "floating_widget" | "both";

  // Page Routing (Which page it can show)
  targetRoutes: SurveyTargetRoutes;

  // Audience Criteria Engine (Who can see it)
  criteria: SurveyAudienceCriteria;

  // Legacy field support for backwards compatibility
  targetAudience?: "all" | "ap_endowment" | "tg_police" | "appsc" | "tgpsc";

  // Timing & Frequency Rules
  triggerDelaySeconds: number;
  cooldownDays: number;
  maxSkipAppearances: number;
  reappearIfSubmitted: boolean;
  submittedIntervalDays: number;
  reappearIfSkipped: boolean;
  skipIntervalHours: number;

  // Access & Quota
  allowAnonymous: boolean;
  requirePhone: "optional" | "required" | "none";
  responseQuota?: number | null;
  startDate?: string | null;
  expiryDate?: string | null;
  showProgressBar: boolean;

  // If Growth / Support form
  contribution?: SurveyContributionConfig;
};

export const DEFAULT_SURVEY_SETTINGS: SurveySettings = {
  formType: "survey",
  appIcon: "🤝",
  badgeText: "Help Us Grow Varadhi Prep",
  themeColor: "teal",
  displayMode: "both",
  targetRoutes: {
    dashboard: true,
    mockTests: true,
    testReview: true,
    exams: true,
    home: false,
  },
  criteria: {
    testCondition: "one_to_four",
    minTests: 1,
    maxTests: 4,
    registrationCondition: "all",
    targetExam: "all",
    requireAuth: false,
  },
  targetAudience: "all",
  triggerDelaySeconds: 2.5,
  cooldownDays: 3,
  maxSkipAppearances: 2,
  reappearIfSubmitted: false,
  submittedIntervalDays: 7,
  reappearIfSkipped: true,
  skipIntervalHours: 72,
  allowAnonymous: true,
  requirePhone: "optional",
  responseQuota: null,
  startDate: null,
  expiryDate: null,
  showProgressBar: true,
  contribution: {
    headline: "Support Varadhi Prep",
    message:
      "All mock tests are free and ad-free. If this platform helps your preparation, consider a small voluntary contribution to keep it running for everyone.",
    suggestedAmounts: [49, 99, 199, 499],
    upiId: "",
    upiName: "Varadhi Prep",
    primaryButtonText: "Support Varadhi",
    secondaryButtonText: "Maybe Later",
  },
};
