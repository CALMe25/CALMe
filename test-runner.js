#!/usr/bin/env node

// Interactive Test Runner for CALMe Conversation Flows
// Provides guided testing through each scenario

const readline = require("readline");
const testScenarios = require("./test-conversation-flows.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let currentScenario = 0;
let currentInput = 0;

function displayHeader() {
  console.clear();
  console.log("🧠 CALMe Phase 2 - Interactive Test Runner");
  console.log("==========================================");
  console.log("");
}

function displayScenario(scenarioIndex) {
  const scenario = testScenarios[scenarioIndex];
  console.log(`📋 TEST ${scenarioIndex + 1}/${testScenarios.length}: ${scenario.name}`);
  console.log(`📖 ${scenario.description}`);
  console.log(`🗺️  Expected: ${scenario.expectedFlow}`);
  console.log("");
}

function displayInput(scenarioIndex, inputIndex) {
  const scenario = testScenarios[scenarioIndex];
  const input = scenario.inputs[inputIndex];

  console.log(`💬 Input ${inputIndex + 1}/${scenario.inputs.length}:`);
  console.log(`"${input}"`);
  console.log("");
  console.log("👆 Copy the text above and paste it into the CALMe app");
  console.log("");
}

function promptNext() {
  rl.question(
    "Press Enter when ready for next input (or 'skip' for next scenario, 'quit' to exit): ",
    (answer) => {
      if (answer.toLowerCase() === "quit") {
        console.log("🏁 Testing session ended.");
        rl.close();
        return;
      }

      if (answer.toLowerCase() === "skip") {
        currentScenario++;
        currentInput = 0;

        if (currentScenario >= testScenarios.length) {
          console.log("🎉 All test scenarios completed!");
          rl.close();
          return;
        }

        showCurrentTest();
        return;
      }

      // Move to next input
      currentInput++;

      if (currentInput >= testScenarios[currentScenario].inputs.length) {
        // Scenario complete
        console.log("✅ Scenario completed! Moving to next...");
        console.log("");
        currentScenario++;
        currentInput = 0;

        if (currentScenario >= testScenarios.length) {
          console.log("🎉 All test scenarios completed!");
          console.log("");
          console.log("📊 Testing Summary:");
          console.log(`- Tested ${testScenarios.length} conversation flow scenarios`);
          console.log("- Covered safety, stress, location, and social assessments");
          console.log("- Verified activity triggers and return flows");
          console.log("- Tested emergency protocols and ongoing support");
          console.log("");
          console.log("🔍 Review your observations and verify:");
          console.log("□ Parser classifications were accurate");
          console.log("□ Conversation flows matched expected paths");
          console.log("□ Activities triggered at appropriate times");
          console.log("□ User experience felt natural and therapeutic");
          rl.close();
          return;
        }

        setTimeout(() => {
          showCurrentTest();
        }, 1000);
        return;
      }

      // Show next input
      showCurrentTest();
    },
  );
}

function showCurrentTest() {
  displayHeader();
  displayScenario(currentScenario);
  displayInput(currentScenario, currentInput);
  promptNext();
}

// Start the test runner
console.log("🚀 CALMe Conversation Flow Test Runner");
console.log("");
console.log("Instructions:");
console.log("1. Make sure CALMe is running (npm run dev)");
console.log("2. Open http://localhost:5174 in your browser");
console.log("3. This script will guide you through test inputs");
console.log("4. Copy each provided input and paste it into the app");
console.log("5. Observe how the conversation flows");
console.log("");

rl.question("Ready to start testing? (Press Enter): ", () => {
  showCurrentTest();
});

// Handle cleanup
process.on("SIGINT", () => {
  console.log("\n🛑 Test runner interrupted");
  rl.close();
});
