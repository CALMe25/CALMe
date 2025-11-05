// Comprehensive Test Script for CALMe Phase 2 Conversation Flows
// Tests multiple user journeys using realistic natural language inputs
// No keyword matching - relies entirely on semantic parser classification

const testScenarios = [
  {
    name: "Scenario 1: Safe Person with High Stress",
    description: "Person is safe but experiencing panic attack",
    inputs: [
      "I'm inside my apartment right now, but I'm really freaking out",
      "I'm at home with my family, we got to the safe room",
      "I can't catch my breath and my heart is pounding so fast, I think I might be having a panic attack",
      "That helped a little bit, I feel slightly calmer now",
      "My husband and kids are here with me, we're all together",
      "I want to try some more breathing exercises please"
    ],
    expectedFlow: "safety_check → stress_level → breathing_activity → breathing_return → location_check → family_check → positive_coping → ongoing_support → breathing_activity"
  },

  {
    name: "Scenario 2: Dangerous Situation - Emergency Protocol",
    description: "Person in immediate danger",
    inputs: [
      "There are explosions nearby and I'm still outside",
      "No I can't get anywhere safe, I'm trapped on the street"
    ],
    expectedFlow: "safety_check → safety_clarify → emergency_mode"
  },

  {
    name: "Scenario 3: Uncertain Safety, Moderate Stress, Alone",
    description: "Person unsure about safety, moderately stressed, isolated",
    inputs: [
      "I think I'm okay but I'm not really sure what's happening",
      "Maybe I can find somewhere safer, there's a building nearby",
      "I'm feeling pretty anxious and worried about everything",
      "I'm in some kind of office building that I ducked into",
      "I'm completely alone here, nobody else around",
      "It's really hard being by myself during all this, I keep thinking about my family",
      "I'm trying to stay strong but it's really difficult",
      "Maybe we could keep talking for a while? I don't want to be alone with my thoughts"
    ],
    expectedFlow: "safety_check → safety_clarify → stress_level → location_check → social_check → isolation_support → virtual_connection → ongoing_support → continued_conversation"
  },

  {
    name: "Scenario 4: Safe Family, Low Stress, Leadership Role",
    description: "Calm person taking care of family group",
    inputs: [
      "We're all safe in our shelter at home",
      "I'm feeling pretty calm, trying to keep everyone else calm too",
      "We're at our house in the reinforced room",
      "Yes, my whole family is with me - spouse and two kids",
      "Everyone is managing okay, the kids are a bit scared but we're keeping them distracted",
      "I'm doing alright, just focused on keeping everyone safe and calm",
      "I think we're all stable for now, thank you for checking on us"
    ],
    expectedFlow: "safety_check → stress_level → location_check → family_check → positive_coping → social_check → group_coping → leadership_role → ongoing_support → positive_ending"
  },

  {
    name: "Scenario 5: Safe but Overwhelmed Caregiver",
    description: "Person safe but struggling to care for others",
    inputs: [
      "We made it to the community shelter",
      "I'm really overwhelmed, there are people here having breakdowns and kids crying",
      "I'm in the main shelter area with about thirty other people",
      "Some people are panicking, others are arguing, it's really chaotic",
      "I keep trying to help calm people down but I'm exhausted",
      "I really need a moment to breathe, this is too much"
    ],
    expectedFlow: "safety_check → stress_level → location_check → social_check → group_coping → helper_role → breathing_activity"
  },

  {
    name: "Scenario 6: Confused/Dissociated State",
    description: "Person experiencing dissociation or confusion",
    inputs: [
      "I'm somewhere safe I think",
      "I don't really know how I'm feeling, everything seems fuzzy and distant",
      "I can't really focus on anything, my mind keeps wandering",
      "That was a bit better, helped me focus on something concrete",
      "I'm feeling a bit more grounded now, thank you"
    ],
    expectedFlow: "safety_check → stress_level → grounding_activity → grounding_return → social_check → ongoing_support"
  },

  {
    name: "Scenario 7: Family Separation Anxiety",
    description: "Safe person worried about separated family",
    inputs: [
      "I'm safe in a shelter but I'm really worried",
      "I'm feeling extremely anxious because I don't know where my family is",
      "I'm at the downtown emergency center",
      "No, I'm here alone. My wife and daughter were at school when this started",
      "I haven't been able to reach them, the phone lines are down",
      "I can't stop imagining the worst case scenarios, I'm going crazy with worry"
    ],
    expectedFlow: "safety_check → stress_level → location_check → family_check → separation_support → communication_check → uncertainty_coping → grounding_activity"
  },

  {
    name: "Scenario 8: Relief After Contact with Family",
    description: "Person finds out family is safe",
    inputs: [
      "We're safe at home now",
      "I was really stressed earlier but I'm feeling much better",
      "We're at our house",
      "Yes, my family is with me now",
      "I finally got through to them and they made it home safely",
      "It's such a relief but I still feel kind of shaky and emotional",
      "I think I just need some time to process everything that happened"
    ],
    expectedFlow: "safety_check → stress_level → location_check → family_check → communication_check → relief_processing → ongoing_support"
  },

  {
    name: "Scenario 9: Person Who Prefers Solitude",
    description: "Individual who finds strength in being alone",
    inputs: [
      "I'm safe in my apartment",
      "I'm feeling okay, managing things on my own",
      "I'm at my place",
      "I'm alone but I actually prefer it that way right now",
      "Honestly, I think better when I'm by myself. Less chaos, less stress",
      "I'm doing well on my own, I can focus better this way"
    ],
    expectedFlow: "safety_check → stress_level → location_check → social_check → isolation_support → solitude_strength → ongoing_support"
  },

  {
    name: "Scenario 10: Ongoing Support Loop",
    description: "Person needing continued conversation",
    inputs: [
      "I'm safe inside",
      "I'm feeling somewhat anxious",
      "I'm at a friend's house",
      "There are a few of us here together",
      "We're all pretty worried and on edge",
      "I think talking more would help, I don't want to stop yet",
      "I'm still feeling pretty anxious about everything"
    ],
    expectedFlow: "safety_check → stress_level → location_check → social_check → group_coping → ongoing_support → continued_conversation → stress_level"
  }
];

