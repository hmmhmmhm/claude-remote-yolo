# claude-remote-yolo

Minimal TypeScript CLI package.

## Usage

After publishing to npm:

```bash
npx claude-remote-yolo
```

For local verification from this repository:

```bash
pnpm install
pnpm check
node dist/bin.js
```

## Quality Gates

- ESLint runs with zero warnings allowed.
- Unit tests run with Vitest.
- Coverage must remain at 100% for lines, functions, statements, and branches.
- Repository files are checked to stay within the 450-line limit.
- A pre-commit hook runs `pnpm check`.
