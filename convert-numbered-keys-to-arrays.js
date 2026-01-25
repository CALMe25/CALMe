#!/usr/bin/env node

/**
 * Convert Numbered Suffix Keys to Arrays
 *
 * This script identifies all numbered suffix patterns in translation files
 * (e.g., "instructions1", "instructions2", etc.) and converts them to arrays.
 *
 * Usage: node convert-numbered-keys-to-arrays.js
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
 * Identify all numbered suffix patterns in an object
 * Returns a map of base keys to their numbered variants
 */
function findNumberedPatterns(obj, prefix = "") {
  const patterns = new Map();

  Object.keys(obj).forEach((key) => {
    const fullKey = prefix ? `${prefix}_${key}` : key;

    // Check if key ends with a number
    const match = key.match(/^(.+?)(\d+)$/);
    if (match) {
      const baseKey = match[1];
      const number = parseInt(match[2], 10);
      const baseFullKey = prefix ? `${prefix}_${baseKey}` : baseKey;

      if (!patterns.has(baseFullKey)) {
        patterns.set(baseFullKey, []);
      }
      patterns.get(baseFullKey).push({
        originalKey: key,
        number: number,
        value: obj[key],
      });
    }
  });

  return patterns;
}

/**
 * Recursively find all numbered patterns in nested objects
 */
function findAllNumberedPatterns(obj, prefix = "", results = new Map()) {
  const keys = Object.keys(obj);

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
      });
    }
  });

  // Filter groups that have sequential numbers starting from 1
  baseGroups.forEach((items, baseKey) => {
    items.sort((a, b) => a.number - b.number);

    // Check if numbers are sequential starting from 1
    const isSequential = items.every((item, index) => item.number === index + 1);

    if (isSequential && items.length > 1) {
      const fullKey = prefix ? `${prefix}_${baseKey}` : baseKey;
      results.set(fullKey, {
        prefix,
        baseKey,
        items,
      });
    }
  });

  return results;
}

/**
 * Convert numbered keys to arrays in the object
 */
function convertToArrays(obj, patterns) {
  const newObj = {};
  const processedKeys = new Set();

  // First, identify which keys are part of numbered patterns
  patterns.forEach(({ items }, fullBaseKey) => {
    items.forEach((item) => {
      processedKeys.add(item.key);
    });
  });

  // Copy non-numbered keys and create arrays for numbered patterns
  Object.keys(obj).forEach((key) => {
    if (!processedKeys.has(key)) {
      newObj[key] = obj[key];
    }
  });

  // Add arrays for numbered patterns
  patterns.forEach(({ items, baseKey }, fullBaseKey) => {
    // Sort by number to ensure correct order
    items.sort((a, b) => a.number - b.number);
    newObj[baseKey] = items.map((item) => item.value);
  });

  return newObj;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  console.log(`\n📄 Processing: ${filePath}`);

  // Read the file
  const content = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(content);

  // Find all numbered patterns
  const patterns = findAllNumberedPatterns(data);

  if (patterns.size === 0) {
    console.log("  ✓ No numbered patterns found");
    return;
  }

  // Display found patterns
  console.log(`\n  Found ${patterns.size} numbered pattern(s):`);
  patterns.forEach(({ items, baseKey }, fullKey) => {
    console.log(
      `    - ${baseKey}: ${items.length} items (${baseKey}1 to ${baseKey}${items.length})`,
    );
  });

  // Convert to arrays
  const newData = convertToArrays(data, patterns);

  // Create backup
  const backupPath = filePath + ".backup";
  fs.writeFileSync(backupPath, content, "utf8");
  console.log(`  💾 Backup created: ${backupPath}`);

  // Write converted data
  const newContent = JSON.stringify(newData, null, 2) + "\n";
  fs.writeFileSync(filePath, newContent, "utf8");
  console.log(`  ✅ Converted file written`);

  // Display conversion details
  console.log("\n  Conversion details:");
  patterns.forEach(({ items, baseKey }, fullKey) => {
    console.log(`    ${baseKey}:`);
    items.forEach((item, index) => {
      console.log(
        `      [${index}]: "${item.value.substring(0, 60)}${item.value.length > 60 ? "..." : ""}"`,
      );
    });
  });
}

/**
 * Main execution
 */
function main() {
  console.log("🔄 Converting numbered suffix keys to arrays...\n");
  console.log("This script will:");
  console.log("  1. Scan translation files for numbered patterns");
  console.log('  2. Convert patterns like "key1", "key2" → "key": ["value1", "value2"]');
  console.log("  3. Create backups before modifying files");
  console.log("  4. Preserve all other keys and formatting");

  // Check if files exist
  const missingFiles = FILES.filter((file) => !fs.existsSync(file));
  if (missingFiles.length > 0) {
    console.error("\n❌ Error: Missing files:");
    missingFiles.forEach((file) => console.error(`  - ${file}`));
    process.exit(1);
  }

  // Process each file
  FILES.forEach(processFile);

  console.log("\n✨ Conversion complete!\n");
  console.log("Next steps:");
  console.log("  1. Review the changes in the translation files");
  console.log("  2. Update your code to access array values (e.g., messages.key[0])");
  console.log("  3. Test thoroughly to ensure nothing breaks");
  console.log("  4. If everything works, you can delete the .backup files\n");
}

// Run the script
main();

export { findAllNumberedPatterns, convertToArrays };
