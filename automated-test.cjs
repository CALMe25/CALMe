#!/usr/bin/env node

// Automated Test Suite for CALMe Phase 2 Conversation Flows
// Tests the conversation controller and parser integration programmatically

// Import the test-compatible conversation controller
const { ConversationController } = require("./test-setup.cjs");

// Simulated parser functions for testing
// These simulate the semantic parser behavior for automated testing

class TestRunner {
  constructor() {
    this.results = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  // Simulate parser functions for testing
  simulateClassifySafety(text) {
    const lowerText = text.toLowerCase();
    if (
      lowerText.includes("safe") ||
      lowerText.includes("home") ||
      lowerText.includes("shelter")
    ) {
      return {
        category: "SAFE",
        confidence: 0.85,
        reasoning: "Contains safety indicators",
      };
    } else if (
      lowerText.includes("danger") ||
      lowerText.includes("explosion") ||
      lowerText.includes("trapped")
    ) {
      return {
        category: "DANGER",
        confidence: 0.9,
        reasoning: "Contains danger indicators",
      };
    } else if (
      lowerText.includes("think") ||
      lowerText.includes("maybe") ||
      lowerText.includes("not sure")
    ) {
      return {
        category: "UNSURE",
        confidence: 0.75,
        reasoning: "Contains uncertainty indicators",
      };
    }
    return {
      category: "SAFE",
      confidence: 0.6,
      reasoning: "Default classification",
    };
  }

  simulateClassifyStress(text) {
    const lowerText = text.toLowerCase();
    if (
      lowerText.includes("panic") ||
      lowerText.includes("breathe") ||
      lowerText.includes("heart racing") ||
      lowerText.includes("pounding")
    ) {
      return {
        category: "HIGH_STRESS",
        confidence: 0.9,
        reasoning: "Contains panic indicators",
      };
    } else if (
      lowerText.includes("anxious") ||
      lowerText.includes("worried") ||
      lowerText.includes("stressed")
    ) {
      return {
        category: "MODERATE_STRESS",
        confidence: 0.8,
        reasoning: "Contains moderate stress indicators",
      };
    } else if (
      lowerText.includes("calm") ||
      lowerText.includes("okay") ||
      lowerText.includes("fine") ||
      lowerText.includes("better")
    ) {
      return {
        category: "LOW_STRESS",
        confidence: 0.85,
        reasoning: "Contains calm indicators",
      };
    } else if (
      lowerText.includes("fuzzy") ||
      lowerText.includes("distant") ||
      lowerText.includes("numb") ||
      lowerText.includes("don't know")
    ) {
      return {
        category: "CONFUSED",
        confidence: 0.8,
        reasoning: "Contains dissociation indicators",
      };
    }
    return {
      category: "MODERATE_STRESS",
      confidence: 0.6,
      reasoning: "Default classification",
    };
  }

  simulateExtractLocation(text) {
    const lowerText = text.toLowerCase();
    let extractedValue = "unknown location";
    let confidence = 0.5;

    if (lowerText.includes("home") || lowerText.includes("house")) {
      extractedValue = "home";
      confidence = 0.9;
    } else if (lowerText.includes("shelter")) {
      extractedValue = "shelter";
      confidence = 0.9;
    } else if (lowerText.includes("building") || lowerText.includes("office")) {
      extractedValue = "building";
      confidence = 0.8;
    } else if (lowerText.includes("apartment")) {
      extractedValue = "apartment";
      confidence = 0.9;
    }

    return {
      extractedValue,
      confidence,
      extractionMethod: "keyword matching simulation",
    };
  }

  processInput(controller, input, expectedParserType) {
    try {
      let parserResult;

      if (expectedParserType === "classifySafety") {
        const result = this.simulateClassifySafety(input);
        parserResult = {
          type: "classification",
          category: result.category,
          confidence: result.confidence,
          reasoning: result.reasoning,
        };
      } else if (expectedParserType === "classifyStress") {
        const result = this.simulateClassifyStress(input);
        parserResult = {
          type: "classification",
          category: result.category,
          confidence: result.confidence,
          reasoning: result.reasoning,
        };
      } else if (expectedParserType === "extractLocation") {
        const result = this.simulateExtractLocation(input);
        parserResult = {
          type: "extraction",
          extractedValue: result.extractedValue,
          confidence: result.confidence,
          informationType: "location",
          extractionMethod: result.extractionMethod,
        };
      } else {
        // Default to stress classification
        const result = this.simulateClassifyStress(input);
        parserResult = {
          type: "classification",
          category: result.category,
          confidence: result.confidence,
          reasoning: result.reasoning,
        };
      }

      const { nextNode, activityTrigger } =
        controller.processParserOutput(parserResult);

      return {
        success: true,
        parserResult,
        nextNode,
        activityTrigger,
        currentNodeId: nextNode.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        currentNodeId: null,
      };
    }
  }

  runScenario(scenario) {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    console.log(`📝 ${scenario.description}`);

    // Create a fresh controller for each scenario
    const controller = new ConversationController();
    const testResults = [];
    let currentStep = 1;
    let flowPath = [controller.getCurrentNode().id];

    for (const input of scenario.inputs) {
      console.log(`\n  Step ${currentStep}: "${input}"`);

      const currentNode = controller.getCurrentNode();
      const expectedParserType = controller.getCurrentParserType();

      console.log(`    Current Node: ${currentNode.id}`);
      console.log(`    Expected Parser: ${expectedParserType || "none"}`);

      if (currentNode.type === "end") {
        console.log(`    ⚠️  Conversation already ended at: ${currentNode.id}`);
        break;
      }

      const result = this.processInput(controller, input, expectedParserType);

      if (result.success) {
        console.log(
          `    ✅ Parser Result: ${JSON.stringify(result.parserResult)}`,
        );
        console.log(`    ➡️  Next Node: ${result.nextNode.id}`);

        if (result.activityTrigger) {
          console.log(
            `    🎯 Activity Triggered: ${result.activityTrigger.activityName}`,
          );
          console.log(
            `    🔄 Return Node: ${result.activityTrigger.returnNode}`,
          );

          // Simulate activity completion and return
          try {
            controller.moveToNode(result.activityTrigger.returnNode);
            const returnNode = controller.getCurrentNode();
            console.log(`    ↩️  Returned to: ${returnNode.id}`);
            flowPath.push(`${result.activityTrigger.activityName}_activity`);
            flowPath.push(returnNode.id);
          } catch (error) {
            console.log(
              `    ❌ Error returning from activity: ${error.message}`,
            );
          }
        } else {
          flowPath.push(result.currentNodeId);
        }

        testResults.push({
          step: currentStep,
          success: true,
          nodeId: result.currentNodeId,
        });
      } else {
        console.log(`    ❌ Error: ${result.error}`);
        testResults.push({
          step: currentStep,
          success: false,
          error: result.error,
        });
        this.failedTests++;
        break;
      }

      currentStep++;
    }

    const actualFlow = flowPath.join(" → ");
    console.log(`\n  📊 Actual Flow: ${actualFlow}`);
    console.log(`  🎯 Expected Flow: ${scenario.expectedFlow}`);

    // Simple flow comparison (could be more sophisticated)
    const flowMatch = this.compareFlows(actualFlow, scenario.expectedFlow);

    if (flowMatch) {
      console.log(`  ✅ Flow Test: PASSED`);
      this.passedTests++;
    } else {
      console.log(
        `  ❌ Flow Test: FAILED - Flow doesn't match expected pattern`,
      );
      this.failedTests++;
    }

    this.results.push({
      scenario: scenario.name,
      passed: flowMatch,
      actualFlow,
      expectedFlow: scenario.expectedFlow,
      steps: testResults,
    });

    return flowMatch;
  }

  compareFlows(actual, expected) {
    // Simple comparison - check if key nodes from expected flow appear in actual flow
    const expectedNodes = expected.split(" → ");
    const actualNodes = actual.split(" → ");

    // Check if at least 70% of expected nodes appear in the actual flow
    let matchCount = 0;
    for (const expectedNode of expectedNodes) {
      if (actualNodes.includes(expectedNode)) {
        matchCount++;
      }
    }

    const matchPercentage = matchCount / expectedNodes.length;
    return matchPercentage >= 0.7; // 70% match threshold
  }

  generateReport() {
    console.log("\n" + "=".repeat(80));
    console.log("📋 AUTOMATED TEST RESULTS");
    console.log("=".repeat(80));

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Passed: ${this.passedTests}`);
    console.log(`   ❌ Failed: ${this.failedTests}`);
    console.log(
      `   📈 Success Rate: ${Math.round((this.passedTests / (this.passedTests + this.failedTests)) * 100)}%`,
    );

    console.log(`\n📝 Detailed Results:`);
    this.results.forEach((result, index) => {
      const status = result.passed ? "✅ PASS" : "❌ FAIL";
      console.log(`   ${index + 1}. ${result.scenario}: ${status}`);
      if (!result.passed) {
        console.log(`      Expected: ${result.expectedFlow}`);
        console.log(`      Actual:   ${result.actualFlow}`);
      }
    });

    console.log(`\n🔍 Analysis:`);
    if (this.failedTests === 0) {
      console.log(
        "   🎉 All tests passed! The conversation flow system is working correctly.",
      );
    } else {
      console.log(
        `   ⚠️  ${this.failedTests} test(s) failed. Review the flow logic and parser accuracy.`,
      );
    }

    console.log(`\n💡 Recommendations:`);
    console.log("   - Review failed scenarios for parser accuracy");
    console.log("   - Check conversation flow conditions");
    console.log("   - Verify activity trigger logic");
    console.log(
      "   - Test with real semantic parser for production validation",
    );
  }
}

// Test scenarios (simplified for automated testing)
const testScenarios = [
  {
    name: "Safe Person with High Stress",
    description: "Person is safe but experiencing panic attack",
    inputs: [
      "I'm inside my apartment right now, but I'm really freaking out",
      "I can't catch my breath and my heart is pounding so fast",
      "That helped a little bit, I feel slightly calmer now",
    ],
    expectedFlow:
      "safety_check → stress_level → breathing_activity → breathing_return",
  },
  {
    name: "Emergency Situation",
    description: "Person in immediate danger",
    inputs: ["There are explosions nearby and I'm still outside"],
    expectedFlow: "safety_check → emergency_mode",
  },
  {
    name: "Uncertain Safety to Support",
    description: "Person unsure about safety, needs guidance",
    inputs: [
      "I think I'm okay but I'm not really sure",
      "Maybe I can find somewhere safer",
      "I'm feeling pretty anxious about everything",
    ],
    expectedFlow: "safety_check → safety_clarify → stress_level",
  },
  {
    name: "Low Stress Family Situation",
    description: "Calm person with family",
    inputs: [
      "We're all safe in our home",
      "I'm feeling pretty calm, keeping everyone calm",
      "We're at our house with my family",
    ],
    expectedFlow: "safety_check → stress_level → location_check",
  },
  {
    name: "Confused State Needing Grounding",
    description: "Person experiencing dissociation",
    inputs: [
      "I'm somewhere safe I think",
      "I don't really know how I'm feeling, everything seems fuzzy",
    ],
    expectedFlow: "safety_check → stress_level → grounding_activity",
  },
];

// Run the automated tests
async function runAutomatedTests() {
  console.log("🚀 Starting CALMe Phase 2 Automated Test Suite");
  console.log("===============================================");

  const testRunner = new TestRunner();

  console.log("\n📋 Test Configuration:");
  console.log(`   - ${testScenarios.length} scenarios to test`);
  console.log("   - Using simulated parser functions");
  console.log("   - Testing conversation flow logic");
  console.log("   - Validating activity triggers");

  // Run each test scenario
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n[${i + 1}/${testScenarios.length}] Running scenario...`);
    testRunner.runScenario(scenario);
  }

  // Generate final report
  testRunner.generateReport();

  return testRunner.passedTests === testScenarios.length;
}

// Export for use as module or run directly
if (require.main === module) {
  runAutomatedTests()
    .then((allPassed) => {
      process.exit(allPassed ? 0 : 1);
    })
    .catch((error) => {
      console.error("💥 Test suite crashed:", error);
      process.exit(1);
    });
}

module.exports = { runAutomatedTests, TestRunner };
