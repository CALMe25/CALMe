# CALMe Integration Debug Guide

## Current Architecture

```
src/
├── activities/           # Activity modules (breathing, card game)
├── components/          # UI components (chat interface)
├── parser/             # Semantic parser for NLP
├── conversation/       # Placeholder for conversation controller
├── AppLauncher/        # Activity launcher component
└── App.tsx            # Main app with integration logic
```

## Known Issues Fixed

1. ✅ TypeScript errors for NodeJS types
2. ✅ Import path corrections
3. ✅ Missing Toaster component for notifications
4. ✅ AppLauncher error handling

## Testing Instructions

1. Run development server:
   ```bash
   npm run dev
   ```

2. Test conversation flow:
   - Safety check → Location extraction → Stress assessment
   - High stress should trigger breathing exercise
   - Activities can be launched from app buttons

## Debug Commands

```bash
# Check for TypeScript errors
npm run build

# Run dev server
npm run dev

# Check dependencies
npm list
```

## Integration Points

- Parser: `src/parser/semanticParser.ts` 
- UI Components: `src/components/`
- Activities: `src/activities/`
- Conversation Controller: `src/conversation/ConversationController.ts` (placeholder)