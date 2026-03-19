import { spawnSync } from "node:child_process";

export type SpawnRunner = (
  command: string,
  args: string[],
  options: { shell: boolean; stdio: "inherit" }
) => {
  error?: Error;
  status: number | null;
};

export function stripWrapperFlags(args: string[]): string[] {
  return args.filter((arg) => arg !== "--yolo");
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

export function buildClaudeArguments(args: string[]): string[] {
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
  args: string[],
  platform: NodeJS.Platform
): {
  args: string[];
  command: string;
  options: { shell: boolean; stdio: "inherit" };
} {
  const claudeArgs = buildClaudeArguments(args);

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
  args: string[],
  runner: SpawnRunner = spawnSync,
  platform: NodeJS.Platform = process.platform
): number {
  const invocation = buildCommandInvocation(args, platform);
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
