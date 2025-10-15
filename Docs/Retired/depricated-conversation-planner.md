# **DEPRICATED**


# Technical Specification Template for Conversation Design

## Overview
This document shows you how to specify your conversation design so programmers can implement it. Users will respond naturally to your questions, and the system will categorize their responses and show appropriate pre-written replies.

---

## Required Information for Each Question

### Question Identifier
**ID:** _______ (e.g., SAFETY_1, STRESS_2, ACTIVITY_3)

### Question Text
**Display text:** "_________________________________"

### Response Categories
For each question, define all possible response categories and their detection rules:

| Category ID | Keywords/Phrases | Sample User Inputs |
|------------|------------------|-------------------|
| __________ | ________________ | _________________ |
| __________ | ________________ | _________________ |
| __________ | ________________ | _________________ |
| __________ | ________________ | _________________ |

### Response Logic
For each category above:

**Category: [ID]**
- Response text: "_________________________________"
- Next question: [Question ID]
- Additional actions: _________________ (e.g., "trigger silent mode", "show activity menu", "log high stress")

### Default Behavior
- If no category matches: Go to category _______ OR ask clarification question: "_______"

---

## Complete Example

### Question Identifier
**ID:** SAFETY_1

### Question Text
**Display text:** "Hi there. First, I need to know - are you currently in a safe place?"

### Response Categories

| Category ID | Keywords/Phrases | Sample User Inputs |
|------------|------------------|-------------------|
| SAFE | safe, yes, secure, okay, fine, shelter, bunker, protected, home, inside, good | "Yes I'm safe", "In the shelter", "I'm fine" |
| DANGER | no, danger, help, scared, attack, sirens, running, outside, exposed, emergency | "No", "Still hearing sirens", "Help" |
| UNSURE | maybe, don't know, think so, not sure, confused, possibly | "I think so?", "Not sure", "Maybe" |

### Response Logic

**Category: SAFE**
- Response text: "Good, I'm relieved you're safe. Take a deep breath with me. Now, how are you feeling emotionally?"
- Next question: STRESS_1
- Additional actions: None

**Category: DANGER**
- Response text: "I understand. Your safety is most important. Follow your emergency protocol. I'm switching to silent mode."
- Next question: EMERGENCY_CHECKLIST
- Additional actions: Enable silent mode (no sound/vibration)

**Category: UNSURE**
- Response text: "Let's make sure you're safe. Are you inside a building or shelter right now?"
- Next question: SAFETY_2
- Additional actions: Reduce notifications

### Default Behavior
- If no category matches: Go to category UNSURE

---

## Specification Format Options

### Option 1: Spreadsheet
Create columns for:
- Question_ID
- Question_Text
- Category_ID
- Keywords (comma-separated)
- Response_Text
- Next_Question_ID
- Special_Actions

### Option 2: Structured Document
Use the template format shown above for each question

### Option 3: Flowchart + Data Tables
- Visual flowchart showing question flow
- Separate data table with category definitions

---

## Technical Constraints to Consider

1. **Category Limits:** 3-6 categories per question work best
2. **Keyword Requirements:** Provide 10-20 keywords/phrases per category
3. **Response Length:** Keep responses under 100 words
4. **Question IDs:** Must be unique, no spaces, use underscore (e.g., SAFETY_1)

---

## Special System Behaviors to Specify

### Silent Mode Triggers
List specific words/phrases that should trigger silent mode:
```
attack, bombing, shooting, active danger, can't talk, they'll hear, quiet, silence
```

### High Priority Routes
Identify responses that need immediate special handling:
```
Category: CRISIS_RISK
Keywords: [list keywords]
Action: Show emergency resources immediately
```

### Offline Requirements
Mark which conversation paths must work offline:
- [ ] This question/response set must work offline
- [ ] Requires internet connection

---

## Deliverable Checklist

For each conversation section, provide:

**1. Question Sequence**
- [ ] List of all Question IDs in order
- [ ] Clear start point
- [ ] All endpoints defined

**2. For Each Question**
- [ ] Unique ID
- [ ] Question text
- [ ] 3-6 response categories
- [ ] 10-20 keywords per category
- [ ] Response text for each category
- [ ] Next question ID for each category
- [ ] Default behavior

**3. System Behaviors**
- [ ] Silent mode triggers listed
- [ ] High priority routes marked
- [ ] Offline requirements specified

**4. Additional Data**
- [ ] Activity options (breathing, games, etc.)
- [ ] Emergency resources text
- [ ] Age-variant responses (if applicable)

---

## Quick Reference

**Question ID Format:** SECTION_NUMBER
Examples: SAFETY_1, STRESS_1, ACTIVITY_1

**Category ID Format:** Brief descriptor
Examples: SAFE, DANGER, HIGH_STRESS, READY

**Special Actions:** 
- silent_mode
- show_activities
- emergency_resources
- log_event
- require_confirmation

**Navigation Options:**
- Go to [Question_ID]
- Show [Activity_Menu]
- End conversation
- Loop back
