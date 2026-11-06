import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export const isPaidSalesEnabled = unstable_cache(
  async () => {
    try {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("site_settings")
        .select("enabled")
        .eq("key", "paid_sales")
        .maybeSingle();

      return data?.enabled === true;
    } catch {
      return false;
    }
  },
  ["site-setting-paid-sales-v1"],
  { revalidate: 60 },
);
