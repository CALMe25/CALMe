# Conversation Design Guide

## Overview
This guide explains the technical capabilities of the trauma response app's conversation system. Use this reference to understand what the system can do, then fill out the Content Specification Form for each question you create.

---

## Question Types Supported

### Type 1: Classification Questions
These questions lead users to select from predefined response categories. Each category triggers a different therapeutic response.

**Use when:** You want to branch the conversation based on user's emotional state, safety status, or preference.

**Technical behavior:** The system analyzes user input and classifies it into one of your predefined categories, then delivers the corresponding response. If the system cannot confidently classify the input, it will ask for clarification and loop back to the same question rather than guessing incorrectly.

**Clarification mechanism:** For every classification question, you must provide a "clarification needed" response that prompts the user to be more specific when their input cannot be parsed clearly. This prevents the system from making incorrect assumptions during crisis situations.

### Type 2: Extraction Questions  
These questions collect specific information to populate variables for later use in the conversation (mad-lib style).

**Use when:** You need to gather personal details (name, location, family members) or specific information about their situation to personalize future responses.

**Technical behavior:** The system extracts specific information from natural language input and stores it in variables like {user_name}, {location}, {family_member}, etc.

---

## Response Options Available

After any question, your response can include:

### Immediate Chat Response
- Text-based therapeutic response
- Can reference extracted variables: "Thank you {user_name}, I understand you're in {location}..."
- Can be followed by another question

### Multimedia Activities
- Guided breathing exercises (video + audio)
- Calming visualizations 
- Educational content about trauma responses
- **Activity completion automatically returns user to a conversation point you specify**

### Interactive Activities  
- Progressive muscle relaxation exercises
- Cognitive grounding games (5-4-3-2-1 sensory exercise)
- Simple distraction activities
- **Activity completion automatically returns user to a conversation point you specify**

### Conversation Navigation
- Jump to any other question ID
- Loop back to previous points
- End conversation with summary/resources

---

## Content Specification Format

For each piece of content you create, provide the following information:

### Question Specification

**Question ID:** [Unique identifier - e.g., SAFETY_CHECK_1, NAME_COLLECT, STRESS_LEVEL]

**Question Type:** [CLASSIFICATION or EXTRACTION]

**Question Text:** [Exact text to display to user]

**If CLASSIFICATION Question:**
```
Categories:
- Category_ID: [unique name]
  Keywords: [list of words/phrases that indicate this category]
  Sample_inputs: [examples of how users might express this]
  
- Category_ID: [unique name]  
  Keywords: [list of words/phrases that indicate this category]
  Sample_inputs: [examples of how users might express this]

[repeat for all categories]

Clarification_needed_response: [text to show when input can't be parsed]
Clarification_action: loop_back_to_same_question
Default_category: [which category to use if still no clear match after clarification]
```

**If EXTRACTION Question:**
```
Extract_to_variable: [variable name like user_name, location, etc.]
Information_type: [name, place, number, emotion, etc.]
Validation_rules: [any requirements - optional]
Fallback_behavior: [what to do if extraction fails]
```

### Response Specification

For each category (classification) or successful extraction:

**Response_text:** [Therapeutic response, can include {variable_names}]

**Next_action:** Choose one:
- `continue_to: [Question_ID]` - Go to another question
- `launch_activity: [Activity_ID]` - Start multimedia/interactive content
- `end_conversation` - Conclude with resources
- `loop_back_to: [Question_ID]` - Return to previous point

**If launching activity:**
```
Activity_type: [breathing, grounding, visualization, education]
Return_point: [Question_ID] - where to continue after activity
Special_instructions: [any specific guidance for this transition]
```

---

## Available Activities

### Breathing Exercises
- **ID:** breathing_4_7_8, breathing_box, breathing_simple
- **Duration:** 3-8 minutes
- **Returns to:** Question ID you specify

### Grounding Activities  
- **ID:** grounding_5_4_3_2_1, grounding_body_scan, grounding_environment
- **Duration:** 5-10 minutes
- **Returns to:** Question ID you specify

### Cognitive Games
- **ID:** cognitive_counting, cognitive_categories, cognitive_memory
- **Duration:** 3-7 minutes  
- **Returns to:** Question ID you specify

### Educational Content
- **ID:** education_trauma_normal, education_breathing_benefits, education_safety_planning
- **Duration:** 2-5 minutes
- **Returns to:** Question ID you specify

*Note: You can request custom activities by describing the therapeutic goal and preferred interaction style.*

---

## Variable System

### Extraction Variables Available
The system can extract and store these types of information:

**Personal Information:**
- `user_name` - First name or preferred name
- `age_group` - Child, teen, adult categories
- `language_preference` - Hebrew, English, Arabic

**Location Information:**
- `current_location` - Where they are now
- `safe_location` - Where they feel safe
- `city` - Current city/region

**Social Information:**  
- `family_members` - Names of family/friends nearby
- `emergency_contact` - Person to contact if needed
- `support_person` - Who provides comfort

