import { homedir } from "node:os";
import { join } from "node:path";

const CLAUDE_DIR = join(homedir(), ".claude");

export const PATHS = {
  root: CLAUDE_DIR,
  history: join(CLAUDE_DIR, "history.jsonl"),
  plans: join(CLAUDE_DIR, "plans"),
  todos: join(CLAUDE_DIR, "todos"),
  tasks: join(CLAUDE_DIR, "tasks"),
  teams: join(CLAUDE_DIR, "teams"),
  debug: join(CLAUDE_DIR, "debug"),
  statsCache: join(CLAUDE_DIR, "stats-cache.json"),
  projects: join(CLAUDE_DIR, "projects"),
  settings: join(CLAUDE_DIR, "settings.json"),
} as const;
