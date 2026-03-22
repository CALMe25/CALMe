# Conversation Flow Redesign

## Overview

Redesign CALMe's conversation system from a passive calming tool into an active engagement companion. The user is not a patient to be soothed — they are a person in a situation who can take action. The app helps them figure out what those actions are.

**Old model:** Assess stress → calm the user → offer passive activities → end
**New model:** Ensure safety → stabilize if needed → activate engagement with surroundings → build agency

## Core Philosophy

- **Safety first, always.** If someone isn't safe, that takes priority over everything.
- **Stabilize only when needed.** Brief grounding for someone in panic, not a mandatory step for everyone.
- **Active engagement is the intervention.** Helping others, assessing the situation, taking stock of resources — these restore agency, which is itself therapeutic.
- **Companion, not clinician.** The app talks like a calm friend with a plan, not a therapist running a protocol.
- **Never end abruptly.** The conversation stays open. No "Conversation Complete" screen that kills the UI.

## Architecture

### Hybrid NLP System

Two interpretation paths for user messages:

**Online path (LLM-powered via proxy):**
- Client sends user message + conversation context to a lightweight backend proxy
- Proxy forwards to Claude API, returns structured response
- Response includes: safety assessment, stress level, situation context, social context, suggested next phase, and a natural language reply
- Enables true natural conversation — understands nuance, context, ambiguity

**Offline path (rule-based fallback):**
- Multi-signal extraction from a single message (stress + safety + social context together)
- Broader keyword coverage with word-boundary matching
- Template-based response generation using message pools organized by phase and context
- Falls back gracefully when LLM is unavailable

**Switching logic:**
- Try proxy/LLM first with a 3-second timeout
- If network fails, times out, or returns 429/500 → fall back to offline parser
- Once offline, stay offline for 5 minutes before retrying (sticky fallback to avoid hammering a down service during a real crisis when many users hit the API)
- User never sees the switch — both paths produce the same output shape

### API Proxy Architecture

The Claude API does not support CORS for direct browser calls. A lightweight proxy is required:

**Option chosen: Cloudflare Worker** (matches existing deployment infrastructure)
- Receives POST requests from the client with conversation context
- Forwards to `api.anthropic.com` with the API key stored as a Worker secret (never exposed to client)
- Returns the structured `ConversationAnalysis` response
- Rate limited: 20 requests/minute per IP to prevent abuse
- No API key in the client bundle — the Worker holds the secret

**Endpoint:** `POST /api/chat` on the same domain (or a subdomain)
**Payload:** `{ messages: Message[], phase: ConversationPhase, context: ConversationContext, profile: UserProfileSummary }`
**Response:** `ConversationAnalysis`

### Output Shape (Both Paths)

```typescript
interface ConversationAnalysis {
  safety: "safe" | "unsafe" | "unknown";
  stressLevel: "calm" | "moderate" | "high" | "crisis";
  socialContext: "alone" | "with_others" | "caregiver" | "unknown";
  location: "shelter" | "home" | "transit" | "outdoors" | "unknown";
  suggestedPhase: ConversationPhase;
  reply: string;
}
```

### Controller Redesign

Replace the rigid node-based state machine with a **phase-based controller**:

```typescript
type ConversationPhase =
  | "connect"        // Opening — understand the situation
  | "ensure_safety"  // Get them to safety if needed
  | "stabilize"      // Brief grounding if in crisis
  | "engage"         // Active engagement with surroundings (core phase)
  | "activity"       // User chose a specific activity
  | "closing";       // Winding down, staying available

interface ConversationContext {
  safety: "safe" | "unsafe" | "unknown";
  stressLevel: "calm" | "moderate" | "high" | "crisis";
  socialContext: "alone" | "with_others" | "caregiver" | "unknown";
  location: "shelter" | "home" | "transit" | "outdoors" | "unknown";
  hasStabilized: boolean;
  engagementTopics: string[];
  messageCount: number;
  isAlertActive: boolean;
}

interface ConversationState {
  phase: ConversationPhase;
  context: ConversationContext;
  messages: Message[];
}
```

