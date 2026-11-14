export type ZohoSurveySettings = {
  // Placement & Display
  displayMode: "page_only" | "popup_modal" | "both";
  targetAudience: "all" | "ap_endowment" | "tg_police" | "appsc" | "tgpsc";
  triggerDelaySeconds: number;

  // Zoho Frequency Rules: When Submitted
  reappearIfSubmitted: boolean;
  submittedIntervalDays: number;

  // Zoho Frequency Rules: When Skipped / Dismissed
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

export const DEFAULT_ZOHO_SETTINGS: ZohoSurveySettings = {
  displayMode: "both",
  targetAudience: "all",
  triggerDelaySeconds: 2,
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
