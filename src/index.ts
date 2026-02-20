#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { searchHistory } from "./loaders/history.js";
import { searchPlans } from "./loaders/plans.js";
import { searchTodos } from "./loaders/todos.js";
import { searchTasks } from "./loaders/tasks.js";
import { listTeams } from "./loaders/teams.js";
import { searchDebugLogs } from "./loaders/debug.js";
import { getActivityStats, loadStats } from "./loaders/stats.js";
import { listProjects, getProjectSessions } from "./loaders/projects.js";
import { loadSettings } from "./loaders/settings.js";
import { searchAll } from "./search/index.js";

const server = new McpServer({
  name: "cc-claude-history",
  version: "1.0.0",
});

// --- search_history ---
server.tool(
  "search_history",
  "Search conversation history in ~/.claude/history.jsonl",
  {
    query: z.string().optional().describe("Keyword to search in conversation display text"),
    project: z.string().optional().describe("Filter by project path"),
    startDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    endDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
    limit: z.number().optional().default(50).describe("Max results"),
    offset: z.number().optional().default(0).describe("Pagination offset"),
  },
  async ({ query, project, startDate, endDate, limit, offset }) => {
    const result = await searchHistory(query, project, startDate, endDate, limit, offset);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

// --- search_plans ---
server.tool(
  "search_plans",
  "Full-text search plan documents in ~/.claude/plans/",
  {
    query: z.string().optional().describe("Keyword to search in plan content"),
    limit: z.number().optional().default(20).describe("Max results"),
  },
  async ({ query, limit }) => {
    const plans = await searchPlans(query, limit);
    const summary = plans.map((p) => ({
      filename: p.filename,
      preview: p.content.slice(0, 500),
      size: p.content.length,
    }));
    return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
  },
);

// --- search_todos ---
server.tool(
  "search_todos",
  "Search TODO items in ~/.claude/todos/",
  {
    query: z.string().optional().describe("Keyword to search in todo content"),
    status: z.string().optional().describe("Filter by status: pending, in_progress, completed"),
    limit: z.number().optional().default(50).describe("Max results"),
    offset: z.number().optional().default(0).describe("Pagination offset"),
  },
  async ({ query, status, limit, offset }) => {
    const result = await searchTodos(query, status, limit, offset);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

// --- search_tasks ---
server.tool(
  "search_tasks",
  "Search team tasks in ~/.claude/tasks/",
  {
    query: z.string().optional().describe("Keyword to search in task subject/description"),
    status: z.string().optional().describe("Filter by status: pending, in_progress, completed"),
    teamName: z.string().optional().describe("Filter by team name"),
    limit: z.number().optional().default(50).describe("Max results"),
  },
  async ({ query, status, teamName, limit }) => {
    const tasks = await searchTasks(query, status, teamName, limit);
    return { content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }] };
  },
);

// --- list_teams ---
server.tool(
  "list_teams",
  "List team configurations from ~/.claude/teams/",
  {
    teamName: z.string().optional().describe("Filter by specific team name"),
  },
  async ({ teamName }) => {
    const teams = await listTeams(teamName);
    return { content: [{ type: "text", text: JSON.stringify(teams, null, 2) }] };
  },
);

// --- search_debug_logs ---
server.tool(
  "search_debug_logs",
  "Stream-search debug logs in ~/.claude/debug/. Large files are streamed, not loaded into memory.",
  {
    sessionId: z.string().optional().describe("Session UUID to search specific debug log"),
    query: z.string().optional().describe("Keyword to search in log lines"),
    tailLines: z.number().optional().describe("Show last N lines (no query needed)"),
    limit: z.number().optional().default(100).describe("Max matching lines"),
  },
  async ({ sessionId, query, tailLines, limit }) => {
    const matches = await searchDebugLogs(sessionId, query, tailLines, limit);
    return { content: [{ type: "text", text: JSON.stringify(matches, null, 2) }] };
  },
);

// --- get_activity_stats ---
server.tool(
  "get_activity_stats",
  "Get daily activity statistics from ~/.claude/stats-cache.json",
  {
    startDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    endDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
  },
  async ({ startDate, endDate }) => {
    const activities = await getActivityStats(startDate, endDate);
    const stats = await loadStats();
    const result = {
      dailyActivity: activities,
      summary: {
        totalSessions: stats.totalSessions,
        totalMessages: stats.totalMessages,
        firstSessionDate: stats.firstSessionDate,
        lastComputedDate: stats.lastComputedDate,
      },
    };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

// --- list_projects ---
server.tool(
  "list_projects",
  "List projects from ~/.claude/projects/",
  {
    query: z.string().optional().describe("Filter projects by name/path"),
  },
  async ({ query }) => {
    const projects = await listProjects(query);
    return { content: [{ type: "text", text: JSON.stringify(projects, null, 2) }] };
  },
);

// --- get_project_sessions ---
server.tool(
  "get_project_sessions",
  "Get session details for a project from sessions-index.json",
  {
    project: z.string().describe("Project directory name or partial match"),
    limit: z.number().optional().default(20).describe("Max sessions to return"),
  },
  async ({ project, limit }) => {
    const result = await getProjectSessions(project, limit);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

// --- get_settings ---
server.tool(
  "get_settings",
  "Show Claude Code settings from ~/.claude/settings.json",
  {},
  async () => {
    const settings = await loadSettings();
    return { content: [{ type: "text", text: JSON.stringify(settings, null, 2) }] };
  },
);

// --- search_all ---
server.tool(
  "search_all",
  "Cross-source search across all Claude Code data (history, plans, todos, tasks, debug, projects)",
  {
    query: z.string().describe("Keyword to search across all sources"),
    sources: z
      .array(z.string())
      .optional()
      .describe("Limit to specific sources: history, plans, todos, tasks, debug, projects"),
    limit: z.number().optional().default(30).describe("Max total results"),
  },
  async ({ query, sources, limit }) => {
    const results = await searchAll(query, sources, limit);
    return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
  },
);

// --- Start server ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});
