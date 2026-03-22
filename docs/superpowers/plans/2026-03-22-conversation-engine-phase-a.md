# Conversation Engine Phase A: Offline Path Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the node-based conversation state machine with a phase-based conversation engine using the offline (rule-based) path, producing a fully working app without LLM dependency.

**Architecture:** Phase-based controller (`ConversationEngine`) with multi-signal offline parser (`offlineParser`) and template-based message generator (`messageGenerator`). The engine manages phase transitions via a priority-based algorithm (safety > crisis > alert > suggested). `App.tsx` is rewired to use the engine instead of the old `ConversationController`.

**Tech Stack:** TypeScript, React 19, Vite 7, IndexedDB (via existing `userProfileStorage`), Paraglide i18n, compromise (NLP), sentiment (analysis)

**Spec:** `docs/superpowers/specs/2026-03-22-conversation-flow-redesign.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/conversation/types.ts` | Create | Shared types: `ConversationPhase`, `ConversationAnalysis`, `ConversationContext`, `ConversationState`, `PersistedConversationState` |
| `src/conversation/offlineParser.ts` | Create | Multi-signal extraction from user text — returns `ConversationAnalysis` using keyword lists from `enhancedParser.ts` + sentiment |
| `src/conversation/messageGenerator.ts` | Create | Template-based response generator — selects from message pools by phase + context, applies profile variable substitution |
| `src/conversation/ConversationEngine.ts` | Create | Phase-based controller — manages state, processes messages via offline parser, applies phase transition algorithm, handles alerts |
| `src/App.tsx` | Modify | Remove old `ConversationController` usage, wire up `ConversationEngine`, remove "Conversation Complete" takeover, simplify message flow |
| `src/storage/userProfileStorage.ts` | Modify | Add `saveEngineState()` / `loadEngineState()` for `PersistedConversationState` |
| `src/conversation/conversationMap.ts` | Delete | V1 map, unused |
| `src/conversation/conversationMapV2.ts` | Delete | Replaced by engine |
| `src/conversation/ConversationController.ts` | Keep | Still needed for onboarding flow — App.tsx conditionally uses old controller during onboarding, new engine after |
| `src/parser/enhancedParser.ts` | Modify | Make `matchesKeyword` public, add `"crisis"` stress keyword category |

---

### Task 1: Create shared types

**Files:**
- Create: `src/conversation/types.ts`

- [ ] **Step 1: Create types file**

```typescript
// src/conversation/types.ts

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
  lastActiveAt: string; // ISO string for IndexedDB serialization
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
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --project tsconfig.app.json 2>&1 | grep "types.ts" || echo "No errors in types.ts"`

- [ ] **Step 3: Commit**

```bash
git add src/conversation/types.ts
git commit -m "feat: add shared types for conversation engine"
```

---

### Task 2: Create offline parser

**Files:**
- Create: `src/conversation/offlineParser.ts`
- Read: `src/parser/enhancedParser.ts` (reuse keyword lists and sentiment)

The offline parser extracts ALL signals (safety, stress, social, location) from a single message and returns a unified `ConversationAnalysis`. It reuses the keyword lists from `enhancedParser.ts`.

- [ ] **Step 1: Create offline parser**

