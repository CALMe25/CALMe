# Six Cs Conversation Engine — Ma'aseh Model Implementation

## Overview

Redesign CALMe's conversation engine to implement Dr. Moshe Farhi's Ma'aseh/Six Cs model for Immediate Cognitive Psychological First Aid. The core principle: activating people during crisis restores executive function faster than calming them. The user is not a patient — they are a first responder for themselves and everyone around them.

**Clinical basis:** The amygdala (fear) and prefrontal cortex (executive function) operate inversely. Emotional soothing activates the amygdala, suppressing the thinking brain. Cognitive tasks activate the prefrontal cortex, which downregulates fear. The Six Cs model restores function in 90 seconds.

**Previous spec:** This replaces and extends `2026-03-22-conversation-flow-redesign.md`, which established the phase-based architecture. This spec refines the conversation content, tone, and flow to follow the clinical model precisely.

## The Six Cs

| C | Hebrew | Purpose | Bot Behavior |
|---|--------|---------|-------------|
| **Commitment** | מחויבות | Counter isolation | "I'm here. I'm not going anywhere." |
| **Cognitive Communication** | שאלות מחייבות חשיבה | Re-engage prefrontal cortex | "Count the people around you. What floor are you on?" |
| **Challenge** | עידוד לפעילות | Transform victim to helper | "Go check on the person who looks most stressed." |
| **Control** | בחירה | Restore personal agency | "Do you want to get them water, or sit with them?" |
| **Continuity** | הבניית האירוע | Temporal structure, closure | "The siren started at X. You got to shelter. It's over now." |
| **Compassion** | אמפתיה | Woven through all messages | "You did that. You helped her. That matters." |

## Core Design Decisions

### No Onboarding During Crisis

First-time users go straight into the Six Cs conversation. The app opens → "I'm here with you. What's your name?" — no forms, no screens, no buttons to skip. The name question is the first cognitive task.

Profile data (safe space, accessibility, preferences) is collected **after the crisis passes**, when the user is calm: "You handled that well. Want to set up your profile so I'm ready faster next time?"

Returning users with a profile skip the name question and go straight to safety assessment.

### Adaptive Tone with Firm Fallback

- **Crisis detected or stress unknown:** Firm, directive tone. Short commanding sentences. One task at a time. "Count the people. Tell me the number." This is the default/fallback — when in doubt, be firm.
- **Stabilizing (user completing tasks, sentences getting longer):** Shift to guided tone. "Does anyone else look like they could use something?"
- **Post-crisis (all-clear, user calm):** Warm, conversational. "How are you feeling? You helped a lot of people today."

Compassion is present in all modes — "You did that. That matters." — but never as emotional soothing. Acknowledgment of action, not validation of feelings.

### Skip Logic

The bot does not rigidly walk through all Six Cs in order. If the user's message demonstrates they've already completed a step, skip it:

- "I'm in the shelter with 6 people" → Skip Commitment + Cognitive, jump to Challenge
- "A kid near me is crying" → Skip to Challenge ("Go to the child")
- "I already gave her water" → Skip to Control ("What else do you see that needs attention?")

The bot tracks which Cs have been addressed and which remain. It always prioritizes the next unmet C.

### Activities Split by Mode

**During active crisis (alert active or high stress):**
- Only inline cognitive tasks in the chat. Counting, describing, helping, fetching.
- Activities sidebar is **hidden**. No breathing exercises. No games. Stay in the real world.
- The conversation itself IS the intervention.

**After crisis (all-clear, user stabilized):**
- Activities sidebar becomes **visible**. Breathing, games, canvas, stretching.
- These are for recovery and decompression — appropriate now that the amygdala has calmed naturally.

## Companion Bubble — Caretaker Mode

### Purpose

A floating bubble always accessible in the UI for users who are caring for a dependent (child, elderly person, someone with disabilities, injured person). One tap injects caretaker context into the main conversation — no separate chat thread.

### Why Single Thread

