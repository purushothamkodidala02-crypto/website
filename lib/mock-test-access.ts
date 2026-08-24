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

  const rawPrice = String(formData.get("price_inr") ?? "").trim();
  const priceInr = rawPrice ? Number(rawPrice) : NaN;
  if (!Number.isFinite(priceInr) || priceInr <= 0) {
    return {
      accessType: "paid",
      priceInr: null,
      error: "Enter a price greater than zero for paid access.",
    };
  }

  return {
    accessType: "paid",
    priceInr,
    error: null,
  };
}
