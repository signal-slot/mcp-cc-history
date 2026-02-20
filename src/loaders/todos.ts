import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { PATHS } from "../utils/path.js";
import { paginate } from "../utils/pagination.js";
import type { TodoItem, TodoFile, PaginatedResult } from "../types.js";

let cache: TodoFile[] | null = null;

async function loadAllTodos(): Promise<TodoFile[]> {
  if (cache) return cache;

  let files: string[];
  try {
    files = await readdir(PATHS.todos);
  } catch {
    return [];
  }

  const result: TodoFile[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    try {
      const raw = await readFile(join(PATHS.todos, f), "utf-8");
      const parsed = JSON.parse(raw);
      const items: TodoItem[] = Array.isArray(parsed) ? parsed : [];
      result.push({ filename: f, items });
    } catch {
      // skip malformed files
    }
  }
  cache = result;
  return result;
}

export function invalidateTodoCache(): void {
  cache = null;
}

export async function searchTodos(
  query?: string,
  status?: string,
  limit = 50,
  offset = 0,
): Promise<PaginatedResult<TodoItem & { filename: string }>> {
  const all = await loadAllTodos();
  const q = query?.toLowerCase();

  const items: (TodoItem & { filename: string })[] = [];
  for (const file of all) {
    for (const item of file.items) {
      if (q && !item.content.toLowerCase().includes(q)) continue;
      if (status && item.status !== status) continue;
      items.push({ ...item, filename: file.filename });
    }
  }
  return paginate(items, offset, limit);
}