// Test execution instructions
console.log("=".repeat(80));
console.log("CALMe Phase 2 Conversation Flow Test Scenarios");
console.log("=".repeat(80));
console.log("");

testScenarios.forEach((scenario, index) => {
  console.log(`TEST ${index + 1}: ${scenario.name}`);
  console.log(`Description: ${scenario.description}`);
  console.log(`Expected Flow: ${scenario.expectedFlow}`);
  console.log("");
  console.log("User Inputs to Test:");
  scenario.inputs.forEach((input, inputIndex) => {
    console.log(`  ${inputIndex + 1}. "${input}"`);
  });
  console.log("");
  console.log("Manual Testing Instructions:");
  console.log("1. Start the app with 'npm run dev'");
  console.log("2. Enter each input in sequence");
  console.log("3. Observe the conversation flow and responses");
  console.log("4. Verify activities are triggered appropriately");
  console.log("5. Check that the conversation follows the expected flow path");
  console.log("");
  console.log("-".repeat(60));
  console.log("");
});

console.log("AUTOMATED TESTING NOTES:");
console.log("- These inputs avoid keywords and test natural language understanding");
console.log("- Each scenario tests different emotional states and situations");
console.log("- Pay attention to activity triggers (breathing, grounding exercises)");
console.log("- Verify emergency protocols activate for dangerous situations");
console.log("- Check that social/family context affects conversation flow");
console.log("- Ensure return paths from activities work correctly");
console.log("");
console.log("VALIDATION CHECKLIST:");
console.log("□ Safety assessment classifies correctly");
console.log("□ Stress levels trigger appropriate responses");
console.log("□ Location extraction works with various phrasings");
console.log("□ Social situation assessment is accurate");
console.log("□ Activity triggers fire at correct moments");
console.log("□ Return flows from activities continue appropriately");
console.log("□ Emergency protocols activate for danger situations");
console.log("□ Conversation can loop for ongoing support");
console.log("□ End states are reached when appropriate");
console.log("");

// Export for programmatic testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testScenarios;
}