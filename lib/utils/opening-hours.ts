export interface DaySchedule {
  open: string;  // "HH:mm" (e.g. "09:00")
  close: string; // "HH:mm" (e.g. "21:30")
  closed: boolean;
}

export type WeekSchedule = Record<
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
  DaySchedule
>;

export interface OpenStatusResult {
  isOpen: boolean;
  statusText: string;
  badgeVariant: "open" | "closed";
  todaySchedule?: DaySchedule;
}

const DAYS_ORDER: Array<keyof WeekSchedule> = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr || "0", 10);
  const m = mStr || "00";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${period}`;
}

export function getOpeningStatus(
  scheduleJson: unknown,
  timezone = "Asia/Kolkata"
): OpenStatusResult {
  if (!scheduleJson || typeof scheduleJson !== "object") {
    return {
      isOpen: false,
      statusText: "Hours not available",
      badgeVariant: "closed",
    };
  }

  const schedule = scheduleJson as Partial<WeekSchedule>;

  // Get current date & time in target timezone
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const weekdayPart = parts.find((p) => p.type === "weekday")?.value?.toLowerCase() as
    | keyof WeekSchedule
    | undefined;
  const hourPart = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const minutePart = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);

  if (!weekdayPart || !schedule[weekdayPart]) {
    return {
      isOpen: false,
      statusText: "Hours not specified",
      badgeVariant: "closed",
    };
  }

  const today = schedule[weekdayPart];
  if (!today || today.closed) {
    return {
      isOpen: false,
      statusText: "Closed Today",
      badgeVariant: "closed",
      todaySchedule: today,
    };
  }

  const currentMinutes = hourPart * 60 + minutePart;

  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);

  const openMinutes = (openH || 0) * 60 + (openM || 0);
  let closeMinutes = (closeH || 0) * 60 + (closeM || 0);

  // If closing after midnight (e.g. 00:30 or 01:00)
  if (closeMinutes <= openMinutes) {
    closeMinutes += 24 * 60;
  }

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return {
      isOpen: true,
      statusText: `Open Now · Closes at ${formatTime12h(today.close)}`,
      badgeVariant: "open",
      todaySchedule: today,
    };
  }

  if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      statusText: `Closed · Opens today at ${formatTime12h(today.open)}`,
      badgeVariant: "closed",
      todaySchedule: today,
    };
  }

  return {
    isOpen: false,
    statusText: `Closed · Reopens tomorrow`,
    badgeVariant: "closed",
    todaySchedule: today,
  };
}