```typescript
// src/conversation/offlineParser.ts

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

/**
 * Multi-signal offline parser.
 * Extracts safety, stress, social context, and location from a single message.
 * Returns a ConversationAnalysis with a suggested phase and empty reply
 * (reply is filled in by messageGenerator).
 */
export function analyzeOffline(
  input: string,
  currentPhase: ConversationPhase,
  context: ConversationContext,
): ConversationAnalysis {
  const safety = extractSafety(input);
  const stressLevel = extractStress(input);
  const socialContext = extractSocialContext(input);
  const location = extractLocation(input);
  const suggestedPhase = determineSuggestedPhase(input, currentPhase, {
    ...context,
    safety: safety !== "unknown" ? safety : context.safety,
    stressLevel: stressLevel !== "moderate" ? stressLevel : context.stressLevel,
    socialContext: socialContext !== "unknown" ? socialContext : context.socialContext,
    location: location !== "unknown" ? location : context.location,
  });

  return {
    safety,
    stressLevel,
    socialContext,
    location,
    suggestedPhase,
    reply: "", // Filled in by messageGenerator
  };
}

function extractSafety(input: string): SafetyLevel {
  const result = enhancedParser.classifySafety(input);
  if (result.confidence < 0.5) return "unknown";
  switch (result.category) {
    case "SAFE": return "safe";
    case "DANGER": return "unsafe";
    default: return "unknown";
  }
}

// Crisis-specific keywords that distinguish crisis from high stress
const crisisKeywords = [
  "cant breathe", "can not breathe", "dying", "going to die",
  "panic attack", "hyperventilating", "losing control", "help me",
  "someone help", "i need help", "cant move", "paralyzed", "frozen",
];

function extractStress(input: string): StressLevel {
  const result = enhancedParser.classifyStress(input);
  if (result.confidence < 0.4) return "moderate"; // default assumption
  switch (result.category) {
    case "no_stress": return "calm";
    case "moderate_stress": return "moderate";
    case "high_stress": {
      // Distinguish high from crisis using crisis-specific keywords
      const lower = input.toLowerCase();
      if (crisisKeywords.some((kw) => lower.includes(kw))) return "crisis";
      return "high";
    }
    default: return "moderate";
  }
}

function extractSocialContext(input: string): SocialContext {
  // Use the socialKeywords from enhancedParser
  for (const mapping of enhancedParser.socialKeywords) {
    for (const keyword of mapping.keywords) {
      if (enhancedParser.matchesKeyword(input, keyword)) {
        switch (mapping.category) {
          case "alone": return "alone";
          case "with_others": return "with_others";
          case "caregiver": return "caregiver";
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
  if (loc === "home" || loc === "house" || loc === "apartment") return "home";
  if (loc === "shelter" || loc === "miklat" || loc === "mamad" || loc === "stairway") return "shelter";
  // Check for transit via stress keywords (in_transit category)
  const stressResult = enhancedParser.classifyStress(input);
  if (stressResult.category === "in_transit") return "transit";
  if (stressResult.category === "outdoor_worker") return "outdoors";
  return "unknown";
}

// Activity-related keywords
const activityKeywords = [
  "breathing", "breathe", "breath",
  "game", "play", "match", "cards", "sudoku", "puzzle", "snake",
  "draw", "paint", "canvas", "art",
  "stretch", "exercise",
  "activity", "something to do",
];

// Closing/goodbye keywords
const closingKeywords = [
  "thanks", "thank you", "bye", "goodbye", "good bye",
  "im good", "i'm good", "im fine", "i'm fine",
  "im okay", "i'm okay", "im ok", "i'm ok",
  "take care", "see you", "later", "gotta go",
  "all good", "feeling better", "much better",
];

function determineSuggestedPhase(
  input: string,
  currentPhase: ConversationPhase,
  updatedContext: ConversationContext,
): ConversationPhase {
  const lowerInput = input.toLowerCase();

  // PRIORITY 1: Safety override (always wins per spec)
  if (updatedContext.safety === "unsafe") {
    return "ensure_safety";
  }

  // PRIORITY 2: Crisis override
  if (updatedContext.stressLevel === "crisis" && !updatedContext.hasStabilized) {
    return "stabilize";
  }

  // PRIORITY 3: Alert override
  if (updatedContext.isAlertActive && currentPhase === "connect") {
    return "ensure_safety";
  }

  // PRIORITY 4: Activity request (after safety/crisis overrides)
  if (activityKeywords.some((kw) => lowerInput.includes(kw))) {
    return "activity";
  }

  // PRIORITY 5: Closing signals
  if (closingKeywords.some((kw) => lowerInput.includes(kw))) {
    return "closing";
  }

  // After connect, default to engage
  if (currentPhase === "connect") {
    return "engage";
  }

  // Sticky engage
  if (currentPhase === "engage") {
    return "engage";
  }

  // After stabilize, move to engage
  if (currentPhase === "stabilize") {
    return "engage";
  }

  // After ensure_safety and user confirms safe
  if (currentPhase === "ensure_safety" && updatedContext.safety === "safe") {
    if (updatedContext.stressLevel === "crisis" && !updatedContext.hasStabilized) {
      return "stabilize";
    }
    return "engage";
  }

  // Default: stay in current phase
  return currentPhase;
}
```

