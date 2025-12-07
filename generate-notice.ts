#!/usr/bin/env tsx
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";

/**
 * Custom packages that are not detected by license-checker-rseidelsohn.
 * These are typically manually vendored packages or non-npm dependencies.
 * Add entries in the format: { name: 'package@version', url: 'repo-url', license: 'LICENSE-TYPE' }
 */
const customPackages = [
  {
    name: "acc_toolbar@1.02",
    url: "https://github.com/mickidum/acc_toolbar",
    license: "MIT",
  },
];

execSync('npx license-checker-rseidelsohn --markdown --out="NOTICE"', {
  stdio: "inherit",
  env: { ...process.env, NODE_NO_WARNINGS: "1" },
});

const lines = readFileSync("NOTICE", "utf8").trim().split("\n");
customPackages.forEach((p) => lines.push(`- [${p.name}](${p.url}) - ${p.license}`));
lines.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
writeFileSync("NOTICE", lines.join("\n") + "\n");
