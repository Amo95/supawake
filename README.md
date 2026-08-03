# supawake

Keep your free-tier Supabase projects from auto-pausing. `supawake` is a tiny CLI that pings the Supabase REST API on a schedule so your databases stay warm.

Supabase pauses free-tier projects after ~7 days of inactivity. `supawake` prevents that with a single scheduled HTTP request — run it locally, in a cron job, or as a GitHub Action.

## Install

```bash
npm install -g supawake
```

Or run without installing:

```bash
npx supawake ping
```

Requires Node.js 18+ (uses the built-in `fetch`).

## Quick start

```bash
# 1. Add a project (interactive)
supawake add

# 2. Verify it's reachable
supawake status

# 3. Ping once
supawake ping

# 4. Or run continuously on a schedule
supawake start --interval "0 0 */3 * *"
```

## Commands

| Command | Description |
|---|---|
| `supawake add` | Interactively add a Supabase project (name, URL, anon key, keepalive table) |
| `supawake remove <name>` | Remove a project by name |
| `supawake list` | List all configured projects |
| `supawake ping` | Ping all projects once and exit |
| `supawake start [--interval <cron>]` | Continuously ping projects on a cron schedule |
| `supawake status` | Check which projects are currently reachable |

### `supawake start`

Starts a long-running process that pings every project according to the given cron expression. Defaults to the value in `settings.defaultInterval` (every 3 days at midnight: `0 0 */3 * *`).

```bash
supawake start                         # use default schedule from config
supawake start -i "*/30 * * * *"       # every 30 minutes
supawake start -i "0 */12 * * *"       # every 12 hours
```

## How pings work

For each project with a `table` configured, `supawake` sends an HTTP `GET` to:

```
https://<your-ref>.supabase.co/rest/v1/<table>?select=*&limit=1
```

…with your anon key in the `apikey` and `Authorization: Bearer …` headers. A **200** response means the project is alive. Anything else is reported as a failure. An empty result (`[]`) still counts as success — the query ran, which is the whole point.

**Why a table read specifically.** Supabase pauses free-tier projects based on *database* inactivity. This request goes through PostgREST to Postgres, which evaluates your row-level security policies inside the database — real activity that resets the timer. Endpoints like `/auth/v1/health` return a 200 without ever querying Postgres, so pinging them produces a green check while the database still pauses.

The table must actually exist. A nonexistent name returns `PGRST205` straight from PostgREST's in-memory schema cache without reaching the database.

If a project has **no** `table` set, supawake falls back to `GET /auth/v1/health`. That confirms the project responds but will **not** prevent auto-pause, and every ping prints a warning saying so.

The anon key is safe for this purpose — it's the same key you ship in client apps. Row-level security still protects your data.

### Setting up a keepalive table

If you'd rather not expose an existing table, create a dedicated one. Run this in the Supabase dashboard under **SQL Editor**, once per project:

```sql
create table if not exists public.keepalive (
  id         smallint primary key default 1,
  pinged_at  timestamptz not null default now()
);

insert into public.keepalive (id) values (1) on conflict do nothing;

alter table public.keepalive enable row level security;

create policy "anon can read keepalive"
  on public.keepalive
  for select
  to anon
  using (true);
```

It holds one meaningless row and grants anon `select` only — no insert, update, or delete.

## Retries

A single DNS hiccup or cold edge node shouldn't page you. Each ping is retried up to twice (after 500 ms, then 2 s) before being reported as a failure. Retries apply to network errors, timeouts, and `5xx` responses. Authentication failures like `401` are **not** retried — those never fix themselves. When a ping needed more than one attempt, the count is shown in the output.

## Configuration

Configuration lives at `~/.config/supawake/config.json`:

```json
{
  "projects": [
    {
      "name": "anyigba",
      "url": "https://xyz.supabase.co",
      "anonKey": "eyJ...",
      "table": "keepalive"
    }
  ],
  "settings": {
    "defaultInterval": "0 0 */3 * *",
    "notifications": {
      "enabled": false,
      "webhookUrl": ""
    }
  }
}
```

### Notifications (optional)

Set `notifications.enabled` to `true` and provide a `webhookUrl` (Slack-compatible) to receive a simple `{ text: "…" }` POST whenever one or more pings fail.

## Running on GitHub Actions

The most reliable way to keep your projects alive is to let GitHub run `supawake ping` on a schedule. Save the following as `.github/workflows/supawake.yml`:

```yaml
name: supawake

on:
  schedule:
    # Every 3 days at 06:00 UTC
    - cron: '0 6 */3 * *'
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install supawake
        run: npm install -g supawake

      - name: Write config from secret
        run: |
          mkdir -p "$HOME/.config/supawake"
          echo "$SUPAWAKE_CONFIG" > "$HOME/.config/supawake/config.json"
        env:
          SUPAWAKE_CONFIG: ${{ secrets.SUPAWAKE_CONFIG }}

      - name: Ping all projects
        run: supawake ping
```

Then in your repo settings, add a secret called `SUPAWAKE_CONFIG` containing the full JSON contents of your `~/.config/supawake/config.json`.

## Development

```bash
git clone <this repo>
cd supawake
npm install
npm run build
node dist/index.js --help
```

Scripts:

- `npm run build` — compile TypeScript to `dist/`
- `npm run dev` — watch mode
- `npm run lint` — ESLint
- `npm run format` — Prettier

## License

MIT