- [ ] **Step 1.5: Make `matchesKeyword` public on `enhancedParser` (MUST DO BEFORE Step 1)**

In `src/parser/enhancedParser.ts`, change `private matchesKeyword(` → `matchesKeyword(` so the offline parser can call it. `socialKeywords` is already not `private`.

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --project tsconfig.app.json 2>&1 | grep -E "offlineParser|enhancedParser" | head -10`

- [ ] **Step 4: Commit**

```bash
git add src/conversation/offlineParser.ts src/parser/enhancedParser.ts
git commit -m "feat: add multi-signal offline parser for conversation engine"
```

---

### Task 3: Create message generator

**Files:**
- Create: `src/conversation/messageGenerator.ts`

Template-based response generator. Selects from message pools organized by phase + context. Applies profile variable substitution.

- [ ] **Step 1: Create message generator**

**Known regression:** Message pools are hardcoded English for now. This means conversation messages will not translate when the user switches language. The existing Paraglide retranslation mechanism in App.tsx (`getConvMessage`) should be preserved for onboarding messages but will not apply to engine messages. A follow-up task (Phase A.1) will add Paraglide message keys for all pools across the 5 base languages (Hebrew, English, Russian, Amharic, Arabic). This is intentionally deferred to keep this task focused on the engine architecture.

```typescript
// src/conversation/messageGenerator.ts

import type {
  ConversationPhase,
  ConversationContext,
  UserProfileSummary,
} from "./types";

interface MessagePool {
  [subKey: string]: string[];
}

