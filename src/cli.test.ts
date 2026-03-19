import { mkdtempSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import { createDefaultCliDependencies, runCli } from "./cli";
import type { CliDependencies } from "./cli";
import type { WrapperState } from "./state";

function createHarness(
  state: WrapperState,
  overrides: Partial<CliDependencies> = {}
) {
  const loadState = vi.fn(() => state);
  const requestConsent = vi.fn().mockResolvedValue(true);
  const runClaude = vi.fn(() => 0);
  const saveState = vi.fn();
  const stderrWrite = vi.fn();
  const stdoutWrite = vi.fn();
  const dependencies: CliDependencies = {
    loadState,
    requestConsent,
    runClaude,
    saveState,
    stderr: { write: stderrWrite },
    stdout: { write: stdoutWrite },
    ...overrides
  };

  return {
    dependencies,
    loadState,
    requestConsent,
    runClaude,
    saveState,
    stderrWrite,
    stdoutWrite
  };
}

describe("cli", () => {
  it("prints help output", async () => {
    const { dependencies, stdoutWrite } = createHarness({
      consentAccepted: false
    });

    await expect(runCli(["--help"], dependencies)).resolves.toBe(0);
    expect(stdoutWrite).toHaveBeenCalled();
  });

  it("prints the current mode", async () => {
    const { dependencies, stdoutWrite } = createHarness({
      consentAccepted: false
    });

    await expect(runCli(["--help"], dependencies)).resolves.toBe(0);
    expect(stdoutWrite).toHaveBeenCalled();
  });

  it("aborts execution when consent is rejected", async () => {
    const requestConsent = vi.fn().mockResolvedValue(false);
    const { dependencies, runClaude, stderrWrite } = createHarness(
      {
        consentAccepted: false
      },
      {
        requestConsent
      }
    );

    await expect(runCli(["task"], dependencies)).resolves.toBe(1);
    expect(runClaude).not.toHaveBeenCalled();
    expect(stderrWrite).toHaveBeenCalledWith(
      "Consent not granted. Aborting.\n"
    );
  });

  it("persists consent before running the wrapper", async () => {
    const { dependencies, saveState, runClaude } = createHarness({
      consentAccepted: false
    });

    await expect(runCli(["task"], dependencies)).resolves.toBe(0);
    expect(saveState).toHaveBeenCalledWith({
      consentAccepted: true
    });
    expect(runClaude).toHaveBeenCalledWith(["task"]);
  });

  it("skips prompting once consent was already accepted", async () => {
    const { dependencies, requestConsent, runClaude } = createHarness({
      consentAccepted: true
    });

    await expect(runCli(["task"], dependencies)).resolves.toBe(0);
    expect(requestConsent).not.toHaveBeenCalled();
    expect(runClaude).toHaveBeenCalledWith(["task"]);
  });

  it("accepts the compatibility yolo flag and strips it before execution", async () => {
    const { dependencies, runClaude } = createHarness({
      consentAccepted: true
    });

    await expect(runCli(["--yolo", "task"], dependencies)).resolves.toBe(0);
    expect(runClaude).toHaveBeenCalledWith(["task"]);
  });

  it("creates default dependencies backed by the state file and runner", async () => {
    const tempDirectory = mkdtempSync(path.join(os.tmpdir(), "cli-defaults-"));
    const stateFilePath = path.join(tempDirectory, "state.json");
    const stdoutWrite = vi.fn();
    const stderrWrite = vi.fn();
    const close = vi.fn();
    const ask = vi.fn().mockResolvedValue("yes");
    const runner = vi.fn(() => ({ status: 9 }));
    const dependencies = createDefaultCliDependencies({
      input: {} as NodeJS.ReadableStream,
      platform: "linux",
      questionSessionFactory: () => ({
        ask,
        close
      }),
      runner,
      stateFilePath,
      stderr: { write: stderrWrite },
      stdout: { write: stdoutWrite }
    });

    expect(dependencies.loadState()).toEqual({
      consentAccepted: false
    });

    dependencies.saveState({
      consentAccepted: true
    });
    expect(dependencies.loadState()).toEqual({
      consentAccepted: true
    });

    await expect(dependencies.requestConsent()).resolves.toBe(true);
    expect(close).toHaveBeenCalledOnce();
    expect(dependencies.runClaude(["task"])).toBe(9);
    expect(runner).toHaveBeenCalled();
    expect(stderrWrite).not.toHaveBeenCalled();
  });

  it("creates default dependencies when only the state path is provided", () => {
    const tempDirectory = mkdtempSync(path.join(os.tmpdir(), "cli-minimal-"));
    const stateFilePath = path.join(tempDirectory, "state.json");
    const dependencies = createDefaultCliDependencies({
      stateFilePath
    });

    expect(dependencies.loadState()).toEqual({
      consentAccepted: false
    });
  });

  it("creates default dependencies with the default state path", () => {
    const dependencies = createDefaultCliDependencies({
      stderr: { write: vi.fn() },
      stdout: { write: vi.fn() }
    });

    expect(dependencies).toBeDefined();
  });
});
