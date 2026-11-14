import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("publishMockTest and republishArchivedMockTest are protected against uncaught exceptions and map MFA errors", async () => {
  const [manageActions, editActions, catalogData, nextConfig, migration] = await Promise.all([
    read("app/admin/mock-tests/manage-actions.ts"),
    read("app/admin/mock-tests/[id]/edit/actions.ts"),
    read("lib/catalog-data.ts"),
    read("next.config.ts"),
    read("supabase/migrations/20261114090000_harden_mock_test_publishing.sql"),
  ]);

  // catalog-data exports safe revalidation helper
  assert.match(catalogData, /export function safeRevalidateCatalogTag/);
  assert.match(catalogData, /updateTag\(PUBLIC_CATALOG_TAG\)/);
  assert.match(catalogData, /revalidateTag\(PUBLIC_CATALOG_TAG, "max"\)/);

  // manage-actions uses safe catalog revalidation and catches revalidation errors
  assert.match(manageActions, /safeRevalidateCatalogTag/);
  assert.match(manageActions, /try \{[\s\S]*?revalidatePath\("\/admin"\)/);

  // publishMockTest handles MFA and zero questions explicitly
  assert.match(manageActions, /Administrator MFA verification is required/);
  assert.match(manageActions, /Add at least one Question before publishing/);
  assert.match(manageActions, /The assigned Question count must match the Paper Question count/);
  assert.match(manageActions, /Create an active Exam Pass for this Exam before publishing a paid Mock Test/);

  // Service role fallback support on MFA block
  assert.match(manageActions, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(manageActions, /createAdminClient/);

  // Allowed origins include localhost, vercel preview and production
  assert.match(nextConfig, /"localhost:3000"/);
  assert.match(nextConfig, /"127\.0\.0\.1:3000"/);
  assert.match(nextConfig, /"\*\.vercel\.app"/);
  assert.match(nextConfig, /"\*\.varadhiprep\.in"/);

  // Migration defines secure functions and restores draft tests
  assert.match(migration, /create or replace function public\.publish_mock_test_safely/i);
  assert.match(migration, /create or replace function public\.republish_archived_mock_test_safely/i);
  assert.match(migration, /coalesce\(auth\.jwt\(\) ->> 'role', ''\) <> 'service_role'/);
  assert.match(migration, /5d4222b7-a2e9-4471-a006-b1813a18f7a4/);
  assert.match(migration, /433697ea-8456-44d7-8681-81b46125b23e/);
  assert.match(migration, /15f047ac-d741-4abe-bda4-75fcd4771542/);
});