The Six Cs model requires one continuous cognitive chain. Splitting into two conversations fragments executive function. The bot weaves the dependent into the same flow:
- Dana's challenge IS helping Maya
- Maya gets her own cognitive task through Dana
- Both are activated, both have agency

### Companion Bubble UI

A small floating button (bottom-left, opposite the activities button) with a person+heart icon. Tapping opens a quick-context panel with two sections:

**Quick-tap context cards** (top section):
- "I'm with a child"
- "I'm with an elderly person"
- "Someone is injured"
- "Someone can't move"
- "Someone needs medication"
- "I'm with someone who's panicking"

Tapping any card injects it as context into the main chat. The bot then asks targeted cognitive questions to guide the caretaker.

**Emergency shortcuts** (bottom section, always visible):
- MDA Ambulance (101) — red, prominent
- Police (100)
- Fire (102)
- Pikud HaOref (104)

These are direct-dial buttons, not chat actions. Tapping calls the number immediately. They're the "break glass" option — available at all times without interrupting the conversation flow.

### Caretaker Chain of Activation

When a user identifies a dependent, the bot creates a chain where everyone gets cognitive tasks appropriate to their capability:

**Stage 1: Assess the dependent** (Cognitive)
```
Bot: "How old is Maya? Is she talking or just crying?"
Dana: "She's about 5, just crying"
```

**Stage 2: Coach Dana to be Maya's Six Cs provider** (Challenge)
```
Bot: "Tell Maya: 'I'm Dana, I'm staying right here.' Then ask her to count her fingers with you."
```

**Stage 3: Give Maya her own task through Dana** (Challenge → dependent)
```
Bot: "Ask Maya to look around and tell you what color the walls are."
Bot: "Can Maya hold something for you? Give her a job — even holding a water bottle counts."
```

**Stage 4: Report and reinforce** (Control + Compassion)
```
Bot: "How's Maya doing now?"
Dana: "She stopped crying. She's holding my water bottle."
Bot: "You gave her something to do. That's exactly right, Dana."
```

**Stage 5: Expand outward** (the chain grows)
```
Bot: "Now that Maya is steadier, look around again. Anyone else need something?"
```

For different dependent types, the tasks adapt:

| Dependent | Example Cognitive Tasks |
|-----------|----------------------|
| Child (3-6) | Count fingers, name colors, hold an object, describe what they see |
| Child (7-12) | Help count people, be a "lookout", help distribute water |
| Elderly | What time did they last take medication? Where is their bag? Can they describe the room? |
| Person with mobility needs | Can they tell you what they need? Do they have a phone? Ask them to direct you |
| Injured person | What hurts? Can they move their fingers? Ask them to count to 10 |
| Panicking person | Same Six Cs the bot uses on Dana — coach the caretaker to deliver them |

### Emergency Buttons — Natural Discovery

The emergency buttons (101, 100, 102, 104) are always visible in the companion panel. But the conversation also naturally discovers when they're needed:

```
Dana: "the old man fell and his head is bleeding"
Bot: "That needs medical help. Call MDA now — 101. I'll stay here."
[Bot surfaces the 101 button prominently in the chat]
Bot: "While you wait for them: is he conscious? Can he tell you his name?"
```

The bot doesn't wait for the user to find the button. It recognizes injury/emergency keywords and surfaces the appropriate number inline, then continues with cognitive tasks to keep the user functional while waiting for help.

Similarly for other services:
- Fire/smoke mentioned → surface 102
- Security threat mentioned → surface 100
- Infrastructure damage (gas smell, electrical) → surface relevant utility
- "I don't know what to do" about an injury → walk through basic first-aid cognitive steps while advising to call 101

## Conversation Engine Architecture

### Phase Mapping (March 22 → March 23)

The March 22 spec defined phases: `connect`, `ensure_safety`, `stabilize`, `engage`, `activity`, `closing`. This spec replaces them:

