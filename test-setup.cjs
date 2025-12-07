// Test Setup for CALMe - Creates a testable version of the conversation system
// This bridges the TypeScript modules for Node.js testing

// Mock TypeScript modules for testing since Node.js can't directly import TS
class MockConversationController {
  constructor() {
    this.currentNodeId = "safety_check";
    this.conversationMap = this.createMockMap();
  }

  createMockMap() {
    return new Map([
      [
        "safety_check",
        {
          id: "safety_check",
          type: "question",
          content:
            "Hello! I'm here with you. First, I need to understand if you're currently in a safe place?",
          parser: "classifySafety",
          next: {
            conditions: [
              { if: 'category === "SAFE"', goto: "stress_level" },
              { if: 'category === "DANGER"', goto: "emergency_mode" },
              { if: 'category === "UNSURE"', goto: "safety_clarify" },
              { default: "stress_level", goto: "stress_level" },
            ],
          },
        },
      ],
      [
        "safety_clarify",
        {
          id: "safety_clarify",
          type: "question",
          content: "Can you get to a secure location right now?",
          parser: "classifySafety",
          next: {
            conditions: [
              { if: 'category === "SAFE"', goto: "stress_level" },
              { if: 'category === "DANGER"', goto: "emergency_mode" },
              { default: "stress_level", goto: "stress_level" },
            ],
          },
        },
      ],
      [
        "emergency_mode",
        {
          id: "emergency_mode",
          type: "end",
          content:
            "🚨 EMERGENCY PROTOCOL\n- Find shelter immediately\n- Follow official instructions\n- Stay low and quiet",
        },
      ],
      [
        "stress_level",
        {
          id: "stress_level",
          type: "question",
          content: "How are you feeling right now?",
          parser: "classifyStress",
          next: {
            conditions: [
              { if: 'category === "HIGH_STRESS"', goto: "breathing_activity" },
              { if: 'category === "MODERATE_STRESS"', goto: "location_check" },
              { if: 'category === "LOW_STRESS"', goto: "social_check" },
              { if: 'category === "CONFUSED"', goto: "grounding_activity" },
              { default: "location_check", goto: "location_check" },
            ],
          },
        },
      ],
      [
        "breathing_activity",
        {
          id: "breathing_activity",
          type: "activity",
          content: "🫁 I'm going to start a breathing exercise to help calm your nervous system.",
          activity: "breathing",
          next: "breathing_return",
        },
      ],
      [
        "breathing_return",
        {
          id: "breathing_return",
          type: "question",
          content: "How do you feel after the breathing exercise?",
          parser: "classifyStress",
          next: {
            conditions: [
              {
                if: 'category === "LOW_STRESS" || category === "MODERATE_STRESS"',
                goto: "location_check",
              },
              { if: 'category === "HIGH_STRESS"', goto: "grounding_activity" },
              { default: "location_check", goto: "location_check" },
            ],
          },
        },
      ],
      [
        "grounding_activity",
        {
          id: "grounding_activity",
          type: "activity",
          content:
            "🎯 Let's try a focusing exercise - a card matching game to help ground your attention.",
          activity: "matching-cards",
          next: "grounding_return",
        },
      ],
      [
        "grounding_return",
        {
          id: "grounding_return",
          type: "question",
          content: "How was the focusing exercise?",
          parser: "classifyStress",
          next: {
            conditions: [
              {
                if: 'category === "LOW_STRESS" || category === "MODERATE_STRESS"',
                goto: "social_check",
              },
              { default: "social_check", goto: "social_check" },
            ],
          },
        },
      ],
      [
        "location_check",
        {
          id: "location_check",
          type: "question",
          content: "Where are you right now?",
          parser: "extractLocation",
          next: {
            conditions: [
              {
                if: 'extractedValue.toLowerCase().includes("home")',
                goto: "family_check",
              },
              { default: "social_check", goto: "social_check" },
            ],
          },
        },
      ],
      [
        "family_check",
        {
          id: "family_check",
          type: "question",
          content: "Is your family with you?",
          parser: "classifyStress",
          next: {
            conditions: [
              { if: 'category === "LOW_STRESS"', goto: "positive_coping" },
              { default: "social_check", goto: "social_check" },
            ],
          },
        },
      ],
      [
        "social_check",
        {
          id: "social_check",
          type: "question",
          content: "Are you alone or with others?",
          parser: "classifyStress",
          next: {
            conditions: [{ default: "ongoing_support", goto: "ongoing_support" }],
          },
        },
      ],
      [
        "positive_coping",
        {
          id: "positive_coping",
          type: "question",
          content: "✅ FAMILY SAFE TOGETHER\nYou're doing great keeping everyone safe.",
          parser: "classifyStress",
          next: "ongoing_support",
        },
      ],
      [
        "ongoing_support",
        {
          id: "ongoing_support",
          type: "question",
          content: "What would be most helpful for you right now?",
          parser: "classifyStress",
          next: {
            conditions: [
              { if: 'category === "HIGH_STRESS"', goto: "breathing_activity" },
              { if: 'category === "LOW_STRESS"', goto: "positive_ending" },
              {
                default: "continued_conversation",
                goto: "continued_conversation",
              },
            ],
          },
        },
      ],
      [
        "continued_conversation",
        {
          id: "continued_conversation",
          type: "question",
          content: "We can keep talking as long as you need.",
          parser: "classifyStress",
          next: "stress_level",
        },
      ],
      [
        "positive_ending",
        {
          id: "positive_ending",
          type: "end",
          content: "🌟 YOU'VE SHOWN INCREDIBLE STRENGTH\nRemember: You survived today.",
        },
      ],
    ]);
  }

