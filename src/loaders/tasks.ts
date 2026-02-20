import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { PATHS } from "../utils/path.js";
import type { TaskItem } from "../types.js";

let cache: { teamName: string; task: TaskItem }[] | null = null;

async function loadAllTasks(): Promise<{ teamName: string; task: TaskItem }[]> {
  if (cache) return cache;

  let teamDirs: string[];
  try {
    teamDirs = await readdir(PATHS.tasks);
  } catch {
    return [];
  }

  const result: { teamName: string; task: TaskItem }[] = [];
  for (const team of teamDirs) {
    const teamDir = join(PATHS.tasks, team);
    let files: string[];
    try {
      files = await readdir(teamDir);
    } catch {
      continue;
    }
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      try {
        const raw = await readFile(join(teamDir, f), "utf-8");
        const task = JSON.parse(raw) as TaskItem;
        if (task.id && task.subject) {
          result.push({ teamName: team, task });
        }
      } catch {
        // skip
      }
    }
  }
  cache = result;
  return result;
}

export function invalidateTaskCache(): void {
  cache = null;
}

export async function searchTasks(
  query?: string,
  status?: string,
  teamName?: string,
  limit = 50,
): Promise<{ teamName: string; task: TaskItem }[]> {
  const all = await loadAllTasks();
  const q = query?.toLowerCase();

  const filtered = all.filter((entry) => {
    if (teamName && entry.teamName !== teamName) return false;
    if (status && entry.task.status !== status) return false;
    if (q) {
      const searchable =
        `${entry.task.subject} ${entry.task.description}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  return filtered.slice(0, limit);
}
