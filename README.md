# MCP Vector Agent

An intelligent AI-powered business assistant that integrates the Model Context Protocol (MCP) with LLMs and Telegram. It provides tool-augmented reasoning with access to e-commerce operations (orders, inventory, shipping) and optional vector search capabilities via Qdrant or SQLite backends.

## Quick Start

### Prerequisites

- Node.js/Bun runtime
- Docker (for running Qdrant or databases)
- Environment variables configured (see [Environment Variables](#environment-variables) section)

### Run with Docker Compose

```bash
docker-compose up
```

This will start all required services (Qdrant, databases, etc.).

### Run Telegram Bot

```bash
bun install
DEEPSEEK_API_KEY=your_key DEEPSEEK_MODEL=your_model bun run src/startTelegram.ts
```

### Run CLI Agent

```bash
bun install
DEEPSEEK_API_KEY=your_key DEEPSEEK_MODEL=your_model bun run src/start.ts
```

## Features

- **Telegram Integration** - Chat with the agent via Telegram bot
- **MCP Protocol Support** - Configurable MCP servers for extensible tool access
- **Multiple Backend Options** - SQLite for e-commerce data or Qdrant for vector search
- **E-Commerce Operations** - Manage orders, inventory, and shipping costs
- **Chat History** - Maintains conversation context
- **Structured Output** - LLM-generated structured responses
- **Lazy-initialized MCP Agent** - Configurable max steps (default 8)
- **Pluggable LLM** - Support for OpenAI-compatible endpoints (e.g., DeepSeek)

## Project Structure

```
src/
  ├── start.ts                      # CLI entry point
  ├── startTelegram.ts              # Telegram bot entry point
  ├── constants.ts                  # Application constants
  ├── prompts.ts                    # LLM prompts
  ├── mcpConfig/
  │   ├── mcp.config.json          # Default MCP configuration
  │   ├── mcp.config.qdrant.json   # Qdrant vector store config
  │   └── mcp.config.sqlite.json   # SQLite backend config
  ├── services/
  │   ├── llmService.ts            # LLM interface (DeepSeek, OpenAI-compatible)
  │   ├── mcpService.ts            # MCP protocol handler
  │   ├── telegramService.ts       # Telegram bot integration
  │   ├── chatHistorySQLite.ts     # Chat history persistence
  │   ├── OrdersSQLite.ts          # Orders management
  │   ├── inventory.SQLite.ts      # Inventory management
  │   ├── structuredOutputService.ts # Output formatting
  ├── seedScripts/
  │   ├── seedInventorySQLite.ts   # Seed inventory data
  │   ├── seedQdrant.ts            # Seed vector embeddings
  │   └── seedShippingCostSQLite.ts # Seed shipping costs
  └── types/
      └── Order.ts                 # Order data model
docker-compose.yml                  # Docker services setup
package.json                        # Dependencies
tsconfig.json                       # TypeScript configuration
```

## Requirements

- Node.js 18+ or Bun (https://bun.sh)
- Docker (for running services via docker-compose)
- LLM API key (DeepSeek, OpenAI, or compatible endpoint)
- For Qdrant: Running instance reachable at the URL in MCP config
- For SQLite: Local SQLite databases (auto-created or seeded)

## Environment Variables

| Variable             | Required | Description                                      |
| -------------------- | -------- | ------------------------------------------------ |
| `DEEPSEEK_API_KEY`   | yes      | API key for the LLM endpoint                     |
| `DEEPSEEK_MODEL`     | yes      | Model name (e.g., `deepseek-chat`)               |
| `DEEPSEEK_BASE_URL`  | optional | Override LLM base URL (default: DeepSeek public) |
| `TELEGRAM_BOT_TOKEN` | optional | Telegram bot token (required for Telegram mode)  |

Export them or place in a `.env` file (not committed).

## Installation

```bash
bun install
```

## Database Setup

### With Docker Compose

```bash
docker-compose up
```

This starts all services and creates necessary databases.

### Manual Setup

#### Seed Inventory & Shipping (SQLite)

```bash
bun run src/seedScripts/seedInventorySQLite.ts
bun run src/seedScripts/seedShippingCostSQLite.ts
```

#### Seed Vector Embeddings (Qdrant)

```bash
bun run src/seedScripts/seedQdrant.ts
```

## Configure MCP Servers

Choose a configuration based on your backend:

### SQLite (Default)

```bash
cp src/mcpConfig/mcp.config.sqlite.json src/mcpConfig/mcp.config.json
```

### Qdrant Vector Store

```bash
cp src/mcpConfig/mcp.config.qdrant.json src/mcpConfig/mcp.config.json
```

Edit `src/mcpConfig/mcp.config.json` to customize endpoints and settings.

## Run

### Telegram Bot

```bash
DEEPSEEK_API_KEY=your_key \
DEEPSEEK_MODEL=deepseek-chat \
TELEGRAM_BOT_TOKEN=your_token \
bun run src/startTelegram.ts
```

Then send messages to your Telegram bot.

### CLI Agent

```bash
DEEPSEEK_API_KEY=your_key \
DEEPSEEK_MODEL=deepseek-chat \
bun run src/start.ts
```

## Graceful Shutdown

The application handles graceful shutdown of MCP sessions and database connections. Pressing Ctrl+C will clean up resources.

## Customizing

- **Switch Backends** - Copy the desired MCP config (SQLite or Qdrant) to `src/mcpConfig/mcp.config.json`
- **Add New Tools** - Extend `mcpServers` in the MCP config file
- **Adjust Agent Steps** - Modify `maxSteps` in the agent initialization
- **Seed Data** - Customize seed scripts in `src/seedScripts/` to add your own data

## Troubleshooting

| Symptom                         | Likely Cause                   | Fix                                      |
| ------------------------------- | ------------------------------ | ---------------------------------------- |
| Error: Missing required env var | Env not set                    | Set env vars or create `.env` file       |
| Invalid JSON in MCP config      | Syntax error in config         | Check JSON syntax and fix                |
| Connection refused to database  | Service not running            | Run `docker-compose up` or start service |
| Telegram bot not responding     | Missing `TELEGRAM_BOT_TOKEN`   | Set bot token env var                    |
| Empty or low-quality answers    | Wrong model or invalid API key | Verify LLM credentials                   |

## Next Ideas

- Add health check endpoint for service status
- Expand e-commerce features (payments, refunds, returns)
- Add more vector search capabilities
- Implement user authentication for Telegram bot
- Add comprehensive test suite
- Support additional LLM providers

## License

Private / unreleased. Add a license file if distributing.