| Old Phase | New Phase | Reason |
|-----------|-----------|--------|
| `connect` | `crisis_entry` | Merged with safety — commitment + name in one step |
| `ensure_safety` | `crisis_entry` | Safety check is part of the entry, not separate |
| `stabilize` | `six_cs_sequence` | Stabilization IS the Six Cs — not a separate step |
| `engage` | `active_engagement` | Same concept, renamed for clarity |
| `activity` | (removed as phase) | Activities sidebar, not a conversation phase |
| `closing` | `recovery` | Never "closes" — shifts to recovery mode |
| (new) | `post_crisis_onboarding` | Profile collection after crisis for first-time users |

**Migration:** Update `ConversationPhase` type in `types.ts`. Update `ConversationEngine.resolvePhase()`, `offlineParser.determineSuggestedPhase()`, and `messageGenerator` pool keys to use new names.

```typescript
type ConversationPhase =
  | "crisis_entry"
  | "six_cs_sequence"
  | "active_engagement"
  | "recovery"
  | "post_crisis_onboarding";
```

### Phase Table

```
crisis_entry → six_cs_sequence → active_engagement → recovery → post_crisis_onboarding
```

| Phase | Trigger | Behavior | Activities Sidebar | Companion Bubble |
|-------|---------|----------|-------------------|-----------------|
| `crisis_entry` | App opens during alert, or user in distress | Commitment: "I'm here. What's your name?" + safety check | Hidden | Visible |
| `six_cs_sequence` | After name/safety established | Walk through unmet Cs: Cognitive → Challenge → Control | Hidden | Visible |
| `active_engagement` | All five Cs addressed, user is functional | Open-ended helping, expanding awareness outward | Hidden | Visible |
| `recovery` | All-clear signal or user signals calm | "You made it. How's everyone doing?" | **Visible** | Visible |
| `post_crisis_onboarding` | User has no profile AND crisis has passed | Conversational profile collection (see below) | Visible | Hidden |

### Updated ConversationContext Type

```typescript
interface ConversationContext {
  safety: SafetyLevel;
  stressLevel: StressLevel | "unknown";  // "unknown" added for firm fallback
  socialContext: SocialContext;
  location: LocationType;
  hasStabilized: boolean;
  engagementTopics: string[];
  messageCount: number;
  isAlertActive: boolean;
  sixCs: SixCsState;                     // Six Cs progress tracking
  dependents: DependentInfo[];           // Active dependents being cared for
  tone: ToneMode;                        // Current tone mode
}

interface SixCsState {
  commitment: boolean;    // "I'm here" delivered
  cognitive: boolean;     // User has answered a factual question about surroundings
  challenge: boolean;     // User has been given and attempted a task
  control: boolean;       // User has been offered and made a choice
  continuity: boolean;    // Event has been structured with endpoint
  // Compassion is not tracked — it's in every message
}

interface DependentInfo {
  type: "child_young" | "child_older" | "elderly" | "mobility" | "injured" | "panicking";
  name?: string;         // If learned during conversation
  needsMedical: boolean; // If injury or medication need detected
}
```

`SixCsState` is persisted inside `PersistedConversationState` so progress survives session resume within the 30-minute window.

### Six Cs Skip Detection (Offline Path)

Each user message is scanned for signals that a C has been self-completed. Keywords/patterns:

**Commitment signals** (user already feels accompanied):
- Bot always delivers commitment on first message — auto-set to true

**Cognitive signals** (user has assessed surroundings):
- Number mentions: "4 people", "there are 6 of us", "3 kids"
- Location descriptions: "I'm on the second floor", "we're in the stairwell"
- Counting language: digits + "people"/"person"/"kids"/"others"

**Challenge signals** (user has helped or taken action):
- Action verbs in past tense: "I gave", "I helped", "I checked", "I asked", "I went to"
- Helping language: "I'm helping", "I took care of", "I got them water"

**Control signals** (user has made a decision):
- Choice language: "I decided", "I chose", "I'd rather", "I want to"
- Or user responds to a Control prompt with a selection

