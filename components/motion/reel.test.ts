import { describe, expect, it } from "vitest";
import { shouldReel } from "./reel";

describe("shouldReel", () => {
  it("is false for a single card", () => {
    expect(shouldReel(1)).toBe(false);
  });
  it("is true for two or more", () => {
    expect(shouldReel(2)).toBe(true);
    expect(shouldReel(5)).toBe(true);
  });
  it("is false for zero", () => {
    expect(shouldReel(0)).toBe(false);
  });
});
