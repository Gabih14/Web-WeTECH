export type ShippingZone = "gran-mendoza" | "resto-mendoza";

export type DeliveryScheduleConfig = {
  holidays: string[];
  fridayBefore16Delivery: "saturday" | "monday";
};

export type DeliveryEstimate = {
  zone: ShippingZone;
  estimatedDate: string;
  answer: string;
  explanation: string;
  summary: string;
  highlighted: boolean;
};

export type DeliverySchedule = {
  now: Date;
  today: string;
  config: DeliveryScheduleConfig;
};

const MENDOZA_TIME_ZONE = "America/Argentina/Mendoza";
const DEFAULT_CONFIG: DeliveryScheduleConfig = {
  holidays: [],
  fridayBefore16Delivery: "monday",
};

const GRAN_MENDOZA_DEPARTMENTS = [
  "capital",
  "ciudad",
  "ciudad de mendoza",
  "godoy cruz",
  "guaymallen",
  "las heras",
  "lujan",
  "lujan de cuyo",
  "maipu",
];

const RESTO_MENDOZA_DEPARTMENTS = [
  "general alvear",
  "junin",
  "la paz",
  "lavalle",
  "malargue",
  "rivadavia",
  "san carlos",
  "san martin",
  "san rafael",
  "santa rosa",
  "tunuyan",
  "tupungato",
];

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export const getKnownShippingZone = (department: string): ShippingZone | undefined => {
  const normalizedDepartment = normalize(department);
  if (GRAN_MENDOZA_DEPARTMENTS.includes(normalizedDepartment)) return "gran-mendoza";
  if (RESTO_MENDOZA_DEPARTMENTS.includes(normalizedDepartment)) return "resto-mendoza";
  return undefined;
};

export const getShippingZone = (department: string): ShippingZone =>
  getKnownShippingZone(department) ?? "resto-mendoza";

export const getZoneLabel = (zone: ShippingZone) =>
  zone === "gran-mendoza" ? "Gran Mendoza" : "Resto de Mendoza";

const zonedParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MENDOZA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
  };
};

const dateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const addDays = (key: string, days: number) => {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12));
  return dateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
};

const weekday = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay();
};

const isHoliday = (key: string, holidays: Set<string>) => holidays.has(key);
const isBusinessDay = (key: string, holidays: Set<string>) => {
  const day = weekday(key);
  return day >= 1 && day <= 5 && !isHoliday(key, holidays);
};

const nextBusinessDay = (from: string, holidays: Set<string>) => {
  let candidate = from;
  while (!isBusinessDay(candidate, holidays)) candidate = addDays(candidate, 1);
  return candidate;
};

const moveIfHoliday = (candidate: string, holidays: Set<string>) =>
  isHoliday(candidate, holidays)
    ? nextBusinessDay(addDays(candidate, 1), holidays)
    : candidate;

const dayDifference = (from: string, to: string) => {
  const toUtc = (key: string) => {
    const [year, month, day] = key.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((toUtc(to) - toUtc(from)) / 86_400_000);
};

const weekdayName = (key: string) => {
  const names = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  return names[weekday(key)];
};

const answerFor = (today: string, estimatedDate: string) => {
  const difference = dayDifference(today, estimatedDate);
  if (difference === 0) return "Llega hoy";
  if (difference === 1) return "Llega mañana";
  return `Llega el ${weekdayName(estimatedDate)}`;
};

export const formatDeliverySummary = (estimatedDate: string, zone: ShippingZone) => {
  const [year, month, day] = estimatedDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  const weekdayText = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    timeZone: "UTC",
  }).format(date);
  const monthText = new Intl.DateTimeFormat("es-AR", {
    month: "short",
    timeZone: "UTC",
  }).format(date).replace(".", "").toUpperCase();
  return `Entrega estimada: ${weekdayText} ${String(day).padStart(2, "0")}/${monthText} (${getZoneLabel(zone)})`;
};

const buildEstimate = (
  zone: ShippingZone,
  today: string,
  estimatedDate: string,
  explanation: string,
  highlighted: boolean,
  useWeekdayAnswer = false
): DeliveryEstimate => ({
  zone,
  estimatedDate,
  answer: useWeekdayAnswer
    ? `Llega el ${weekdayName(estimatedDate)}`
    : answerFor(today, estimatedDate),
  explanation,
  summary: formatDeliverySummary(estimatedDate, zone),
  highlighted,
});

