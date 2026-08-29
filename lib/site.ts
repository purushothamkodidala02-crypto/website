export const SITE_NAME = "Varadhi Prep";
export const SITE_DESCRIPTION =
  "Prepare for Telangana, Andhra Pradesh and Central exams with Varadhi Prep mock tests. Practise TGPRB Police Constable, TSPSC, APPSC, TG TET and other competitive exam papers in Telugu and English, take timed tests, review detailed solutions, track weak topics, and improve your study plan after every attempt.";

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://varadhiprep.in";

export const SITE_URL = configuredSiteUrl.replace(/\/+$/, "");

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}
