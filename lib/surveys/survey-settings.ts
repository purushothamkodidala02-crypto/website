export type SurveyDisplayMode = "side_button" | "popup_modal" | "both" | "page_only";

export type SurveyAudienceCategory =
  | "all"
  | "new_users"
  | "returning_users"
  | "ap_endowment"
  | "tg_police"
  | "appsc"
  | "tgpsc"
  | "specific_users";

export type SurveyRewardType =
  | "none"
  | "validity_extension"
  | "free_pass"
  | "discount_code"
  | "study_notes"
  | "custom";

export type SurveySettings = {
  // Placement & Display
  displayMode: "page_only" | "popup_modal" | "both" | "side_button";
  targetAudience:
    | "all"
    | "ap_endowment"
    | "tg_police"
    | "appsc"
    | "tgpsc"
    | "new_users"
    | "returning_users"
    | "specific_users"
    | string;
  triggerDelaySeconds: number;

  // Side Button Configuration ("We will show it as a pop-up like side button, like that")
  sideButtonPosition?: "bottom_right" | "bottom_left" | "right_middle" | "left_middle";
  sideButtonLabel?: string;

  // Granular Targeting Rules: Who Can See ("manage who can see the survey forms")
  targetUserType?: "all" | "new_users" | "returning_users" | "specific_users";
  minMockTestsTaken?: number; // e.g. 0 for new users, 1+ or 5+ for active candidates
  maxMockTestsTaken?: number | null; // e.g. 0 to strictly target users before their first test
  targetExamSlug?: string; // e.g. "all", "telangana-police-constable", "ap-endowment-officer", etc.
  targetState?: "all" | "telangana" | "andhra_pradesh";
  specificTargetUsers?: string[]; // specific candidate emails or phones
  daysRegisteredMax?: number | null; // e.g. <= 7 or 14 days for new registrations

  // What They Are Receiving / Incentives ("what they are receiving", "contribution to validity")
  rewardType?: SurveyRewardType;
  rewardTitle?: string; // e.g. "+30 Days Free Mock Pass Validity Extension"
  rewardDescription?: string;
  rewardValue?: string; // e.g. "30_DAYS", "COUPON_VARADHI", "PDF_NOTES"

  // Target Routes (where side button or popup can trigger)
  targetRoutes?: {
    dashboard: boolean;
    mockTests: boolean;
    results: boolean;
    exams: boolean;
    home: boolean;
  };

  // Frequency Rules: When Submitted
  reappearIfSubmitted: boolean;
  submittedIntervalDays: number;

  // Frequency Rules: When Skipped / Dismissed
  reappearIfSkipped: boolean;
  maxSkipAppearances: number;
  skipIntervalHours: number;

  // Access & Quota
  allowAnonymous: boolean;
  requirePhone: "optional" | "required" | "none";
  responseQuota?: number | null;
  expiryDate?: string | null;
  showProgressBar: boolean;
};

export const DEFAULT_SURVEY_SETTINGS: SurveySettings = {
  displayMode: "both",
  targetAudience: "all",
  triggerDelaySeconds: 2,
  sideButtonPosition: "bottom_right",
  sideButtonLabel: "💬 1-Min Feedback",

  targetUserType: "all",
  minMockTestsTaken: 0,
  maxMockTestsTaken: null,
  targetExamSlug: "all",
  targetState: "all",
  specificTargetUsers: [],
  daysRegisteredMax: null,

  rewardType: "none",
  rewardTitle: "",
  rewardDescription: "",
  rewardValue: "",

  targetRoutes: {
    dashboard: true,
    mockTests: true,
    results: true,
    exams: false,
    home: false,
  },

  reappearIfSubmitted: false,
  submittedIntervalDays: 7,
  reappearIfSkipped: true,
  maxSkipAppearances: 3,
  skipIntervalHours: 24,
  allowAnonymous: true,
  requirePhone: "optional",
  responseQuota: null,
  expiryDate: null,
  showProgressBar: true,
};