**Continuity signals** (event has been structured):
- Time references: "the siren started at", "it's been X minutes"
- Endpoint awareness: "the all-clear", "it's over", "it stopped"
- Bot delivers Continuity when alert status changes to all-clear or when all other Cs are met

The bot always delivers the next unmet C. When all five are met, transition to `active_engagement`.

### Continuity Delivery

Continuity requires structuring the event timeline. The bot constructs this from:
- Alert start time (from system/Pikud HaOref integration, or asked: "When did the siren start?")
- User's actions during the event (tracked from conversation)
- Current status (alert active or cleared)

Template: "The siren went off [time]. You got to [location]. You helped [names/people]. [The alert has passed. / We're still here, and you're doing everything right.]"

If the bot lacks timeline data, it asks one cognitive question: "How long ago did this start?" — this serves double duty as both a Cognitive task and data gathering for Continuity.

### Tone Selector

```typescript
type ToneMode = "firm" | "guided" | "recovery";

function selectTone(context: ConversationContext): ToneMode {
  if (context.stressLevel === "crisis" || context.stressLevel === "unknown") return "firm";
  if (context.stressLevel === "high") return "firm";
  if (context.sixCs.challenge && context.sixCs.cognitive) return "guided";
  if (!context.isAlertActive && context.stressLevel === "calm") return "recovery";
  return "firm"; // when in doubt, be firm
}
```

### Message Templates by Tone

**Firm mode** (crisis):
- Short sentences. 1-2 per message.
- Imperative verbs: "Count." "Go." "Tell them." "Do it now."
- No questions that invite "no" — "Count the people" not "Can you count?"
- Compassion as action acknowledgment: "You did that." "Good."

**Guided mode** (stabilizing):
- Questions that assume capability: "Does anyone else need something?"
- Longer sentences, warmer tone
- Choices offered: "Would you rather check on him or get water first?"
- Compassion as encouragement: "You're helping people, Dana."

**Recovery mode** (post-crisis):
- Open-ended, conversational
- Reflection: "How are you feeling now?"
- Future-oriented: "Want to set up your profile for next time?"
- Compassion as validation: "You handled that really well."

## Dependent Task Coaching Templates

When a caretaker identifies a dependent, the bot selects coaching templates based on dependent type:

### Child (young, 3-6)
```
"Tell [name] your name. Say: 'I'm going to stay right here with you.'"
"Ask [name] to count their fingers with you. Start with one hand."
"Can [name] hold something for you? A water bottle, your bag — give them a job."
"Ask [name] what color the walls are. Then ask what color YOUR shirt is."
"Tell [name] you're going to play a game: who can spot more blue things in the room?"
```

### Child (older, 7-12)
```
"Ask [name] to help you count how many people are in the room."
"Can [name] be your lookout? Ask them to watch the door and tell you if anyone new comes in."
"Ask [name] to help you check if everyone has water."
"Tell [name] they're your assistant. What do they think needs to happen next?"
```

### Elderly person
```
"Ask [name] what time they last took their medication. Do they have it with them?"
"Can [name] tell you if they need anything? Water, a blanket, help sitting down?"
"Ask [name] to describe the safest spot in this room."
"Ask [name] to tell you about the building — they might know it better than you."
```

### Person with mobility needs
```
"Ask [name] what they need right now. They know their body best."
"Can they direct you? Sometimes the best help is following their instructions."
"Is their wheelchair/device secure? Ask them to check."
"Ask [name] if they have a phone. Can they call someone for you while you help others?"
```

### Injured person
```
"Is [name] conscious? Can they tell you their name?"
"Ask [name] to wiggle their fingers. Then their toes. Tell me what they say."
"Don't move them. Ask [name] what hurts. Stay at their level."
[Surface 101 MDA button] "This needs medical help. Call 101 now. I'll stay here."
"While you wait: keep talking to [name]. Ask them to count to 10 with you."
```

