import { describe, expect, it, vi } from "vitest";

import {
  buildCommandInvocation,
  buildClaudeArguments,
  runClaudeCommand,
  stripWrapperFlags
} from "./claude";

describe("claude", () => {
  it("strips the compatibility yolo flag", () => {
    expect(stripWrapperFlags(["--yolo", "prompt", "extra"])).toEqual([
      "prompt",
      "extra"
    ]);
  });

  it("builds the remote-control bypass command", () => {
    expect(buildClaudeArguments(["do work"])).toEqual([
      "remote-control",
      "--permission-mode",
      "bypassPermissions",
      "do work"
    ]);
  });

  it("normalizes existing remote-control invocations", () => {
    expect(buildClaudeArguments([
      "remote-control",
      "--permission-mode",
      "default",
      "task"
    ])).toEqual([
      "remote-control",
      "--permission-mode",
      "bypassPermissions",
      "task"
    ]);
  });

  it("runs remote-control bypass mode on Windows", () => {
    const runner = vi.fn(() => ({ status: 7 }));

    expect(runClaudeCommand(["task"], runner, "win32")).toBe(7);
    expect(runner).toHaveBeenCalledWith(
      "cmd.exe",
      [
        "/d",
        "/s",
        "/c",
        "claude.cmd",
        "remote-control",
        "--permission-mode",
        "bypassPermissions",
        "task"
      ],
      {
        shell: false,
        stdio: "inherit"
      }
    );
  });

  it("builds a direct claude invocation on non-Windows platforms", () => {
    expect(buildCommandInvocation(["task"], "linux")).toEqual({
      args: ["remote-control", "--permission-mode", "bypassPermissions", "task"],
      command: "claude",
      options: {
        shell: false,
        stdio: "inherit"
      }
    });
  });

  it("builds a cmd.exe invocation on Windows", () => {
    expect(buildCommandInvocation(["task"], "win32")).toEqual({
      args: [
        "/d",
        "/s",
        "/c",
        "claude.cmd",
        "remote-control",
        "--permission-mode",
        "bypassPermissions",
        "task"
      ],
      command: "cmd.exe",
      options: {
        shell: false,
        stdio: "inherit"
      }
    });
  });

  it("throws runner errors", () => {
    const failure = new Error("spawn failed");
    const runner = vi.fn(() => ({ error: failure, status: null }));

    expect(() => runClaudeCommand(["task"], runner, "linux")).toThrow(
      "spawn failed"
    );
  });

  it("falls back to exit code zero when the runner returns a null status", () => {
    const runner = vi.fn(() => ({ status: null }));

    expect(runClaudeCommand(["task"], runner, "linux")).toBe(0);
  });
});