export const calculateDeliveryEstimate = (
  now: Date,
  zone: ShippingZone,
  config: DeliveryScheduleConfig = DEFAULT_CONFIG
): DeliveryEstimate => {
  const local = zonedParts(now);
  const today = dateKey(local.year, local.month, local.day);
  const day = weekday(today);
  const minutes = local.hour * 60 + local.minute;
  const holidays = new Set(config.holidays);

  if (isHoliday(today, holidays)) {
    const dispatch = nextBusinessDay(addDays(today, 1), holidays);
    const estimated = zone === "gran-mendoza"
      ? dispatch
      : nextBusinessDay(addDays(dispatch, 1), holidays);
    return buildEstimate(
      zone,
      today,
      estimated,
      "Hoy es feriado: no hay envíos.",
      false,
      true
    );
  }

  if (zone === "gran-mendoza") {
    if (day === 0) {
      return buildEstimate(zone, today, nextBusinessDay(addDays(today, 1), holidays), "Los domingos no hay envíos.", false, true);
    }
    if (day === 6) {
      if (minutes < 13 * 60) {
        return buildEstimate(zone, today, today, "si pagás antes de las 13:00", true);
      }
      return buildEstimate(zone, today, nextBusinessDay(addDays(today, 1), holidays), "hoy ya cerramos los envíos", false);
    }
    if (minutes < 17 * 60 + 30) {
      return buildEstimate(zone, today, today, "si pagás antes de las 17:30", true);
    }
    const candidate = day === 5
      ? moveIfHoliday(addDays(today, 1), holidays)
      : nextBusinessDay(addDays(today, 1), holidays);
    return buildEstimate(zone, today, candidate, "hoy ya cerramos los envíos", false);
  }

  if (day >= 1 && day <= 4 && minutes < 16 * 60) {
    return buildEstimate(
      zone,
      today,
      nextBusinessDay(addDays(today, 1), holidays),
      "si pagás antes de las 16:00",
      true
    );
  }

  if (day === 5 && minutes < 16 * 60) {
    const candidate = config.fridayBefore16Delivery === "saturday"
      ? moveIfHoliday(addDays(today, 1), holidays)
      : nextBusinessDay(addDays(today, 1), holidays);
    return buildEstimate(zone, today, candidate, "si pagás antes de las 16:00", false);
  }

  const dispatch = nextBusinessDay(addDays(today, 1), holidays);
  const estimated = nextBusinessDay(addDays(dispatch, 1), holidays);
  const explanation = day === 5 || day === 6 || day === 0
    ? `Sale el ${weekdayName(dispatch)}.`
    : `Sale ${dayDifference(today, dispatch) === 1 ? "mañana" : `el ${weekdayName(dispatch)}`}.`;
  return buildEstimate(zone, today, estimated, explanation, false);
};

export const getMendozaToday = (now: Date) => {
  const local = zonedParts(now);
  return dateKey(local.year, local.month, local.day);
};

const isConfig = (value: unknown): value is DeliveryScheduleConfig => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DeliveryScheduleConfig>;
  return Array.isArray(candidate.holidays) &&
    candidate.holidays.every((holiday) => /^\d{4}-\d{2}-\d{2}$/.test(holiday)) &&
    (candidate.fridayBefore16Delivery === "saturday" || candidate.fridayBefore16Delivery === "monday");
};

export const loadDeliverySchedule = async (): Promise<DeliverySchedule> => {
  const response = await fetch("/shipping-schedule.json", { cache: "no-store" });
  if (!response.ok) throw new Error("No se pudo cargar la agenda de envíos.");
  const rawConfig: unknown = await response.json();
  const config = isConfig(rawConfig) ? rawConfig : DEFAULT_CONFIG;
  const serverDate = response.headers.get("Date");
  if (!serverDate) throw new Error("El servidor no informó su fecha y hora.");
  const now = new Date(serverDate);
  if (Number.isNaN(now.getTime())) throw new Error("La fecha del servidor no es válida.");
  return { now, today: getMendozaToday(now), config };
};

export const defaultDeliveryScheduleConfig = DEFAULT_CONFIG;