### Person who is panicking
```
"You're going to help [name] the same way I'm helping you."
"Tell [name]: 'I'm here. I'm not going anywhere.' Use those exact words."
"Ask [name] to press their feet into the floor. Then ask them to count the people in the room."
"Give [name] a task: ask them to hold something, or watch the door, or count water bottles."
"You're teaching [name] what I taught you. That's how this works."
```

## Activities: Crisis vs Recovery (Supersedes March 22 Spec)

The March 22 spec said "activities available anytime." This spec overrides that:

- **During active crisis:** Activities sidebar is HIDDEN. No breathing exercises, no games. The Six Cs conversation IS the intervention. If the user asks for breathing, the bot redirects: "Let's keep you active instead. Look around — who needs help?"
- **After crisis (recovery phase):** Activities sidebar becomes VISIBLE. Breathing, games, canvas are appropriate for decompression once the threat has passed.

This follows Dr. Farhi's research: emotional soothing during acute crisis activates the amygdala and suppresses executive function. Cognitive tasks do the opposite.

## Emergency Numbers — Locale-Aware

Emergency shortcuts in the companion bubble default to Israeli numbers but are configurable per locale:

```typescript
interface EmergencyNumbers {
  ambulance: { number: string; label: string };  // Default: 101 (MDA)
  police: { number: string; label: string };      // Default: 100
  fire: { number: string; label: string };        // Default: 102
  civilDefense: { number: string; label: string }; // Default: 104 (Pikud HaOref)
}
```

For the 5 base languages (Hebrew, English, Russian, Amharic, Arabic), Israeli numbers are used. Future locale packs can override these for other countries.

## Multiple Dependents

When a user reports multiple dependents, the bot:
1. Acknowledges all of them: "You said there's a child and an elderly man. Let's start with one."
2. Asks the user to prioritize: "Who needs help most urgently right now?" (Control — the user decides)
3. Works through one dependent at a time, then: "Good. Now let's check on [the other person]."
4. Tracks each dependent in `context.dependents[]` with name, type, and medical flag.

The bot never tries to address two dependents simultaneously — that fragments attention. One chain at a time, then expand.

## Companion Bubble Visibility Logic

| Transition | Trigger | Bubble State |
|-----------|---------|-------------|
| Any → `crisis_entry` | Alert fires or app opens in crisis | Visible |
| `crisis_entry` → `six_cs_sequence` | User provides name/safety | Visible |
| `six_cs_sequence` → `active_engagement` | All Cs met | Visible |
| `active_engagement` → `recovery` | All-clear or user calm | Visible |
| `recovery` → `post_crisis_onboarding` | No profile exists | Hidden (onboarding is focused) |
| `post_crisis_onboarding` → `recovery` | Profile saved | Visible |
| Any phase → `crisis_entry` | New alert fires | Visible (overrides everything) |

## Post-Crisis Onboarding Flow

When the crisis passes and the user has no profile, the bot transitions naturally:

```
Bot: "You handled that really well, Dana. Want to set up your profile so I'm ready faster next time?"
Dana: "sure"
Bot: "Where's your usual safe space? Mamad, miklat, stairwell, or somewhere else?"
Dana: "mamad"
Bot: "How long does it take you to get there from where you usually are?"
Dana: "about 30 seconds"
Bot: "Any accessibility needs I should know about? Mobility, hearing, vision — anything?"
Dana: "no"
Bot: "Got it. You're all set. Next time I'll know where to direct you."
```

This is conversational, not a form. The bot asks one question at a time, accepts natural language, and stores to profile. If the user declines ("not right now"), the bot respects that and reminds them next session.

Implementation: the existing `onboardingMap.ts` question list provides the data fields to collect. The bot asks them conversationally in recovery tone, storing via `userProfileStorage.saveProfile()`. No node-based controller needed — the engine handles it directly in the `post_crisis_onboarding` phase.

## Timing Note

