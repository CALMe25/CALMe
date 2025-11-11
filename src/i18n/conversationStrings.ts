// Conversation string keys mapped to node IDs
// This allows the conversation map to use keys instead of hardcoded strings
export const conversationStringKeys: Record<string, string> = {
  start: "conversation.start",
  start_clarify: "conversation.startClarify",
  no_stress_flow: "conversation.noStressFlow",
  end_positive: "conversation.endPositive",
  high_stress_immediate: "conversation.highStressImmediate",
  high_stress_grounding: "conversation.highStressGrounding",
};

// Helper function to check if a string is a translation key
export function isTranslationKey(str: string): boolean {
  return str.startsWith("conversation.") || str.includes(".");
}
