export const SITE_NAME = "Varadhi Prep";
export const SITE_DESCRIPTION =
  "Prepare for Telangana and Andhra Pradesh government exams with Varadhi Prep mock tests. Practise TGPRB Police Constable, TSPSC, APPSC and TG TET papers in Telugu and English, attempt timed tests, review detailed solutions, track progress, and improve your study plan.";

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://varadhiprep.in";

export const SITE_URL = configuredSiteUrl.replace(/\/+$/, "");

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}
