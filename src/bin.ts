#!/usr/bin/env node

import { createDefaultCliDependencies, runCli } from "./cli";

void runCli(process.argv.slice(2), createDefaultCliDependencies()).then(
  (exitCode) => {
    if (exitCode !== 0) {
      process.exitCode = exitCode;
    }
  },
  (error: unknown) => {
    const message =
      error instanceof Error ? error.message : "Unknown execution failure.";
    console.error(message);
    process.exitCode = 1;
  }
);
