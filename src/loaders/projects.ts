import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { PATHS } from "../utils/path.js";
import type { SessionsIndex, SessionEntry } from "../types.js";

interface ProjectInfo {
  dirName: string;
  originalPath?: string;
  sessionCount: number;
}

export async function listProjects(
  query?: string,
): Promise<ProjectInfo[]> {
  let dirs: string[];
  try {
    dirs = await readdir(PATHS.projects);
  } catch {
    return [];
  }

  const q = query?.toLowerCase();
  const projects: ProjectInfo[] = [];

  for (const d of dirs) {
    const indexPath = join(PATHS.projects, d, "sessions-index.json");
    let originalPath: string | undefined;
    let sessionCount = 0;

    try {
      const raw = await readFile(indexPath, "utf-8");
      const index = JSON.parse(raw) as SessionsIndex;
      originalPath = index.originalPath;
      sessionCount = index.entries.length;
    } catch {
      // no sessions-index
    }

    const searchStr = `${d} ${originalPath ?? ""}`.toLowerCase();
    if (q && !searchStr.includes(q)) continue;

    projects.push({ dirName: d, originalPath, sessionCount });
  }

  return projects;
}

export async function getProjectSessions(
  project: string,
  limit = 20,
): Promise<{ originalPath?: string; sessions: SessionEntry[] }> {
  // Find project dir - try exact match or search
  let dirs: string[];
  try {
    dirs = await readdir(PATHS.projects);
  } catch {
    return { sessions: [] };
  }

  const matchDir = dirs.find(
    (d) => d === project || d.includes(project),
  );
  if (!matchDir) return { sessions: [] };

  const indexPath = join(PATHS.projects, matchDir, "sessions-index.json");
  try {
    const raw = await readFile(indexPath, "utf-8");
    const index = JSON.parse(raw) as SessionsIndex;
    // Sort by modified descending
    const sorted = [...index.entries].sort(
      (a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime(),
    );
    return {
      originalPath: index.originalPath,
      sessions: sorted.slice(0, limit),
    };
  } catch {
    return { sessions: [] };
  }
}
