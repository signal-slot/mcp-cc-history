import { searchHistory } from "../loaders/history.js";
import { searchPlans } from "../loaders/plans.js";
import { searchTodos } from "../loaders/todos.js";
import { searchTasks } from "../loaders/tasks.js";
import { searchDebugLogs } from "../loaders/debug.js";
import { listProjects } from "../loaders/projects.js";
import type { SearchMatch } from "../types.js";

const ALL_SOURCES = [
  "history",
  "plans",
  "todos",
  "tasks",
  "debug",
  "projects",
] as const;
type Source = (typeof ALL_SOURCES)[number];

export async function searchAll(
  query: string,
  sources?: string[],
  limit = 10,
): Promise<SearchMatch[]> {
  const activeSources: Source[] = sources
    ? (sources.filter((s) => ALL_SOURCES.includes(s as Source)) as Source[])
    : [...ALL_SOURCES];

  const results: SearchMatch[] = [];
  const perSourceLimit = Math.max(3, Math.ceil(limit / activeSources.length));

  const promises: Promise<void>[] = [];

  for (const source of activeSources) {
    switch (source) {
      case "history":
        promises.push(
          searchHistory(query, undefined, undefined, undefined, perSourceLimit).then(
            (r) => {
              for (const item of r.items) {
                results.push({
                  source: "history",
                  item: {
                    display: item.display,
                    timestamp: item.timestamp,
                    project: item.project,
                    sessionId: item.sessionId,
                  },
                  matchContext: item.display.slice(0, 200),
                });
              }
            },
          ),
        );
        break;
      case "plans":
        promises.push(
          searchPlans(query, perSourceLimit).then((plans) => {
            for (const p of plans) {
              const idx = p.content.toLowerCase().indexOf(query.toLowerCase());
              const start = Math.max(0, idx - 50);
              const end = Math.min(p.content.length, idx + query.length + 100);
              results.push({
                source: "plans",
                item: { filename: p.filename },
                matchContext: p.content.slice(start, end),
              });
            }
          }),
        );
        break;
      case "todos":
        promises.push(
          searchTodos(query, undefined, perSourceLimit).then((r) => {
            for (const item of r.items) {
              results.push({
                source: "todos",
                item,
                matchContext: item.content.slice(0, 200),
              });
            }
          }),
        );
        break;
      case "tasks":
        promises.push(
          searchTasks(query, undefined, undefined, perSourceLimit).then(
            (tasks) => {
              for (const t of tasks) {
                results.push({
                  source: "tasks",
                  item: { teamName: t.teamName, ...t.task },
                  matchContext: `${t.task.subject}: ${t.task.description?.slice(0, 150) ?? ""}`,
                });
              }
            },
          ),
        );
        break;
      case "debug":
        promises.push(
          searchDebugLogs(undefined, query, undefined, perSourceLimit).then(
            (matches) => {
              for (const m of matches) {
                results.push({
                  source: "debug",
                  item: m,
                  matchContext: m.text.slice(0, 200),
                });
              }
            },
          ),
        );
        break;
      case "projects":
        promises.push(
          listProjects(query).then((projects) => {
            for (const p of projects.slice(0, perSourceLimit)) {
              results.push({
                source: "projects",
                item: p,
                matchContext: p.originalPath ?? p.dirName,
              });
            }
          }),
        );
        break;
    }
  }

  await Promise.all(promises);
  return results.slice(0, limit);
}
