# CALMe Phase 2 Testing Guide

## Quick Start Testing

### 1. Start the Application
```bash
npm run dev
# App will be available at http://localhost:5174
```

### 2. Run Interactive Test Runner
```bash
node test-runner.js
```

This will guide you through 10 comprehensive test scenarios, providing realistic user inputs that test the semantic parser without relying on keywords.

## Test Scenarios Overview

### Scenario 1: Safe Person with High Stress
**Tests**: Safety → Stress → Activity → Return flow
**Key Input**: *"I can't catch my breath and my heart is pounding so fast, I think I might be having a panic attack"*
**Should Trigger**: Breathing exercise automatically

### Scenario 2: Emergency Protocol
**Tests**: Danger detection → Emergency mode
**Key Input**: *"There are explosions nearby and I'm still outside"*
**Should Trigger**: Emergency protocol message

### Scenario 3: Uncertain Safety → Isolation Support
**Tests**: Uncertainty handling → Social assessment → Virtual connection
**Key Input**: *"I think I'm okay but I'm not really sure what's happening"*
**Should Flow**: Through uncertainty → social isolation → support

### Scenario 4: Calm Family Leader
**Tests**: Low stress → Family context → Leadership role
**Key Input**: *"I'm feeling pretty calm, trying to keep everyone else calm too"*
**Should Flow**: Through family assessment → positive coping

### Scenario 5: Overwhelmed Caregiver
**Tests**: Group stress → Helper role → Activity trigger
**Key Input**: *"I keep trying to help calm people down but I'm exhausted"*
**Should Trigger**: Breathing exercise for caregiver

### Scenario 6: Dissociation/Confusion
**Tests**: Confused state → Grounding activity
**Key Input**: *"I don't really know how I'm feeling, everything seems fuzzy and distant"*
**Should Trigger**: Card matching game

### Scenario 7: Family Separation Anxiety
**Tests**: Separation stress → Communication → Uncertainty coping
**Key Input**: *"I can't stop imagining the worst case scenarios, I'm going crazy with worry"*
**Should Flow**: Through family separation → uncertainty → grounding

### Scenario 8: Relief After Contact
**Tests**: Relief processing → Emotional regulation
**Key Input**: *"It's such a relief but I still feel kind of shaky and emotional"*
**Should Flow**: Through relief processing → ongoing support

### Scenario 9: Solitude Preference
**Tests**: Alone but positive → Solitude strength
**Key Input**: *"Honestly, I think better when I'm by myself. Less chaos, less stress"*
**Should Flow**: To solitude strength recognition

### Scenario 10: Continued Support Loop
**Tests**: Ongoing conversation → Loop back
**Key Input**: *"I think talking more would help, I don't want to stop yet"*
**Should Loop**: Back to stress assessment

## What to Observe

### ✅ Parser Accuracy
- [ ] Safety classification works with natural language
- [ ] Stress levels detected correctly (HIGH_STRESS, MODERATE_STRESS, LOW_STRESS, CONFUSED)
- [ ] Location extraction from casual mentions
- [ ] Social context understanding

### ✅ Flow Logic
- [ ] Conditions evaluate correctly based on parser output
- [ ] Emergency protocols activate for danger
- [ ] Activities trigger at appropriate stress levels
- [ ] Social/family context affects conversation path

### ✅ Activity Integration
- [ ] Breathing exercise launches for high stress
- [ ] Card game launches for confusion/grounding
- [ ] Activities return to correct conversation points
- [ ] Auto-launch warning appears before activity

### ✅ User Experience
- [ ] Conversation feels natural and therapeutic
- [ ] Responses are contextually appropriate
- [ ] Flow doesn't feel robotic or scripted
- [ ] Emergency situations handled sensitively

## Manual Testing Tips

### Natural Language Variations
Try these alternative phrasings to test parser robustness:

**Safety Variations:**
- "We're okay, made it inside"
- "Still hearing sirens outside"
- "Not sure if this place is secure"

**Stress Variations:**
- "My chest feels tight, hard to breathe"
- "Feeling worried but managing"
- "Everything seems unreal, like I'm watching from outside"

**Location Variations:**
- "At my neighbor's house"
- "In the basement of our building"
- "Some kind of shelter downtown"

**Social Variations:**
- "My kids are with me"
- "Separated from my family"
- "There's a bunch of people here but I feel alone"

## Debugging

### Check Browser Console
Look for:
- Parser output logs
- Conversation controller state
- Activity trigger logs
- Error messages

### Common Issues
1. **Activities not launching**: Check stress classification accuracy
2. **Wrong conversation path**: Verify conditional logic evaluation
3. **Parser errors**: Check input text and classification results
4. **Return flow issues**: Verify activity return node mapping

## Advanced Testing

### Custom Scenarios
Create your own test cases by:
1. Defining a user situation
2. Writing natural language inputs
3. Predicting expected conversation flow
4. Testing and comparing actual vs expected

### Edge Cases
Test unusual inputs:
- Very short responses: "Yes", "No", "Maybe"
- Emotional language: "I'm terrified", "Can't think straight"
- Mixed situations: "Safe but family missing"
- Cultural variations: Different ways of expressing stress/safety

## Performance Testing

### Load Testing
- Test multiple rapid inputs
- Verify parser response times
- Check memory usage during long conversations

### Error Handling
- Test with nonsensical inputs
- Verify graceful fallbacks
- Check error message clarity

## Results Documentation

Keep track of:
- [ ] Which scenarios passed/failed
- [ ] Parser accuracy observations
- [ ] Flow logic issues discovered
- [ ] User experience feedback
- [ ] Performance concerns
- [ ] Suggested improvements

This testing approach ensures the therapeutic conversation system works reliably across diverse real-world scenarios while maintaining natural, empathetic interactions.