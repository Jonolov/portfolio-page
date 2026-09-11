import { describe, expect, it } from "vitest";
import { buildDriftPath } from "./driftPath";

describe("buildDriftPath", () => {
  it("starts the loop at the shard's own position", () => {
    expect(buildDriftPath(0)[0]).toEqual({ x: 0, y: 0 });
  });

  it("returns a closed loop with more than one leg", () => {
    const path = buildDriftPath(0);
    expect(path.length).toBeGreaterThan(2);
  });

  it("grows the wobble amplitude for later shards", () => {
    const small = buildDriftPath(0);
    const big = buildDriftPath(3);
    const reach = (path: { x: number; y: number }[]) =>
      Math.max(...path.map((p) => Math.hypot(p.x, p.y)));
    expect(reach(big)).toBeGreaterThan(reach(small));
  });

  it("alternates spin direction by index parity", () => {
    const a = buildDriftPath(0);
    const b = buildDriftPath(1);
    // Same amplitude family (adjacent indices differ only slightly), opposite
    // handedness: the second point's x sign should flip.
    expect(Math.sign(a[1].x)).not.toBe(Math.sign(b[1].x));
  });
});
