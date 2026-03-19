import { describe, expect, it, vi } from "vitest";

import {
  isConsentAccepted,
  promptForConsent,
  renderConsentMessage
} from "./consent";

describe("consent", () => {
  it("renders the consent message with the bypass command", () => {
    expect(renderConsentMessage()).toContain(
      "claude remote-control --permission-mode bypassPermissions"
    );
  });

  it("accepts yes-like answers only", () => {
    expect(isConsentAccepted("yes")).toBe(true);
    expect(isConsentAccepted("Y")).toBe(true);
    expect(isConsentAccepted("no")).toBe(false);
  });

  it("prompts for consent and closes the session", async () => {
    const output = { write: vi.fn() };
    const session = {
      ask: vi.fn().mockResolvedValue("yes"),
      close: vi.fn()
    };

    await expect(promptForConsent(session, output)).resolves.toBe(true);
    expect(output.write).toHaveBeenCalledWith(renderConsentMessage());
    expect(session.ask).toHaveBeenCalledWith("Type 'yes' to continue: ");
    expect(session.close).toHaveBeenCalledOnce();
  });

  it("creates a readline-backed question session", async () => {
    const close = vi.fn();
    const question = vi.fn().mockResolvedValue("yes");
    const output = { write: vi.fn() };
    const mockCreateInterface = vi.fn(() => ({
      close,
      question
    }));

    vi.doMock("node:readline/promises", () => ({
      createInterface: mockCreateInterface
    }));

    vi.resetModules();
    const { createReadlineQuestionSession: createSession } = await import(
      "./consent"
    );
    const session = createSession({} as NodeJS.ReadableStream, output);

    await expect(session.ask("prompt")).resolves.toBe("yes");
    session.close();

    expect(mockCreateInterface).toHaveBeenCalledWith({
      input: {} as NodeJS.ReadableStream,
      output
    });
    expect(question).toHaveBeenCalledWith("prompt");
    expect(close).toHaveBeenCalledOnce();
    vi.doUnmock("node:readline/promises");
    vi.resetModules();
  });
});
