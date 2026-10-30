import { describe, it, expect } from "vitest";
import { getOpeningStatus, WeekSchedule } from "@/lib/utils/opening-hours";

describe("Opening Hours Utility", () => {
  const mockSchedule: WeekSchedule = {
    monday: { open: "09:00", close: "21:00", closed: false },
    tuesday: { open: "09:00", close: "21:00", closed: false },
    wednesday: { open: "09:00", close: "21:00", closed: false },
    thursday: { open: "09:00", close: "21:00", closed: false },
    friday: { open: "09:00", close: "21:00", closed: false },
    saturday: { open: "10:00", close: "22:00", closed: false },
    sunday: { open: "00:00", close: "00:00", closed: true },
  };

  it("handles empty or null schedules gracefully", () => {
    const result = getOpeningStatus(null);
    expect(result.isOpen).toBe(false);
    expect(result.statusText).toBe("Hours not available");
    expect(result.badgeVariant).toBe("closed");
  });

  it("returns closed when day is marked closed", () => {
    const alwaysClosed: Partial<WeekSchedule> = {
      sunday: { open: "00:00", close: "00:00", closed: true },
      monday: { open: "00:00", close: "00:00", closed: true },
      tuesday: { open: "00:00", close: "00:00", closed: true },
      wednesday: { open: "00:00", close: "00:00", closed: true },
      thursday: { open: "00:00", close: "00:00", closed: true },
      friday: { open: "00:00", close: "00:00", closed: true },
      saturday: { open: "00:00", close: "00:00", closed: true },
    };

    const result = getOpeningStatus(alwaysClosed);
    expect(result.isOpen).toBe(false);
    expect(result.badgeVariant).toBe("closed");
  });

  it("returns open when 24x7 schedule is configured", () => {
    const alwaysOpen: Partial<WeekSchedule> = {
      sunday: { open: "00:00", close: "23:59", closed: false },
      monday: { open: "00:00", close: "23:59", closed: false },
      tuesday: { open: "00:00", close: "23:59", closed: false },
      wednesday: { open: "00:00", close: "23:59", closed: false },
      thursday: { open: "00:00", close: "23:59", closed: false },
      friday: { open: "00:00", close: "23:59", closed: false },
      saturday: { open: "00:00", close: "23:59", closed: false },
    };

    const result = getOpeningStatus(alwaysOpen);
    expect(result.isOpen).toBe(true);
    expect(result.badgeVariant).toBe("open");
    expect(result.statusText).toContain("Open Now");
  });
});
