# Full Codebase Review: CALMe

CALMe is a React/TypeScript crisis-support PWA for Israeli civilians, featuring a therapeutic conversation engine, breathing exercises, calming activities, i18n (English/Hebrew/Arabic), and rocket-alert handling. This review covers the fresh clone of `CALMe25/CALMe`.

---

## Critical Issues

### 1. Safety classification case mismatch -- all V2 users treated as "unsafe"

**`src/conversation/conversationMapV2.ts:132-154`** + **`src/parser/enhancedParser.ts`**

The `classifySafety` parser returns `"SAFE"` / `"DANGER"` / `"UNSURE"` (uppercase). The V2 conversation map checks `"safe"` / `"unsafe"` (lowercase). No condition ever matches, so every user falls through to the `default` branch and is routed to `unsafe_can_move` regardless of their actual safety status.

### 2. Dead `extractedValue` branches in `classifyStress` nodes

**`src/conversation/conversationMapV2.ts:46-57, 433-470`**

Nodes like `start_clarify`, `continue_loop`, and `continue_loop_options` use conditions like `extractedValue.includes("better")` but their parser is `classifyStress`, which returns a `ClassificationResult` (no `extractedValue`). These branches are permanently dead code. Users who say "I feel better" after an activity can never reach the end state via the `extractedValue` path.

### 3. `completeOnboarding` fires async then unconditional throw crashes onboarding

**`src/conversation/ConversationController.ts:222-229`**

```ts
void this.completeOnboarding(this.userVariables);
throw new Error(`Node ${this.currentNodeId} has no next steps defined`);
```

The async profile save is fired-and-forgotten, then the function always throws. The caller receives an exception instead of a successful onboarding completion. The profile may or may not be saved depending on microtask timing.

### 4. Constructor/async init race condition

**`src/conversation/ConversationController.ts:119-193`**

The constructor sets initial state, then fires `void this.initializeProfile()`. Callers using the controller before `isInitialized()` returns `true` will get the constructor's default map. If the profile check later determines onboarding is needed, the map switches silently mid-session. The app polls with `setTimeout` loops in `App.tsx` to work around this, but on slow devices or storage the race is real.

### 5. `semanticAnalysis` is undefined -- ReferenceError on every classification

**`src/nlp/separated_mermaid_interpreter_parser.js:355-360`**

The call to `analyzeText(text)` is commented out, but `semanticAnalysis` is still referenced on lines 358 and 360. Every call to `performGenericAnalysis` throws `ReferenceError: semanticAnalysis is not defined`, crashing the entire mermaid-based NLP classification path.

### 6. IndexedDB transaction dies before `store.put()` -- active profile writes always fail

**`src/storage/userProfileStorage.ts:158-180`**

`saveProfile` opens a transaction, then `await`s `deactivateAllProfiles()` (which opens its own transactions). The `await` yields the event loop, causing the original transaction to auto-commit. The subsequent `store.put(profile)` always throws `InvalidStateError`.

### 7. `clearAllData` resolves immediately -- data not actually cleared

**`src/storage/userProfileStorage.ts:332-348`**

`Promise.all` receives `IDBRequest` objects (not Promises). It resolves immediately without waiting for the clear operations to commit. Any code that reads after `await clearAllData()` sees stale data.

### 8. Auto-launch effect always overwrites chosen app with breathing

**`src/App.tsx:480-486`**

The `useEffect` watching `shouldAutoLaunchApp` hardcodes the breathing app via `resolvedApps.find(...)`, overriding whatever `targetApp` was set in `processUserInput`. Any non-breathing activity trigger is silently replaced.

### 9. `tailwind.config.js` is dead code under Tailwind v4

**`tailwind.config.js` (entire file)**

The project uses `@tailwindcss/vite` (Tailwind v4), which ignores `tailwind.config.js` entirely. All custom screens (`xs`), touch-target sizes (`min-h-touch`), safe-area spacing, and theme overrides in this file have zero effect. Classes referencing these tokens produce no CSS.

---

## High Issues

### 10. `onboard_review` template variables don't match stored keys

**`src/conversation/onboardingMap.ts:212`**

The template uses `{safeSpace}`, `{timeToSafety}`, `{accessibilityNeeds}`, `{calmingPreference}`, `{communicationPreference}`. But the onboarding parsers store values under `informationType` keys: `"name"`, `"duration"`, `"accessibility"`, `"communication"`. Only `{name}` renders correctly; the rest display as literal `{safeSpace}` text.

### 11. `onboard_what_to_change` ignores parsed change type

**`src/conversation/onboardingMap.ts:224-230`**

The `extractChangeRequest` parser extracts a `changeType`, but the node's `next` is hardcoded to `"onboard_safe_space"`. A user who wants to change their name is sent to the safe-space question.

