import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { getOpeningStatus, WeekSchedule } from "@/lib/utils/opening-hours";

interface OpeningHoursCardProps {
  openingHours: unknown;
}

const DAYS_DISPLAY: Array<{ key: keyof WeekSchedule; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr || "0", 10);
  const m = mStr || "00";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${period}`;
}

export function OpeningHoursCard({ openingHours }: OpeningHoursCardProps) {
  const status = getOpeningStatus(openingHours);
  const schedule = openingHours as Partial<WeekSchedule> | null;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm text-foreground">Business Hours</h3>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            status.isOpen
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {status.isOpen ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          <span>{status.statusText}</span>
        </span>
      </div>

      {schedule ? (
        <div className="space-y-2 text-xs">
          {DAYS_DISPLAY.map(({ key, label }) => {
            const day = schedule[key];
            const isClosed = !day || day.closed;

            return (
              <div
                key={key}
                className="flex items-center justify-between py-1 border-b border-border/50 last:border-0"
              >
                <span className="font-medium text-foreground">{label}</span>
                <span className={isClosed ? "text-destructive font-semibold" : "text-muted-foreground"}>
                  {isClosed ? "Closed" : `${formatTime12h(day.open)} - ${formatTime12h(day.close)}`}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Opening hours not provided by owner.</p>
      )}
    </div>
  );
}
