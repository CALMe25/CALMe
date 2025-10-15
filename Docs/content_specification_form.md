# Content Specification Form

## Instructions for Content Writers
Fill out one form per question. Copy this template for each question you create. Developers will implement directly from these specifications.

---

## QUESTION SPECIFICATION

**Question ID:** _____________________ *(unique identifier, no spaces - e.g., SAFETY_CHECK_1, STRESS_LEVEL_2)*

**Question Type:** ☐ CLASSIFICATION ☐ EXTRACTION *(check one)*

**Question Text:** 
```
[Write the exact text the user will see]
```

**Context/Notes:** _____________________ *(optional - therapeutic rationale, timing notes)*

---

## FOR CLASSIFICATION QUESTIONS ONLY
*(Skip this section if you selected EXTRACTION above)*

### Response Categories

**Category 1:**
- Category ID: _____________________
- Keywords: _____________________
- Sample User Inputs: _____________________

**Category 2:**
- Category ID: _____________________  
- Keywords: _____________________
- Sample User Inputs: _____________________

**Category 3:**
- Category ID: _____________________
- Keywords: _____________________
- Sample User Inputs: _____________________

**Category 4:** *(optional)*
- Category ID: _____________________
- Keywords: _____________________
- Sample User Inputs: _____________________

**Category 5:** *(optional)*
- Category ID: _____________________
- Keywords: _____________________
- Sample User Inputs: _____________________

### Clarification & Defaults

