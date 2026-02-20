import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { PATHS } from "../utils/path.js";
import type { TeamConfig } from "../types.js";

export async function listTeams(
  teamName?: string,
): Promise<TeamConfig[]> {
  let dirs: string[];
  try {
    dirs = await readdir(PATHS.teams);
  } catch {
    return [];
  }

  if (teamName) {
    dirs = dirs.filter((d) => d === teamName);
  }

  const configs: TeamConfig[] = [];
  for (const d of dirs) {
    const configPath = join(PATHS.teams, d, "config.json");
    try {
      const raw = await readFile(configPath, "utf-8");
      configs.push(JSON.parse(raw) as TeamConfig);
    } catch {
      // skip dirs without config.json
    }
  }
  return configs;
}
