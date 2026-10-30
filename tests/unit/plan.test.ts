import { describe, it, expect } from "vitest";
import { PlanService } from "@/lib/services/plan.service";

describe("Plan Service & Pricing Utility", () => {
  it("formats zero paise as Free Forever", () => {
    expect(PlanService.formatPriceINR(0)).toBe("Free Forever");
  });

  it("formats 499900 paise as ₹4,999 / year in Indian format", () => {
    const formatted = PlanService.formatPriceINR(499900);
    expect(formatted).toContain("4,999");
    expect(formatted).toContain("/ year");
  });

  it("formats 999900 paise as ₹9,999 / year in Indian format", () => {
    const formatted = PlanService.formatPriceINR(999900);
    expect(formatted).toContain("9,999");
    expect(formatted).toContain("/ year");
  });

  it("falls back to default plan fixtures when database is disconnected", async () => {
    const plans = await PlanService.getActivePlans();
    expect(plans.length).toBeGreaterThanOrEqual(3);
    const slugs = plans.map((p) => p.slug);
    expect(slugs).toContain("free");
    expect(slugs).toContain("standard");
    expect(slugs).toContain("premium");
  });
});
