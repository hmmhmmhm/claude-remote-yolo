import { spawnSync } from "node:child_process";

import type { Mode } from "./state";

export type ModeOverride = Mode | undefined;

export type SpawnRunner = (
  command: string,
  args: string[],
  options: { shell: boolean; stdio: "inherit" }
) => {
  error?: Error;
  status: number | null;
};

export function stripWrapperFlags(args: string[]): {
  modeOverride: ModeOverride;
  passthroughArgs: string[];
} {
  let modeOverride: ModeOverride;
  const passthroughArgs: string[] = [];

  for (const arg of args) {
    if (arg === "--safe" || arg === "--no-yolo") {
      modeOverride = "safe";
      continue;
    }

    if (arg === "--yolo") {
      modeOverride = "yolo";
      continue;
    }

    passthroughArgs.push(arg);
  }

  return { modeOverride, passthroughArgs };
}

function removePermissionMode(args: string[]): string[] {
  const normalizedArgs: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const currentArg = args[index];

    if (currentArg === "--permission-mode") {
      index += 1;
      continue;
    }

    normalizedArgs.push(currentArg);
  }

  return normalizedArgs;
}

export function buildClaudeArguments(mode: Mode, args: string[]): string[] {
  if (mode === "safe") {
    return [...args];
  }

  const normalizedArgs = removePermissionMode(args);
  const passthroughArgs =
    normalizedArgs[0] === "remote-control"
      ? normalizedArgs.slice(1)
      : normalizedArgs;

  return [
    "remote-control",
    "--permission-mode",
    "bypassPermissions",
    ...passthroughArgs
  ];
}

export function buildCommandInvocation(
  mode: Mode,
  args: string[],
  platform: NodeJS.Platform
): {
  args: string[];
  command: string;
  options: { shell: boolean; stdio: "inherit" };
} {
  const claudeArgs = buildClaudeArguments(mode, args);

  if (platform === "win32") {
    return {
      args: ["/d", "/s", "/c", "claude.cmd", ...claudeArgs],
      command: "cmd.exe",
      options: {
        shell: false,
        stdio: "inherit"
      }
    };
  }

  return {
    args: claudeArgs,
    command: "claude",
    options: {
      shell: false,
      stdio: "inherit"
    }
  };
}

export function runClaudeCommand(
  mode: Mode,
  args: string[],
  runner: SpawnRunner = spawnSync,
  platform: NodeJS.Platform = process.platform
): number {
  const invocation = buildCommandInvocation(mode, args, platform);
  const result = runner(
    invocation.command,
    invocation.args,
    invocation.options
  );

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 0;
}
