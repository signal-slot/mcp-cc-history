# mcp-cc-history

An MCP (Model Context Protocol) server that provides keyword search across all `~/.claude/` data — conversation history, plans, todos, tasks, teams, debug logs, stats, projects, and settings.

## Install

```bash
claude mcp add cc-claude-history -s user -- npx mcp-cc-history
```

## Tools

| Tool | Description |
|------|-------------|
| `search_history` | Search conversation history in `~/.claude/history.jsonl` |
| `search_plans` | Full-text search plan documents in `~/.claude/plans/` |
| `search_todos` | Search TODO items in `~/.claude/todos/` |
| `search_tasks` | Search team tasks in `~/.claude/tasks/` |
| `list_teams` | List team configurations from `~/.claude/teams/` |
| `search_debug_logs` | Stream-search debug logs in `~/.claude/debug/` |
| `get_activity_stats` | Get daily activity statistics from `~/.claude/stats-cache.json` |
| `list_projects` | List projects from `~/.claude/projects/` |
| `get_project_sessions` | Get session details for a project |
| `get_settings` | Show Claude Code settings from `~/.claude/settings.json` |
| `search_all` | Cross-source search across all Claude Code data |

## License

ISC
