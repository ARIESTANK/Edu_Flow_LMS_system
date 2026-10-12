export const mean = (a: number[]) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);

export function median(a: number[]) {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Population standard deviation */
export function stdev(a: number[]) {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(mean(a.map(x => (x - m) ** 2)));
}

/** Counts per bucket, edges like [0,50,60,70,80,90,101] -> 6 buckets */
export function histogram(values: number[], edges: number[]) {
  const counts = new Array(edges.length - 1).fill(0);
  for (const v of values) {
    for (let i = 0; i < counts.length; i++) {
      if (v >= edges[i] && v < edges[i + 1]) { counts[i]++; break; }
    }
  }
  return counts as number[];
}

export function randomPassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);
  return Array.from(buf, n => chars[n % chars.length]).join('');
}
