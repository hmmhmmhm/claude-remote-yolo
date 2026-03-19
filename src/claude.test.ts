import { describe, expect, it, vi } from "vitest";

import {
  buildCommandInvocation,
  buildClaudeArguments,
  runClaudeCommand,
  stripWrapperFlags
} from "./claude";

describe("claude", () => {
  it("extracts wrapper flags and preserves passthrough arguments", () => {
    expect(stripWrapperFlags(["--safe", "prompt", "--yolo", "extra"])).toEqual({
      modeOverride: "yolo",
      passthroughArgs: ["prompt", "extra"]
    });
  });

  it("passes arguments through unchanged in safe mode", () => {
    expect(buildClaudeArguments("safe", ["task", "--json"])).toEqual([
      "task",
      "--json"
    ]);
  });

  it("builds the remote-control bypass command in yolo mode", () => {
    expect(buildClaudeArguments("yolo", ["do work"])).toEqual([
      "remote-control",
      "--permission-mode",
      "bypassPermissions",
      "do work"
    ]);
  });

  it("normalizes existing remote-control invocations", () => {
    expect(
      buildClaudeArguments("yolo", [
        "remote-control",
        "--permission-mode",
        "default",
        "task"
      ])
    ).toEqual([
      "remote-control",
      "--permission-mode",
      "bypassPermissions",
      "task"
    ]);
  });

  it("runs claude with shell enabled on Windows", () => {
    const runner = vi.fn(() => ({ status: 7 }));

    expect(runClaudeCommand("safe", ["task"], runner, "win32")).toBe(7);
    expect(runner).toHaveBeenCalledWith(
      "cmd.exe",
      ["/d", "/s", "/c", "claude.cmd", "task"],
      {
        shell: false,
        stdio: "inherit"
      }
    );
  });

  it("builds a direct claude invocation on non-Windows platforms", () => {
    expect(buildCommandInvocation("safe", ["task"], "linux")).toEqual({
      args: ["task"],
      command: "claude",
      options: {
        shell: false,
        stdio: "inherit"
      }
    });
  });

  it("builds a cmd.exe invocation on Windows", () => {
    expect(buildCommandInvocation("yolo", ["task"], "win32")).toEqual({
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

    expect(() => runClaudeCommand("safe", ["task"], runner, "linux")).toThrow(
      "spawn failed"
    );
  });

  it("falls back to exit code zero when the runner returns a null status", () => {
    const runner = vi.fn(() => ({ status: null }));

    expect(runClaudeCommand("safe", ["task"], runner, "linux")).toBe(0);
  });
});
