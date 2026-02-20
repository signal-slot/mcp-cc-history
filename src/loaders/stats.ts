import { readFile } from "node:fs/promises";
import { PATHS } from "../utils/path.js";
import type { StatsCache, DailyActivity } from "../types.js";

export async function loadStats(): Promise<StatsCache> {
  const raw = await readFile(PATHS.statsCache, "utf-8");
  return JSON.parse(raw) as StatsCache;
}

export async function getActivityStats(
  startDate?: string,
  endDate?: string,
): Promise<DailyActivity[]> {
  const stats = await loadStats();
  let activities = stats.dailyActivity;
  if (startDate) {
    activities = activities.filter((a) => a.date >= startDate);
  }
  if (endDate) {
    activities = activities.filter((a) => a.date <= endDate);
  }
  return activities;
}
