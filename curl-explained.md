# Curl Command Explained

```bash
curl -v -H "apikey: <your-key>" https://<ref>.supabase.co/rest/v1/ 2>&1 | tail -20
```

## Breakdown

| Part | Meaning |
|---|---|
| `curl` | Command-line tool to make HTTP requests |
| `-v` | Verbose mode — shows full request/response headers, not just the body |
| `-H "apikey: ..."` | Adds a custom HTTP header. Supabase uses the `apikey` header for authentication |
| `https://...supabase.co/rest/v1/` | The Supabase REST API endpoint for a project |
| `2>&1` | Redirects stderr into stdout (merges both streams) |
| `| tail -20` | Shows only the last 20 lines of combined output |

## What are file descriptors 1 and 2?

In Unix/Linux shells, every process has standard I/O streams identified by numbers:

- **`0`** = stdin (standard input)
- **`1`** = stdout (standard output — normal output)
- **`2`** = stderr (standard error — errors, debug info)

`2>&1` means "redirect file descriptor 2 (stderr) into file descriptor 1 (stdout)."

## Why is this needed here?

`curl -v` prints verbose debug info (headers, TLS handshake, etc.) to **stderr**, and the response body to **stdout**. Without `2>&1`, piping to `tail -20` would only filter stdout — the verbose noise from stderr would still flood the screen separately.

By merging them with `2>&1`, the entire output flows through `tail -20`, giving you just the last 20 lines (typically the response headers and body — the part you actually care about).