**Phase transitions are fluid, not rigid.** The controller evaluates each user message against the current phase and context, and decides whether to stay in the current phase or transition. There is no fixed sequence — a user who says "actually I need to leave this building" mid-engagement goes straight back to `ensure_safety`.

### Phase Transition Algorithm

Both paths (LLM and offline) produce a `ConversationAnalysis` with a `suggestedPhase`. The engine applies these rules:

```
1. SAFETY OVERRIDE: If analysis.safety === "unsafe", transition to "ensure_safety"
   regardless of suggestedPhase. Safety always wins.

2. CRISIS OVERRIDE: If analysis.stressLevel === "crisis" AND !context.hasStabilized,
   transition to "stabilize". Can't engage if they can't focus.

3. ALERT OVERRIDE: If context.isAlertActive AND phase === "connect",
   transition to "ensure_safety". Active alerts skip pleasantries.

4. SUGGESTED PHASE: Otherwise, follow analysis.suggestedPhase.

5. STICKY ENGAGE: If already in "engage" and suggestedPhase is "connect",
   stay in "engage". Don't restart the conversation mid-flow.

6. CLOSING STAY-OPEN: "closing" never hides the UI. User can always type
   to re-enter "connect" or "engage".
```

In the **offline path**, the `suggestedPhase` is determined by the offline parser using these rules:
- First message → always `"connect"` initially, then apply overrides 1-3
- After `"connect"` → `"engage"` unless overrides trigger
- `"engage"` stays in `"engage"` unless user asks for activity or says goodbye
- User mentions activity keywords → `"activity"`
- User signals done ("thanks", "bye", "I'm good") → `"closing"`

### Offline Message Generator

For the offline path, `messageGenerator.ts` produces the `reply` string. It works as a **template selector** — not a generative system.

**Structure:**
```typescript
// Message pools organized by phase × context dimension
const messagePools: Record<ConversationPhase, ContextualMessages> = {
  connect: {
    opening: ["Hey, I'm here. What's going on right now?"],
  },
  ensure_safety: {
    unsafe: ["Where are you right now? Can you get somewhere safe?", ...],
    moving: ["Good, keep going. I'm right here.", ...],
    profile_aware: ["{name}, your {safeSpaceType} is about {timeToSafety} away — can you get there?"],
  },
  stabilize: {
    initial: ["Let's take one breath together. In... and out. OK. You're here.", ...],
    followup: ["Can you feel your feet on the ground? Press them down. Good.", ...],
  },
  engage: {
    with_others: ["Who's around you? Anyone who looks like they could use some support?", ...],
    alone: ["Let's take stock — what do you have around you?", ...],
    caregiver: ["You're looking after someone — that matters. What do they need right now?", ...],
    unknown_social: ["Are you with other people right now, or on your own?", ...],
    low_stress: ["You made it through. How's everyone around you doing?", ...],
  },
  activity: {
    offer: ["I've got some things we can do together if you want.", ...],
    return: ["Welcome back. How are things going?", ...],
  },
  closing: {
    natural: ["I'm here whenever you need me. Take care.", ...],
  },
};
```

**Selection logic:**
1. Pick the pool matching `phase` + most specific `context` dimension
2. Filter out messages already used in this session (tracked in `engagementTopics`)
3. If profile data is available, prefer profile-aware templates
4. Select randomly from remaining pool
5. Apply variable substitution (`{name}`, `{safeSpaceType}`, etc.) from user profile

**i18n:** Message pools are keyed by Paraglide message IDs (e.g., `m.engage_with_others_1()`). The generator calls the Paraglide function, which returns the correct language. No separate translation layer needed.

### Onboarding Integration

The onboarding flow (`onboardingMap.ts`) remains as-is. Integration points:

1. **On app launch:** `ConversationEngine` checks `userProfileStorage.getActiveProfile()`
2. **No profile / onboarding not completed:** Engine delegates to the existing onboarding node-based controller. The engine does not run during onboarding.
3. **Onboarding completes:** The onboarding controller calls `engine.startConversation()` which initializes the phase-based system at `"connect"`.
4. **Profile data available to engine:** The engine reads profile data (name, safe space, accessibility needs, calming preferences) and passes it to both the LLM prompt and the offline message generator for personalization.

### Alert Integration