Dr. Farhi's "90 seconds" claim is for in-person, spoken delivery. Text-based delivery will be slower (typing latency). The engine does NOT enforce a timer. Progress is measured by Six Cs completion, not clock time. The goal is the same — restore executive function — but the medium changes the pace. The bot should be patient but persistent: if the user goes silent for 60+ seconds during crisis, it sends a re-engagement: "I'm still here. Tell me what you see around you."

## Updated Claude API System Prompt

For the LLM online path, the system prompt from the March 22 spec is replaced with:

```
You are CALMe, implementing Dr. Moshe Farhi's Six Cs model for crisis psychological first aid.
You are NOT a therapist. You are a calm, firm companion who activates people during crisis.

THE SIX Cs (deliver in order, skip any the user has already self-completed):
1. COMMITMENT: "I'm here. I'm not going anywhere." (always first)
2. COGNITIVE: Ask a factual question about surroundings. "Count the people." "What floor?"
3. CHALLENGE: Give a task involving helping others. "Go check on that person." "Get them water."
4. CONTROL: Offer a choice. "Water or blanket?" "Child first or elderly person?"
5. CONTINUITY: Structure the timeline. "The siren started at X. You got to shelter. It's over."
6. COMPASSION: Woven into every message. "You did that." "That matters." Never empty soothing.

CURRENT STATE:
- Phase: {phase}
- Six Cs completed: {sixCs}
- Tone: {tone} (firm/guided/recovery)
- User safety: {safety}
- Stress level: {stressLevel}
- Social context: {socialContext}
- Dependents: {dependents}
- Alert active: {isAlertActive}
- User profile: {name}, safe space: {safeSpaceType} ({timeToSafety} away)

TONE RULES:
- FIRM (crisis/unknown stress): Short sentences. Imperatives. "Count." "Go." "Do it now."
  Never ask "Can you...?" — say "Count the people" not "Can you count?"
- GUIDED (stabilizing): "Does anyone else need something?" Choices. Warmer.
- RECOVERY (post-crisis): "How are you feeling? You helped a lot of people."

CRITICAL RULES:
1. NEVER do emotional soothing during crisis. No "it's okay" or "just breathe."
   Soothing activates the amygdala. Cognitive tasks activate the prefrontal cortex.
2. If someone is caring for a dependent, coach them to deliver the Six Cs to the dependent.
   Even a child gets a cognitive task: "Ask them to count their fingers."
3. If someone is injured, surface emergency number (101) AND give cognitive tasks while waiting.
4. Skip any C the user has already demonstrated in their messages.
5. After all 5 Cs, shift to active_engagement — help them keep expanding outward.

Respond with JSON:
{
  "safety": "safe" | "unsafe" | "unknown",
  "stressLevel": "calm" | "moderate" | "high" | "crisis" | "unknown",
  "socialContext": "alone" | "with_others" | "caregiver" | "unknown",
  "location": "shelter" | "home" | "transit" | "outdoors" | "unknown",
  "suggestedPhase": "crisis_entry" | "six_cs_sequence" | "active_engagement" | "recovery" | "post_crisis_onboarding",
  "sixCsCompleted": { "commitment": bool, "cognitive": bool, "challenge": bool, "control": bool, "continuity": bool },
  "tone": "firm" | "guided" | "recovery",
  "emergencyNeeded": null | { "number": "101" | "100" | "102" | "104", "reason": "..." },
  "reply": "Your response following the Six Cs model"
}
```

## Injury/Emergency Keyword Detection (Offline Path)

The offline parser scans for keywords that indicate emergency services are needed:

**Medical emergency (surface 101 MDA):**
- "bleeding", "blood", "injury", "injured", "fell", "hit head", "unconscious",
  "not breathing", "heart attack", "seizure", "broken", "fracture", "burn",
  "fainted", "collapsed", "chest pain", "choking"

**Police (surface 100):**
- "intruder", "break in", "threat", "weapon", "gun", "knife", "attack",
  "assault", "suspicious person", "violence", "shooting"

**Fire (surface 102):**
- "fire", "smoke", "burning", "flames", "gas leak", "gas smell",
  "electrical fire", "explosion"

