import { createReadStream } from "node:fs";
import { readdir, realpath } from "node:fs/promises";
import { createInterface } from "node:readline";
import { join } from "node:path";
import { PATHS } from "../utils/path.js";

interface DebugMatch {
  file: string;
  line: number;
  text: string;
}

export async function searchDebugLogs(
  sessionId?: string,
  query?: string,
  tailLines?: number,
  limit = 100,
): Promise<DebugMatch[]> {
  let files: string[];

  if (sessionId) {
    // Search specific session's debug log
    const candidate = join(PATHS.debug, `${sessionId}.txt`);
    files = [candidate];
  } else {
    // Search latest debug log
    try {
      const latestPath = join(PATHS.debug, "latest");
      const resolved = await realpath(latestPath);
      files = [resolved];
    } catch {
      // fallback: list all debug files
      try {
        const all = await readdir(PATHS.debug);
        files = all
          .filter((f) => f.endsWith(".txt"))
          .map((f) => join(PATHS.debug, f));
      } catch {
        return [];
      }
    }
  }

  const matches: DebugMatch[] = [];

  for (const filePath of files) {
    try {
      if (tailLines && !query) {
        // tail mode: read last N lines
        const lines = await readTailLines(filePath, tailLines);
        for (let i = 0; i < lines.length; i++) {
          matches.push({ file: filePath, line: i + 1, text: lines[i] });
        }
      } else {
        // streaming search
        await streamSearch(filePath, query, limit - matches.length, matches);
      }
    } catch {
      // file not found
    }
    if (matches.length >= limit) break;
  }

  return matches.slice(0, limit);
}

async function streamSearch(
  filePath: string,
  query: string | undefined,
  maxResults: number,
  results: DebugMatch[],
): Promise<void> {
  const q = query?.toLowerCase();

  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, { encoding: "utf-8" });
    const rl = createInterface({ input: stream, crlfDelay: Infinity });

    let lineNum = 0;
    rl.on("line", (line) => {
      lineNum++;
      if (!q || line.toLowerCase().includes(q)) {
        results.push({ file: filePath, line: lineNum, text: line });
        if (results.length >= maxResults) {
          rl.close();
          stream.destroy();
        }
      }
    });
    rl.on("close", resolve);
    rl.on("error", reject);
    stream.on("error", reject);
  });
}

async function readTailLines(
  filePath: string,
  n: number,
): Promise<string[]> {
  const lines: string[] = [];

  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, { encoding: "utf-8" });
    const rl = createInterface({ input: stream, crlfDelay: Infinity });

    rl.on("line", (line) => {
      lines.push(line);
      if (lines.length > n) lines.shift();
    });
    rl.on("close", () => resolve(lines));
    rl.on("error", reject);
    stream.on("error", reject);
  });
}
