import {
  createReadlineQuestionSession,
  promptForConsent,
  type QuestionSessionFactory,
  type WriteLike
} from "./consent";
import { runClaudeCommand, stripWrapperFlags, type SpawnRunner } from "./claude";
import { readState, resolveStateFilePath, writeState, type WrapperState } from "./state";

export type CliDependencies = {
  loadState(): WrapperState;
  requestConsent(): Promise<boolean>;
  runClaude(args: string[]): number;
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
  writeLine(output, "Usage: claude-remote-yolo [options]");
  writeLine(output, "");
  writeLine(output, "Execution always wraps:");
  writeLine(output, "claude remote-control --permission-mode bypassPermissions");
  writeLine(output, "");
  writeLine(output, "Wrapper flags:");
  writeLine(output, "--yolo              Accepted for compatibility and ignored");
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
    runClaude(args: string[]) {
      return runClaudeCommand(args, options.runner, options.platform);
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

  const passthroughArgs = stripWrapperFlags(args);

  if (!state.consentAccepted) {
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

  return dependencies.runClaude(passthroughArgs);
}
