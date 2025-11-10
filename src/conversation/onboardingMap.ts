// Onboarding Conversation Map - Based on profile-intro-questions.md
// Handles first-time user setup and profile creation

import type {
  ConversationMap,
  ConversationNode,
} from "./ConversationController";

// Helper to create conversation nodes
const createNode = (
  id: string,
  content: string,
  type: "question" | "activity" | "decision" | "end" = "question",
  next?: string | ConversationNode["next"],
  parser?: string,
  activity?: string,
): [string, ConversationNode] => {
  return [id, { id, type, content, next, parser, activity }];
};

// Build the onboarding conversation map
const nodes = new Map<string, ConversationNode>([
  // === WELCOME ===
  createNode(
    "onboard_start",
    "Welcome to CALMe. I'm here to support you during stressful moments. First, let me get to know you a bit. What should I call you?",
    "question",
    "onboard_name_confirm",
    "extractName",
  ),

  createNode(
    "onboard_name_confirm",
    "Nice to meet you, {name}. Is that the name you'd like me to use during emergencies?",
    "question",
    {
      conditions: [
        { if: 'category === "yes"', goto: "onboard_safe_space" },
        { if: 'category === "no"', goto: "onboard_name_retry" },
        { default: true, goto: "onboard_safe_space" },
      ],
    },
    "parseYesNo",
  ),

  createNode(
    "onboard_name_retry",
    "What name would you prefer I use?",
    "question",
    "onboard_safe_space",
    "extractName",
  ),

  // === SAFE SPACE SETUP ===
  createNode(
    "onboard_safe_space",
    "During emergencies, where is your designated safe space? For example: a public shelter, your home's safe room, a stairway, or another protected area.",
    "question",
    {
      conditions: [
        {
          if: 'extractedValue.includes("miklat") || extractedValue.includes("shelter")',
          goto: "onboard_miklat_details",
        },
        {
          if: 'extractedValue.includes("mamad") || extractedValue.includes("safe room")',
          goto: "onboard_mamad_details",
        },
        {
          if: 'extractedValue.includes("stair")',
          goto: "onboard_stairway_details",
        },
        { if: 'extractedValue.includes("home")', goto: "onboard_home_clarify" },
        { default: true, goto: "onboard_other_location" },
      ],
    },
    "extractLocation",
  ),

  createNode(
    "onboard_home_clarify",
    "Is your safe space at home a reinforced room (Mamad) or another area?",
    "question",
    {
      conditions: [
        {
          if: 'extractedValue.includes("mamad") || extractedValue.includes("reinforced")',
          goto: "onboard_mamad_details",
        },
        { default: true, goto: "onboard_other_location" },
      ],
    },
    "extractLocation",
  ),

  createNode(
    "onboard_miklat_details",
    "Good choice. Can you tell me the address or building name of this shelter?",
    "question",
    "onboard_time_to_safety",
    "extractLocation",
  ),

  createNode(
    "onboard_mamad_details",
    "Great. Where in your home is the Mamad located?",
    "question",
    "onboard_time_to_safety",
    "extractLocation",
  ),

  createNode(
    "onboard_stairway_details",
    "Stairways can be good protection. Which building and floor is this in?",
    "question",
    "onboard_time_to_safety",
    "extractLocation",
  ),

  createNode(
    "onboard_other_location",
    "I understand. Can you describe exactly where this safe space is?",
    "question",
    "onboard_time_to_safety",
    "extractLocation",
  ),

  createNode(
    "onboard_time_to_safety",
    "How long does it usually take you to reach this location? For example: 30 seconds, 1 minute, 2 minutes?",
    "question",
    "onboard_backup_location",
    "extractDuration",
  ),

  createNode(
    "onboard_backup_location",
    "What's your backup plan if this location is unavailable?",
    "question",
    "onboard_accessibility",
    "extractLocation",
  ),

  // === ACCESSIBILITY NEEDS ===
  createNode(
    "onboard_accessibility",
    "During emergencies, do you need any special assistance? For example: extra time to move, visual alerts, simple instructions, or help with dependents?",
    "question",
    {
      conditions: [
        {
          if: 'category === "no" || extractedValue.includes("no") || extractedValue.includes("none")',
          goto: "onboard_calming_preferences",
        },
        { default: true, goto: "onboard_accessibility_details" },
      ],
    },
    "extractAccessibilityNeeds",
  ),

  createNode(
    "onboard_accessibility_details",
    "I'll make sure to accommodate that. Anything else I should know about?",
    "question",
    "onboard_calming_preferences",
    "extractAccessibilityNeeds",
  ),

  // === CALMING PREFERENCES ===
  createNode(
    "onboard_calming_preferences",
    "What helps you stay calm when you're scared or stressed? Breathing exercises, calming sounds, someone talking you through it, or something else?",
    "question",
    "onboard_communication_preference",
    "parseActivityPreference",
  ),

  // === COMMUNICATION PREFERENCES ===
  createNode(
    "onboard_communication_preference",
    "How should I communicate with you during an emergency? Voice instructions, visual text, or both?",
    "question",
    "onboard_emergency_contacts",
    "extractCommunicationPreference",
  ),

  // === EMERGENCY CONTACTS ===
  createNode(
    "onboard_emergency_contacts",
    "Should I notify anyone once you're safe? You can skip this if you prefer.",
    "question",
    {
      conditions: [
        {
          if: 'category === "no" || extractedValue.includes("skip") || extractedValue.includes("no")',
          goto: "onboard_review",
        },
        { default: true, goto: "onboard_contact_details" },
      ],
    },
    "parseYesNo",
  ),

  createNode(
    "onboard_contact_details",
    "What's their name and phone number?",
    "question",
    "onboard_review",
    "extractContact",
  ),

  // === PROFILE REVIEW ===
  createNode(
    "onboard_review",
    "{name}, here's your emergency profile:\n🏠 Safe space: {safeSpace} ({timeToSafety} to reach)\n♿ Accessibility: {accessibilityNeeds}\n🫁 Calming method: {calmingPreference}\n🗣️ Communication: {communicationPreference}\n\nDoes this look right?",
    "question",
    {
      conditions: [
        { if: 'category === "yes"', goto: "onboard_test_offer" },
        { if: 'category === "no"', goto: "onboard_what_to_change" },
        { default: true, goto: "onboard_test_offer" },
      ],
    },
    "parseYesNo",
  ),

  createNode(
    "onboard_what_to_change",
    "What would you like to change?",
    "question",
    "onboard_safe_space", // Loop back to relevant section based on response
    "extractChangeRequest",
  ),

  // === TEST PROTOCOL ===
  createNode(
    "onboard_test_offer",
    "Would you like to do a quick test of your emergency setup? This is optional but recommended.",
    "question",
    {
      conditions: [
        { if: 'category === "yes"', goto: "onboard_test_sound" },
        { if: 'category === "no"', goto: "onboard_complete" },
        { default: true, goto: "onboard_complete" },
      ],
    },
    "parseYesNo",
  ),

  createNode(
    "onboard_test_sound",
    "I'll play a quiet alert sound now. Ready?",
    "question",
    "onboard_test_breathing",
    "parseYesNo",
  ),

  createNode(
    "onboard_test_breathing",
    "Great! Now let's try a quick breathing exercise to make sure everything works.",
    "activity",
    "onboard_test_complete",
    undefined,
    "breathing",
  ),

  createNode(
    "onboard_test_complete",
    "Perfect! Everything is working well.",
    "question",
    "onboard_complete",
  ),

  // === COMPLETION ===
  createNode(
    "onboard_complete",
    "Your emergency profile is ready, {name}. When you need me, I'll be here. The app will automatically launch 90 seconds after any red alert to guide you to safety and help you stay calm.",
    "end",
  ),
]);

