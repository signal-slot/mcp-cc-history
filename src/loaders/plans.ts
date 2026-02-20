import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { PATHS } from "../utils/path.js";
import type { PlanEntry } from "../types.js";

const fileCache = new Map<string, { mtime: number; entry: PlanEntry }>();

async function loadAllPlans(): Promise<PlanEntry[]> {
  let files: string[];
  try {
    files = await readdir(PATHS.plans);
  } catch {
    return [];
  }

  const entries: PlanEntry[] = [];
  for (const f of files) {
    if (!f.endsWith(".md")) continue;
    const fp = join(PATHS.plans, f);
    const st = await stat(fp);
    const cached = fileCache.get(f);
    if (cached && cached.mtime === st.mtimeMs) {
      entries.push(cached.entry);
      continue;
    }
    const content = await readFile(fp, "utf-8");
    const entry: PlanEntry = { filename: f, content, mtime: st.mtimeMs };
    fileCache.set(f, { mtime: st.mtimeMs, entry });
    entries.push(entry);
  }
  return entries;
}

export async function searchPlans(
  query?: string,
  limit = 20,
): Promise<PlanEntry[]> {
  const all = await loadAllPlans();
  if (!query) return all.slice(0, limit);

  const q = query.toLowerCase();
  const matched = all.filter(
    (p) =>
      p.content.toLowerCase().includes(q) ||
      p.filename.toLowerCase().includes(q),
  );
  return matched.slice(0, limit);
}
