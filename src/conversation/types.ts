export type ConversationPhase =
  | "connect"
  | "ensure_safety"
  | "stabilize"
  | "engage"
  | "activity"
  | "closing";

export type SafetyLevel = "safe" | "unsafe" | "unknown";
export type StressLevel = "calm" | "moderate" | "high" | "crisis";
export type SocialContext = "alone" | "with_others" | "caregiver" | "unknown";
export type LocationType = "shelter" | "home" | "transit" | "outdoors" | "unknown";

export interface ConversationAnalysis {
  safety: SafetyLevel;
  stressLevel: StressLevel;
  socialContext: SocialContext;
  location: LocationType;
  suggestedPhase: ConversationPhase;
  reply: string;
}

export interface ConversationContext {
  safety: SafetyLevel;
  stressLevel: StressLevel;
  socialContext: SocialContext;
  location: LocationType;
  hasStabilized: boolean;
  engagementTopics: string[];
  messageCount: number;
  isAlertActive: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: string;
}

export interface ConversationState {
  phase: ConversationPhase;
  context: ConversationContext;
  messages: ChatMessage[];
}

export interface PersistedConversationState {
  phase: ConversationPhase;
  context: ConversationContext;
  messages: ChatMessage[];
  lastActiveAt: string;
}

export interface UserProfileSummary {
  name: string;
  safeSpaceType: string;
  safeSpaceLocation: string;
  timeToSafety: number;
  accessibilityNeeds: string[];
  calmingPreferences: string[];
}

export function createInitialContext(): ConversationContext {
  return {
    safety: "unknown",
    stressLevel: "moderate",
    socialContext: "unknown",
    location: "unknown",
    hasStabilized: false,
    engagementTopics: [],
    messageCount: 0,
    isAlertActive: false,
  };
}

export function createInitialState(): ConversationState {
  return {
    phase: "connect",
    context: createInitialContext(),
    messages: [],
  };
}
