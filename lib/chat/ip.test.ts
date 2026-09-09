import { describe, expect, it } from "vitest";
import { ipFromHeaders } from "@/lib/chat/ip";

describe("ipFromHeaders", () => {
  it("takes the first hop of x-forwarded-for", () => {
    const h = new Headers({
      "x-forwarded-for": "203.0.113.1, 70.41.3.18, 150.172.238.178",
    });
    expect(ipFromHeaders(h)).toBe("203.0.113.1");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    expect(ipFromHeaders(new Headers({ "x-real-ip": "198.51.100.7" }))).toBe(
      "198.51.100.7",
    );
  });

  it("returns 'unknown' when neither header is present", () => {
    expect(ipFromHeaders(new Headers())).toBe("unknown");
  });
});
