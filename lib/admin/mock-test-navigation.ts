const mockTestsPath = "/admin/mock-tests";

function isMockTestsListPath(value: string) {
  return value === mockTestsPath || value.startsWith(`${mockTestsPath}?`);
}

/** Keeps navigation inside the admin mock-test workspace and preserves list filters. */
export function mockTestsListReturnTo(value: string | string[] | undefined) {
  if (typeof value !== "string" || value.length > 2_000 || !isMockTestsListPath(value)) {
    return mockTestsPath;
  }

  return value;
}

export function mockTestQuestionsHref(mockTestId: string, listReturnTo: string) {
  return `/admin/mock-tests/${mockTestId}/questions?returnTo=${encodeURIComponent(listReturnTo)}`;
}

export function mockTestPreviewHref(mockTestId: string, listReturnTo: string, question?: number) {
  const params = new URLSearchParams({ returnTo: listReturnTo });
  if (question && question > 0) params.set("question", String(question));
  return `/admin/mock-tests/${mockTestId}/preview?${params.toString()}`;
}

export function isMockTestPreviewHref(value: string | string[] | undefined, mockTestId: string) {
  return typeof value === "string" && value.startsWith(`/admin/mock-tests/${mockTestId}/preview`);
}

export function listReturnToFromMockTestPreview(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.startsWith("/admin/mock-tests/")) return mockTestsPath;

  try {
    return mockTestsListReturnTo(new URL(value, "https://varadhiprep.in").searchParams.get("returnTo") ?? undefined);
  } catch {
    return mockTestsPath;
  }
}
