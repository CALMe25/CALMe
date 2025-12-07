// Conversation Map Definition for CALMe Therapeutic Flow
// Based on the mermaid flowchart specification

import type { ConversationMap, ConversationNode } from "./ConversationController";

export const therapeuticConversationMap: ConversationMap = {
  startNode: "safety_check",
  nodes: new Map<string, ConversationNode>([
    // Start - Safety Assessment
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
          "🚨 EMERGENCY PROTOCOL\n- Find shelter immediately\n- Follow official instructions\n- Stay low and quiet\n\nReturn to this app when you're safe.",
      },
    ],

    // Stress Level Assessment
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

    // Activities
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
            { if: 'category === "CONFUSED"', goto: "distraction_activity" },
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
            {
              if: 'category === "HIGH_STRESS" || category === "CONFUSED"',
              goto: "location_check",
            },
            { default: "social_check", goto: "social_check" },
          ],
        },
      },
    ],

    [
      "distraction_activity",
      {
        id: "distraction_activity",
        type: "question",
        content:
          "🎮 Let's try a simple counting exercise: Can you count 5 things you can see around you right now?",
        parser: "extractLocation",
        next: "location_check",
      },
    ],

    // Location and Context
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
              if: 'extractedValue.toLowerCase().includes("home") || extractedValue.toLowerCase().includes("house")',
              goto: "family_check",
            },
            {
              if: 'extractedValue.toLowerCase().includes("shelter") || extractedValue.toLowerCase().includes("safe")',
              goto: "social_check",
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
            { if: 'category === "HIGH_STRESS"', goto: "separation_support" },
            {
              if: 'category === "MODERATE_STRESS"',
              goto: "communication_check",
            },
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
          conditions: [
            { if: 'category === "LOW_STRESS"', goto: "group_coping" },
            {
              if: 'category === "HIGH_STRESS" || category === "MODERATE_STRESS"',
              goto: "isolation_support",
            },
            { if: 'category === "CONFUSED"', goto: "connection_check" },
            { default: "ongoing_support", goto: "ongoing_support" },
          ],
        },
      },
    ],

    // Support Paths
    [
      "positive_coping",
      {
        id: "positive_coping",
        type: "question",
        content:
          "✅ FAMILY SAFE TOGETHER\nYou're doing great keeping everyone safe. Let's focus on staying calm for them. What would be most helpful right now?",
        parser: "classifyStress",
        next: "ongoing_support",
      },
    ],

    [
      "separation_support",
      {
        id: "separation_support",
        type: "question",
        content: "How are you coping with being separated from family?",
        parser: "classifyStress",
        next: {
          conditions: [
            {
              if: 'category === "LOW_STRESS" || category === "MODERATE_STRESS"',
              goto: "strength_reinforcement",
            },
            { if: 'category === "HIGH_STRESS"', goto: "worry_management" },
            { if: 'category === "CONFUSED"', goto: "breathing_activity" },
            {
              default: "strength_reinforcement",
              goto: "strength_reinforcement",
            },
          ],
        },
      },
    ],

    [
      "group_coping",
      {
        id: "group_coping",
        type: "question",
        content: "How is everyone in your group doing?",
        parser: "classifyStress",
        next: {
          conditions: [
            { if: 'category === "LOW_STRESS"', goto: "leadership_role" },
            { if: 'category === "MODERATE_STRESS"', goto: "helper_role" },
            { if: 'category === "HIGH_STRESS"', goto: "peace_keeping" },
            { default: "ongoing_support", goto: "ongoing_support" },
          ],
        },
      },
    ],

    [
      "isolation_support",
      {
        id: "isolation_support",
        type: "question",
        content: "Being alone during this must be really hard. How are you managing?",
        parser: "classifyStress",
        next: {
          conditions: [
            { if: 'category === "LOW_STRESS"', goto: "self_reliance" },
            { if: 'category === "HIGH_STRESS"', goto: "virtual_connection" },
            { if: 'category === "MODERATE_STRESS"', goto: "solitude_strength" },
            { default: "virtual_connection", goto: "virtual_connection" },
          ],
        },
      },
    ],

    // Advanced Support Strategies
    [
      "strength_reinforcement",
      {
        id: "strength_reinforcement",
        type: "question",
        content:
          "💪 RECOGNIZING YOUR STRENGTH\nYou're showing incredible resilience. What's helping you stay strong?",
        parser: "classifyStress",
        next: "ongoing_support",
      },
    ],

    [
      "worry_management",
      {
        id: "worry_management",
        type: "question",
        content:
          "Let's work on managing those worried thoughts. Are you ready to try some techniques?",
        parser: "classifyStress",
        next: {
          conditions: [
            {
              if: 'category === "LOW_STRESS" || category === "MODERATE_STRESS"',
              goto: "grounding_activity",
            },
            {
              if: 'category === "HIGH_STRESS" || category === "CONFUSED"',
              goto: "breathing_activity",
            },
            { default: "grounding_activity", goto: "grounding_activity" },
          ],
        },
      },
    ],

    [
      "leadership_role",
      {
        id: "leadership_role",
        type: "question",
        content:
          "👥 SUPPORTING YOUR GROUP\nYour calm leadership helps everyone feel safer. How can I support you in supporting them?",
        parser: "classifyStress",
        next: "ongoing_support",
      },
    ],

    [
      "helper_role",
      {
        id: "helper_role",
        type: "question",
        content: "You're taking care of others. How can we help you stay strong?",
        parser: "classifyStress",
        next: {
          conditions: [
            { if: 'category === "HIGH_STRESS"', goto: "breathing_activity" },
            {
              if: 'category === "LOW_STRESS" || category === "MODERATE_STRESS"',
              goto: "caregiver_support",
            },
            { default: "caregiver_support", goto: "caregiver_support" },
          ],
        },
      },
    ],

    [
      "virtual_connection",
      {
        id: "virtual_connection",
        type: "question",
        content:
          "📱 YOU'RE NOT TRULY ALONE\nWe're here with you through this app. What kind of support would help you feel less alone?",
        parser: "classifyStress",
        next: "ongoing_support",
      },
    ],

    [
      "caregiver_support",
      {
        id: "caregiver_support",
        type: "question",
        content:
          "🤝 CARING FOR THE CAREGIVER\nTaking care of yourself helps you take care of others. What do you need right now?",
        parser: "classifyStress",
        next: "ongoing_support",
      },
    ],

    [
      "communication_check",
      {
        id: "communication_check",
        type: "question",
        content: "Have you been able to contact your missing family or friends?",
        parser: "classifyStress",
        next: {
          conditions: [
            { if: 'category === "LOW_STRESS"', goto: "relief_processing" },
            {
              if: 'category === "HIGH_STRESS" || category === "MODERATE_STRESS"',
              goto: "uncertainty_coping",
            },
            { default: "uncertainty_coping", goto: "uncertainty_coping" },
          ],
        },
      },
    ],

    [
      "connection_check",
      {
        id: "connection_check",
        type: "question",
        content: "Tell me more about your situation with others.",
        parser: "classifyStress",
        next: "social_check",
      },
    ],

    [
      "relief_processing",
      {
        id: "relief_processing",
        type: "question",
        content:
          "😌 PROCESSING RELIEF\nIt's normal to feel many emotions even when everyone is safe. How are you processing everything?",
        parser: "classifyStress",
        next: "ongoing_support",
      },
    ],

    [
      "uncertainty_coping",
      {
        id: "uncertainty_coping",
        type: "question",
        content:
          "Not knowing is one of the hardest parts. How are you dealing with this uncertainty?",
        parser: "classifyStress",
        next: {
          conditions: [
            {
              if: 'category === "LOW_STRESS" || category === "MODERATE_STRESS"',
              goto: "strength_reinforcement",
            },
            {
              if: 'category === "HIGH_STRESS" || category === "CONFUSED"',
              goto: "grounding_activity",
            },
            {
              default: "strength_reinforcement",
              goto: "strength_reinforcement",
            },
          ],
        },
      },
    ],

    [
      "peace_keeping",
      {
        id: "peace_keeping",
        type: "question",
        content:
          "🕊️ KEEPING PEACE IN STRESS\nEveryone reacts differently to crisis - that's normal. How can I help you manage group dynamics?",
        parser: "classifyStress",
        next: "ongoing_support",
      },
    ],

    [
      "self_reliance",
      {
        id: "self_reliance",
        type: "question",
        content:
          "🎯 INNER STRENGTH\nYou're proving you can handle difficult situations. What's working best for you?",
        parser: "classifyStress",
        next: "ongoing_support",
      },
    ],

    [
      "solitude_strength",
      {
        id: "solitude_strength",
        type: "question",
        content:
          "🧘 FINDING CALM IN SOLITUDE\nSome people do find peace in quiet moments. How can we build on that strength?",
        parser: "classifyStress",
        next: "ongoing_support",
      },
    ],

    // Final Support and Continuation
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
            {
              if: 'category === "MODERATE_STRESS"',
              goto: "continued_conversation",
            },
            { if: 'category === "LOW_STRESS"', goto: "positive_ending" },
            { if: 'category === "CONFUSED"', goto: "helper_transition" },
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
        content: "We can keep talking as long as you need. What's on your mind?",
        parser: "classifyStress",
        next: "stress_level",
      },
    ],

    [
      "positive_ending",
      {
        id: "positive_ending",
        type: "end",
        content:
          "🌟 YOU'VE SHOWN INCREDIBLE STRENGTH\nRemember: You survived today. You kept yourself safe. That's what matters.\n\nIf you need support again, I'll be here.",
      },
    ],

    [
      "helper_transition",
      {
        id: "helper_transition",
        type: "end",
        content:
          "👨‍👩‍👧‍👦 HELPING YOUR FAMILY\nYou can share these same techniques with your loved ones. Take care of yourself so you can take care of them.",
      },
    ],
  ]),
};

// Enhanced decision logic type for complex conditions
export interface ConversationDecisionRule {
  if?: string;
  default?: string;
  goto: string;
}

export interface ConversationDecisionLogic {
  conditions: ConversationDecisionRule[];
}
