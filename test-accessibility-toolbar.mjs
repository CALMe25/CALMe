#!/usr/bin/env node

/**
 * Test script for accessibility toolbar language switching
 * This script tests if the accessibility toolbar changes language when the app language is switched
 */

import puppeteer from "puppeteer";
import { writeFileSync } from "fs";
import { join } from "path";

const URL = "http://localhost:5174/";
const SCREENSHOTS_DIR = "/home/roib/github/CALMe/screenshots";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testAccessibilityToolbar() {
  console.log("Starting accessibility toolbar language switching test...\n");

  const browser = await puppeteer.launch({
    headless: false, // Run in visible mode to see what's happening
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Array to collect console messages
  const consoleMessages = [];
  const errorMessages = [];

  page.on("console", (msg) => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(text);
    console.log("  Console:", text);
  });

  page.on("pageerror", (error) => {
    const text = `ERROR: ${error.message}`;
    errorMessages.push(text);
    console.error("  Page Error:", text);
  });

  try {
    // Step 1: Navigate to the URL
    console.log("Step 1: Navigating to", URL);
    await page.goto(URL, { waitUntil: "networkidle2" });
    await sleep(2000); // Wait for page to fully load

    // Step 2: Check initial HTML lang attribute
    console.log("\nStep 2: Checking initial HTML lang attribute");
    const initialLang = await page.evaluate(
      () => document.documentElement.lang,
    );
    const initialDir = await page.evaluate(() => document.documentElement.dir);
    console.log("  Initial lang:", initialLang);
    console.log("  Initial dir:", initialDir);

    // Step 3: Take initial screenshot
    console.log("\nStep 3: Taking initial screenshot");
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, "1-initial-page.png"),
      fullPage: true,
    });
    console.log("  Screenshot saved: 1-initial-page.png");

    // Step 4: Open accessibility toolbar with Ctrl+F2
    console.log("\nStep 4: Opening accessibility toolbar (Ctrl+F2)");
    await page.keyboard.down("Control");
    await page.keyboard.press("F2");
    await page.keyboard.up("Control");
    await sleep(2000); // Wait for toolbar to open

    // Step 5: Take screenshot of toolbar in initial language
    console.log("\nStep 5: Taking screenshot of toolbar in initial language");
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, "2-toolbar-initial-language.png"),
      fullPage: true,
    });
    console.log("  Screenshot saved: 2-toolbar-initial-language.png");

    // Check if toolbar is visible
    const toolbarVisible = await page.evaluate(() => {
      const toolbar = document.getElementById("mic-init-access-tool");
      return toolbar && toolbar.style.display !== "none";
    });
    console.log("  Toolbar visible:", toolbarVisible);

    // Try to get toolbar language
    const toolbarLang = await page.evaluate(() => {
      const toolbar = document.getElementById("mic-init-access-tool");
      if (!toolbar) return null;
      // Look for language indicators in the toolbar
      const resetButton = toolbar.querySelector(".vi-tooltip");
      return {
        hasToolbar: !!toolbar,
        resetButtonText: resetButton ? resetButton.textContent : null,
        toolbarHTML: toolbar.innerHTML.substring(0, 500), // First 500 chars
      };
    });
    console.log("  Toolbar info:", toolbarLang);

    // Step 6: Close the toolbar (press Escape)
    console.log("\nStep 6: Closing toolbar (Escape)");
    await page.keyboard.press("Escape");
    await sleep(1000);

    // Step 7: Find and click language switcher to change to Hebrew
    console.log("\nStep 7: Switching language to Hebrew");

    // Look for the language switcher button (Languages icon)
    const languageSwitcherClicked = await page.evaluate(() => {
      // Find the button with the Languages icon
      const buttons = Array.from(document.querySelectorAll("button"));
      const langButton = buttons.find((btn) => {
        const svg = btn.querySelector("svg");
        return svg && btn.querySelector('[class*="lucide"]');
      });

      if (langButton) {
        langButton.click();
        return true;
      }
      return false;
    });

    if (languageSwitcherClicked) {
      console.log("  Language switcher button clicked");
      await sleep(500);

      // Take screenshot of dropdown
      await page.screenshot({
        path: join(SCREENSHOTS_DIR, "3-language-dropdown.png"),
        fullPage: true,
      });
      console.log("  Screenshot saved: 3-language-dropdown.png");

      // Click on Hebrew option (עברית)
      const hebrewClicked = await page.evaluate(() => {
        const menuItems = Array.from(
          document.querySelectorAll('[role="menuitem"]'),
        );
        const hebrewItem = menuItems.find((item) =>
          item.textContent.includes("עברית"),
        );
        if (hebrewItem) {
          hebrewItem.click();
          return true;
        }
        return false;
      });

      if (hebrewClicked) {
        console.log("  Hebrew option clicked");
        await sleep(1000); // Wait for language change to take effect
      } else {
        console.log("  WARNING: Could not find Hebrew option in dropdown");
      }
    } else {
      console.log("  WARNING: Could not find language switcher button");
    }

    // Step 8: Check HTML lang attribute after switching
    console.log("\nStep 8: Checking HTML lang attribute after switching");
    const newLang = await page.evaluate(() => document.documentElement.lang);
    const newDir = await page.evaluate(() => document.documentElement.dir);
    console.log("  New lang:", newLang);
    console.log("  New dir:", newDir);

    // Take screenshot after language change
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, "4-page-after-language-switch.png"),
      fullPage: true,
    });
    console.log("  Screenshot saved: 4-page-after-language-switch.png");

    // Step 9: Open toolbar again with Ctrl+F2
    console.log("\nStep 9: Opening accessibility toolbar again (Ctrl+F2)");
    await page.keyboard.down("Control");
    await page.keyboard.press("F2");
    await page.keyboard.up("Control");
    await sleep(2000); // Wait for toolbar to open

    // Step 10: Take screenshot of toolbar in new language
    console.log("\nStep 10: Taking screenshot of toolbar in new language");
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, "5-toolbar-after-language-switch.png"),
      fullPage: true,
    });
    console.log("  Screenshot saved: 5-toolbar-after-language-switch.png");

    // Check toolbar language again
    const toolbarLangAfter = await page.evaluate(() => {
      const toolbar = document.getElementById("mic-init-access-tool");
      if (!toolbar) return null;
      const resetButton = toolbar.querySelector(".vi-tooltip");
      return {
        hasToolbar: !!toolbar,
        resetButtonText: resetButton ? resetButton.textContent : null,
        toolbarHTML: toolbar.innerHTML.substring(0, 500),
      };
    });
    console.log("  Toolbar info after switch:", toolbarLangAfter);

    // Generate report
    console.log("\n" + "=".repeat(60));
    console.log("TEST REPORT");
    console.log("=".repeat(60));
    console.log("\n1. HTML lang attribute:");
    console.log("   Before switching:", initialLang, `(dir: ${initialDir})`);
    console.log("   After switching: ", newLang, `(dir: ${newDir})`);
    console.log("   ✓ Lang attribute changed:", initialLang !== newLang);

    console.log("\n2. Toolbar language:");
    if (toolbarLang && toolbarLangAfter) {
      console.log("   Before switching:", toolbarLang.resetButtonText);
      console.log("   After switching: ", toolbarLangAfter.resetButtonText);

      // Check if toolbar text changed
      const textChanged =
        toolbarLang.resetButtonText !== toolbarLangAfter.resetButtonText;
      if (textChanged) {
        console.log("   ✓ Toolbar text changed - language switching works!");
      } else {
        console.log("   ✗ Toolbar text did NOT change - potential issue");
      }
    }

    console.log("\n3. Console errors:");
    if (errorMessages.length > 0) {
      console.log("   Errors found:", errorMessages.length);
      errorMessages.forEach((err) => console.log("   -", err));
    } else {
      console.log("   ✓ No errors in console");
    }

    console.log("\n4. Screenshots saved to:", SCREENSHOTS_DIR);
    console.log("   - 1-initial-page.png");
    console.log("   - 2-toolbar-initial-language.png");
    console.log("   - 3-language-dropdown.png");
    console.log("   - 4-page-after-language-switch.png");
    console.log("   - 5-toolbar-after-language-switch.png");

    // Save detailed report to file
    const report = {
      timestamp: new Date().toISOString(),
      langAttributes: {
        before: { lang: initialLang, dir: initialDir },
        after: { lang: newLang, dir: newDir },
      },
      toolbar: {
        before: toolbarLang,
        after: toolbarLangAfter,
      },
      consoleMessages,
      errorMessages,
    };

    writeFileSync(
      join(SCREENSHOTS_DIR, "test-report.json"),
      JSON.stringify(report, null, 2),
    );
    console.log("   - test-report.json");

    console.log("\n" + "=".repeat(60));

    // Keep browser open for 5 seconds so user can see final state
    console.log("\nKeeping browser open for 5 seconds...");
    await sleep(5000);
  } catch (error) {
    console.error("\n❌ Test failed with error:", error);
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, "error.png"),
      fullPage: true,
    });
  } finally {
    await browser.close();
    console.log("\nTest completed. Browser closed.");
  }
}

// Run the test
testAccessibilityToolbar().catch(console.error);
