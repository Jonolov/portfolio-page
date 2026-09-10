/** A draggable reel only makes sense with more than one card. */
export function shouldReel(count: number): boolean {
  return count > 1;
}
