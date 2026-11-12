export type StudentDisplayInfo = {
  displayName: string;
  firstName: string;
  avatarLetter: string;
};

function formatEmailUsername(email?: string | null): string {
  if (!email) return "Student";
  const local = email.split("@")[0]?.trim() ?? "";
  if (!local) return "Student";
  const cleaned = local.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "Student";
  return cleaned
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function resolveStudentDisplayInfo({
  fullName,
  name,
  email,
}: {
  fullName?: unknown;
  name?: unknown;
  email?: string | null;
}): StudentDisplayInfo {
  const rawFull = typeof fullName === "string" ? fullName.trim() : "";
  const rawName = typeof name === "string" ? name.trim() : "";
  const displayName = rawFull || rawName || formatEmailUsername(email);
  const firstName = displayName.split(/\s+/)[0] || "Student";
  const avatarLetter = (firstName.charAt(0) || "S").toUpperCase();

  return { displayName, firstName, avatarLetter };
}
