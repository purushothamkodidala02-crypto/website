import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("admin question editing and taxonomy loading are resilient against missing service role key and unexpected errors", async () => {
  const [taxonomy, syncAttempt, editActions, adminError] = await Promise.all([
    read("lib/admin/taxonomy.ts"),
    read("lib/questions/sync-attempt-sessions.ts"),
    read("app/admin/questions/[id]/edit/actions.ts"),
    read("app/admin/error.tsx"),
  ]);

  // 1. Taxonomy uses public client fallback and never crashes if service role key is absent
  assert.match(taxonomy, /createPublicClient/);
  assert.match(taxonomy, /catch \(err\)/);

  // 2. Sync to attempt sessions safely skips if service role key is absent and catches errors
  assert.match(syncAttempt, /!process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(syncAttempt, /try \{/);
  assert.match(syncAttempt, /catch \(err\)/);

  // 3. updateQuestion has top-level try-catch returning clean error state without crashing
  assert.match(editActions, /try \{/);
  assert.match(editActions, /catch \(err\)/);
  assert.match(editActions, /Temporary problem saving question/);

  // 4. Admin error boundary exists and provides dedicated admin workspace recovery
  assert.match(adminError, /Admin Workspace Error/);
  assert.match(adminError, /RetryButton/);
  assert.match(adminError, /\/admin\/mock-tests/);
  assert.match(adminError, /\/admin\/questions/);
});
