import { createInterface } from "node:readline/promises";

export type WriteLike = {
  write(chunk: string): void;
};

export type QuestionSession = {
  ask(prompt: string): Promise<string>;
  close(): void;
};

export type QuestionSessionFactory = (
  input: NodeJS.ReadableStream,
  output: WriteLike
) => QuestionSession;

export function createReadlineQuestionSession(
  input: NodeJS.ReadableStream,
  output: WriteLike
): QuestionSession {
  const questionInterface = createInterface({
    input,
    output
  });

  return {
    ask(prompt: string) {
      return questionInterface.question(prompt);
    },
    close() {
      questionInterface.close();
    }
  };
}

export function renderConsentMessage(): string {
  return [
    "WARNING: YOLO mode will run Claude with:",
    "claude remote-control --permission-mode bypassPermissions",
    "",
    "This can bypass interactive permission checks.",
    "Use it only if you understand the security implications.",
    ""
  ].join("\n");
}

export function isConsentAccepted(answer: string): boolean {
  const normalizedAnswer = answer.trim().toLowerCase();

  return normalizedAnswer === "y" || normalizedAnswer === "yes";
}

export async function promptForConsent(
  session: QuestionSession,
  output: WriteLike
): Promise<boolean> {
  output.write(renderConsentMessage());

  try {
    const answer = await session.ask("Type 'yes' to continue: ");
    return isConsentAccepted(answer);
  } finally {
    session.close();
  }
}
