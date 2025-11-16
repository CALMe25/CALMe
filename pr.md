# i18n and Hebrew support

## Summary

- add i18n support using [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) with a typed runtime, persistent locale storage, and a Vite build step that emits `/src/paraglide` bindings from `project.inlang`
- translate all activities, parser prompts, and chatbot flows with the new message catalog (English + Hebrew) while introducing gender-aware variants where needed
- layer UI state contexts (language, theme, user preferences) so locale, RTL direction, and dark-mode choices are synced across the app and stored in `localStorage`
- refresh the toolbar/header experience with a hamburger sheet, iconized controls, and RTL-aware placement so Hebrew reads correctly on mobile and desktop
- reorganize the hamburger menu buttons so language/gender settings live in the sheet, the trigger sits on the locale-appropriate side, and dark-mode rows stay clickable across the full width even in RTL
- harden the accessibility toolbar by reloading it when languages swap, patching keyboard/focus behavior, and providing a puppeteer regression script
- add targeted Rollup `manualChunks` so React, Paraglide, and UI vendors emit smaller bundles and the largest chunk stays under Vite’s 500 kB warning without widening the limit

## Details

### [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) adoption

- add `@inlang/paraglide-js` + [Vite plugin](https://inlang.com/m/gerre34r/library-inlang-paraglideJs/vite), a `project.inlang` definition, and generated runtime helpers (`getLocale`, `setLocale`, language metadata) that power a new `LanguageContext`
- generate `messages/en.json` + `messages/he.json` and rewire every activity/chat message/parser prompt to call functions from `m` so translations remain type-safe
- expose `LanguageProvider` + `useLanguage` to persist the user's locale, update `<html dir/lang>` attributes, and trigger reactive rerenders without a page reload
- introduce `useLocalizedApps` so the quick-launcher, activity cards, and the new `GenderPreference` UI all pull their titles/descriptions from Paraglide instead of hardcoded strings

### Hebrew + RTL UX polish

- ensure `LanguageSwitcher` and `GenderPreference` controls live inside the hamburger sheet and store selections via the `UserPreferencesContext` for later sessions
- mirror chat bubbles, quick-action layouts, and hamburger triggers when `currentLocale === "he"`, keeping icons aligned with the logo and defaulting dark-mode rows to full-width buttons
- automatically set `document.dir = 'rtl'` for Hebrew, move the hamburger trigger to the left, and keep the sheet/drawer animations consistent regardless of reading direction

### Accessibility + testing improvements

- rewrite `AccessibilityToolbar` integration to bootstrap MicAccessTool lazily, patch its keyboard/focus helpers, clear inline styles when toggling features, and reload it when the locale changes so the UI language matches the app
- share dark-mode state via a `ThemeContext` so toggles, the layout, and the toolbar stay synchronized with system preferences (fallback to system when the user has not picked a mode)
- add `test-accessibility-toolbar.mjs`, a puppeteer flow that exercises the toolbar before/after switching to Hebrew, captures screenshots, and validates `<html lang/dir>` updates

### Hamburger and button refinements

- consolidate header controls into the hamburger sheet, keep language/gender selectors inside the drawer, and move the trigger to the locale-appropriate edge so Hebrew layouts feel native
- reorganize the quick-action and dark-mode buttons so each row fills the available width, icons stay paired with labels, and the RTL spacing remains balanced without duplicating controls

### Build optimizations

- add Rollup `manualChunks` that isolate React, Paraglide’s runtime/bindings, UI libraries, and the remaining vendors so every bundle stays below the 500 kB warning and the default `chunkSizeWarningLimit` remains untouched

## Testing

- `npm run build` (compiles Paraglide JS messages with the Vite plugin)
