import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const EXEMPT_ADMIN_EMAILS = ["kodidalanani@gmail.com"];

export function isExemptAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const clean = normalized.replace(/\./g, "");
  if (clean.startsWith("kodidalanani@")) return true;
  return EXEMPT_ADMIN_EMAILS.some((e) => e.replace(/\./g, "").toLowerCase() === clean);
}

export type MockTestAttemptBreakdown = {
  studentAttempts: number;
  adminAttempts: number;
};

/**
 * Safely resolves an authenticated Supabase client:
 * Uses createAdminClient() if SUPABASE_SERVICE_ROLE_KEY is configured;
 * otherwise gracefully falls back to the authenticated server client createClient().
 */
async function getExemptionClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      return createAdminClient();
    } catch {
      // fallback
    }
  }
  return await createClient();
}

type ExemptionDbClient = ReturnType<typeof createAdminClient> | Awaited<ReturnType<typeof createClient>>;

async function resolveAllAdminUserIds(client: ExemptionDbClient): Promise<Set<string>> {
  const adminUserIds = new Set<string>();

  // 1. Current logged-in user if exempt email
  try {
    const serverClient = await createClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (user?.id && isExemptAdminEmail(user.email)) {
      adminUserIds.add(user.id);
    }
  } catch {
    // ignore
  }

  // 2. Query profiles with 'admin' role in one fast indexed query
  try {
    const { data: profiles } = await client.from("profiles").select("id").eq("role", "admin");
    for (const p of profiles ?? []) {
      adminUserIds.add(p.id);
    }
  } catch {
    // ignore
  }

  return adminUserIds;
}

/**
 * Returns a map of mock_test_id -> { studentAttempts, adminAttempts }
 * Attempts by kodidalanani@gmail.com or users with profile role 'admin' are counted as adminAttempts,
 * which do not lock the mock test from admin editing.
 */
export async function getAdminAttemptCountsByMockTestId(): Promise<Map<string, MockTestAttemptBreakdown>> {
  try {
    const client = await getExemptionClient();
    const adminUserIds = await resolveAllAdminUserIds(client);

    if (adminUserIds.size === 0) {
      return new Map();
    }

    const { data: attempts, error: attemptsError } = await client
      .from("test_attempts")
      .select("mock_test_id")
      .in("user_id", Array.from(adminUserIds));

    if (attemptsError || !attempts || attempts.length === 0) {
      return new Map();
    }

    const map = new Map<string, MockTestAttemptBreakdown>();
    for (const a of attempts) {
      const entry = map.get(a.mock_test_id) ?? { studentAttempts: 0, adminAttempts: 0 };
      entry.adminAttempts += 1;
      map.set(a.mock_test_id, entry);
    }

    return map;
  } catch (err) {
    console.error("Failed to load attempt exemptions:", err);
    return new Map();
  }
}

/**
 * Checks whether a specific mock test has any real student attempts (i.e. not by kodidalanani@gmail.com or admin).
 */
export async function mockTestHasStudentAttempts(mockTestId: string): Promise<boolean> {
  try {
    const client = await getExemptionClient();
    // Fast path: use PostgreSQL database function directly
    const { data: hasAttempts, error } = await client.rpc("mock_test_has_student_attempts", {
      target_mock_test_id: mockTestId,
    });

    if (!error && typeof hasAttempts === "boolean") {
      return hasAttempts;
    }

    // Fallback: fast indexed head count excluding admin IDs
    const adminUserIds = await resolveAllAdminUserIds(client);
    let query = client
      .from("test_attempts")
      .select("id", { count: "exact", head: true })
      .eq("mock_test_id", mockTestId);

    if (adminUserIds.size > 0) {
      query = query.not("user_id", "in", `(${Array.from(adminUserIds).join(",")})`);
    }

    const { count } = await query;
    return (count ?? 0) > 0;
  } catch (err) {
    console.error("Failed to check student attempts:", err);
    return false;
  }
}

/**
 * Removes only test attempts made by kodidalanani@gmail.com or admins for this mock test.
 */
export async function clearAdminTestAttempts(mockTestId: string): Promise<{ success: boolean; clearedCount: number }> {
  try {
    const client = await getExemptionClient();
    const adminUserIds = await resolveAllAdminUserIds(client);
    if (adminUserIds.size === 0) {
      return { success: true, clearedCount: 0 };
    }

    const { data: attempts, error } = await client
      .from("test_attempts")
      .select("id, user_id")
      .eq("mock_test_id", mockTestId)
      .in("user_id", Array.from(adminUserIds));

    if (error || !attempts || attempts.length === 0) {
      return { success: true, clearedCount: 0 };
    }

    const adminAttemptIds = attempts.map((a) => a.id);
    if (adminAttemptIds.length === 0) {
      return { success: true, clearedCount: 0 };
    }

    // Delete test attempt sessions for these admin users
    await client
      .from("test_attempt_sessions")
      .delete()
      .eq("mock_test_id", mockTestId)
      .in("user_id", Array.from(adminUserIds));

    // Delete the test attempts (cascades to attempt_responses)
    const { error: deleteError } = await client
      .from("test_attempts")
      .delete()
      .in("id", adminAttemptIds);

    if (deleteError) {
      console.error("Failed to delete admin test attempts:", deleteError);
      return { success: false, clearedCount: 0 };
    }

    return { success: true, clearedCount: adminAttemptIds.length };
  } catch (err) {
    console.error("Failed to clear admin test attempts:", err);
    return { success: false, clearedCount: 0 };
  }
}
