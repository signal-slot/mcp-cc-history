import { readFile } from "node:fs/promises";
import { PATHS } from "../utils/path.js";
import type { Settings } from "../types.js";

export async function loadSettings(): Promise<Settings> {
  const raw = await readFile(PATHS.settings, "utf-8");
  return JSON.parse(raw) as Settings;
}
