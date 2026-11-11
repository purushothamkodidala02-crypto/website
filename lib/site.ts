export const SITE_NAME = "Varadhi Prep";
export const SITE_DESCRIPTION =
  "Free TG & AP competitive exam mock tests & official syllabus for TGPRB Police Constable, TG TET, TSPSC & APPSC in Telugu and English on Varadhi Prep.";

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://varadhiprep.in";

export const SITE_URL = configuredSiteUrl.replace(/\/+$/, "");

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}
