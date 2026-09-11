/**
 * A small closed loop of points (relative to a shard's own resting
 * position) for `MotionPathPlugin` to idly drift a shard along. Each shard
 * gets a different amplitude and handedness so the ambient motion reads as
 * organic drifting rather than a synchronized wobble.
 */
export function buildDriftPath(index: number): { x: number; y: number }[] {
  const amp = 26 + index * 8;
  const spin = index % 2 === 0 ? 1 : -1;

  return [
    { x: 0, y: 0 },
    { x: amp * spin, y: -amp * 0.7 },
    { x: amp * 0.3 * spin, y: amp },
    { x: -amp * 0.8 * spin, y: amp * 0.2 },
  ];
}
