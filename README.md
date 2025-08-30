# MCP Test Agent

A minimal Bun + TypeScript command‑line agent that uses the Model Context Protocol (via `mcp-use`) and a local Qdrant vector store for tool‑augmented LLM reasoning.

## Quick Start

Run (or have running) a local Qdrant instance before using the agent:

```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 -p 6334:6334 -v "$(pwd)/qdrant_storage:/qdrant/storage:z" qdrant/qdrant
```

Then install deps and ask a question (make sure env vars are set):

```bash
bun install
DEEPSEEK_API_KEY=your_key DEEPSEEK_MODEL=your_model bun run index.ts "What tools do you have?"
```

## Features

- Lazy‑initialized MCP agent with configurable max steps (default 8)
- Qdrant-backed memory (collection: `mcp-memory`)
- Pluggable LLM via LangChain `ChatOpenAI` (e.g. DeepSeek models)
- Strict env + config validation for predictable runs

## Project Structure

```
index.ts            # CLI entry
src/mcpAgent.ts     # Agent bootstrap & run helper
src/utils.ts        # Env + config helpers
mcp.config.json     # Declares MCP servers (currently Qdrant)
qdrant_storage/     # Local Qdrant data (ignored by git)
```

## Requirements

- Bun (https://bun.sh)
- Running Qdrant instance reachable at the URL in `mcp.config.json` (default `http://localhost:6333`)
- Node-compatible DeepSeek (or OpenAI‑style) endpoint + API key

## Environment Variables

| Variable            | Required | Description                                 |
| ------------------- | -------- | ------------------------------------------- |
| `DEEPSEEK_API_KEY`  | yes      | API key for the model endpoint              |
| `DEEPSEEK_MODEL`    | yes      | Model name passed to LangChain `ChatOpenAI` |
| `DEEPSEEK_BASE_URL` | optional | Override base URL (self-host / proxy)       |

Export them or place in a local dotenv file (not committed).

## Install deps

```
bun install
```

## Install uv (for running the Qdrant MCP server)

The `mcp.config.json` uses `uvx mcp-server-qdrant`. If you don't have `uv` installed yet:

```
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Then restart your shell (or source your profile) so `uv` is on PATH, and verify:

```
uv --version
uvx mcp-server-qdrant --help
```

(As always, review install scripts before piping to `sh` in security‑sensitive environments.)

## Run Qdrant with Docker

If you don't already have a local Qdrant running, start one via Docker (the data will persist in the `qdrant_storage/` folder which is git-ignored):

```
docker pull qdrant/qdrant
docker run \
  -p 6333:6333 \
  -p 6334:6334 \
  -v "$(pwd)/qdrant_storage:/qdrant/storage:z" \
  qdrant/qdrant
```

Notes:

- The final `qdrant/qdrant` in the run command is the image name (sometimes omitted by mistake).
- Port 6333 is REST/gRPC (auto), 6334 is for the distributed/raft communication; mapping both is handy.
- Use `:z` only on SELinux systems (Fedora/RHEL). On others you can omit it: `-v "$(pwd)/qdrant_storage:/qdrant/storage"`.

## Configure MCP Servers

Edit `mcp.config.json`. Current example:

```json
{
  "mcpServers": {
    "qdrant": {
      "command": "uvx",
      "args": ["mcp-server-qdrant"],
      "env": {
        "QDRANT_URL": "http://localhost:6333",
        "COLLECTION_NAME": "mcp-memory",
        "EMBEDDING_MODEL": "sentence-transformers/all-MiniLM-L6-v2"
      }
    }
  }
}
```

Ensure the Qdrant MCP server is installed (e.g. `uv tool install mcp-server-qdrant` or run via `uvx`).

## Run a Query

```
DEEPSEEK_API_KEY=your_key \
DEEPSEEK_MODEL=your_model \
DEEPSEEK_BASE_URL=https://api.deepseek.com \
bun run index.ts "What tools do you have available?"
```

(Leave `DEEPSEEK_BASE_URL` unset if using a default public endpoint.)

Shortcut scripts:

```
bun run ask "Your question"
# or with --mcp flag if you add logic for it later
bun run ask:mcp "Your question"
```

## Graceful Shutdown

If you add long-running flows, you can import and call `closeMCP()` to close sessions.

## Customizing

- Adjust `maxSteps` by passing `{ maxSteps: N }` to `runMCPAgent` call site (modify `index.ts` if needed)
- Add new MCP servers by extending the `mcpServers` object in `mcp.config.json`

## Troubleshooting

| Symptom                         | Likely Cause                    | Fix                             |
| ------------------------------- | ------------------------------- | ------------------------------- |
| Error: Missing required env var | Env not exported                | Set the variable before running |
| Invalid JSON in mcp.config.json | Trailing comma / syntax         | Fix JSON & retry                |
| Connection refused to Qdrant    | Qdrant not running or wrong URL | Start Qdrant / correct URL      |
| Empty or low-quality answers    | Wrong model name or key         | Verify env vars                 |

## Next Ideas

- Add a health command to list available MCP tools
- Provide Docker compose for Qdrant
- Add tests (e.g., config loader validation)
- Add embedding ingestion script

## License

Private / unreleased. Add a license file if distributing.
