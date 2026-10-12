import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface TimingSummary {
  count: number;
  min: number;
  median: number;
  p95: number;
  max: number;
}

export type PerformanceReport = Record<string, TimingSummary>;

/**
 * Merges one component's report into a package's results file. Keys are sorted so two local
 * runs compare with a plain `diff`; a missing or empty file starts from nothing, because the
 * first benchmark of a fresh checkout has no file yet.
 */
export async function recordPerformance(
  file: string,
  name: string,
  report: PerformanceReport
): Promise<void> {
  let results: Record<string, PerformanceReport> = {};
  try {
    const existing = await readFile(file, 'utf8');
    if (existing.trim()) results = JSON.parse(existing) as Record<string, PerformanceReport>;
  } catch {
    // No file yet: first write.
  }

  results[name] = report;
  const sorted = Object.fromEntries(Object.entries(results).sort(([a], [b]) => a.localeCompare(b)));

  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(sorted, null, 2)}\n`);
}
