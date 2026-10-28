export const safeCount = (value: unknown): number => {
  const n = typeof value === "number" || (typeof value === "string" && value.trim() !== "") ? Number(value) : NaN;
  return Number.isSafeInteger(n) && n >= 0 ? n : 0;
};
export const isDiscordId = (value: unknown): value is string => typeof value === "string" && /^[0-9]{15,25}$/.test(value);
export const safeText = (value: unknown, max: number, fallback = ""): string =>
  typeof value === "string" ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, max) : fallback;
