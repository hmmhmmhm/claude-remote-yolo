import os from "node:os";
import path from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

export type WrapperState = {
  consentAccepted: boolean;
};

export const DEFAULT_STATE: WrapperState = {
  consentAccepted: false
};

export function resolveStateFilePath(homeDirectory = os.homedir()): string {
  return path.join(homeDirectory, ".claude-remote-yolo-state.json");
}

export function parseState(rawState: string): WrapperState {
  try {
    const parsedState = JSON.parse(rawState) as Partial<WrapperState>;

    return {
      consentAccepted: parsedState.consentAccepted === true
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function readState(stateFilePath: string): WrapperState {
  try {
    return parseState(readFileSync(stateFilePath, "utf8"));
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function writeState(
  stateFilePath: string,
  nextState: WrapperState
): void {
  writeFileSync(stateFilePath, JSON.stringify(nextState, null, 2));
}
