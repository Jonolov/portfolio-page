import { describe, expect, it } from "vitest";
import { computeMagnetOffset } from "./magnet";

describe("computeMagnetOffset", () => {
  it("scales the pointer offset by the pull fraction when under the cap", () => {
    expect(computeMagnetOffset(20, 10, 0.5, 100)).toEqual({ x: 10, y: 5 });
  });

  it("returns zero for a pointer exactly on centre", () => {
    expect(computeMagnetOffset(0, 0, 0.5, 100)).toEqual({ x: 0, y: 0 });
  });

  it("clamps the offset length to maxOffset, preserving direction", () => {
    // dx*pull = 300, dy*pull = 400 -> length 500, way past a 20px cap.
    // Clamped vector must keep the 3:4 ratio and have length 20.
    const result = computeMagnetOffset(600, 800, 0.5, 20);
    expect(result.x).toBeCloseTo(12);
    expect(result.y).toBeCloseTo(16);
  });
});