// Message pools organized by phase
const messagePools: Record<ConversationPhase, MessagePool> = {
  connect: {
    opening: [
      "Hey, I'm here. What's going on right now?",
      "I'm here with you. How are things?",
      "Hey. What's happening right now?",
    ],
  },
  ensure_safety: {
    unsafe: [
      "Where are you right now? Can you get somewhere safe?",
      "Let's get you to a safe spot first. Where are you?",
      "Safety first — can you get to a protected space?",
    ],
    moving: [
      "Good, keep going. I'm right here.",
      "You're doing the right thing. Keep moving.",
      "Almost there. I'm with you.",
    ],
    confirming: [
      "Are you in a safe place now?",
      "Did you make it somewhere protected?",
    ],
    profile_aware: [
      "{name}, your {safeSpaceType} is about {timeToSafety} seconds away — can you get there?",
      "{name}, head to your {safeSpaceType}. I'll be here when you arrive.",
    ],
    guided: [
      "Find the nearest interior wall, away from windows. Sit low.",
      "Get to a stairwell or interior hallway if you can. Stay low.",
      "Look for the nearest reinforced space. Even an interior bathroom helps.",
    ],
  },
  stabilize: {
    initial: [
      "Let's take one breath together. In... and out. OK. You're here.",
      "Take a breath with me. In through the nose... out through the mouth. Good.",
      "Breathe with me for a second. In... hold... out. You're doing fine.",
    ],
    followup: [
      "Can you feel your feet on the ground? Press them down. Good.",
      "Look around you — name one thing you can see. Just one.",
      "Put your hands on something solid. Feel that? You're here.",
    ],
    transition: [
      "OK. You're here. Now — let's figure out what's happening around you.",
      "Better. Now let's see what we can do from here.",
      "Good. You're steady. Let's look at what's around you.",
    ],
  },
  engage: {
    with_others: [
      "Who's around you? Anyone who looks like they could use some support?",
      "Is there anyone near you who might need a hand?",
      "Can you check if everyone has water?",
      "Sometimes just asking someone 'how are you doing?' makes a big difference — for both of you.",
      "Is anyone having a hard time? You might be able to help them calm down.",
      "Look around — is there anything practical you can help with?",
      "Have you introduced yourself to anyone nearby? It helps to not feel like strangers.",
    ],
    alone: [
      "Let's take stock — what do you have around you? Water, phone charger, blanket?",
      "Is there anyone you want to text to let them know you're OK?",
      "What can you see from where you are? Describe it to me.",
      "Having a plan helps. If the alert ends in 5 minutes, what's your first move?",
      "Is your phone charged? If not, save battery for essentials.",
      "Can you hear anything outside? Sometimes that helps you know what's going on.",
    ],
    caregiver: [
      "You're looking after someone — that matters. What do they need right now?",
      "Kids pick up on your energy. If you can stay steady, they will too.",
      "Does the person you're with have any needs we should think about? Medication, mobility?",
      "You're doing a great job. Taking care of someone else is hard work.",
      "Is there a game or activity that might help keep them calm? I've got some ideas.",
      "Have they had water recently? Small things help.",
    ],
    unknown_social: [
      "Are you with other people right now, or on your own?",
      "Is anyone around you?",
    ],
    low_stress: [
      "You made it through. How's everyone around you doing?",
      "Sometimes after the adrenaline fades, people crash a bit. That's normal.",
      "Is there anything practical you need to take care of right now?",
      "Want to do something together, or are you good for now?",
      "How are you holding up? Sometimes it hits later.",
    ],
  },
  activity: {
    offer: [
      "I've got some things we can do together if you want. Breathing, games, drawing — your call.",
      "Want to try something? I've got breathing exercises, puzzle games, a digital canvas...",
      "Need something to do? I've got activities — calming ones and distracting ones.",
    ],
    return: [
      "Welcome back. How are things going?",
      "How was that? Feeling any different?",
      "Good to have you back. How are you doing?",
    ],
  },
  closing: {
    natural: [
      "I'm here whenever you need me. Take care.",
      "You're doing great. I'm here if you need anything.",
      "Take care of yourself. You can come back anytime.",
      "I'll be right here. Stay safe.",
    ],
  },
};

/**
 * Select a contextual response message for the given phase and context.
 */
export function generateReply(
  phase: ConversationPhase,
  context: ConversationContext,
  profile: UserProfileSummary | null,
  usedMessages: string[],
): string {
  const pool = messagePools[phase];
  if (!pool) return "I'm here with you.";

  // Determine the best sub-pool based on context
  const subKey = selectSubKey(phase, context);
  let candidates = pool[subKey] ?? pool[Object.keys(pool)[0]] ?? ["I'm here with you."];

  // If profile data available and we're in ensure_safety, try profile-aware messages first
  if (phase === "ensure_safety" && profile?.safeSpaceType && pool["profile_aware"]) {
    const profileMessages = pool["profile_aware"].filter((m) => !usedMessages.includes(m));
    if (profileMessages.length > 0) {
      candidates = profileMessages;
    }
  }

  // Filter out already-used messages
  let available = candidates.filter((m) => !usedMessages.includes(m));
  if (available.length === 0) {
    available = candidates; // Reset if all used
  }

  // Pick randomly
  const selected = available[Math.floor(Math.random() * available.length)];

  // Apply variable substitution from profile
  return applyProfileSubstitution(selected, profile);
}

