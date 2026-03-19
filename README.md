# claude-remote-yolo

A TypeScript wrapper around the Claude CLI that always runs remote-control with bypass permissions.

## Installation

Install the package globally:

```bash
npm install -g claude-remote-yolo
```

This wrapper expects the `claude` CLI to be available on your system.

## Usage

This wrapper always runs this command shape:

```bash
claude remote-control --permission-mode bypassPermissions
```

Examples:

```bash
claude-remote-yolo --yolo "summarize this repository"
claude-remote-yolo "summarize this repository"
```

The wrapper asks for consent once before it first runs the bypass command and stores that decision in a local state file under the user's home directory.

The saved state file is:

```bash
~/.claude-remote-yolo-state.json
```

## Local Development

```bash
pnpm install
pnpm check
node dist/bin.js "summarize this repository"
```

## Design Notes

- This project intentionally wraps the public Claude CLI command instead of patching Claude's installed source files.
- Execution is always normalized to `claude remote-control --permission-mode bypassPermissions`.
- `--yolo` is accepted as a compatibility flag and ignored.

## Quality Gates

- ESLint runs with zero warnings allowed.
- Unit tests run with Vitest.
- Coverage must remain at 100% for lines, functions, statements, and branches.
- Repository files are checked to stay within the 450-line limit.
- A pre-commit hook runs `pnpm check`.
