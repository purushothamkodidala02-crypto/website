"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type CandidateLookupResult = {
  id: string;
  fullName: string | null;
  phone: string | null;
  createdAt: string;
  activePasses: string[];
  totalAttempts: number;
};

export async function lookupCandidateAction(rawQuery: string): Promise<{
  success: boolean;
  candidates: CandidateLookupResult[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, candidates: [], error: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return { success: false, candidates: [], error: "Forbidden: Admin access required" };
    }

    const query = rawQuery.trim();
    if (!query || query.length < 2) {
      return { success: false, candidates: [], error: "Enter at least 2 characters to search." };
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        success: false,
        candidates: [],
        error: "Candidate directory search requires SUPABASE_SERVICE_ROLE_KEY in this environment.",
      };
    }

    const admin = createAdminClient();
    const isDigits = /^\d+$/.test(query);

    let profileQuery = admin
      .from("profiles")
      .select("id, full_name, phone, created_at")
      .eq("role", "student");

    if (isDigits) {
      profileQuery = profileQuery.ilike("phone", `%${query}%`);
    } else {
      profileQuery = profileQuery.ilike("full_name", `%${query}%`);
    }

    const { data: profiles, error: pError } = await profileQuery.limit(5);
    if (pError || !profiles || profiles.length === 0) {
      return { success: true, candidates: [] };
    }

    const userIds = profiles.map((p) => p.id);
    const now = new Date().toISOString();

    const [entitlementsRes, attemptsRes, productsRes] = await Promise.all([
      admin
        .from("student_entitlements")
        .select("user_id, product_id")
        .in("user_id", userIds)
        .gt("expires_at", now),
      admin
        .from("test_attempts")
        .select("user_id")
        .in("user_id", userIds),
      admin
        .from("access_products")
        .select("id, name"),
    ]);

    const productMap = new Map((productsRes.data ?? []).map((p) => [p.id, p.name]));
    const passesByUser = new Map<string, string[]>();
    for (const ent of entitlementsRes.data ?? []) {
      const current = passesByUser.get(ent.user_id) ?? [];
      const productName = productMap.get(ent.product_id) ?? "Active Pass";
      if (!current.includes(productName)) current.push(productName);
      passesByUser.set(ent.user_id, current);
    }

    const attemptCountByUser = new Map<string, number>();
    for (const att of attemptsRes.data ?? []) {
      attemptCountByUser.set(att.user_id, (attemptCountByUser.get(att.user_id) ?? 0) + 1);
    }

    const results: CandidateLookupResult[] = profiles.map((p) => ({
      id: p.id,
      fullName: p.full_name,
      phone: p.phone,
      createdAt: p.created_at,
      activePasses: passesByUser.get(p.id) ?? [],
      totalAttempts: attemptCountByUser.get(p.id) ?? 0,
    }));

    return { success: true, candidates: results };
  } catch (err: unknown) {
    return {
      success: false,
      candidates: [],
      error: err instanceof Error ? err.message : "Failed to lookup candidate",
    };
  }
}
