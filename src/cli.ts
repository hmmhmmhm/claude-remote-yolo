import {
  createReadlineQuestionSession,
  promptForConsent,
  type QuestionSessionFactory,
  type WriteLike
} from "./consent";
import {
  runClaudeCommand,
  stripWrapperFlags,
  type SpawnRunner
} from "./claude";
import {
  readState,
  resolveStateFilePath,
  writeState,
  type Mode,
  type WrapperState
} from "./state";

export type CliDependencies = {
  loadState(): WrapperState;
  requestConsent(): Promise<boolean>;
  runClaude(mode: Mode, args: string[]): number;
  saveState(state: WrapperState): void;
  stderr: WriteLike;
  stdout: WriteLike;
};

export type DefaultCliDependencyOptions = {
  input?: NodeJS.ReadableStream;
  platform?: NodeJS.Platform;
  questionSessionFactory?: QuestionSessionFactory;
  runner?: SpawnRunner;
  stateFilePath?: string;
  stderr?: WriteLike;
  stdout?: WriteLike;
};

function writeLine(output: WriteLike, message: string): void {
  output.write(`${message}\n`);
}

function printHelp(output: WriteLike): void {
  writeLine(output, "Usage: claude-remote-yolo [mode [yolo|safe]] [options]");
  writeLine(output, "");
  writeLine(output, "Default yolo execution wraps:");
  writeLine(output, "claude remote-control --permission-mode bypassPermissions");
  writeLine(output, "");
  writeLine(output, "Wrapper flags:");
  writeLine(output, "--safe, --no-yolo   Run plain claude for this invocation");
  writeLine(output, "--yolo              Force bypass mode for this invocation");
  writeLine(output, "mode                Show the saved default mode");
  writeLine(output, "mode yolo|safe      Save the default mode");
}

function handleModeCommand(
  args: string[],
  state: WrapperState,
  dependencies: CliDependencies
): number {
  const nextMode = args[1];

  if (nextMode === undefined) {
    writeLine(dependencies.stdout, `Current mode: ${state.mode}`);
    return 0;
  }

  if (nextMode !== "safe" && nextMode !== "yolo") {
    writeLine(dependencies.stderr, "Invalid mode. Use 'yolo' or 'safe'.");
    return 1;
  }

  dependencies.saveState({
    ...state,
    mode: nextMode
  });
  writeLine(dependencies.stdout, `Saved mode: ${nextMode}`);

  return 0;
}

export function createDefaultCliDependencies(
  options: DefaultCliDependencyOptions = {}
): CliDependencies {
  const stateFilePath = options.stateFilePath ?? resolveStateFilePath();
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const input = options.input ?? process.stdin;
  const questionSessionFactory =
    options.questionSessionFactory ?? createReadlineQuestionSession;

  return {
    loadState() {
      return readState(stateFilePath);
    },
    requestConsent() {
      return promptForConsent(questionSessionFactory(input, stdout), stdout);
    },
    runClaude(mode: Mode, args: string[]) {
      return runClaudeCommand(mode, args, options.runner, options.platform);
    },
    saveState(state: WrapperState) {
      writeState(stateFilePath, state);
    },
    stderr,
    stdout
  };
}

export async function runCli(
  args: string[],
  dependencies: CliDependencies
): Promise<number> {
  const state = dependencies.loadState();

  if (args[0] === "help" || args.includes("--help")) {
    printHelp(dependencies.stdout);
    return 0;
  }

  if (args[0] === "mode") {
    return handleModeCommand(args, state, dependencies);
  }

  const { modeOverride, passthroughArgs } = stripWrapperFlags(args);
  const mode = modeOverride ?? state.mode;

  if (mode === "yolo" && !state.consentAccepted) {
    const consentAccepted = await dependencies.requestConsent();

    if (!consentAccepted) {
      writeLine(dependencies.stderr, "Consent not granted. Aborting.");
      return 1;
    }

    dependencies.saveState({
      ...state,
      consentAccepted: true
    });
  }

  return dependencies.runClaude(mode, passthroughArgs);
}
