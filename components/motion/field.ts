/**
 * Smoothstep falloff for a cursor "field": 1 right at the source, 0 at or
 * beyond `radius`, easing between. Used to drive both how far a shard gets
 * pushed away from the pointer and how much it scales up as a depth cue.
 */
export function computeFieldInfluence(distance: number, radius: number): number {
  if (distance >= radius) return 0;
  if (distance <= 0) return 1;
  const t = 1 - distance / radius;
  return t * t * (3 - 2 * t);
}