  getCurrentNode() {
    const node = this.conversationMap.get(this.currentNodeId);
    if (!node) {
      throw new Error(`Node ${this.currentNodeId} not found`);
    }
    return node;
  }

  getCurrentParserType() {
    const currentNode = this.getCurrentNode();
    return currentNode.parser || null;
  }

  moveToNode(nodeId) {
    const node = this.conversationMap.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }
    this.currentNodeId = nodeId;
    return node;
  }

  isComplete() {
    const currentNode = this.getCurrentNode();
    return currentNode.type === "end";
  }

  evaluateConditions(decisionLogic, result) {
    for (const condition of decisionLogic.conditions) {
      if (condition.if) {
        const evaluationContext = {
          category: result.type === "classification" ? result.category : undefined,
          extractedValue: result.type === "extraction" ? result.extractedValue : undefined,
          confidence: result.confidence,
        };

        try {
          if (this.evaluateCondition(condition.if, evaluationContext)) {
            return condition.goto;
          }
        } catch (error) {
          console.warn(`Error evaluating condition: ${condition.if}`, error);
          continue;
        }
      } else if (condition.default) {
        return condition.goto;
      }
    }

    return decisionLogic.conditions[0]?.goto || "ongoing_support";
  }

  evaluateCondition(conditionStr, context) {
    const { category, extractedValue } = context;

    if (conditionStr.includes("category ===")) {
      const match = conditionStr.match(/category === ["']([^"']+)["']/);
      if (match && category) {
        return category === match[1];
      }
    }

    if (conditionStr.includes("||")) {
      const conditions = conditionStr.split("||").map((c) => c.trim());
      return conditions.some((cond) => this.evaluateCondition(cond, context));
    }

    if (conditionStr.includes("extractedValue") && extractedValue) {
      if (conditionStr.includes(".toLowerCase().includes(")) {
        const match = conditionStr.match(
          /extractedValue\.toLowerCase\(\)\.includes\(["']([^"']+)["']\)/,
        );
        if (match) {
          return extractedValue.toLowerCase().includes(match[1]);
        }
      }
    }

    return false;
  }

  processParserOutput(result) {
    const currentNode = this.getCurrentNode();

    if (!currentNode.next) {
      throw new Error(`Node ${this.currentNodeId} has no next steps defined`);
    }

    let nextNodeId;

    if (typeof currentNode.next === "string") {
      nextNodeId = currentNode.next;
    } else {
      nextNodeId = this.evaluateConditions(currentNode.next, result);
    }

    const nextNode = this.moveToNode(nextNodeId);

    let activityTrigger;
    if (nextNode.type === "activity" && nextNode.activity) {
      activityTrigger = {
        activityName: nextNode.activity,
        returnNode: nextNode.next,
      };
    }

    return { nextNode, activityTrigger };
  }
}

// Export the mock controller
module.exports = {
  ConversationController: MockConversationController,
};
