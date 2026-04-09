# CALMe -- Calm & Alert

Offline-first psychological first aid for active crisis situations. CALMe delivers real-time, step-by-step trauma response guidance based on the [Six Cs model](https://scholar.google.com/citations?user=yKV0n3YAAAAJ) by Dr. Moshe Farhi -- a peer-reviewed psychological first aid model developed for active conflict zones.

Built for the reality that during a rocket attack in Israel, a shelling in Ukraine, or a disaster anywhere else, you can't call a therapist, your phone might not have signal, and emergency services are dealing with physical casualties first.

<!-- TODO: Add demo GIF or screenshot here -->
<!-- ![CALMe demo](docs/assets/demo.gif) -->

## The problem

In the first minutes after a rocket attack, terror incident, or natural disaster, people experience acute stress that shuts down executive function. Existing mental health tools assume connectivity, require onboarding, and rely on emotional soothing -- which actually suppresses the thinking brain during crisis.

## How CALMe works

CALMe uses Dr. Farhi's core insight: **activating people during crisis restores executive function faster than calming them.** The fear response and the thinking brain can't run at full power simultaneously -- give someone a cognitive task and the fear starts to quiet. Research shows this can happen in as little as 90 seconds.

The app guides users through the Six Cs:

| C | Purpose | Example |
|---|---------|---------|
| **Commitment** | Counter isolation | "I'm here. I'm not going anywhere." |
| **Cognitive Communication** | Re-engage the thinking brain | "Count the people around you. What floor are you on?" |
| **Challenge** | Transform victim to helper | "Check on the person who looks most stressed." |
| **Control** | Restore personal agency | "Do you want to get them water, or sit with them?" |
| **Continuity** | Provide temporal structure | "The siren started at X. You got to shelter. It's over now." |
| **Compassion** | Woven through every message | "You did that. You helped her. That matters." |

## Key features

- **Completely offline** -- works with no network connection after the first download. No API calls, no server dependency. Peer-shareable via local network or USB during infrastructure attacks.
- **Natural language understanding** -- handles fragmented, emotional crisis speech using local NLP (Compromise.js + Sentiment analysis). No rigid questionnaires.
- **Adaptive conversation engine** -- 30+ conversation nodes with skip logic. If a user says "I'm in shelter with 6 people," the bot detects completed steps and jumps ahead.
- **No onboarding during crisis** -- opens directly to "I'm here with you." No onboarding forms during crisis. Activities sidebar hidden until recovery phase.
- **Recovery activities** -- breathing exercises, matching games, digital canvas, stretching routines, Sudoku -- triggered by the conversation engine based on stress level.
- **Multi-language** -- Hebrew, Arabic, and English support via compile-time i18n (Paraglide-JS).
- **Accessibility** -- ARIA-compliant contrast, dyslexia-friendly mode (OpenDyslexic font), screen reader support.
- **Companion mode** -- floating helper bubble for users caring for dependents (children, elderly, injured).

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7 |
| UI | Radix UI, Tailwind CSS 4 |
| NLP | Compromise.js, Sentiment |
| Offline | Vite PWA Plugin, Workbox service workers |
| i18n | Paraglide-JS (compile-time) |
| Storage | IndexedDB (local profiles, no server) |
| Hosting | Cloudflare Workers |
| CI/CD | GitHub Actions (build, lint, deploy) |
| Linting | OXLint, OXFmt, Husky + lint-staged |

## Getting started

```bash
git clone https://github.com/CALMe25/CALMe.git
cd CALMe
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. The app runs entirely locally.

To build for production:

```bash
npm run build      # Output in dist/ (~50MB with all assets)
npm run preview    # Preview the production build locally
```

## Project structure

```
src/
  activities/        # Breathing, games, canvas, stretching
  chat_interface/    # Chat UI components
  components/        # Shared UI (Radix-based)
  contexts/          # React contexts
  conversation/      # Conversation engine, controller, maps
  hooks/             # Custom React hooks
  nlp/               # Natural language processing
  parser/            # Multi-signal text analysis
  storage/           # IndexedDB profile persistence
  paraglide/         # Compiled i18n output
  types/             # TypeScript interfaces
docs/                # Architecture, resources, specs
```

## Why this matters

This is not a wellness app. CALMe is built for the minutes between a siren and an all-clear, when a person is alone in a shelter with their phone and no one to call. The Six Cs model has been field-tested during active conflict in Israel and validated across emergency mental health research globally.

The design philosophy: **don't sedate, activate.** Transform the user from passive victim to active participant. Restore agency, then stabilize.

## Research foundation

- Farchi, M., et al. (2018). "The SIX Cs model for Immediate Cognitive Psychological First Aid." *International Journal of Emergency Mental Health and Human Resilience.*
- Farchi, M., et al. (2025). "Effects of a psychological first aid based on the SIX Cs model on acute stress responses." *Psychological Trauma.*
- Farchi & Shlezinger (2026). "The SIX Cs model integrating empathy: a structured cognitive framework for psychological first aid during acute threat." *Frontiers in Psychology.*
- [ICFR -- International Center for Functional Resilience](https://icfr.co.il)

