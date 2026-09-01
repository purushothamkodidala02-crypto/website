import type { MockTestAccessType } from "@/types/mock-test";

export const MOCK_TEST_ACCESS_TYPES: MockTestAccessType[] = ["free", "paid"];

export function readMockTestAccess(formData: FormData): {
  accessType: MockTestAccessType;
  priceInr: number | null;
  error: string | null;
} {
  const accessType = String(formData.get("access_type") ?? "free").trim().toLowerCase();
  if (!MOCK_TEST_ACCESS_TYPES.includes(accessType as MockTestAccessType)) {
    return {
      accessType: "free",
      priceInr: null,
      error: "Choose Free or Paid student access.",
    };
  }

  if (accessType === "free") {
    return {
      accessType: "free",
      priceInr: null,
      error: null,
    };
  }

  return {
    accessType: "paid",
    // Required only by the legacy database constraint. Students purchase an
    // Exam Series and never see or pay this internal value.
    priceInr: 1,
    error: null,
  };
}