**Clarification Response:** *(When user input can't be classified)*
```
[Write response that asks user to be more specific]
```

**Default Category:** _____________________ *(which category to use if still unclear after clarification)*

---

## FOR EXTRACTION QUESTIONS ONLY
*(Skip this section if you selected CLASSIFICATION above)*

**Extract to Variable:** _____________________ *(e.g., user_name, current_location)*

**Information Type:** _____________________ *(name, place, number, emotion, etc.)*

**Validation Rules:** _____________________ *(optional - any requirements)*

**Fallback Behavior:** *(What happens if extraction fails)*
☐ Ask clarifying question: _____________________
☐ Skip and continue to: _____________________
☐ Use default value: _____________________

---

## RESPONSE SPECIFICATIONS

### Response for Category/Extraction Result 1:
**Applies to:** _____________________ *(category ID or "successful_extraction")*

**Response Text:** *(can include {variable_names})*
```
[Write therapeutic response text]
```

**Next Action:** *(check one)*
☐ Continue to Question ID: _____________________
☐ Launch Activity: _____________________
   - Return Point: _____________________
☐ End Conversation
☐ Loop back to Question ID: _____________________

### Response for Category/Extraction Result 2:
**Applies to:** _____________________ 

**Response Text:**
```
[Write therapeutic response text]
```

**Next Action:** *(check one)*
☐ Continue to Question ID: _____________________
☐ Launch Activity: _____________________
   - Return Point: _____________________
☐ End Conversation
☐ Loop back to Question ID: _____________________

### Response for Category/Extraction Result 3:
**Applies to:** _____________________ 

**Response Text:**
```
[Write therapeutic response text]
```

**Next Action:** *(check one)*
☐ Continue to Question ID: _____________________
☐ Launch Activity: _____________________
   - Return Point: _____________________
☐ End Conversation
☐ Loop back to Question ID: _____________________

### Response for Category/Extraction Result 4: *(optional)*
**Applies to:** _____________________ 

**Response Text:**
```
[Write therapeutic response text]
```

**Next Action:** *(check one)*
☐ Continue to Question ID: _____________________
☐ Launch Activity: _____________________
   - Return Point: _____________________
☐ End Conversation
☐ Loop back to Question ID: _____________________

### Response for Category/Extraction Result 5: *(optional)*
**Applies to:** _____________________ 

**Response Text:**
```
[Write therapeutic response text]
```

**Next Action:** *(check one)*
☐ Continue to Question ID: _____________________
☐ Launch Activity: _____________________
   - Return Point: _____________________
☐ End Conversation
☐ Loop back to Question ID: _____________________

---

## ACTIVITY SPECIFICATIONS
*(Only fill out if any responses above launch activities)*

**Activity 1:**
- Activity ID: _____________________ *(breathing_4_7_8, grounding_5_4_3_2_1, etc.)*
- Activity Type: _____________________ *(breathing, grounding, visualization, education)*
- Special Instructions: _____________________

**Activity 2:** *(if needed)*
- Activity ID: _____________________
- Activity Type: _____________________
- Special Instructions: _____________________

---

## VARIABLE USAGE
*(Only fill out if this question or responses use extracted variables)*

**Variables Used in This Question:**
- {_____________________}: from Question ID _____________________
- {_____________________}: from Question ID _____________________

**Variables Created by This Question:**
- {_____________________}: will be available for use in future questions

---

## QUALITY CHECKLIST
*(Check before submitting)*

☐ Question ID is unique and descriptive
☐ Question text is under 100 words
☐ All response text is under 200 words  
☐ Keywords include 5-15 terms per category
☐ Sample inputs show realistic crisis language
☐ Clarification response guides toward parseable language
☐ All next actions specify valid question IDs or activities
☐ Activity return points are specified
☐ Variable names are descriptive and consistent
☐ Therapeutic content follows trauma-informed principles
☐ Language is culturally appropriate for Israeli context

---

## EXAMPLE COMPLETED FORM

**Question ID:** STRESS_ASSESSMENT_1

**Question Type:** ☑ CLASSIFICATION ☐ EXTRACTION

**Question Text:** 
```
I'd like to understand how you're feeling right now. Can you tell me what's going on in your body and mind?
```

**Context/Notes:** Initial stress level assessment to determine appropriate intervention

### Response Categories

**Category 1:**
- Category ID: HIGH_STRESS
- Keywords: panic, can't breathe, shaking, racing heart, spinning, overwhelming, can't think, dying, losing control
- Sample User Inputs: "I can't breathe", "Everything is spinning", "I feel like I'm dying"

**Category 2:**
- Category ID: MODERATE_STRESS  
- Keywords: worried, anxious, tense, upset, scared, nervous, uncomfortable, stressed
- Sample User Inputs: "I'm really worried", "Feeling tense", "Pretty scared right now"

**Category 3:**
- Category ID: LOW_STRESS
- Keywords: okay, fine, managing, stable, calm, better, under control, alright
- Sample User Inputs: "I'm okay", "Feeling more stable", "Things are manageable"

### Clarification & Defaults

**Clarification Response:**
```
I want to make sure I understand how you're feeling. Can you tell me more specifically about what you're experiencing right now - either what's happening in your body (like your breathing, heart rate, or physical sensations) or what's going through your mind?
```

**Default Category:** MODERATE_STRESS

### Response for Category 1:
**Applies to:** HIGH_STRESS

**Response Text:**
```
I can hear that you're experiencing intense symptoms right now. Let's start with something to help you feel more grounded in your body.
```

**Next Action:** ☑ Launch Activity: breathing_4_7_8
   - Return Point: STRESS_REASSESS_1

### Response for Category 2:
**Applies to:** MODERATE_STRESS

**Response Text:**
```
Thank you for sharing how you're feeling. It's completely normal to feel this way. Let's explore what might help you most right now.
```

**Next Action:** ☑ Continue to Question ID: COPING_PREFERENCE_1

### Response for Category 3:
**Applies to:** LOW_STRESS

**Response Text:**
```
I'm glad to hear you're feeling more stable. That shows real resilience. Let's talk about what you might want to focus on next.
```

**Next Action:** ☑ Continue to Question ID: GOAL_SETTING_1

### Activity Specifications

**Activity 1:**
- Activity ID: breathing_4_7_8
- Activity Type: breathing
- Special Instructions: For users experiencing panic symptoms

**Quality Checklist:** ☑ All items checked
