import { mkdtempSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  DEFAULT_STATE,
  parseState,
  readState,
  resolveStateFilePath,
  writeState
} from "./state";

describe("state", () => {
  it("resolves the persisted state path under the provided home directory", () => {
    expect(resolveStateFilePath("/tmp/example")).toBe(
      path.join("/tmp/example", ".claude-remote-yolo-state.json")
    );
  });

  it("parses valid persisted state", () => {
    expect(parseState(JSON.stringify({ consentAccepted: true }))).toEqual({
      consentAccepted: true
    });
  });

  it("falls back to the default state for invalid content", () => {
    expect(parseState("not-json")).toEqual(DEFAULT_STATE);
  });

  it("returns the default state when the file does not exist", () => {
    const tempDirectory = mkdtempSync(path.join(os.tmpdir(), "state-missing-"));
    const missingFilePath = path.join(tempDirectory, "missing.json");

    expect(readState(missingFilePath)).toEqual(DEFAULT_STATE);
  });

  it("writes and reads state consistently", () => {
    const tempDirectory = mkdtempSync(path.join(os.tmpdir(), "state-write-"));
    const stateFilePath = path.join(tempDirectory, "state.json");

    writeState(stateFilePath, {
      consentAccepted: true
    });

    expect(JSON.parse(readFileSync(stateFilePath, "utf8"))).toEqual({
      consentAccepted: true
    });
    expect(readState(stateFilePath)).toEqual({
      consentAccepted: true
    });
  });
});
