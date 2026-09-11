import { describe, expect, it } from "vitest";
import { computeFieldInfluence } from "./field";

describe("computeFieldInfluence", () => {
  it("is 1 right at the source", () => {
    expect(computeFieldInfluence(0, 200)).toBe(1);
  });

  it("is 0 at or beyond the radius", () => {
    expect(computeFieldInfluence(200, 200)).toBe(0);
    expect(computeFieldInfluence(500, 200)).toBe(0);
  });

  it("is 0.5 at the midpoint (smoothstep symmetry)", () => {
    expect(computeFieldInfluence(100, 200)).toBeCloseTo(0.5);
  });

  it("falls off monotonically between the source and the radius", () => {
    const near = computeFieldInfluence(40, 200);
    const mid = computeFieldInfluence(100, 200);
    const far = computeFieldInfluence(160, 200);
    expect(near).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(far);
  });
});
