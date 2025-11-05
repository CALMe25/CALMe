# CALMe Chat Flow Diagram

```mermaid
flowchart TD
    Start([User Opens CALMe App]) --> Init[Initialize App State]
    Init --> Safety[Safety Assessment Screen]
    
    Safety -->|User Input| ParseSafety{Semantic Parser:<br/>classifySafety()}
    
    ParseSafety -->|SAFE| Location[Location Extraction Screen]
    ParseSafety -->|DANGER| Emergency[Emergency Protocol<br/>End Conversation]
    ParseSafety -->|UNSURE| Location
    
    Location -->|User Input| ParseLocation{Semantic Parser:<br/>extractLocation()}
    ParseLocation --> Stress[Stress Assessment Screen]
    
    Stress -->|User Input| ParseStress{Semantic Parser:<br/>classifyStress()}
    
    ParseStress -->|HIGH_STRESS| TriggerBreathing[Set Auto-Launch Timer<br/>1.5 seconds]
    ParseStress -->|MODERATE_STRESS| Complete[Conversation Complete Screen]
    ParseStress -->|LOW_STRESS| Complete
    
    TriggerBreathing --> ShowBreathing[Display Breathing Exercise]
    TriggerBreathing --> Complete
    
    ShowBreathing --> BreathingModule[BreathingExercise Component<br/>4-7-8 Technique]
    BreathingModule -->|User Closes| Complete
    
    Complete --> Summary[Show Conversation Summary]
    Summary --> Options{User Options}
    
    Options -->|New Conversation| Reset[Reset All State]
    Options -->|Breathing Exercise| ManualBreathing[Launch Breathing Exercise]
    
    Reset --> Safety
    ManualBreathing --> BreathingModule
    
    %% Styling
    classDef assessment fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef parser fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef breathing fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef emergency fill:#ffebee,stroke:#b71c1c,stroke-width:2px
    
    class Safety,Location,Stress,Complete assessment
    class ParseSafety,ParseLocation,ParseStress parser
    class ShowBreathing,BreathingModule,ManualBreathing breathing
    class Emergency emergency
```

## Flow Description

### 1. **Initialization**
- User opens the app
- App initializes with `currentStep: 'safety'`
- Empty conversation history

### 2. **Safety Assessment**
- **Question**: "First, I need to understand if you're safe right now..."
- **Processing**: User input → `classifySafety()` semantic parser
- **Outcomes**:
  - SAFE → Proceed to location
  - DANGER → Emergency protocol (end flow)
  - UNSURE → Proceed to location

### 3. **Location Extraction**
- **Question**: "Where are you right now?"
- **Processing**: User input → `extractLocation()` semantic parser
- **Outcome**: Always proceeds to stress assessment

### 4. **Stress Assessment**
- **Question**: "I'd like to understand how you're feeling right now..."
- **Processing**: User input → `classifyStress()` semantic parser
- **Outcomes**:
  - HIGH_STRESS → Auto-launch breathing exercise after 1.5s
  - MODERATE_STRESS → Complete conversation
  - LOW_STRESS → Complete conversation

### 5. **Breathing Exercise (if triggered)**
- Overlay modal with 4-7-8 breathing technique
- Visual breathing circle animation
- User can restart or close

### 6. **Conversation Complete**
- Shows summary of all responses
- Options:
  - Start new conversation (resets flow)
  - Launch breathing exercise manually

## Key Components

- **App.tsx**: Main flow controller (src/App.tsx:149-487)
- **semanticParser.ts**: NLP analysis engine (src/nlp/semanticParser.ts)
- **BreathingExercise.tsx**: Breathing module (src/breathing_module/BreathingExercise.tsx)
- **BreathingCircle.tsx**: Visual breathing animation

## State Management

- `currentStep`: Tracks conversation progress
- `conversationHistory`: Stores all responses
- `showBreathing`: Controls breathing exercise visibility
- `shouldAutoLaunchBreathing`: Triggers auto-launch for high stress