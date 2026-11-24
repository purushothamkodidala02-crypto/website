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
  // Contribution to Validity linkage
  validityRewardEnabled?: boolean;
  validityDaysGranted?: number; // e.g. 30 days added to mock series
  validityMinContribution?: number; // e.g. ₹99
  validityMessage?: string;
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
  validityRewardEnabled: false,
  validityDaysGranted: 30,
  validityMinContribution: 99,
  validityMessage: "Contribute ₹99 or more to receive +30 days bonus validity extension on all active mock tests.",
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