### 12. Substring matching on "no"/"yes" matches inside words

**`src/parser/enhancedParser.ts:119, 504-506`**

`lowerInput.includes("no")` matches "know", "snow", "another", "noted". A user saying "I know I'm safe" gets classified as `DANGER`. Same for `lowerInput.includes("yes")` matching "yesterday". This affects all i18n keyword checks across `classifyStress`, `classifySafety`, and `parseYesNo`.

### 13. `applyCrisisPatterns` uses wrong Compromise API in TypeScript parser

**`src/parser/semanticParser.ts:50`**

`matches.has("")` should be `matches.found`. The JS version correctly uses `.found`. The TS version's `.has("")` always returns true or behaves unpredictably, meaning crisis tags may be applied incorrectly.

### 14. `setInterval` in ChatMessage never cleared -- memory leak

**`src/chat_interface/ChatMessage.tsx:74-83`**

The audio playback interval is stored in a local variable with no `useRef` or cleanup. On unmount, the interval keeps firing, calling state setters on an unmounted component.

### 15. Division by zero in audio progress bar

**`src/chat_interface/ChatMessage.tsx:143`**

`audioDuration` defaults to `0`. The width calculation `currentTime / 0` produces `Infinity%`, an invalid CSS value.

### 16. SnakeGame stale closure in game loop

**`src/activities/SnakeGame.tsx:82-128`**

The game loop `setInterval` is recreated on every state change (snake, direction, food, gameOver, canvasSize). A `directionRef` exists but is never read in the loop. This causes unstable frame rate and missed inputs on slower devices.

### 17. `BreathingCircle` color prop silently overridden by inline style

**`src/activities/breathing_module/BreathingCircle.tsx:88-95, 113-115`**

The inline `backgroundColor: "skyblue"` always wins over the Tailwind `color` prop class. Dynamic width/height classes (`w-${sideSize}rem`) will be purged in production builds since Tailwind's JIT scanner can't detect interpolated class names.

### 18. `DigitalCanvas` clear only works on 25% of retina screens

**`src/activities/DigitalCanvas.tsx:129-135`**

`handleClear` uses `canvas.clientWidth/clientHeight` (CSS pixels) instead of the DPR-scaled canvas dimensions. On 2x displays, only the top-left quarter is cleared.

### 19. PWA missing `navigateFallback` and `runtimeCaching` -- offline broken

**`pwa.config.ts:30-33`**

No `navigateFallback` means hard navigation when offline returns a network error instead of the SPA shell. No `runtimeCaching` means the Google Fonts request fails offline. The `.png` glob pattern is also missing, so PWA icons aren't precached.

### 20. Build script runs `vite build` before `tsc -b`

**`package.json:9`**

Type errors can ship to production since esbuild strips types without checking them, and the `dist/` folder is already written before `tsc -b` runs.

### 21. `src/styles/globals.css` is never imported

**`src/styles/globals.css` (entire file)**

Defines an alternate token set with unique variables (`--input-background`, `--switch-background`) that are never loaded. Any component referencing these tokens gets no CSS.

### 22. `App.css` is a Vite scaffold leftover with live `text-align: center` on `#root`

**`src/App.css:1-6`**

Applies `text-align: center` to the entire app root as an inherited property. This is almost certainly unintentional.

### 23. `AlertTimer` "Alert Active" is hard-coded English

**`src/components/AlertTimer.tsx:19`**

The most safety-critical UI component is not internationalized. Hebrew/Arabic speakers see English during emergencies.

### 24. `needsClarification === true` condition never evaluates

**`src/conversation/conversationMapV2.ts:33, 135`**

The `evaluateCondition` method has no handler for `needsClarification`. The condition string falls through to `return false`. The `default` branch catches it, but the intended clarification routing is silently bypassed.

### 25. Context provider/consumer pattern issues

**`src/contexts/LanguageContext.tsx:9-12`** and **`src/contexts/UserPreferencesContext.tsx:10-13`**

Both contexts provide default values with no-op functions. `useLanguage` and `useUserPreferences` have no provider guard -- if used outside a provider, locale changes and gender preference changes are silently dropped. `ThemeContext` correctly throws on missing provider; the others should match.

### 26. `resolvedApps` always resolves to non-localized `InnerApps`

**`src/App.tsx:102-103, 605`**

`AppsProvider` wraps the JSX with `value={InnerApps}` (static English labels). `resolvedApps = appsContext ?? localizedApps` always picks `appsContext` (always present). Localized app labels from `useLocalizedApps` are never used.

### 27. `reloadFlowchart` uses nonexistent `this.filePath`

**`src/nlp/separated_mermaid_interpreter_parser.js:722`**

Should be `this.scriptPath`. Also calls `MermaidInterpreter.createFromFile` as a static method, but it's an instance method.

---

