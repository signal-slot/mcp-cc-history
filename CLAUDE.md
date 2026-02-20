# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

An MCP (Model Context Protocol) server that provides keyword search across all `~/.claude/` data — conversation history, plans, todos, tasks, teams, debug logs, stats, projects, and settings. Registered in `~/.claude.json` and used directly from Claude Code sessions.

## Build & Run

```bash
npm run build    # tsc → dist/
npm start        # node dist/index.js (stdio transport)
```

No tests or linter configured. Verify manually by piping JSON-RPC to stdin:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node dist/index.js
```

## Architecture

ESM TypeScript project (`"type": "module"`). All imports use `.js` extensions.

**`src/index.ts`** — Entry point. Creates `McpServer`, registers all 11 tools with Zod schemas, connects via `StdioServerTransport`. Each tool handler calls a loader function and returns `JSON.stringify`'d results.

**`src/loaders/`** — One file per data source. Each exports async functions that read from `~/.claude/`. Key performance constraints:
- `history.ts` — Parses `history.jsonl` with mtime-based cache (reload only when file changes)
- `plans.ts` — Per-file mtime cache for `plans/*.md`
- `todos.ts`, `tasks.ts` — In-memory cache with `invalidate*Cache()` exports
- `debug.ts` — **Streaming only** via `readline` (files can be 300MB+). Never loads full file into memory
- `projects.ts` — Reads only `sessions-index.json` metadata. **Never** reads session JSONL files (total 1.3GB+)
- `settings.ts`, `stats.ts` — Small files, read on demand

**`src/search/index.ts`** — `searchAll()` coordinator. Runs loader searches in parallel via `Promise.all`, distributes per-source limits evenly.

**`src/types.ts`** — All shared interfaces. Mirrors the actual JSON structures in `~/.claude/`.

**`src/utils/`** — `path.ts` (PATHS constants), `pagination.ts` (generic paginate helper), `date.ts` (date range filters).

## MCP Registration

Registered via CLI:
```bash
claude mcp add cc-claude-history -s user -- npx mcp-cc-history
```
