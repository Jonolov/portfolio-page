interface LimitWindow {
  readonly limit: number;
  readonly windowMs: number;
}

const WINDOWS: readonly LimitWindow[] = [
  { limit: 5, windowMs: 30_000 },
  { limit: 30, windowMs: 60 * 60_000 },
  { limit: 100, windowMs: 24 * 60 * 60_000 },
];

const MAX_WINDOW_MS = Math.max(...WINDOWS.map((w) => w.windowMs));

const hits = new Map<string, number[]>();

function check(ip: string, now: number = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < MAX_WINDOW_MS);

  for (const { limit, windowMs } of WINDOWS) {
    const count = recent.filter((t) => now - t < windowMs).length;
    if (count >= limit) {
      hits.set(ip, recent);
      return false;
    }
  }

  recent.push(now);
  hits.set(ip, recent);
  sweep(now);
  return true;
}

function sweep(now: number): void {
  for (const [ip, times] of hits) {
    const live = times.filter((t) => now - t < MAX_WINDOW_MS);
    if (live.length === 0) hits.delete(ip);
    else hits.set(ip, live);
  }
}

export const rateLimit = { check };

export function __resetRateLimit(): void {
  hits.clear();
}