function selectSubKey(phase: ConversationPhase, context: ConversationContext): string {
  switch (phase) {
    case "connect":
      return "opening";
    case "ensure_safety":
      if (context.safety === "safe") return "confirming";
      return "unsafe";
    case "stabilize":
      if (context.hasStabilized) return "transition";
      if (context.messageCount > 1) return "followup";
      return "initial";
    case "engage":
      if (context.stressLevel === "calm") return "low_stress";
      switch (context.socialContext) {
        case "with_others": return "with_others";
        case "alone": return "alone";
        case "caregiver": return "caregiver";
        default: return "unknown_social";
      }
    case "activity":
      return "offer";
    case "closing":
      return "natural";
    default:
      return Object.keys(messagePools[phase] ?? {})[0] ?? "opening";
  }
}

function applyProfileSubstitution(message: string, profile: UserProfileSummary | null): string {
  if (!profile) return message;
  return message
    .replace(/\{name\}/g, profile.name)
    .replace(/\{safeSpaceType\}/g, profile.safeSpaceType)
    .replace(/\{safeSpaceLocation\}/g, profile.safeSpaceLocation)
    .replace(/\{timeToSafety\}/g, String(profile.timeToSafety));
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --project tsconfig.app.json 2>&1 | grep "messageGenerator" || echo "Clean"`

- [ ] **Step 3: Commit**

```bash
git add src/conversation/messageGenerator.ts
git commit -m "feat: add template-based message generator for offline conversation"
```

---

### Task 4: Create ConversationEngine

**Files:**
- Create: `src/conversation/ConversationEngine.ts`
- Read: `src/storage/userProfileStorage.ts` (for profile access)

The engine manages conversation state, processes user messages through the offline parser, applies phase transition overrides, and generates replies.

- [ ] **Step 1: Create engine**

```typescript
// src/conversation/ConversationEngine.ts

import type {
  ConversationPhase,
  ConversationAnalysis,
  ConversationContext,
  ConversationState,
  ChatMessage,
  UserProfileSummary,
  PersistedConversationState,
} from "./types";
import { createInitialState, createInitialContext } from "./types";
import { analyzeOffline } from "./offlineParser";
import { generateReply } from "./messageGenerator";
import { userProfileStorage, type UserProfile } from "../storage/userProfileStorage";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export class ConversationEngine {
  private state: ConversationState;
  private profile: UserProfileSummary | null = null;
  private usedMessages: string[] = [];
  private initialized = false;

  constructor() {
    this.state = createInitialState();
  }

  async initialize(): Promise<void> {
    // Load profile
    const userProfile = await this.loadProfile();
    if (userProfile) {
      this.profile = {
        name: userProfile.name,
        safeSpaceType: userProfile.safeSpaceType,
        safeSpaceLocation: userProfile.safeSpaceLocation,
        timeToSafety: userProfile.timeToReachSafety,
        accessibilityNeeds: userProfile.accessibilityNeeds,
        calmingPreferences: userProfile.calmingPreferences,
      };
    }

    // Try to resume session
    const persisted = await this.loadPersistedState();
    if (persisted) {
      const lastActive = new Date(persisted.lastActiveAt).getTime();
      const now = Date.now();
      if (now - lastActive < SESSION_TIMEOUT_MS) {
        // Resume within 30 minutes
        this.state = {
          phase: persisted.phase,
          context: persisted.context,
          messages: persisted.messages,
        };
        this.initialized = true;
        return;
      }
      // Stale session — start fresh but keep safety/location context
      this.state = createInitialState();
      this.state.context.safety = persisted.context.safety;
      this.state.context.location = persisted.context.location;
    }

    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  hasProfile(): boolean {
    return this.profile !== null;
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

  /** Get the opening message for the connect phase */
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

  /** Process a user message and return the bot's response */
  async processMessage(userText: string): Promise<ChatMessage> {
    // Add user message
    const userMsg: ChatMessage = {
      id: `${Date.now()}_user`,
      role: "user",
      content: userText,
      timestamp: new Date().toISOString(),
    };
    this.state.messages.push(userMsg);
    this.state.context.messageCount++;

    // Analyze with offline parser
    const analysis = analyzeOffline(userText, this.state.phase, this.state.context);

    // Update context from analysis
    this.updateContext(analysis);

    // Apply phase transition algorithm
    const nextPhase = this.resolvePhase(analysis);
    this.state.phase = nextPhase;

    // Generate reply
    const reply = generateReply(nextPhase, this.state.context, this.profile, this.usedMessages);
    this.usedMessages.push(reply);

    const botMsg: ChatMessage = {
      id: `${Date.now()}_bot`,
      role: "bot",
      content: reply,
      timestamp: new Date().toISOString(),
    };
    this.state.messages.push(botMsg);

    // Persist state
    await this.persistState();

    return botMsg;
  }

  /** Activate alert mode — force transition to ensure_safety */
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

  /** Deactivate alert — transition to engage */
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

  /** Reset engine to start fresh */
  reset(): void {
    this.state = createInitialState();
    this.usedMessages = [];
  }

  /** Check if an activity was requested — returns activity name or null */
  getRequestedActivity(userText: string): string | null {
    const lower = userText.toLowerCase();
    const activityMap: Record<string, string> = {
      "breathing": "breathing", "breathe": "breathing", "breath": "breathing",
      "stretch": "stretching", "stretching": "stretching",
      "matching": "matching-cards", "cards": "matching-cards", "match": "matching-cards",
      "sudoku": "sudoku", "numbers": "sudoku",
      "puzzle": "puzzle", "jigsaw": "puzzle",
      "paint": "paint", "draw": "paint", "canvas": "paint", "drawing": "paint",
      "snake": "snake",
      "guess": "number-guessing", "guessing": "number-guessing",
    };
    for (const [keyword, activity] of Object.entries(activityMap)) {
      if (lower.includes(keyword)) return activity;
    }
    return null;
  }

  // --- Private ---

  private updateContext(analysis: ConversationAnalysis): void {
    if (analysis.safety !== "unknown") {
      this.state.context.safety = analysis.safety;
    }
    if (analysis.stressLevel !== "moderate") {
      // Only update if the analysis found something definitive
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

    // 5. STICKY ENGAGE — don't restart mid-conversation
    if (currentPhase === "engage" && suggested === "connect") {
      return "engage";
    }

    // Mark stabilized if transitioning out of stabilize
    if (currentPhase === "stabilize" && suggested !== "stabilize") {
      this.state.context.hasStabilized = true;
    }

    // 6. CLOSING STAY-OPEN — if user types after closing, re-engage
    if (currentPhase === "closing" && suggested !== "closing") {
      return "engage";
    }

    return suggested;
  }

  private async loadProfile(): Promise<UserProfile | null> {
    try {
      await userProfileStorage.init();
      return await userProfileStorage.getActiveProfile();
    } catch {
      return null;
    }
  }

  private async loadPersistedState(): Promise<PersistedConversationState | null> {
    try {
      const state = await userProfileStorage.getConversationState();
      if (!state) return null;
      // Map old ConversationState shape to PersistedConversationState
      // For now, return null since the old shape doesn't match
      return null;
    } catch {
      return null;
    }
  }

  private async persistState(): Promise<void> {
    try {
      // Save using the existing conversation state method for now
      // Full PersistedConversationState support is added in Task 5
    } catch {
      // Persist failures are non-fatal
    }
  }
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --project tsconfig.app.json 2>&1 | grep "ConversationEngine" | head -10`

- [ ] **Step 3: Commit**

```bash
git add src/conversation/ConversationEngine.ts
git commit -m "feat: add phase-based ConversationEngine with offline path"
```

---

### Task 5: Add session persistence to storage

**Files:**
- Modify: `src/storage/userProfileStorage.ts`

Add methods to save/load the new `PersistedConversationState` shape.

- [ ] **Step 1: Add the engineState store and methods**

Add to `userProfileStorage.ts`:

1. **Bump `this.version` from `1` to `2`** — required so `onupgradeneeded` fires for returning users
2. In the `onupgradeneeded` handler, add a new object store `engineState` (if not exists)
3. Add `saveEngineState(state: PersistedConversationState)` method — wraps `store.put` in a transaction.oncomplete Promise
4. Add `loadEngineState(): Promise<PersistedConversationState | null>` method — reads from `engineState` store with key `"current"`, validates shape before returning

The store uses a fixed key `"current"` (same pattern as existing `conversationState` store).

- [ ] **Step 2: Update ConversationEngine to use the new methods**

Update `ConversationEngine.ts`:
- `loadPersistedState()`: Replace the `return null` stub with `return await userProfileStorage.loadEngineState()`
- `persistState()`: Replace the empty try block with:
```typescript
const persisted: PersistedConversationState = {
  phase: this.state.phase,
  context: this.state.context,
  messages: this.state.messages.slice(-20), // Keep last 20 messages
  lastActiveAt: new Date().toISOString(),
};
await userProfileStorage.saveEngineState(persisted);
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`

- [ ] **Step 4: Commit**

```bash
git add src/storage/userProfileStorage.ts src/conversation/ConversationEngine.ts
git commit -m "feat: add session persistence for conversation engine state"
```

---

### Task 6: Wire up App.tsx to use ConversationEngine

**Files:**
- Modify: `src/App.tsx`

This is the largest task. Replace all `ConversationController` usage with `ConversationEngine`.

Key changes:
1. Add `ConversationEngine` import alongside existing `ConversationController` (keep both)
2. Add `isOnboarding` state — when true, use old `ConversationController`; when false, use `ConversationEngine`
3. Replace initialization logic — check `engine.hasProfile()` and `profile.onboardingCompleted` to decide which controller to use
4. Replace `processUserInput` — branch: if onboarding, use old controller; if not, use `engine.processMessage()`
5. Remove "Conversation Complete" full-screen takeover (no more `isConversationComplete` state/effect)
6. Simplify alert handling to use `engine.activateAlert()` / `engine.deactivateAlert()` — alerts work even during onboarding (engine takes over temporarily, returns to onboarding after)
7. Keep activity launching logic but use `engine.getRequestedActivity()`

**Important:** The `ConversationController` import and usage stays for onboarding. Only the post-onboarding conversation flow uses the new engine.

- [ ] **Step 1: Update imports and state initialization**

Replace:
```typescript
import { ConversationController } from './conversation/ConversationController';
const [conversationController] = useState(() => new ConversationController());
```
With:
```typescript
import { ConversationEngine } from './conversation/ConversationEngine';
const [engine] = useState(() => new ConversationEngine());
```

- [ ] **Step 2: Replace initialization effect**

Replace the polling-based init with:
```typescript
useEffect(() => {
  const init = async () => {
    await engine.initialize();
    if (!engine.hasProfile()) {
      // Delegate to onboarding (keep existing onboarding flow)
      // TODO: onboarding integration
      setIsInitialized(true);
      return;
    }
    const opening = engine.getOpeningMessage();
    setConversationHistory([{
      id: opening.id,
      type: "message",
      content: opening.content,
      timestamp: opening.timestamp,
      isUser: false,
      nodeId: "connect",
    }]);
    setIsInitialized(true);
  };
  void init();
}, [engine]);
```

- [ ] **Step 3: Replace processUserInput**

Replace the entire `processUserInput` callback with:
```typescript
const processUserInput = useCallback(async () => {
  if (!userInput.trim()) return;
  try {
    // Check for activity request
    const requestedActivity = engine.getRequestedActivity(userInput);

    const botMsg = await engine.processMessage(userInput);

    setConversationHistory(prev => [...prev, {
      id: botMsg.id,
      type: "message",
      content: botMsg.content,
      timestamp: botMsg.timestamp,
      isUser: false,
      nodeId: engine.getPhase(),
    }]);

    // Handle activity launch if requested
    if (requestedActivity || engine.getPhase() === "activity") {
      const activityName = requestedActivity;
      if (activityName) {
        const targetApp = resolvedApps.find(app => app.name === activityName);
        if (targetApp) {
          setChosenApp(targetApp);
          setShouldAutoLaunchApp(true);
          const timer = setTimeout(() => setShowAppsLauncher(true), 2000);
          setAppsTimeout(timer);
        }
      }
    }
  } catch (error) {
    console.error("Error processing message:", error);
    setConversationHistory(prev => [...prev, {
      id: `${Date.now()}_error`,
      type: "message",
      content: "I'm still here. Could you say that again?",
      timestamp: new Date().toISOString(),
      isUser: false,
      nodeId: "error",
    }]);
  }
  setUserInput("");
}, [userInput, engine, resolvedApps]);
```

- [ ] **Step 4: Remove "Conversation Complete" takeover**

Delete the `isConversationComplete` state, the effect that sets it, and the early-return block that replaces the entire UI. The chat input should always remain visible.

- [ ] **Step 5: Simplify alert handler**

Replace `handleDemoAlert` to use engine:
```typescript
const handleDemoAlert = () => {
  const alertMsg = engine.activateAlert();
  setConversationHistory(prev => [...prev, {
    id: alertMsg.id,
    type: "message",
    content: alertMsg.content,
    timestamp: alertMsg.timestamp,
    isUser: false,
    nodeId: "alert",
  }]);
  // Start countdown timer (keep existing timer logic)
  setShowAlertButton(false);
  setAlertTimer(180);
  // ... keep existing interval logic but call engine.deactivateAlert() on completion
};
```

- [ ] **Step 6: Verify build and lint**

Run: `npm run lint && npm run build 2>&1 | tail -5`

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire App.tsx to ConversationEngine, remove node-based flow"
```

---

### Task 7: Delete old conversation files

**Files:**
- Delete: `src/conversation/conversationMap.ts`
- Delete: `src/conversation/conversationMapV2.ts`

Only delete these after Task 6 is working. `ConversationController.ts` stays for now (onboarding depends on it).

- [ ] **Step 1: Delete old map files**

```bash
rm src/conversation/conversationMap.ts src/conversation/conversationMapV2.ts
```

- [ ] **Step 2: Remove any remaining imports of deleted files**

Search for imports of the deleted files and remove them:
```bash
grep -r "conversationMap" src/ --include="*.ts" --include="*.tsx" -l
```

Fix any files that still import them (likely `ConversationController.ts` — update to not import V2 map if it's only used for the `switchToAlertMode` fallback, which is now handled by the engine).

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old node-based conversation maps (V1 and V2)"
```

---

### Task 8: Smoke test and manual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test core conversation scenarios**

Open `http://localhost:5174/` and test:

1. Type "i feel bad" → should get moderate stress → engage phase response
2. Type "there's no alarm right now" → should get calm → engage phase response
3. Type "i'm in the shelter with my kids" → should detect caregiver → caregiver engagement
4. Type "i can't breathe" → should detect crisis → stabilize phase
5. Type "i'm not safe" → should detect unsafe → ensure_safety phase
6. Type "thanks i'm good" → should get closing response (chat stays open)
7. Type again after closing → should re-engage (no "Conversation Complete" screen)
8. Click "Demo - RED ALERT" → should show alert message, start countdown
9. After alert countdown → should show "alert passed" message

- [ ] **Step 3: Fix any issues found**

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: conversation engine Phase A complete — offline path working"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Shared types | `types.ts` |
| 2 | Offline parser | `offlineParser.ts` |
| 3 | Message generator | `messageGenerator.ts` |
| 4 | Conversation engine | `ConversationEngine.ts` |
| 5 | Session persistence | `userProfileStorage.ts` |
| 6 | Wire up App.tsx | `App.tsx` |
| 7 | Delete old files | `conversationMap.ts`, `conversationMapV2.ts` |
| 8 | Smoke test | Manual verification |

Tasks 1-3 are independent and can be done in parallel. Task 4 depends on 1-3. Task 5 depends on 4. Task 6 depends on 4-5. Task 7 depends on 6. Task 8 depends on 7.
