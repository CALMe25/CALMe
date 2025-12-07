// Conversation Map V2 - Based on provided Mermaid diagram
// This map defines the complete conversation flow for CALMe

import type { ConversationMap, ConversationNode } from "./ConversationController";

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

// Build the conversation map
const nodes = new Map<string, ConversationNode>([
  // === ENTRY POINTS ===
  createNode(
    "start",
    "I see you opened my app. I'm here with you. How do you feel right now?",
    "question",
    {
      conditions: [
        { if: 'category === "no_stress"', goto: "no_stress_flow" },
        { if: 'category === "moderate_stress"', goto: "moderate_stress_check" },
        { if: 'category === "high_stress"', goto: "high_stress_immediate" },
        { if: 'category === "in_transit"', goto: "transit_context" },
        { if: 'category === "outdoor_worker"', goto: "outdoor_context" },
        { if: 'category === "caregiver"', goto: "caregiver_context" },
        { if: "needsClarification === true", goto: "start_clarify" },
        { default: true, goto: "moderate_stress_check" },
      ],
    },
    "classifyStress",
  ),

  createNode(
    "start_clarify",
    "I didn't quite understand. Are you feeling relaxed, somewhat stressed, or very stressed?",
    "question",
    {
      conditions: [
        {
          if: 'category === "no_stress" || extractedValue.includes("relax")',
          goto: "no_stress_flow",
        },
        {
          if: 'category === "moderate_stress" || extractedValue.includes("somewhat")',
          goto: "moderate_stress_check",
        },
        {
          if: 'category === "high_stress" || extractedValue.includes("very")',
          goto: "high_stress_immediate",
        },
        { default: true, goto: "moderate_stress_check" },
      ],
    },
    "classifyStress",
  ),

  // === NO STRESS FLOW ===
  createNode(
    "no_stress_flow",
    "Thanks for checking in. You can return anytime. Would you like to do a small activity together?",
    "question",
    {
      conditions: [
        { if: 'category === "yes"', goto: "activity_choice" },
        { if: 'category === "no"', goto: "end_positive" },
        { default: true, goto: "end_positive" },
      ],
    },
    "parseYesNo",
  ),

  createNode("end_positive", "Great. Have a beautiful day!", "end"),

  // === HIGH STRESS FLOW ===
  createNode(
    "high_stress_immediate",
    "Let's focus on this moment, right now.",
    "question",
    "high_stress_grounding",
    "classifyStress",
  ),

  createNode(
    "high_stress_grounding",
    "Press your feet firmly to the floor. Feel that connection.",
    "question",
    "high_stress_breathing",
  ),

  createNode(
    "high_stress_breathing",
    "Now let's breathe together. In for 4... hold for 7... out for 8.",
    "activity",
    "high_stress_continue",
    undefined,
    "breathing",
  ),

  createNode(
    "high_stress_continue",
    "Continue breathing for a few more moments. How are you feeling now?",
    "question",
    {
      conditions: [
        {
          if: 'category === "no_stress" || category === "moderate_stress"',
          goto: "check_safety",
        },
        { if: 'category === "high_stress"', goto: "continue_support" },
        { default: true, goto: "check_safety" },
      ],
    },
    "classifyStress",
  ),

  // === MODERATE STRESS FLOW ===
  createNode("moderate_stress_check", "Let's check your surroundings.", "question", "check_safety"),

  // === SAFETY CHECK (Shared across flows) ===
  createNode(
    "check_safety",
    "Are you in a protected space right now?",
    "question",
    {
      conditions: [
        { if: 'category === "safe"', goto: "check_if_alone" },
        { if: 'category === "unsafe"', goto: "unsafe_can_move" },
        { if: "needsClarification === true", goto: "check_safety_clarify" },
        { default: true, goto: "check_safety_clarify" },
      ],
    },
    "classifySafety",
  ),

  createNode(
    "check_safety_clarify",
    "I need to make sure - are you in a safe, protected space right now?",
    "question",
    {
      conditions: [
        { if: 'category === "safe"', goto: "check_if_alone" },
        { if: 'category === "unsafe"', goto: "unsafe_can_move" },
        { default: true, goto: "unsafe_can_move" },
      ],
    },
    "classifySafety",
  ),

  createNode(
    "check_if_alone",
    "Are you with someone else?",
    "question",
    {
      conditions: [
        { if: 'category === "yes"', goto: "check_feel_safe_with_them" },
        { if: 'category === "no"', goto: "alone_support" },
        { default: true, goto: "alone_support" },
      ],
    },
    "parseYesNo",
  ),

  createNode(
    "check_feel_safe_with_them",
    "Do you feel safe with them?",
    "question",
    {
      conditions: [
        { if: 'category === "yes"', goto: "safe_with_someone" },
        { if: 'category === "no"', goto: "emergency_resources" },
        { default: true, goto: "safe_with_someone" },
      ],
    },
    "parseYesNo",
  ),

  createNode(
    "safe_with_someone",
    "Good to be with someone you trust. Let's work through what happened.",
    "question",
    "structure_experience",
  ),

  createNode(
    "alone_support",
    "I'm here with you as long as you need.",
    "question",
    "check_battery",
  ),

  createNode(
    "check_battery",
    "Is your phone battery charged?",
    "question",
    {
      conditions: [
        { if: 'category === "yes"', goto: "activity_choice" },
        { if: 'category === "no"', goto: "low_battery_warning" },
        { default: true, goto: "activity_choice" },
      ],
    },
    "parseYesNo",
  ),

  createNode(
    "low_battery_warning",
    "Let's try something brief to conserve battery.",
    "question",
    "activity_choice",
  ),

  // === UNSAFE FLOW ===
  createNode(
    "unsafe_can_move",
    "Can you get to a protected space?",
    "question",
    {
      conditions: [
        { if: 'category === "yes"', goto: "unsafe_moving" },
        { if: 'category === "no"', goto: "unsafe_check_guidelines" },
        { default: true, goto: "unsafe_check_guidelines" },
      ],
    },
    "parseYesNo",
  ),

  createNode(
    "unsafe_moving",
    "No time to waste. I'm with you every step.",
    "question",
    "end_stay_safe",
  ),

  createNode(
    "unsafe_check_guidelines",
    "Do you know the safety guidelines?",
    "question",
    {
      conditions: [
        { if: 'category === "yes"', goto: "unsafe_wait_together" },
        { if: 'category === "no"', goto: "provide_guidelines" },
        { default: true, goto: "provide_guidelines" },
      ],
    },
    "parseYesNo",
  ),

  createNode(
    "unsafe_wait_together",
    "I'll wait with you while we get through this.",
    "question",
    "continue_loop",
  ),

  createNode(
    "provide_guidelines",
    "Choose the safest nearby space—sealed room, stairwell, or hallway. [Link: Homefront Command Guidelines]",
    "question",
    "activity_choice",
  ),

  // === STRUCTURE EXPERIENCE (Moderate stress processing) ===
  createNode(
    "structure_experience",
    "Let's structure what happened—it helps with clarity.",
    "question",
    "acknowledge_difficulty",
  ),

  createNode(
    "acknowledge_difficulty",
    "Something hard happened. You're getting through it.",
    "question",
    "describe_experience",
  ),

  createNode(
    "describe_experience",
    "Can you describe what happened step-by-step?",
    "question",
    {
      conditions: [
        { if: "confidence > 0.5", goto: "validate_feelings" },
        { default: true, goto: "validate_feelings" },
      ],
    },
    "classifyStress",
  ),

  createNode(
    "validate_feelings",
    "Thanks for sharing. Feelings come and go—like waves.",
    "question",
    "continue_loop",
  ),

  // === ACTIVITY MENU ===
  createNode(
    "activity_choice",
    "What activity would you like to try?",
    "question",
    {
      conditions: [
        { if: 'category === "breathing"', goto: "activity_breathing" },
        { if: 'category === "stretching"', goto: "activity_stretching" },
        { if: 'category === "matching-cards"', goto: "activity_matching" },
        { if: 'category === "sudoku"', goto: "activity_sudoku" },
        { if: 'category === "puzzle"', goto: "activity_puzzle" },
        { if: 'category === "paint"', goto: "activity_paint" },
        { if: 'category === "grounding"', goto: "activity_grounding" },
        { if: 'category === "music"', goto: "activity_music" },
        { if: 'category === "story"', goto: "activity_story" },
        { if: 'category === "no_activity"', goto: "end_node" },
        { if: "needsClarification === true", goto: "activity_choice_clarify" },
        { default: true, goto: "activity_choice_clarify" },
      ],
    },
    "parseActivityPreference",
  ),

  createNode(
    "activity_choice_clarify",
    "Would you like to try breathing exercises, grounding techniques, or perhaps listen to something calming?",
    "question",
    {
      conditions: [
        { if: 'category === "breathing"', goto: "activity_breathing" },
        { if: 'category === "stretching"', goto: "activity_stretching" },
        { if: 'category === "matching-cards"', goto: "activity_matching" },
        { if: 'category === "grounding"', goto: "activity_grounding" },
        {
          if: 'extractedValue.includes("listen") || extractedValue.includes("music")',
          goto: "activity_music",
        },
        { if: 'category === "no_activity"', goto: "end_node" },
        { default: true, goto: "activity_breathing" },
      ],
    },
    "parseActivityPreference",
  ),

  // === ACTIVITIES ===
  createNode(
    "activity_breathing",
    "Starting breathing exercise...",
    "activity",
    "continue_loop",
    undefined,
    "breathing",
  ),

  createNode(
    "activity_grounding",
    "Starting 5-4-3-2-1 grounding technique...",
    "activity",
    "continue_loop",
    undefined,
    "grounding",
  ),

  createNode(
    "activity_stretching",
    "Starting stretching routine...",
    "activity",
    "continue_loop",
    undefined,
    "stretching",
  ),

  createNode(
    "activity_matching",
    "Starting card matching game...",
    "activity",
    "continue_loop",
    undefined,
    "matching-cards",
  ),

  createNode(
    "activity_sudoku",
    "Starting sudoku puzzle...",
    "activity",
    "continue_loop",
    undefined,
    "sudoku",
  ),

  createNode(
    "activity_puzzle",
    "Starting jigsaw puzzle...",
    "activity",
    "continue_loop",
    undefined,
    "puzzle",
  ),

  createNode(
    "activity_paint",
    "Opening digital canvas...",
    "activity",
    "continue_loop",
    undefined,
    "paint",
  ),

  createNode(
    "activity_music",
    'Activity "Relaxing Music" would be called, but is still in development.',
    "question",
    "continue_loop",
  ),

  createNode(
    "activity_story",
    'Activity "Calming Story" would be called, but is still in development.',
    "question",
    "continue_loop",
  ),

  // === CONTINUE LOOP ===
  createNode(
    "continue_loop",
    "How are you feeling now?",
    "question",
    {
      conditions: [
        {
          if: 'extractedValue.includes("better") || category === "no_stress"',
          goto: "end_node",
        },
        {
          if: 'extractedValue.includes("another") || extractedValue.includes("more")',
          goto: "activity_choice",
        },
        {
          if: 'extractedValue.includes("struggling") || category === "high_stress"',
          goto: "continue_support",
        },
        { default: true, goto: "continue_loop_options" },
      ],
    },
    "classifyStress",
  ),

  createNode(
    "continue_loop_options",
    "Would you like to try another activity, or are you feeling better?",
    "question",
    {
      conditions: [
        {
          if: 'extractedValue.includes("another") || extractedValue.includes("activity")',
          goto: "activity_choice",
        },
        {
          if: 'extractedValue.includes("better") || category === "yes"',
          goto: "end_node",
        },
        {
          if: 'extractedValue.includes("struggling")',
          goto: "continue_support",
        },
        { default: true, goto: "end_node" },
      ],
    },
    "classifyStress",
  ),

  // === EMERGENCY SUPPORT ===
  createNode(
    "continue_support",
    "I understand you're still struggling. Would you like to connect with professional support?",
    "question",
    {
      conditions: [
        { if: 'category === "yes"', goto: "emergency_resources" },
        { if: 'category === "no"', goto: "activity_choice" },
        { default: true, goto: "emergency_resources" },
      ],
    },
    "parseYesNo",
  ),

  createNode(
    "emergency_resources",
    "Here are immediate support options:\n• Emergency: MADA, Fire, Police\n• Mental Health: ERAN, Clalit, Maccabi\n• Chat Support: ERAN Live Chat, WhatsApp Tikva",
    "question",
    "continue_loop",
  ),

  // === SPECIAL CONTEXTS ===
  createNode(
    "transit_context",
    "I understand you're in transit. Let me help you stay calm while traveling.",
    "question",
    "check_safety",
  ),

  createNode(
    "outdoor_context",
    "Being outdoors can feel vulnerable. Let's focus on what you can control right now.",
    "question",
    "check_safety",
  ),

  createNode(
    "caregiver_context",
    "Supporting others is important. Let's make sure you're okay first.",
    "question",
    "check_safety",
  ),

  // === END STATES ===
  createNode("end_node", "Thanks for being here. You are welcome any time.", "end"),

  createNode(
    "end_stay_safe",
    "Stay safe. Remember, you can return here anytime you need support.",
    "end",
  ),

  // === ALERT FLOW (Separate entry point) ===
  createNode(
    "alert_start",
    "App launched after alert. You're not alone.",
    "question",
    "alert_focus",
  ),

  createNode(
    "alert_focus",
    "Let's focus on this moment, right now. Where are you?",
    "question",
    {
      conditions: [
        {
          if: 'extractedValue.includes("vehicle") || extractedValue.includes("car")',
          goto: "alert_transit",
        },
        { if: 'extractedValue.includes("home")', goto: "alert_home" },
        {
          if: 'extractedValue.includes("shelter") || extractedValue.includes("miklat")',
          goto: "alert_protected",
        },
        { default: true, goto: "alert_location_clarify" },
      ],
    },
    "extractLocation",
  ),

  createNode(
    "alert_location_clarify",
    "Where exactly are you right now? At home, in a shelter, or somewhere else?",
    "question",
    {
      conditions: [
        { if: 'extractedValue.includes("home")', goto: "alert_home" },
        { if: 'extractedValue.includes("shelter")', goto: "alert_protected" },
        { default: true, goto: "alert_get_safe" },
      ],
    },
    "extractLocation",
  ),

  createNode(
    "alert_transit",
    "Pull over safely if you can. If not, keep breathing steadily.",
    "question",
    "alert_breathing",
  ),

  createNode(
    "alert_home",
    "Good, you're at home. Get to your safe room immediately.",
    "question",
    "alert_breathing",
  ),

  createNode(
    "alert_protected",
    "Excellent, you're in a protected space. You're doing everything right.",
    "question",
    "alert_breathing",
  ),

  createNode(
    "alert_get_safe",
    "Get to the nearest protected space immediately. Move quickly but safely.",
    "question",
    "alert_breathing",
  ),

  createNode(
    "alert_breathing",
    "Now let's breathe together to stay calm.",
    "activity",
    "alert_wait",
    undefined,
    "breathing",
  ),

  createNode(
    "alert_wait",
    "I'm here with you. We'll get through this together.",
    "question",
    "alert_all_clear",
  ),

  createNode(
    "alert_all_clear",
    "Look at that, we made it! It's safe to leave the protected space whenever you feel ready.",
    "end",
  ),
]);

export const conversationMapV2: ConversationMap = {
  startNode: "start",
  nodes: nodes,
};