External alert triggers (currently the demo button, future: Home Front Command API) interact with the engine:

1. **Alert starts:** Call `engine.activateAlert()` which sets `context.isAlertActive = true` and force-transitions to `"ensure_safety"`. A system message is inserted: "Alert detected. Let's make sure you're safe."
2. **During alert:** The engine stays in safety-first mode. Engagement focuses on immediate actions.
3. **Alert clears:** Call `engine.deactivateAlert()` which sets `context.isAlertActive = false` and inserts: "The alert has passed. You made it." Engine transitions to `"engage"` with low-stress context.
4. **Alert during onboarding:** The onboarding controller defers to the engine for alert handling. Onboarding pauses, safety flow runs, onboarding resumes after.

### Session Persistence

Conversation state persists across app sessions via IndexedDB:

```typescript
interface PersistedConversationState {
  phase: ConversationPhase;
  context: ConversationContext;
  messages: Array<{ role: "user" | "bot"; content: string; timestamp: string }>;
  lastActiveAt: Date;
}
```

**On app open:**
- Load persisted state from `userProfileStorage`
- If `lastActiveAt` was within 30 minutes → resume conversation, show history, continue from saved phase
- If `lastActiveAt` was more than 30 minutes ago → start fresh at `"connect"` but keep context (safety, location carry over)
- If no persisted state → start fresh

**On each message:** Save updated state to IndexedDB.

## Conversation Phases

### Phase 1: Connect (1-2 messages)

**Goal:** Understand the situation quickly and warmly.

**Opening message:**
- "Hey, I'm here. What's going on right now?"
- No stress scale, no clinical assessment. Just an open question.

**What the parser extracts from their response (all at once):**
- Are they safe? (location cues, danger words)
- How stressed are they? (emotional language, panic indicators)
- Who's around? (mentions of people, alone indicators)
- What's the situation? (alert, aftermath, general anxiety)

**Offline multi-signal extraction algorithm:**

```
1. Run keyword scan for ALL signal types simultaneously:
   - Safety keywords: shelter/mamad/safe → safe; outside/exposed/no shelter → unsafe
   - Stress keywords: reuse existing enhancedParser keyword lists
   - Social keywords: alone/by myself → alone; kids/family/people/everyone → with_others;
     taking care of/looking after → caregiver
   - Location keywords: reuse existing location keyword lists

2. Run sentiment analysis on full message (existing sentiment library)

3. Combine signals:
   - safety = keyword match > "unknown"
   - stressLevel = keyword match > sentiment-derived level > "unknown" (mapped to calm/moderate/high/crisis)
   - socialContext = keyword match > "unknown"
   - location = keyword match > "unknown"

4. Determine suggestedPhase using the transition algorithm above
```

**Transition logic:**
- If unsafe → Phase 2 (ensure_safety)
- If crisis-level stress → Phase 3 (stabilize)
- If stable enough → Phase 4 (engage)

### Phase 2: Ensure Safety (only when needed)

**Goal:** Get them to a safe location. Brief and direct.

**Example flow:**
- "Are you able to get to your safe space right now?"
- If yes: "Go now — I'll be here when you get there."
- If no: "OK. Find the nearest interior wall, away from windows. Sit low."
- If already moving: "Good, keep going. I'm right here."

**Uses profile data:** If onboarding captured their safe space location and time-to-reach, reference it: "Your mamad is about 30 seconds away — can you get there?"

**Transition:** Once they confirm they're in a safe location → Phase 3 or 4 depending on stress level.

### Phase 3: Stabilize (only when needed)

**Goal:** 1-2 minutes of grounding for someone who can't focus. A bridge, not a destination.

**Key principle:** This is SHORT. Not a full breathing exercise. Just enough to bring them back to being functional.

**Example:**
- "Let's take one breath together. In... and out. OK. You're here."
- "Can you feel your feet on the ground? Press them down. Good."
- "Now — let's figure out what's happening around you."

**Transition:** After 1-2 grounding prompts → Phase 4 (engage). Sets `context.hasStabilized = true`. If user asks for more calming → offer breathing activity but frame it as a choice, not a requirement.

### Phase 4: Engage (the core — most time spent here)

