// Campaign runs for 7 days (1 week) from activation
// Expiry: Friday, November 20, 2026 at 23:59:59 IST
export const AP_EO_CAMPAIGN_EXPIRY_MS = new Date("2026-11-20T23:59:59+05:30").getTime();

export type ApEndowmentSurveyConditions = {
  reappearIfSubmitted: boolean;
  submittedIntervalDays: number;
  reappearIfSkipped: boolean;
  maxSkipAppearances: number;
  skipIntervalHours: number;
};

export const DEFAULT_SURVEY_CONDITIONS: ApEndowmentSurveyConditions = {
  reappearIfSubmitted: false,
  submittedIntervalDays: 7,
  reappearIfSkipped: true,
  maxSkipAppearances: 2,
  skipIntervalHours: 24,
};
