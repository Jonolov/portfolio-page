/**
 * Scales a pointer offset by `pull`, then clamps the result to `maxOffset`
 * (preserving direction) so a magnetic element never travels far enough to
 * collide with a neighbour sitting close beside it.
 */
export function computeMagnetOffset(
  dx: number,
  dy: number,
  pull: number,
  maxOffset: number,
): { x: number; y: number } {
  const x = dx * pull;
  const y = dy * pull;
  const length = Math.hypot(x, y);
  if (length <= maxOffset || length === 0) return { x, y };

  const scale = maxOffset / length;
  return { x: x * scale, y: y * scale };
}
