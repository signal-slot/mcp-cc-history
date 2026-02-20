import { readFile, stat } from "node:fs/promises";
import { PATHS } from "../utils/path.js";
import { matchesDateRange } from "../utils/date.js";
import { paginate } from "../utils/pagination.js";
import type { HistoryEntry, PaginatedResult } from "../types.js";

let cache: { mtime: number; entries: HistoryEntry[] } | null = null;

async function loadEntries(): Promise<HistoryEntry[]> {
  const st = await stat(PATHS.history);
  const mtime = st.mtimeMs;
  if (cache && cache.mtime === mtime) return cache.entries;

  const raw = await readFile(PATHS.history, "utf-8");
  const entries: HistoryEntry[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      entries.push(JSON.parse(line) as HistoryEntry);
    } catch {
      // skip malformed lines
    }
  }
  cache = { mtime, entries };
  return entries;
}

export async function searchHistory(
  query?: string,
  project?: string,
  startDate?: string,
  endDate?: string,
  limit = 50,
  offset = 0,
): Promise<PaginatedResult<HistoryEntry>> {
  const all = await loadEntries();
  const q = query?.toLowerCase();

  const filtered = all.filter((e) => {
    if (q && !e.display.toLowerCase().includes(q)) return false;
    if (project && e.project !== project) return false;
    if (!matchesDateRange(e.timestamp, startDate, endDate)) return false;
    return true;
  });

  // reverse chronological
  filtered.reverse();
  return paginate(filtered, offset, limit);
}
