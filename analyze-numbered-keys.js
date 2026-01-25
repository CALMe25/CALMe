#!/usr/bin/env node

/**
 * Analyze Numbered Suffix Patterns (Dry Run)
 *
 * This script analyzes translation files and reports all numbered suffix patterns
 * without modifying any files.
 *
 * Usage: node analyze-numbered-keys.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const FILES = [
  path.join(__dirname, "messages", "en.json"),
  path.join(__dirname, "messages", "he.json"),
];

/**
 * Find line number for a key in the original JSON string
 */
function findLineNumber(content, key) {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`"${key}"`)) {
      return i + 1; // 1-indexed
    }
  }
  return -1;
}

/**
 * Recursively find all numbered patterns in nested objects
 */
function findAllNumberedPatterns(obj, content) {
  const keys = Object.keys(obj);
  const results = [];

  // Group keys by potential base names
  const baseGroups = new Map();

  keys.forEach((key) => {
    // Check if key ends with a number
    const match = key.match(/^(.+?)(\d+)$/);
    if (match) {
      const baseKey = match[1];
      const number = parseInt(match[2], 10);

      if (!baseGroups.has(baseKey)) {
        baseGroups.set(baseKey, []);
      }
      baseGroups.get(baseKey).push({
        key,
        number,
        value: obj[key],
        lineNumber: findLineNumber(content, key),
      });
    }
  });

  // Filter groups that have sequential numbers starting from 1
  baseGroups.forEach((items, baseKey) => {
    items.sort((a, b) => a.number - b.number);

    // Check if numbers are sequential starting from 1
    const isSequential = items.every((item, index) => item.number === index + 1);

    if (isSequential && items.length > 1) {
      results.push({
        baseKey,
        count: items.length,
        items,
      });
    }
  });

  return results;
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath) {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`📄 File: ${path.basename(filePath)}`);
  console.log(`${"=".repeat(80)}`);

  // Read the file
  const content = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(content);

  // Find all numbered patterns
  const patterns = findAllNumberedPatterns(data, content);

  if (patterns.length === 0) {
    console.log("\n✓ No numbered patterns found");
    return;
  }

  console.log(`\nFound ${patterns.length} numbered pattern(s):\n`);

  patterns.forEach((pattern, index) => {
    console.log(`${index + 1}. Base key: "${pattern.baseKey}"`);
    console.log(`   Count: ${pattern.count} items`);
    console.log(
      `   Line numbers: ${pattern.items[0].lineNumber}-${pattern.items[pattern.items.length - 1].lineNumber}`,
    );
    console.log(`   Keys: ${pattern.items.map((item) => item.key).join(", ")}`);
    console.log(`\n   Preview of values:`);
    pattern.items.forEach((item, i) => {
      const preview = item.value.length > 70 ? item.value.substring(0, 67) + "..." : item.value;
      console.log(`     [${i}] "${preview}"`);
    });
    console.log(`\n   After conversion:`);
    console.log(`     "${pattern.baseKey}": [`);
    pattern.items.forEach((item, i) => {
      const isLast = i === pattern.items.length - 1;
      const preview = item.value.length > 60 ? item.value.substring(0, 57) + "..." : item.value;
      console.log(`       "${preview}"${isLast ? "" : ","}`);
    });
    console.log(`     ]`);
    console.log();
  });

  // Summary
  console.log(`\nSummary for ${path.basename(filePath)}:`);
  console.log(`  Total patterns found: ${patterns.length}`);
  console.log(`  Total keys to convert: ${patterns.reduce((sum, p) => sum + p.count, 0)}`);
  console.log(`  Keys after conversion: ${patterns.length}`);
  console.log(
    `  Net reduction: ${patterns.reduce((sum, p) => sum + p.count, 0) - patterns.length} keys`,
  );
}

/**
 * Main execution
 */
function main() {
  console.log("🔍 Analyzing numbered suffix patterns in translation files\n");
  console.log("This analysis will:");
  console.log("  • Identify all numbered patterns (e.g., key1, key2, key3)");
  console.log("  • Show line numbers where they appear");
  console.log("  • Preview how they will look after conversion");
  console.log("  • NOT modify any files (dry run only)\n");

  // Check if files exist
  const missingFiles = FILES.filter((file) => !fs.existsSync(file));
  if (missingFiles.length > 0) {
    console.error("❌ Error: Missing files:");
    missingFiles.forEach((file) => console.error(`  - ${file}`));
    process.exit(1);
  }

  // Analyze each file
  FILES.forEach(analyzeFile);

  console.log(`\n${"=".repeat(80)}`);
  console.log("✨ Analysis complete!\n");
  console.log("To perform the actual conversion, run:");
  console.log("  node convert-numbered-keys-to-arrays.js\n");
}

// Run the script
main();

export { findAllNumberedPatterns };
