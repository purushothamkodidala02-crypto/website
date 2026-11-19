import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

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
};

export const DEFAULT_GROWTH_SETTINGS: GrowthPopupSettings = {
  enabled: false, // Default to false (Hide Mode) so users never see pop-up or page until admin enables it
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
  headline: "Contribute to Varadhi Prep",
  message:
    "If you are happy with our service and Varadhi Prep has helped your preparation, consider contributing to help us grow. We keep every mock test free and ad-free for everyone. Your support directly covers cloud servers, database hosting, and bilingual questions.",
  primaryButtonText: "Support Varadhi",
  secondaryButtonText: "Maybe Later",
  suggestedAmounts: [49, 99, 199, 499],
  upiId: "",
  upiName: "",
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

      const storedValue = (data as Record<string, unknown>).value as Partial<GrowthPopupSettings> | undefined;

      return {
        ...DEFAULT_GROWTH_SETTINGS,
        ...(storedValue || {}),
        enabled: typeof data.enabled === "boolean" ? data.enabled : DEFAULT_GROWTH_SETTINGS.enabled,
        targetRoutes: {
          ...DEFAULT_GROWTH_SETTINGS.targetRoutes,
          ...(storedValue?.targetRoutes || {}),
        },
      };
    } catch {
      return DEFAULT_GROWTH_SETTINGS;
    }
  },
  ["site-setting-growth-popup-v1"],
  { revalidate: 60, tags: ["growth-settings"] },
);