## Medium Issues

### 28. `deactivateAllProfiles` calls `saveProfile` in a loop with competing transactions

**`src/storage/userProfileStorage.ts:225-231`**

Each iteration opens its own transaction. Combined with issue #6, the operations are non-atomic and can corrupt profile state.

### 29. `getRecentActivities` cursor orders by primary key, not timestamp

**`src/storage/userProfileStorage.ts:310-311`**

Iterates `'prev'` on the `profileId` index. Results are not ordered by recency.

### 30. `MatchingGame` timeout never cleared on unmount

**`src/activities/MatchingGame.tsx:58-87`**

The 1.5s mismatch `setTimeout` has no cleanup. Also, `cards` in the dependency array causes double-checks after successful matches.

### 31. `processUserInput` double-execution risk via effect pattern

**`src/App.tsx:409-413`**

The `useEffect` calling `processUserInput` when `userInput` changes is redundant and fragile. `processUserInput` calls `setUserInput("")` which re-triggers the effect. The guard `userInput !== ""` prevents infinite loops but depends on state batching order.

### 32. Alert interval cleanup only fires on state change, not reliably on unmount

**`src/App.tsx:560-566`**

Should use a `useRef` for the interval ID instead of depending on `alertInterval` state.

### 33. PWA icon `"purpose": "any maskable"` is deprecated

**`pwa.config.ts:25-28`**

Combined purpose causes incorrect icon cropping on Android. Should provide separate icon entries.

### 34. `tsconfig.node.json` excludes `pwa.config.ts` and `generate-notice.ts` from type checking

**`tsconfig.node.json:25`**

### 35. Duplicate `nlp.plugin(crisisPlugin)` registration

**`src/parser/semanticParser.ts:43`** and **`src/nlp/semanticParser.js:64`**

Both files register the same Compromise plugin at module load. If both are in the module graph, tags are applied twice.

### 36. `eslint.config.js` enables nonexistent `react-hooks/immutability` rule

**`eslint.config.js:36`**

Silently ignored. Not a real rule in `eslint-plugin-react-hooks`.

### 37. `path` npm package listed as runtime dependency

**`package.json:56`**

Browser polyfill for Node's `path` module. Should be `devDependencies` or removed.

### 38. Arrow keys in SnakeGame lack `e.preventDefault()` and `aria-label`

**`src/activities/SnakeGame.tsx:56-80, 223-256`**

Page scrolls while playing. Directional buttons have no accessible labels.

### 39. `NumberGuessingGame` resets on gender preference change

**`src/activities/NumberGuessingGame.tsx:21-34`**

Changing gender mid-game via settings regenerates the target number.

### 40. `applyTheme` in ThemeContext lacks SSR guard

**`src/contexts/ThemeContext.tsx:23-28`**

Calls `window.matchMedia` unconditionally. Will throw in SSR/test environments.

---

## Low Issues

| Issue | File |
|-------|------|
| `version: "0.0.0"` never updated from scaffold | `package.json:3` |
| `index.html` missing explicit `<link rel="manifest">` for dev mode | `index.html` |
| No CSP or referrer policy meta tags | `index.html` |
| Logo `alt` text non-configurable, causes screen-reader duplication | `src/assets/Logo.tsx:8` |
| Audio pause resets playhead to zero instead of pausing | `ChatMessage.tsx:63-67` |
| `DarkModeToggle` aria-label hard-coded English | `src/components/DarkModeToggle.tsx:25` |
| `distraction_activity` in V1 map uses `extractLocation` for a grounding exercise | `conversationMap.ts:144-153` |
| `userVariables[undefined]` when `informationType` is missing | `ConversationController.ts:460` |
| `getAllProfiles` returns unvalidated data from IndexedDB | `userProfileStorage.ts:207-223` |
| `tsconfig.json` root has `allowJs: true` with no effect | `tsconfig.json:5` |
| `lint-staged` runs `--type-check` which is slow on partial file sets | `lint-staged.config.js:6` |

---

## Recommended Fix Priority

1. **Issue #1** -- Safety classification case mismatch (affects every user's safety routing)
2. **Issues #6, #7** -- IndexedDB transaction bugs (all persistence is broken)
3. **Issue #3** -- Onboarding completion throws instead of succeeding
4. **Issue #8** -- Auto-launch always picks breathing (activity routing broken)
5. **Issue #9** -- Dead `tailwind.config.js` (custom breakpoints/tokens not generated)
6. **Issues #10, #11** -- Onboarding template variables and edit routing
7. **Issue #12** -- Substring matching on "no"/"yes"
8. **Issues #14, #15** -- ChatMessage interval leak and division by zero
9. **Issue #19** -- PWA offline support (navigateFallback, runtimeCaching, png glob)
10. **Issue #20** -- Build script order (type-check before bundle)
