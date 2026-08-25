import { createClient } from "@/lib/supabase/server";

export async function isPaidSalesEnabled() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("enabled")
    .eq("key", "paid_sales")
    .maybeSingle();

  return data?.enabled === true;
}
