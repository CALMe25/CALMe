# Contributing to CALMe

CALMe is a crisis intervention tool. Contributions here have real impact on people in real distress. We take that seriously, and we appreciate that you do too.

## Getting set up

```bash
git clone https://github.com/CALMe25/CALMe.git
cd CALMe
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Everything runs locally -- no backend, no API keys, no external services.

## Development workflow

1. Create a branch from `main`
2. Make your changes
3. Run `npm run lint` and `npm run build` before committing
4. Open a pull request using the PR template

Commits are linted on pre-commit via Husky + lint-staged. If the hook fails, fix the issue rather than skipping it.

## What we need help with

- **Mental health professionals** -- reviewing and refining conversation flows, validating therapeutic content against the Six Cs model
- **Translators** -- expanding language support (Hebrew, Arabic, English currently; Russian and Amharic are priorities)
- **Accessibility specialists** -- WCAG 2.2 audit, screen reader testing, assistive technology validation
- **Developers** -- see [docs/ROADMAP.md](docs/ROADMAP.md) for current priorities

## Code style

- TypeScript throughout -- no `any` unless absolutely necessary
- Linting: OXLint (Rust-based, runs fast)
- Formatting: OXFmt
- UI components: Radix UI + Tailwind CSS
- No external API calls in the conversation flow -- everything runs offline

## Conversation content

If you're contributing to conversation maps or therapeutic content, coordinate with the team first. Crisis intervention content is reviewed by a mental health professional before merging. Open an issue to discuss before submitting a PR.

## Reporting issues

Use the issue templates:
- **Bug report** -- something isn't working
- **Feature request** -- something that should exist

## Code of conduct

Be decent. This project exists to help people in crisis. Bring that same care to how you treat contributors.
