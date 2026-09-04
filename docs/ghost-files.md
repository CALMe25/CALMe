# Ghost Files Notes

While combing through the repo after the merge I spotted a few pockets of code that aren’t plugged into the current UI. Rather than ripping anything out, here’s a quick reference so we remember what’s actually in play.

## Still in Use
- `tailwind.config.js` – Vite pulls this in through `vite.config.ts`, so it’s very much part of the build.

## Parser / Conversation Work That Isn’t Wired Up Yet
- `src/parser/*`
- `src/conversation/*`
- `src/storage/userProfileStorage.ts`

`src/App.tsx` still talks to `./nlp/separated_mermaid_interpreter_parser`, which means the shiny ConversationController + parser stack never gets called. They do keep TypeScript busy, though, because the exports are all visible.

## Duplicate Shadcn Components
- `src/components/ui/*`

The chat UI imports everything from `src/chat_interface/ui/*`, so this parallel set is just sitting there.

## Oddball AppLauncher File
- `src/AppLauncher/AppLauncher.tsx`

The misspelled version came across from main. We only use `AppLauncher.tsx`, so this one has no references.

## Standalone Test Scripts
- `automated-test.cjs`
- `production-test.cjs`
- `test-conversation-flows.js`
- `test-runner.js`
- `test-setup.cjs`

Handy utilities, but none of the npm scripts trigger them right now. You’d have to run them manually.

## Docs and Playground Material
- `docs/**`
- `memoryGame/**`
- Hand-off paperwork (`PHASE2_HANDOFF.md`, `PHASE2_COMPLETION_REPORT.md`, etc.)

Great for context, not required at runtime.
