<div align="center">

# CRY (Claude Remote YOLO)

A TypeScript wrapper around the Claude CLI that always runs remote-control with bypass permissions.

[![npm version](https://img.shields.io/npm/v/claude-remote-yolo)](https://www.npmjs.com/package/claude-remote-yolo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)]()

</div>

## What it does

Every invocation is normalized to:

```bash
claude remote-control --permission-mode bypassPermissions
```

On first run, the wrapper asks for consent once and persists the decision to `~/.claude-remote-yolo-state.json`.

## Installation

> **Prerequisite:** The `claude` CLI must be available on your system.

### Global install

```bash
# npm
npm install -g claude-remote-yolo

# pnpm
pnpm add -g claude-remote-yolo
```

### Run directly with npx

```bash
npx claude-remote-yolo "summarize this repository"
```

## Usage

```bash
# Basic usage
claude-remote-yolo "summarize this repository"

# With --yolo flag (accepted for compatibility, ignored)
claude-remote-yolo --yolo "summarize this repository"

# Help
claude-remote-yolo --help
```

### Alias — Run with `cry`

After installing globally, you can register a `cry` alias for quick access.

#### macOS / Linux

Add an alias to your shell config:

```bash
# Bash
echo 'alias cry="claude-remote-yolo"' >> ~/.bashrc && source ~/.bashrc

# Zsh
echo 'alias cry="claude-remote-yolo"' >> ~/.zshrc && source ~/.zshrc
```

#### Windows (PowerShell)

Add a function to your PowerShell profile:

```powershell
# Create profile if it doesn't exist
if (!(Test-Path -Path $PROFILE)) { New-Item -ItemType File -Path $PROFILE -Force }

# Register the alias
Add-Content -Path $PROFILE -Value 'function cry { claude-remote-yolo @args }'
```

> Open a new terminal and you're good to go: `cry "summarize this repository"`

## Development

```bash
# Install dependencies
pnpm install

# Run all checks (lint + test + build)
pnpm check

# Run locally
node dist/bin.js "summarize this repository"
```

### Scripts

| Command | Description |
|---|---|
| `pnpm build` | Build with tsup (CJS, Node 20) |
| `pnpm lint` | ESLint with zero warnings |
| `pnpm test` | Vitest with coverage |
| `pnpm check` | Full pipeline: file-lines check → lint → test → build |

### Quality Gates

- ESLint — zero warnings allowed
- Vitest — 100% coverage (lines, functions, statements, branches)
- File line limit — 450 lines max per file
- Pre-commit hook — runs `pnpm check` via [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks)

## Design Decisions

- Wraps the public Claude CLI command — no patching of Claude's installed source files
- `--yolo` flag is accepted for compatibility and silently ignored
- Consent state is persisted per-user, not per-project

## License

[MIT](LICENSE)