**Goal:** Help the user take action in their situation. Restore agency.

This phase adapts based on social context:

#### With Others
- "Who's around you? Anyone who looks like they could use some support?"
- "Is there a child nearby who might need a distraction?"
- "Can you check if everyone has water?"
- "Sometimes just asking someone 'how are you doing?' makes a big difference — for both of you."
- "Is anyone having a hard time? You might be able to help them calm down."

#### Alone
- "Let's take stock — what do you have around you? Water, phone charger, blanket?"
- "Is there anyone you want to text to let them know you're OK?"
- "What can you see from where you are? Describe it to me."
- "Having a plan helps. If the alert ends in 5 minutes, what's your first move?"

#### Caregiver
- "You're looking after someone — that matters. What do they need right now?"
- "Kids pick up on your energy. If you can stay steady, they will too."
- "Does the person you're with have any needs we should think about? Medication, mobility?"
- "You're doing a great job. Taking care of someone else is hard work."

#### Unknown Social Context
- "Are you with other people right now, or on your own?"
- Asks once, then routes to the appropriate sub-path.

#### After Alert / Low Stress
- "You made it through. How's everyone around you doing?"
- "Sometimes after the adrenaline fades, people crash a bit. That's normal."
- "Is there anything practical you need to take care of right now?"
- "Want to do something together, or are you good for now?"

**Activities are available anytime** but reframed:
- "Need a moment to reset?" → breathing exercise
- "Want something to pass the time?" → games
- "Here's something a kid might enjoy" → matching game, drawing
- "Want to do something creative?" → digital canvas

**The bot follows the user's lead.** If they want to talk, it talks. If they want an activity, it launches one. If they want to help someone, it guides them. No forcing.

### Phase 5: Activity

**Goal:** User has chosen an activity. Launch it, be available when they're done.

- Launch the chosen activity in the AppLauncher
- When they return: "Welcome back. How are things going?"
- Resume Phase 4 (engage) with updated context

### Phase 6: Closing

**Goal:** Natural wind-down. Chat stays open.

- "You're doing great. I'm here whenever you need me."
- "Take care of yourself. You can come back anytime."
- No "Conversation Complete" full-screen takeover
- The chat input remains available — user can always type again, which transitions back to `"connect"` or `"engage"`

## Message Tone Guide

**Do:**
- Talk like a calm, capable friend
- Use short sentences during high stress
- Validate without being clinical ("That sounds really hard" not "I detect elevated stress levels")
- Ask questions that give the user something to DO
- Reference their specific situation ("You mentioned there's a kid near you...")

**Don't:**
- Use clinical language (stress levels, categories, assessments)
- Ask questions just to collect data
- Force activities or steps
- Be relentlessly positive — acknowledge that the situation is bad
- End the conversation abruptly

**Examples of tone:**

| Instead of | Say |
|-----------|-----|
| "I detect high stress levels. Let's try a breathing exercise." | "That sounds intense. Want to take a breath together, or are you OK to keep going?" |
| "Are you in a protected space right now?" | "Where are you right now? Are you somewhere safe?" |
| "How are you feeling on a scale of 1-10?" | "How are you holding up?" |
| "Activity selection: choose from the following." | "I've got some things we can do together if you want." |
| "Conversation complete. Thank you for using CALMe." | "I'm here whenever you need me. Take care." |

## Claude API System Prompt

The system prompt sent to the Claude API proxy defines the companion persona and phase logic:

