import type {
  ConversationPhase,
  ConversationAnalysis,
  ConversationContext,
  ConversationState,
  ChatMessage,
  UserProfileSummary,
} from "./types";
import { createInitialState } from "./types";
import { analyzeOffline } from "./offlineParser";
import { generateReply } from "./messageGenerator";
import { userProfileStorage, type UserProfile } from "../storage/userProfileStorage";

export class ConversationEngine {
  private state: ConversationState;
  private profile: UserProfileSummary | null = null;
  private rawProfile: UserProfile | null = null;
  private usedMessages: string[] = [];
  private initialized = false;

  constructor() {
    this.state = createInitialState();
  }

  async initialize(): Promise<void> {
    // Load profile
    try {
      await userProfileStorage.init();
      this.rawProfile = await userProfileStorage.getActiveProfile();
    } catch {
      this.rawProfile = null;
    }

    if (this.rawProfile) {
      this.profile = {
        name: this.rawProfile.name,
        safeSpaceType: this.rawProfile.safeSpaceType,
        safeSpaceLocation: this.rawProfile.safeSpaceLocation,
        timeToSafety: this.rawProfile.timeToReachSafety,
        accessibilityNeeds: this.rawProfile.accessibilityNeeds,
        calmingPreferences: this.rawProfile.calmingPreferences,
      };
    }

    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  hasCompletedOnboarding(): boolean {
    return this.rawProfile !== null && this.rawProfile.onboardingCompleted === true;
  }

  getState(): ConversationState {
    return this.state;
  }

  getMessages(): ChatMessage[] {
    return this.state.messages;
  }

  getPhase(): ConversationPhase {
    return this.state.phase;
  }

  getContext(): ConversationContext {
    return this.state.context;
  }

  getOpeningMessage(): ChatMessage {
    const reply = generateReply("connect", this.state.context, this.profile, this.usedMessages);
    this.usedMessages.push(reply);
    const msg: ChatMessage = {
      id: `${Date.now()}_bot`,
      role: "bot",
      content: reply,
      timestamp: new Date().toISOString(),
    };
    this.state.messages.push(msg);
    return msg;
  }

  async processMessage(userText: string): Promise<ChatMessage> {
    const userMsg: ChatMessage = {
      id: `${Date.now()}_user`,
      role: "user",
      content: userText,
      timestamp: new Date().toISOString(),
    };
    this.state.messages.push(userMsg);
    this.state.context.messageCount++;

    const analysis = analyzeOffline(userText, this.state.phase, this.state.context);

    this.updateContext(analysis);

    const nextPhase = this.resolvePhase(analysis);
    this.state.phase = nextPhase;

    const reply = generateReply(nextPhase, this.state.context, this.profile, this.usedMessages);
    this.usedMessages.push(reply);

    const botMsg: ChatMessage = {
      id: `${Date.now()}_bot_${this.state.context.messageCount}`,
      role: "bot",
      content: reply,
      timestamp: new Date().toISOString(),
    };
    this.state.messages.push(botMsg);

    return botMsg;
  }

  activateAlert(): ChatMessage {
    this.state.context.isAlertActive = true;
    this.state.phase = "ensure_safety";

    const reply = "Alert detected. Let's make sure you're safe.";
    const msg: ChatMessage = {
      id: `${Date.now()}_alert`,
      role: "bot",
      content: reply,
      timestamp: new Date().toISOString(),
    };
    this.state.messages.push(msg);
    return msg;
  }

  deactivateAlert(): ChatMessage {
    this.state.context.isAlertActive = false;
    this.state.phase = "engage";
    this.state.context.stressLevel = "moderate";

    const reply = "The alert has passed. You made it.";
    const msg: ChatMessage = {
      id: `${Date.now()}_alert_clear`,
      role: "bot",
      content: reply,
      timestamp: new Date().toISOString(),
    };
    this.state.messages.push(msg);
    return msg;
  }

  reset(): void {
    this.state = createInitialState();
    this.usedMessages = [];
  }

  getRequestedActivity(userText: string): string | null {
    const lower = userText.toLowerCase();
    const activityMap: Record<string, string> = {
      breathing: "breathing",
      breathe: "breathing",
      breath: "breathing",
      stretch: "stretching",
      stretching: "stretching",
      matching: "matching-cards",
      cards: "matching-cards",
      sudoku: "sudoku",
      puzzle: "puzzle",
      jigsaw: "puzzle",
      paint: "paint",
      draw: "paint",
      canvas: "paint",
      drawing: "paint",
      snake: "snake",
      guess: "number-guessing",
      guessing: "number-guessing",
    };
    for (const [keyword, activity] of Object.entries(activityMap)) {
      if (lower.includes(keyword)) return activity;
    }
    return null;
  }

  private updateContext(analysis: ConversationAnalysis): void {
    if (analysis.safety !== "unknown") {
      this.state.context.safety = analysis.safety;
    }
    if (analysis.stressLevel !== "moderate") {
      this.state.context.stressLevel = analysis.stressLevel;
    }
    if (analysis.socialContext !== "unknown") {
      this.state.context.socialContext = analysis.socialContext;
    }
    if (analysis.location !== "unknown") {
      this.state.context.location = analysis.location;
    }
  }

  private resolvePhase(analysis: ConversationAnalysis): ConversationPhase {
    const ctx = this.state.context;
    const currentPhase = this.state.phase;

    // 1. SAFETY OVERRIDE
    if (ctx.safety === "unsafe") {
      return "ensure_safety";
    }

    // 2. CRISIS OVERRIDE
    if (ctx.stressLevel === "crisis" && !ctx.hasStabilized) {
      return "stabilize";
    }

    // 3. ALERT OVERRIDE
    if (ctx.isAlertActive && currentPhase === "connect") {
      return "ensure_safety";
    }

    // 4. SUGGESTED PHASE from analysis
    const suggested = analysis.suggestedPhase;

    // 5. STICKY ENGAGE
    if (currentPhase === "engage" && suggested === "connect") {
      return "engage";
    }

    // Mark stabilized if leaving stabilize
    if (currentPhase === "stabilize" && suggested !== "stabilize") {
      this.state.context.hasStabilized = true;
    }

    // 6. CLOSING STAY-OPEN
    if (currentPhase === "closing" && suggested !== "closing") {
      return "engage";
    }

    return suggested;
  }
}
