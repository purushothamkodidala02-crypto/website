export function normaliseIndianMobile(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  const mobile = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(mobile) ? mobile : "";
}
