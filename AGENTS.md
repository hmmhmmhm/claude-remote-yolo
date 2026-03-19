# AGENTS.md

This file defines the working rules for all future agents operating in this repository.

## Core Rules

- Prefer TypeScript for all source code, scripts, and tooling whenever it is practical.
- Keep every source file at or below 450 lines. Check file length before completing a task, and refactor before merging if a file exceeds the limit.
- Maintain strict linting standards. Do not leave lint warnings or errors unresolved.
- Maintain 100% code coverage before every commit. Do not commit if coverage drops below 100%.
- Add and maintain unit tests for all production logic.
- Keep the project compatible with both macOS and Windows. Avoid platform-specific assumptions in paths, shell usage, and filesystem behavior.
- Never commit secrets, credentials, tokens, private keys, personal data, or other sensitive information.
- Treat security as a default requirement. Review new code and dependencies for obvious security risks before committing.
- Keep commits focused and small. Do not bundle unrelated changes or excessive code into one commit.
- Use conventional commit prefixes such as `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, and `chore:` when appropriate.
- Write every commit message in English.
- Write all README content in English.
- Write all code comments in English.

## Required Checks Before Commit

- Run linting and fix all issues.
- Run the full unit test suite.
- Verify coverage is still 100%.
- Confirm the change works on cross-platform code paths and does not rely on macOS-only or Windows-only behavior.
- Review staged changes for secrets or sensitive data.
- Confirm the commit scope is small and coherent.

## Implementation Guidance

- Prefer cross-platform Node.js APIs over shell-specific behavior.
- Avoid hardcoded absolute paths and OS-specific separators.
- Keep CLI behavior and scripts compatible with both PowerShell and POSIX shells when possible.
- If a task would force a file beyond the 450-line limit, split the logic into smaller modules first.
- If tests or coverage are missing, add them as part of the same task before considering the work complete.

## Documentation Standards

- Keep developer-facing documentation concise, accurate, and in English.
- Update README files when behavior, setup steps, or commands change.
- Do not add non-English comments or documentation to repository files.

## Commit Discipline

- Prefer multiple small commits over one large commit.
- Separate refactors from behavior changes when practical.
- Separate test-only changes from production changes when practical.
- Do not use vague commit messages.

## Security Rules

- Never commit `.env` files, API keys, access tokens, certificates, customer data, or machine-specific secrets.
- Sanitize logs, examples, fixtures, and screenshots before committing them.
- Review dependency additions carefully and avoid unnecessary packages.

## Agent Behavior

- Treat these rules as mandatory unless the user explicitly overrides them.
- If a requested change conflicts with these rules, raise the conflict clearly before proceeding.