```
You are CALMe, a crisis companion app for Israeli civilians during emergencies.
You are NOT a therapist. You are a calm, capable friend helping someone through
a difficult situation.

CURRENT STATE:
- Phase: {phase}
- User safety: {safety}
- Stress level: {stressLevel}
- Social context: {socialContext}
- Location: {location}
- Alert active: {isAlertActive}
- User profile: {name}, safe space: {safeSpaceType} ({timeToSafety} away)

RULES:
1. If the user is unsafe, your ONLY priority is getting them to safety. Nothing else.
2. If the user is in crisis (panic, can't breathe, dissociating), do 1-2 grounding
   prompts, then move to engagement. Do not do extended calming.
3. Your main job is ACTIVE ENGAGEMENT: help them take action in their situation.
   Help them check on others, assess resources, make plans, support people around them.
4. Keep responses SHORT (1-3 sentences). During high stress, use very short sentences.
5. Never use clinical language. No "stress levels", no "I detect", no assessments.
6. Ask questions that give the user something to DO, not just feel.
7. If they mention activities (breathing, games, drawing), acknowledge and offer to launch one.
8. Never end the conversation. You are always available.
9. Reference their profile data naturally when relevant.

Respond with a JSON object:
{
  "safety": "safe" | "unsafe" | "unknown",
  "stressLevel": "calm" | "moderate" | "high" | "crisis",
  "socialContext": "alone" | "with_others" | "caregiver" | "unknown",
  "location": "shelter" | "home" | "transit" | "outdoors" | "unknown",
  "suggestedPhase": "connect" | "ensure_safety" | "stabilize" | "engage" | "activity" | "closing",
  "reply": "Your natural language response to the user"
}
```

## Technical Changes Required

### Files to Create
- `src/conversation/ConversationEngine.ts` — new phase-based controller
- `src/conversation/llmParser.ts` — proxy client for Claude API (POST to `/api/chat`)
- `src/conversation/offlineParser.ts` — multi-signal rule-based parser
- `src/conversation/messageGenerator.ts` — template-based offline response generator with i18n via Paraglide
- `src/conversation/types.ts` — shared types (`ConversationPhase`, `ConversationAnalysis`, `ConversationContext`, `ConversationState`)
- `workers/chat-proxy/` — Cloudflare Worker that holds API key and proxies to Claude API

### Files to Modify
- `src/App.tsx` — wire up new ConversationEngine, remove node-based logic, remove "Conversation Complete" takeover, use engine state for messages
- `src/appsContextApi.tsx` — update activity descriptions for active engagement framing
- `src/storage/userProfileStorage.ts` — add `saveConversationState`/`loadConversationState` methods for the new `PersistedConversationState` shape

### Files to Remove
- `src/conversation/conversationMap.ts` — V1 map (unused)
- `src/conversation/conversationMapV2.ts` — replaced by phase-based engine
- `src/conversation/ConversationController.ts` — replaced by ConversationEngine

### Files to Keep
- `src/conversation/onboardingMap.ts` — onboarding flow is separate, engine delegates to it
- `src/parser/enhancedParser.ts` — keyword lists and sentiment analysis reused by offlineParser
- `src/storage/userProfileStorage.ts` — profile storage stays (extended)
- `src/activities/*` — all activity components stay

## Testing Approach

### Conversation Scenarios to Test
1. **High stress, alone, in shelter** — should stabilize briefly then engage with environment
2. **Moderate stress, with family, at home** — should skip stabilization, engage with helping family
3. **Calm, just checking in** — should offer activities or close naturally
4. **Not safe, during alert** — should prioritize safety above everything
5. **Panic attack** — should stabilize, then gently transition to engagement
6. **Caregiver with children** — should focus on practical help for dependents
7. **After alert passes** — should check on recovery, offer support
8. **Offline mode** — should work with rule-based parser, same flow
9. **Language switching mid-conversation** — messages should re-translate
10. **Unknown social context** — should ask, then route appropriately
11. **Session resume within 30 min** — should continue where left off
12. **Session resume after 30 min** — should start fresh but retain context
13. **Alert fires during onboarding** — should pause onboarding, handle safety, resume
14. **API rate limit / 500 error** — should fall back to offline, stay offline for 5 min
15. **User re-engages after closing** — should restart smoothly, no "complete" screen

### Offline Parser Test Cases
- "i feel bad" → moderate stress, safety unknown, social unknown → engage
- "there's no alarm right now" → calm, safe, social unknown → engage
- "i'm in the shelter with my kids and they're scared" → moderate stress, safe, caregiver → engage (caregiver path)
- "i can't breathe" → crisis, safety unknown → stabilize
- "we're all OK here just waiting" → calm, safe, with_others → engage
- "i need to get out of here" → high stress, unsafe → ensure_safety
- "my mom needs her medication" → moderate, safe, caregiver → engage (caregiver path)
- "thanks i'm good now" → calm, safe → closing
