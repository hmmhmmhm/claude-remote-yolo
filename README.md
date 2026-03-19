# claude-remote-yolo

A TypeScript wrapper around the Claude CLI for a persisted safe or yolo workflow.

## Usage

Default yolo mode runs this command shape:

```bash
claude remote-control --permission-mode bypassPermissions
```

The wrapper keeps a saved mode and supports temporary overrides:

```bash
claude-remote-yolo mode
claude-remote-yolo mode yolo
claude-remote-yolo mode safe
claude-remote-yolo --safe
claude-remote-yolo --yolo "summarize this repository"
```

Yolo mode asks for consent once before it first runs the bypass command and stores that decision in a local state file under the user's home directory.

## Local Development

```bash
pnpm install
pnpm check
node dist/bin.js mode
node dist/bin.js --yolo "summarize this repository"
```

## Design Notes

- This project intentionally wraps the public Claude CLI command instead of patching Claude's installed source files.
- Safe mode forwards arguments directly to `claude`.
- Yolo mode normalizes execution to `claude remote-control --permission-mode bypassPermissions`.

## Quality Gates

- ESLint runs with zero warnings allowed.
- Unit tests run with Vitest.
- Coverage must remain at 100% for lines, functions, statements, and branches.
- Repository files are checked to stay within the 450-line limit.
- A pre-commit hook runs `pnpm check`.
