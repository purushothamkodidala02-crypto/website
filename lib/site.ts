export const SITE_NAME = "Varadhi Prep";
export const SITE_DESCRIPTION =
  "Prepare for Telangana and Andhra Pradesh state exams with online mock tests, Telugu and English practice, timed attempts, answer review, and progress tracking.";

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://varadhiprep.in";

export const SITE_URL = configuredSiteUrl.replace(/\/+$/, "");

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}
