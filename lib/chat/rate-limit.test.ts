import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetRateLimit, rateLimit } from "@/lib/chat/rate-limit";

describe("rateLimit.check", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __resetRateLimit();
  });
  afterEach(() => vi.useRealTimers());

  it("allows 5 requests then blocks the 6th within 30s", () => {
    for (let i = 0; i < 5; i++) expect(rateLimit.check("1.1.1.1")).toBe(true);
    expect(rateLimit.check("1.1.1.1")).toBe(false);
  });

  it("frees up once the 30s window has passed", () => {
    for (let i = 0; i < 5; i++) rateLimit.check("1.1.1.1");
    vi.advanceTimersByTime(31_000);
    expect(rateLimit.check("1.1.1.1")).toBe(true);
  });

  it("enforces the hourly ceiling of 30", () => {
    for (let i = 0; i < 30; i++) {
      expect(rateLimit.check("2.2.2.2")).toBe(true);
      vi.advanceTimersByTime(10_000); // 10s apart: never trips the 5/30s window
    }
    expect(rateLimit.check("2.2.2.2")).toBe(false);
  });

  it("tracks IPs independently", () => {
    for (let i = 0; i < 5; i++) rateLimit.check("3.3.3.3");
    expect(rateLimit.check("3.3.3.3")).toBe(false);
    expect(rateLimit.check("4.4.4.4")).toBe(true);
  });
});
