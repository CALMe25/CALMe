import { enhancedParser } from "../parser/enhancedParser";
import type {
  ConversationAnalysis,
  ConversationContext,
  ConversationPhase,
  SafetyLevel,
  StressLevel,
  SocialContext,
  LocationType,
} from "./types";

const crisisKeywords = [
  "cant breathe",
  "can not breathe",
  "dying",
  "going to die",
  "panic attack",
  "hyperventilating",
  "losing control",
  "help me",
  "someone help",
  "i need help",
  "cant move",
  "paralyzed",
  "frozen",
];

const activityKeywords = [
  "breathing",
  "breathe",
  "breath",
  "game",
  "play",
  "match",
  "cards",
  "sudoku",
  "puzzle",
  "snake",
  "draw",
  "paint",
  "canvas",
  "art",
  "stretch",
  "exercise",
  "activity",
  "something to do",
];

const closingKeywords = [
  "thanks",
  "thank you",
  "bye",
  "goodbye",
  "good bye",
  "im good",
  "i'm good",
  "im fine",
  "i'm fine",
  "im okay",
  "i'm okay",
  "im ok",
  "i'm ok",
  "take care",
  "see you",
  "later",
  "gotta go",
  "all good",
  "feeling better",
  "much better",
];

export function analyzeOffline(
  input: string,
  currentPhase: ConversationPhase,
  context: ConversationContext,
): ConversationAnalysis {
  const safety = extractSafety(input);
  const stressLevel = extractStress(input);
  const socialContext = extractSocialContext(input);
  const location = extractLocation(input);

  const updatedContext: ConversationContext = {
    ...context,
    safety: safety !== "unknown" ? safety : context.safety,
    stressLevel: stressLevel !== "moderate" ? stressLevel : context.stressLevel,
    socialContext: socialContext !== "unknown" ? socialContext : context.socialContext,
    location: location !== "unknown" ? location : context.location,
  };

  const suggestedPhase = determineSuggestedPhase(input, currentPhase, updatedContext);

  return {
    safety,
    stressLevel,
    socialContext,
    location,
    suggestedPhase,
    reply: "",
  };
}

function extractSafety(input: string): SafetyLevel {
  const result = enhancedParser.classifySafety(input);
  if (result.confidence < 0.5) return "unknown";
  switch (result.category) {
    case "SAFE":
      return "safe";
    case "DANGER":
      return "unsafe";
    default:
      return "unknown";
  }
}

function extractStress(input: string): StressLevel {
  const result = enhancedParser.classifyStress(input);
  if (result.confidence < 0.4) return "moderate";
  switch (result.category) {
    case "no_stress":
      return "calm";
    case "moderate_stress":
      return "moderate";
    case "high_stress": {
      const lower = input.toLowerCase();
      if (crisisKeywords.some((kw) => lower.includes(kw))) return "crisis";
      return "high";
    }
    default:
      return "moderate";
  }
}

function extractSocialContext(input: string): SocialContext {
  for (const mapping of enhancedParser.socialKeywords) {
    for (const keyword of mapping.keywords) {
      if (enhancedParser.matchesKeyword(input, keyword)) {
        switch (mapping.category) {
          case "alone":
            return "alone";
          case "with_others":
            return "with_others";
          case "caregiver":
            return "caregiver";
        }
      }
    }
  }
  return "unknown";
}

function extractLocation(input: string): LocationType {
  const result = enhancedParser.extractLocation(input);
  if (result.type !== "extraction" || !result.extractedValue) return "unknown";
  const loc = result.extractedValue.toLowerCase();
  if (["home", "house", "apartment", "flat", "my place", "my room"].includes(loc)) return "home";
  if (["shelter", "miklat", "mamad", "stairway", "bunker", "safe room", "stairwell"].includes(loc))
    return "shelter";

  const stressResult = enhancedParser.classifyStress(input);
  if (stressResult.category === "in_transit") return "transit";
  if (stressResult.category === "outdoor_worker") return "outdoors";
  return "unknown";
}

function determineSuggestedPhase(
  input: string,
  currentPhase: ConversationPhase,
  updatedContext: ConversationContext,
): ConversationPhase {
  const lowerInput = input.toLowerCase();

  if (updatedContext.safety === "unsafe") return "ensure_safety";
  if (updatedContext.stressLevel === "crisis" && !updatedContext.hasStabilized) return "stabilize";
  if (updatedContext.isAlertActive && currentPhase === "connect") return "ensure_safety";
  if (activityKeywords.some((kw) => lowerInput.includes(kw))) return "activity";
  if (closingKeywords.some((kw) => lowerInput.includes(kw))) return "closing";
  if (currentPhase === "connect") return "engage";
  if (currentPhase === "engage") return "engage";
  if (currentPhase === "stabilize") return "engage";
  if (currentPhase === "ensure_safety" && updatedContext.safety === "safe") {
    if (updatedContext.stressLevel === "crisis" && !updatedContext.hasStabilized)
      return "stabilize";
    return "engage";
  }
  return currentPhase;
}
