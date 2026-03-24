import type { ConversationPhase, ConversationContext, UserProfileSummary } from "./types";

interface MessagePool {
  [subKey: string]: string[];
}

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
    confirming: ["Are you in a safe place now?", "Did you make it somewhere protected?"],
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

export function generateReply(
  phase: ConversationPhase,
  context: ConversationContext,
  profile: UserProfileSummary | null,
  usedMessages: string[],
): string {
  const pool = messagePools[phase];
  if (!pool) return "I'm here with you.";

  const subKey = selectSubKey(phase, context);
  let candidates = pool[subKey] ?? pool[Object.keys(pool)[0]] ?? ["I'm here with you."];

  if (phase === "ensure_safety" && profile?.safeSpaceType && pool["profile_aware"]) {
    const profileMessages = pool["profile_aware"].filter((m) => !usedMessages.includes(m));
    if (profileMessages.length > 0) {
      candidates = profileMessages;
    }
  }

  let available = candidates.filter((m) => !usedMessages.includes(m));
  if (available.length === 0) {
    available = candidates;
  }

  const selected = available[Math.floor(Math.random() * available.length)];
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
        case "with_others":
          return "with_others";
        case "alone":
          return "alone";
        case "caregiver":
          return "caregiver";
        default:
          return "unknown_social";
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
