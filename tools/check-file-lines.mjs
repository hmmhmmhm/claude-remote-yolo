import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const MAX_LINES = 450;
const ROOT_DIR = process.cwd();
const IGNORED_DIRS = new Set([".git", "coverage", "dist", "node_modules"]);
const CHECKED_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml"
]);
const IGNORED_FILES = new Set(["pnpm-lock.yaml"]);

function collectFiles(dirPath) {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        files.push(...collectFiles(absolutePath));
      }

      continue;
    }

    if (!entry.isFile() || IGNORED_FILES.has(entry.name)) {
      continue;
    }

    if (CHECKED_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

function countLines(filePath) {
  const content = readFileSync(filePath, "utf8");

  if (content.length === 0) {
    return 0;
  }

  return content.split(/\r?\n/u).length;
}

function main() {
  const allFiles = collectFiles(ROOT_DIR);
  const violations = allFiles
    .map((filePath) => ({
      filePath,
      lineCount: countLines(filePath)
    }))
    .filter(({ lineCount }) => lineCount > MAX_LINES)
    .sort((left, right) => left.filePath.localeCompare(right.filePath));

  if (violations.length === 0) {
    console.log(`All checked files are within ${MAX_LINES} lines.`);
    return;
  }

  console.error(`Files exceeding ${MAX_LINES} lines:`);

  for (const violation of violations) {
    const relativePath = path.relative(ROOT_DIR, violation.filePath);
    console.error(`- ${relativePath}: ${violation.lineCount} lines`);
  }

  process.exitCode = 1;
}

main();
