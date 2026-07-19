#!/usr/bin/env node
// Guards against a silent paraglide-js compile failure.
// If the inlang CDN plugins fail to load at compile time, paraglide-js
// only warns and writes an empty messages index, which then produces
// dozens of confusing downstream tsc errors instead of a clear failure.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const target =
  process.argv[2] ?? fileURLToPath(new URL("../src/paraglide/messages/_index.js", import.meta.url));

const source = readFileSync(target, "utf8");
const exportCount = (source.match(/^export /gm) ?? []).length;

if (exportCount === 0) {
  console.error(
    `check-paraglide-output: ${target} has zero exports. ` +
      "paraglide-js compile likely failed to fetch its inlang plugins " +
      "(check network access to cdn.jsdelivr.net) and emitted an empty stub. " +
      "Fix the compile step before running tsc.",
  );
  process.exit(1);
}

console.log(`check-paraglide-output: OK (${exportCount} exports found)`);
process.exit(0);