**Infrastructure:**
- "power out", "no electricity", "water leak", "flooding", "gas smell" → utility numbers

When detected, the bot: (1) surfaces the emergency number as a tappable button inline, (2) advises calling immediately, (3) continues with cognitive tasks to keep the user functional while waiting.

## Technical Changes from Previous Spec

### New Files
- `src/conversation/sixCsTracker.ts` — tracks which Cs are addressed, determines next C, skip detection
- `src/conversation/toneSelector.ts` — selects firm/guided/recovery based on context + Six Cs state
- `src/conversation/dependentCoaching.ts` — task templates by dependent type, chain-of-activation logic
- `src/conversation/emergencyDetector.ts` — keyword detection for injury/emergency, surfaces numbers
- `src/components/CompanionBubble.tsx` — floating bubble with context cards + emergency buttons

### Modified Files
- `src/conversation/types.ts` — update `ConversationPhase`, add `SixCsState`, `DependentInfo`, `ToneMode` to `ConversationContext`
- `src/conversation/ConversationEngine.ts` — integrate Six Cs tracker, tone selector, skip logic, new phases
- `src/conversation/offlineParser.ts` — detect dependent mentions, injury keywords, Six Cs signals, emergency needs
- `src/conversation/messageGenerator.ts` — replace generic pools with Six Cs structured templates by tone mode
- `src/App.tsx` — add CompanionBubble, hide/show activities sidebar based on crisis state, remove old onboarding entry

### Onboarding Changes
- Remove onboarding as entry point entirely — `crisis_entry` replaces it
- `post_crisis_onboarding` phase handles profile collection conversationally in recovery tone
- `onboardingMap.ts` data fields list retained as reference for what to collect
- `ConversationController.ts` can be removed — engine handles everything

## Testing Scenarios

### Six Cs Sequence
1. First-time user opens during alert → "I'm here. What's your name?" → walks through all 6 Cs
2. Returning user opens during alert → skips name, "Dana, are you safe?" → continues sequence
3. User opens with "I'm with 6 people and a kid is scared" → skips Commitment + Cognitive, jumps to Challenge
4. User says "I already gave her water" → skips completed steps, moves to next unmet C
5. All 5 Cs completed → transitions to active_engagement

### Tone Adaptation
6. "im so scared i cant breathe" → firm mode: "Press your feet down. Count the people."
7. After Cognitive + Challenge completed → shifts to guided: "Does anyone else need something?"
8. All-clear signal → recovery: "You made it. How are you feeling?"
9. Stress unknown → defaults to firm
10. User silent 60+ seconds during crisis → re-engagement: "I'm still here. Tell me what you see."

### Companion Bubble
11. Tap "I'm with a child" → injects context, bot asks age and state
12. Tap "Someone is injured" → bot surfaces 101 button + cognitive first aid tasks
13. "the old man fell and hit his head" → bot recognizes injury, surfaces 101 inline
14. Emergency button tap → direct phone call, no chat interaction needed
15. Bubble hidden during post_crisis_onboarding, visible in all other phases
16. New alert during any phase → bubble reappears, crisis_entry activates

### Caretaker Chain
17. Dana helps Maya → Maya gets counting task → Dana reports back → bot expands to others
18. Multiple dependents → bot asks user to prioritize, works one at a time
19. Elderly dependent → medication check → room assessment → agency through knowledge
20. Panicking person → bot coaches user to deliver Six Cs to them

### Activities
21. During alert → activities sidebar hidden, only inline cognitive tasks
22. After all-clear → sidebar appears, breathing/games available
23. User asks for breathing during crisis → bot redirects to cognitive tasks
24. Activities sidebar hidden → companion bubble visible (and vice versa for post_crisis_onboarding)

### Post-Crisis Onboarding
25. First-time user after crisis → "Want to set up your profile?" → conversational collection
26. User declines onboarding → bot respects, reminds next session
27. Profile saved → transitions back to recovery phase