// Additional parser for onboarding-specific extractions
export const onboardingParsers = {
  extractName: (input: string) => {
    // Simple name extraction - takes the first capitalized word or the whole input
    const words = input.split(" ");
    const name = words.find((word) => /^[A-Z]/.test(word)) ?? input.trim();
    return {
      type: "extraction" as const,
      extractedValue: name,
      confidence: 0.8,
      informationType: "name",
    };
  },

  extractDuration: (input: string) => {
    // Extract time duration (seconds, minutes)
    const patterns = [
      /(\d+)\s*(second|sec|s)/i,
      /(\d+)\s*(minute|min|m)/i,
      /(half|½)\s*a?\s*minute/i,
      /minute\s*and\s*a?\s*half/i,
    ];

    let duration = "";
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        if (match[0].includes("half")) {
          duration = "30 seconds";
        } else {
          duration = match[0];
        }
        break;
      }
    }

    return {
      type: "extraction" as const,
      extractedValue: duration || input,
      confidence: duration ? 0.9 : 0.5,
      informationType: "duration",
    };
  },

  extractAccessibilityNeeds: (input: string) => {
    const needs = [];
    const keywords = {
      mobility: ["wheelchair", "walk", "move", "mobility", "slow"],
      hearing: ["deaf", "hearing", "sound", "audio"],
      vision: ["blind", "vision", "see", "visual"],
      cognitive: ["simple", "confused", "repeat", "clear"],
      medical: ["medication", "medical", "condition"],
      dependents: ["children", "elderly", "pets", "family"],
    };

    const lowerInput = input.toLowerCase();
    for (const [need, words] of Object.entries(keywords)) {
      if (words.some((word) => lowerInput.includes(word))) {
        needs.push(need);
      }
    }

    return {
      type: "extraction" as const,
      extractedValue: needs.length > 0 ? needs.join(", ") : "none",
      confidence: 0.8,
      informationType: "accessibility",
    };
  },

  extractCommunicationPreference: (input: string) => {
    const lowerInput = input.toLowerCase();
    let preference = "both";

    if (
      lowerInput.includes("voice") ||
      lowerInput.includes("audio") ||
      lowerInput.includes("sound")
    ) {
      preference = "audio";
    } else if (
      lowerInput.includes("text") ||
      lowerInput.includes("visual") ||
      lowerInput.includes("read")
    ) {
      preference = "visual";
    } else if (lowerInput.includes("both") || lowerInput.includes("either")) {
      preference = "both";
    }

    return {
      type: "extraction" as const,
      extractedValue: preference,
      confidence: 0.8,
      informationType: "communication",
    };
  },

  extractContact: (input: string) => {
    // Simple extraction - in production would parse name and phone
    return {
      type: "extraction" as const,
      extractedValue: input.trim(),
      confidence: 0.7,
      informationType: "contact",
    };
  },

  extractChangeRequest: (input: string) => {
    // Determine what the user wants to change
    const lowerInput = input.toLowerCase();
    let changeType = "general";

    if (lowerInput.includes("name")) changeType = "name";
    else if (lowerInput.includes("location") || lowerInput.includes("space"))
      changeType = "location";
    else if (lowerInput.includes("time")) changeType = "time";
    else if (lowerInput.includes("access")) changeType = "accessibility";
    else if (lowerInput.includes("calm")) changeType = "calming";

    return {
      type: "extraction" as const,
      extractedValue: changeType,
      confidence: 0.7,
      informationType: "change_request",
    };
  },
};

export const onboardingConversationMap: ConversationMap = {
  startNode: "onboard_start",
  nodes: nodes,
};
