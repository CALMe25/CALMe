# CALMe Crisis Intervention App

*Complete Flow Chart & Activity Banks Reference*

## Flow Chart

```mermaid
flowchart TD
    Start([App Opens - Emergency/Stress Situation]) --> T1Bank[(Tier 1 Activity Bank:<br/>See T1 Activities Below)]
    
    T1Bank -->|Intro text| T1_1[Tier 1 Activity 1:<br/>Randomized from T1 Bank<br/>Never repeats in session]
    
    T1_1 -->|transitional text| T1_2[Tier 1 Activity 2:<br/>Different activity from T1 Bank<br/>Never repeats previous]
    
    T1_2 --> StateAssess{Assess User State:<br/>___Orientation Questions___<br/>What's your name: `str`<br/>Are you safe: `bool`<br/>Stress level 1-10: `int`<br/>Are you with other people: `bool`}
    
    StateAssess -->|Needs more grounding| T1_2
    
    StateAssess -->|Ready to proceed<br/>Stress under 5| SocialCheck{User Status<br/>`enum`}
    
    SocialCheck -->|Alone| SoloBank[(Solo Activity Bank:<br/>See T2 Activities Below)]
    
    SocialCheck -->|With Others| GroupBank[(Group Activity Bank:<br/>See T2 Activities Below)]
    
    SoloBank --> T2_1_Solo[Tier 2 Activity 1:<br/>Randomized from Solo Bank<br/>Never repeats in session]
    
    GroupBank --> T2_1_Group[Tier 2 Activity 1:<br/>Randomized from Group Bank<br/>Never repeats in session]
    
    T2_1_Solo --> T2_2_Solo[Tier 2 Activity 2:<br/>Different activity from Solo Bank<br/>Never repeats previous]
    
    T2_1_Group --> T2_2_Group[Tier 2 Activity 2:<br/>Different activity from Group Bank<br/>Never repeats previous]
    
    T2_2_Solo --> StressCheck{Stress Check:<br/>Under 3?}
    T2_2_Group --> StressCheck
    
    StressCheck -->|Still above 3| T2_Continue[Additional T2 Activity<br/>Never repeats session activities]
    StressCheck -->|Under 3| Complete{Session Complete:<br/>Ready to wrap up?}
    
    T2_Continue --> StressCheck
    
    Complete -->|Yes| End([End Session:<br/>Event is over<br/>Resources available])
    Complete -->|Need more support| Additional[Offer additional<br/>activities or resources]
    
    Additional --> End
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style T1_1 fill:#fff3cd
    style T1_2 fill:#fff3cd
    style T2_1_Solo fill:#f8d7da
    style T2_1_Group fill:#f8d7da
    style T2_2_Solo fill:#f8d7da
    style T2_2_Group fill:#f8d7da
    style T2_Continue fill:#f8d7da
    style T1Bank fill:#fff9e6
    style SoloBank fill:#d1ecf1
    style GroupBank fill:#d1ecf1
```

## Activity Banks

### 🟡 TIER 1 ACTIVITIES

**Orientation & Grounding - Bring User to Present Moment**

#### Stage 1: Simple Deflection Activities

*Quick engagement before beginning Ma'asei model*

##### Visual/Perception Tasks

- Drawing or copying shapes
- Color blending recognition (e.g., "Yellow + Blue = ?")
- Finding four square objects in the environment
- Match colors (without memory component)
- Recaptcha-style questions (e.g., "How many rocks do you see?")

##### More Complex T1 Activities

- Matching/Memory Card Game
- Breathing Module (guided breathing exercises)

#### Stage 2: Orientation Questions

*Assess situation and ability to communicate*

##### Identity & Awareness

- Who are you?
- Where are you?
- What day is it?
- Generic awareness questions
- Simple math questions

##### Critical Path-Determining Questions

- **Are you with other people?** (Don't use "alone" - rephrase positively)
  → Determines Solo vs. Group activity path
- **Stress level assessment (1-10 scale)**
  → Determines capability and willingness to act

##### Additional Assessment

- Age range/ability assessment
- Physical space available? (Do you have a lot of space?)

> **Key Principle:** T1 activities are never repeated in the same session. Use randomization to ensure variety.

---

### 🔴 TIER 2 ACTIVITIES

**Engagement & Meaningful Action - Give Purpose**

#### Stage 3A: Activities WITH OTHERS <span style="background-color: #d4edda; color: #155724; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">GROUP PATH</span>

*Provide meaning through helping/connecting with others*

##### Social Awareness

- Count how many people are with you
- Who is with you? Learn their names

##### Helping Activities

- Can you make sure everyone has water?
- Does everyone have room in the safe space? Can you do something to make more room?

#### Stage 3B: Activities ALONE <span style="background-color: #cce5ff; color: #004085; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">SOLO PATH</span>

*Give meaning without requiring others present*

##### Communication Activities

- Are you able to text or call someone?
- Write a letter to someone important to you
- Make a card for someone

> **Note from Matan:** Stretches don't give meaning/impact to others, so they're harder to motivate people to complete. Activities should provide a sense of purpose or connection.

#### Stress Level Check Logic

- **If stress level is NOT under 3:** Loop back to T2 activities (new ones, never repeat)
- **If stress level IS under 3:** Move to wrap-up phase

#### Wrap-Up Phase

*"From confusion to understanding - the event is over"*

- Transition activities to help user recognize emergency has passed
- *(Specific activities to be determined)*

> **Key Principle:** T2 activities are never repeated in the same session. Choose from appropriate bank (Solo or Group) based on T1 assessment.

---

## 🎯 Core Design Principles

- **Randomization:** Use randomization for activities to ensure uniqueness each time app opens
- **No Repeats:** Activities never repeat within the same session
- **Path-Based:** Different activity banks for Solo vs. Group situations
- **Meaningful Action:** Focus on activities that provide purpose and connection
- **Progressive Engagement:** Move from deflection → orientation → meaningful action
- **Stress Assessment:** Check stress levels to determine if more T2 activities needed
- **Fresh Each Time:** No persistent memory between sessions - gather fresh information each time

---

*CALMe Project | Crisis Intervention App Based on Ma'asei Model*

*Last Updated: November 10, 2025*

