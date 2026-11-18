const COUPON_TIME_ZONE = "America/Argentina/Mendoza";
const MONTHS = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
] as const;

type DateParts = { year: number; month: number; day: number };

const getDateParts = (date: Date): DateParts | null => {
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: COUPON_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? Number.NaN);
  const result = {
    year: value("year"),
    month: value("month"),
    day: value("day"),
  };

  return Object.values(result).every(Number.isFinite) ? result : null;
};

const parseDate = (value: string | Date | null | undefined) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatCouponDate = (
  value: string | Date | null | undefined
): string => {
  const date = parseDate(value);
  const parts = date ? getDateParts(date) : null;
  if (!parts) return "";

  return `${String(parts.day).padStart(2, "0")}/${MONTHS[parts.month - 1]}/${parts.year}`;
};

export const getCouponExpiryCopy = (
  expiration: string | Date | null | undefined,
  now = new Date()
): string => {
  const expirationDate = parseDate(expiration);
  const expirationParts = expirationDate ? getDateParts(expirationDate) : null;
  const nowParts = getDateParts(now);
  if (!expirationDate || !expirationParts || !nowParts) return "";

  const expirationDay = Date.UTC(
    expirationParts.year,
    expirationParts.month - 1,
    expirationParts.day
  );
  const currentDay = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day);
  const remainingDays = Math.round((expirationDay - currentDay) / 86_400_000);

  if (remainingDays === 0) return "vence hoy";
  if (remainingDays === 1) return "vence en 1 día";
  if (remainingDays > 1 && remainingDays <= 3) {
    return `vence en ${remainingDays} días`;
  }

  const formatted = formatCouponDate(expirationDate);
  return formatted ? `vence el ${formatted}` : "";
};

export const getCouponCategoryLabel = (
  category: string | null | undefined
): string => {
  switch (category?.trim().toLowerCase()) {
    case "filamento":
      return "filamentos";
    case "impresora":
      return "impresoras";
    case "repuesto":
      return "repuestos";
    default:
      return "los productos indicados";
  }
};