**Situation Information:**
- `stress_level` - High, medium, low
- `physical_symptoms` - What they're experiencing
- `immediate_need` - What they need most right now

### Using Variables in Responses
Reference any extracted variable in your response text:
```
"I understand {user_name}, being in {current_location} during this situation is frightening. Let's work on some techniques to help you feel safer."
```

---

## Conversation Flow Planning

### Flow Structure Options

**Linear Flow:** Question A → Response → Question B → Response → Activity → Question C

**Branching Flow:** Question → Multiple possible responses based on classification → Different paths

**Loop Flow:** Question → Activity → Return to same question for reassessment

**Hub Flow:** Central question that branches to different therapeutic modules, all returning to hub

### Navigation Rules

**Forward Navigation:** Any response can lead to any other question ID

**Backward Navigation:** You can loop back to previous points for reassessment

**Activity Integration:** Any response can launch an activity that returns to any question ID

**Conversation Exits:** You can end the conversation from any point with summary/resources

---

## Content Delivery Requirements

### For Each Conversation Section, Provide:

**1. Question Inventory**
- Complete list of all Question IDs you'll use
- Question type (CLASSIFICATION/EXTRACTION) for each
- Dependencies between questions

**2. Content Specifications**  
- Each question specification in the format above
- All response specifications for each question
- Variable usage plan if using extraction questions

**3. Flow Documentation**
- Visual flowchart or written description of intended user journey
- Activity integration points
- Exit/endpoint definitions

**4. Special Requirements**
- Any custom activities needed beyond standard library
- Specific therapeutic protocols you're following
- Cultural considerations for language/content

---

## Example Content Block

```
Question ID: STRESS_ASSESSMENT_1
Question Type: CLASSIFICATION  
Question Text: "I'd like to understand how you're feeling right now. Can you tell me what's going on in your body and mind?"

Categories:
- HIGH_STRESS
  Keywords: panic, can't breathe, shaking, racing heart, spinning, overwhelming, can't think
  Sample_inputs: "I can't breathe", "Everything is spinning", "I feel like I'm dying"
  
- MODERATE_STRESS  
  Keywords: worried, anxious, tense, upset, scared, nervous, uncomfortable
  Sample_inputs: "I'm really worried", "Feeling tense", "Pretty scared right now"
  
- LOW_STRESS
  Keywords: okay, fine, managing, stable, calm, better, under control
  Sample_inputs: "I'm okay", "Feeling more stable", "Things are manageable"

Clarification_needed_response: "I want to make sure I understand how you're feeling. Can you tell me more specifically about what you're experiencing right now - either what's happening in your body (like your breathing, heart rate, or physical sensations) or what's going through your mind?"
Clarification_action: loop_back_to_same_question
Default_category: MODERATE_STRESS

Responses:
- HIGH_STRESS:
  Response_text: "I can hear that you're experiencing intense symptoms right now. Let's start with something to help you feel more grounded in your body."
  Next_action: launch_activity: breathing_4_7_8
  Return_point: STRESS_REASSESS_1
  
- MODERATE_STRESS:
  Response_text: "Thank you for sharing how you're feeling. It's completely normal to feel this way. Let's explore what might help you most right now."
  Next_action: continue_to: COPING_PREFERENCE_1
  
- LOW_STRESS:
  Response_text: "I'm glad to hear you're feeling more stable. That shows real resilience. Let's talk about what you might want to focus on next."
  Next_action: continue_to: GOAL_SETTING_1
```

---

## Technical Constraints

**Language Processing:**
- System understands emotional/crisis language patterns
- Works with fragmented or incomplete responses  
- Supports Hebrew, English, and Arabic input
- Handles spelling errors and informal language
- **Parsing confidence system**: If user input doesn't clearly match any category keywords, the system will use your clarification response and loop back rather than guessing

**Classification Parsing:**
- System requires reasonable confidence match to user-defined keywords
- Ambiguous responses trigger clarification request automatically
- After clarification attempt, system will use default category if still unclear
- You should design clarification responses to guide users toward more specific language

**Content Limits:**
- Response text should be under 200 words for readability
- Question text should be under 100 words
- 10-25 keywords per classification category work best
- Variable names should be descriptive (user_name not UN)

**Activity Integration:**
- Activities run independently and return automatically
- You cannot customize activity content, only select from library
- Activity completion always returns to the question ID you specify
- Users can skip activities, which also returns to your specified point

---

## Quality Guidelines

**Therapeutic Appropriateness:**
- Follow trauma-informed care principles
- Prioritize safety assessment and stabilization
- Avoid re-traumatization through content
- Provide clear scope limitations (this is not therapy)

**Cultural Sensitivity:**
- Consider different expressions of distress across cultures
- Include culturally relevant coping mechanisms
- Respect family/community dynamics in Israeli context
- Account for different trauma experiences (military, civilian, etc.)

**Crisis Optimization:**
- Keep language simple and clear
- Avoid complex or multi-part questions
- Provide immediate comfort/validation
- Offer concrete, actionable next steps
