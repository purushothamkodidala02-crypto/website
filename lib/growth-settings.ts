import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export type NewUserSurveySettings = {
  enabled: boolean;
  minCompletedTests: number; // Minimum tests completed to see survey (default: 1)
  headline: string;
  description: string;
  submitButtonText: string;
  dismissButtonText: string;
  cooldownDays: number;
  maxAppearances: number;
  displayDelaySeconds: number;
  targetRoutes: {
    dashboard: boolean;
    home: boolean;
    mockTests: boolean;
    exams: boolean;
  };
  askTargetExam: boolean;
  askMediumPreference: boolean;
  askSuggestions: boolean;
  askPhone: boolean;
};

export type GrowthPopupSettings = {
  enabled: boolean;
  minCompletedTests: number;
  cooldownDays: number;
  maxAppearances: number;
  displayDelaySeconds: number;
  targetRoutes: {
    dashboard: boolean;
    home: boolean;
    mockTests: boolean;
    exams: boolean;
  };
  headline: string;
  message: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  suggestedAmounts: number[];
  upiId: string;
  upiName: string;

  // Stage 1: Post-Test Growth Survey Settings (Candidates with 1 to minCompletedTests - 1 tests)
  survey?: NewUserSurveySettings;
};

export const DEFAULT_SURVEY_SETTINGS: NewUserSurveySettings = {
  enabled: true,
  minCompletedTests: 1, // Ignore 0-test visitors; trigger for users who have taken >= 1 test
  headline: "Help Us Grow Varadhi Prep",
  description:
    "All mock tests on Varadhi Prep are 100% free and ad-free. Tell us how your preparation is going and which mock tests you need next!",
  submitButtonText: "Submit & Help Us Grow",
  dismissButtonText: "Maybe Later",
  cooldownDays: 3,
  maxAppearances: 2,
  displayDelaySeconds: 2.5,
  targetRoutes: {
    dashboard: true,
    home: false,
    mockTests: true,
    exams: true,
  },
  askTargetExam: true,
  askMediumPreference: true,
  askSuggestions: true,
  askPhone: false,
};

export const DEFAULT_GROWTH_SETTINGS: GrowthPopupSettings = {
  enabled: true, // Enabled so candidates can access Help Us to Grow from sidebar and prompts
  minCompletedTests: 5,
  cooldownDays: 7,
  maxAppearances: 3,
  displayDelaySeconds: 2.5,
  targetRoutes: {
    dashboard: true,
    home: false,
    mockTests: true,
    exams: true,
  },
  headline: "Support Varadhi Prep",
  message:
    "All mock tests are free and ad-free. If this platform helps your preparation, consider a small voluntary contribution to keep it running for everyone.",
  primaryButtonText: "Support Varadhi",
  secondaryButtonText: "Maybe Later",
  suggestedAmounts: [49, 99, 199, 499],
  upiId: "",
  upiName: "",
  survey: DEFAULT_SURVEY_SETTINGS,
};

export const getGrowthSettings = unstable_cache(
  async (): Promise<GrowthPopupSettings> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "growth_popup")
        .maybeSingle();

      if (error || !data) {
        return DEFAULT_GROWTH_SETTINGS;
      }

      const record = data as Record<string, unknown> | null;
      const storedValue = record?.value as Partial<GrowthPopupSettings> | undefined;

      const mergedSurvey: NewUserSurveySettings = {
        ...DEFAULT_SURVEY_SETTINGS,
        ...(storedValue?.survey || {}),
        targetRoutes: {
          ...DEFAULT_SURVEY_SETTINGS.targetRoutes,
          ...(storedValue?.survey?.targetRoutes || {}),
        },
      };

      return {
        ...DEFAULT_GROWTH_SETTINGS,
        ...(storedValue || {}),
        enabled: typeof record?.enabled === "boolean" ? record.enabled : DEFAULT_GROWTH_SETTINGS.enabled,
        targetRoutes: {
          ...DEFAULT_GROWTH_SETTINGS.targetRoutes,
          ...(storedValue?.targetRoutes || {}),
        },
        survey: mergedSurvey,
      };
    } catch {
      return DEFAULT_GROWTH_SETTINGS;
    }
  },
  ["site-setting-growth-popup-v1"],
  { revalidate: 60, tags: ["growth-settings"] },
);
