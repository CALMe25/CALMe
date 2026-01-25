#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";

function convertNumberedToArrays(filePath) {
  const data = JSON.parse(readFileSync(filePath, "utf8"));
  const converted = {};
  const processed = new Set();

  // Sort keys to process in order
  const keys = Object.keys(data).sort();

  for (const key of keys) {
    // Skip if already processed as part of an array
    if (processed.has(key)) continue;

    // Check if this is a numbered key (ends with a digit)
    const match = key.match(/^(.+?)(\d+)$/);

    if (match) {
      const baseKey = match[1];
      const number = parseInt(match[2], 10);

      // Collect all items with this base key
      const items = [];
      let expectedNum = 1;

      while (data[`${baseKey}${expectedNum}`] !== undefined) {
        items.push(data[`${baseKey}${expectedNum}`]);
        processed.add(`${baseKey}${expectedNum}`);
        expectedNum++;
      }

      // Only convert to array if we have consecutive numbers starting from 1
      if (items.length > 1 && number === 1) {
        // Remove trailing underscore if present
        const cleanBaseKey = baseKey.replace(/_$/, "");
        converted[cleanBaseKey] = items;
        console.log(`✓ Converted ${cleanBaseKey}: ${items.length} items`);
      } else if (!processed.has(key)) {
        // Keep as-is if not part of a sequence
        converted[key] = data[key];
      }
    } else {
      // Not a numbered key, keep as-is
      converted[key] = data[key];
    }
  }

  return converted;
}

// Process both files
const files = ["messages/en.json", "messages/he.json"];

for (const file of files) {
  console.log(`\nProcessing ${file}...`);
  const converted = convertNumberedToArrays(file);

  // Write back with pretty formatting
  writeFileSync(file, JSON.stringify(converted, null, 2) + "\n", "utf8");
  console.log(`✓ ${file} updated successfully`);
}

console.log("\n✅ Conversion complete! Run: npx @inlang/paraglide-js compile");
