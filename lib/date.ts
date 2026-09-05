export function indiaDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = new Map(parts.map((part) => [part.type, part.value]));
  return `${value.get("year")}-${value.get("month")}-${value.get("day")}`;
}

export function formatIndiaDateTime(date: Date | string | number) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(typeof date === "string" || typeof date === "number" ? new Date(date) : date);
}

export function formatIndiaDate(date: Date | string | number) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(typeof date === "string" || typeof date === "number" ? new Date(date) : date);
}
