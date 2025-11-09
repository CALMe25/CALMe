# CALMe App Phase 2 Handoff - Conversation Flow Implementation

## Phase 1 Summary
We have successfully integrated modular components from different branches into a cohesive architecture. The app now has:
- ✅ Natural language parser for classification
- ✅ Chat interface with message handling
- ✅ Activity modules (breathing exercise, memory card game)
- ✅ Modular architecture with clear separation of concerns
- ✅ Integration points ready for conversation controller

## Current Architecture

### Directory Structure
```
src/
├── activities/                 # Activity modules
│   ├── breathing_module/      # Breathing exercise components
│   │   ├── BreathingExercise.tsx
│   │   ├── BreathingCircle.tsx
│   │   └── BreathingApp.tsx
│   └── MatchingGame.tsx      # Memory card game
├── components/                # UI components
│   ├── ChatMessage.tsx       # Message display component
│   ├── ChatInput.tsx         # User input component
│   └── ui/                   # Reusable UI components
├── parser/                    # NLP parser
│   ├── semanticParser.ts     # Main parser logic
│   └── testSemanticParser.ts # Parser tests
├── conversation/             # Conversation flow (placeholder)
│   └── ConversationController.ts
├── AppLauncher/              # Activity launcher
│   └── AppLauncher.tsx
├── appsContextApi.tsx        # Apps context and configuration
└── App.tsx                   # Main app with basic flow logic
```

### Key Integration Points

#### 1. Parser API (src/parser/semanticParser.ts)
```typescript
// Classification functions
classifySafety(text: string): ClassificationResult
classifyStress(text: string): ClassificationResult
extractLocation(text: string): ExtractionResult

// Result types
ClassificationResult {
  category: string
  confidence: number
  reasoning: string
}

ExtractionResult {
  extractedValue: string
  confidence: number
  extractionMethod: string
}
```

#### 2. Activity System (src/appsContextApi.tsx)
```typescript
AppInterface {
  name: 'breathing' | 'stretching' | 'matching-cards' | ...
  type: 'activities' | 'games'
  label: string
  icon?: ReactElement
  main: ReactElement  // The component to render
  description?: string
}
```

Activities are launched via the AppLauncher component when triggered.

#### 3. Conversation Controller Interface (src/conversation/ConversationController.ts)
```typescript
ConversationControllerInterface {
  initialize(map: ConversationMap): void
  processParserOutput(result: ClassificationResult | ExtractionResult): ConversationNode
  getCurrentNode(): ConversationNode
  moveToNode(nodeId: string): ConversationNode
  isComplete(): boolean
  reset(): void
}
```

## Phase 2 Requirements

### 1. Implement Conversation Flow Logic
Replace the hardcoded flow in App.tsx with a dynamic conversation controller that:
- Reads a conversation map/flowchart specification
- Determines next steps based on parser outputs
- Handles branching logic and conditions
- Manages conversation state

### 2. Current Hardcoded Flow (in App.tsx)
```
1. Safety Check → 
   - If SAFE → Location
   - If DANGER → Complete (emergency protocol)
   - If UNSURE → Location

2. Location Extraction → Stress Assessment

3. Stress Assessment →
   - If HIGH_STRESS → Auto-launch breathing exercise
   - Complete
```

### 3. Integration Tasks for Phase 2

#### A. Conversation Map Structure
Define a format for the conversation flowchart that includes:
- Nodes (questions, activities, decisions, endpoints)
- Edges with conditions based on parser output
- Activity triggers
- Return paths from activities

#### B. Controller Implementation
1. Load/parse conversation map (JSON, YAML, or code)
2. Track current position in conversation
3. Process parser results to determine next node
4. Handle activity launches and returns
5. Manage conversation context/memory

#### C. Integration Points
- **Parser → Controller**: Controller receives classification/extraction results
- **Controller → UI**: Controller provides next question/content
- **Controller → Activities**: Controller triggers activity launches
- **Activities → Controller**: Handle activity completion callbacks

### 4. Example Conversation Map Structure (suggested)
```javascript
{
  "startNode": "safety_check",
  "nodes": {
    "safety_check": {
      "type": "question",
      "content": "First, I need to understand if you're safe...",
      "parser": "classifySafety",
      "next": {
        "type": "decision",
        "conditions": [
          { "if": "category === 'SAFE'", "goto": "location_extract" },
          { "if": "category === 'DANGER'", "goto": "emergency_protocol" },
          { "default": "location_extract" }
        ]
      }
    },
    "location_extract": {
      "type": "question",
      "content": "Where are you right now?",
      "parser": "extractLocation",
      "next": "stress_check"
    },
    "stress_check": {
      "type": "question",
      "content": "How are you feeling right now?",
      "parser": "classifyStress",
      "next": {
        "type": "decision",
        "conditions": [
          { 
            "if": "category === 'HIGH_STRESS'", 
            "goto": "breathing_activity",
            "autoLaunch": true
          },
          { "default": "conversation_end" }
        ]
      }
    },
    "breathing_activity": {
      "type": "activity",
      "activityName": "breathing",
      "next": "post_activity_check"
    }
  }
}
```

### 5. Testing & Debugging

#### Run Development Server
```bash
npm run dev
```

#### Test Points
1. Parser classifications work correctly
2. Conversation flow follows the map
3. Activities launch when triggered
4. UI updates reflect conversation state
5. Error handling for edge cases

#### Debug Tools
- Browser console for state tracking
- Parser test file: `src/parser/testSemanticParser.ts`
- Integration test: `test-integration.cjs`

### 6. Future Enhancements (after Phase 2)
- Mermaid.js visualization of conversation flow
- Dynamic conversation map editor
- Multi-language support expansion
- Additional activities integration
- Conversation history/context persistence
- Analytics and conversation metrics

## Deliverables for Phase 2
1. ✅ Conversation map specification format
2. ✅ ConversationController implementation
3. ✅ Integration with existing App.tsx
4. ✅ Documentation for conversation map creation
5. ✅ Test cases for various conversation paths

## Quick Start for Phase 2 Developer
```bash
# 1. Check out integration branch
git checkout integration

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev

# 4. Key files to modify:
# - src/conversation/ConversationController.ts (implement the controller)
# - src/App.tsx (replace hardcoded flow with controller)
# - Create conversation map file (JSON/YAML/TS)
```

## Support & Resources
- Parser documentation: See `src/parser/semanticParser.ts`
- UI components: Check `src/components/`
- Activity integration: Reference `src/appsContextApi.tsx`
- Current flow logic: Review `src/App.tsx` getResult() function
