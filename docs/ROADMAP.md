# Roadmap

## Current state

CALMe has a working conversation engine with 30+ nodes, offline PWA architecture, NLP-based input parsing, and recovery activities. The Six Cs flow is implemented with adaptive skip logic and phase transitions.

## Next milestones

### Conversation and content

- [ ] Complete mapping of flowcharts for all case study scenarios
- [ ] Validate conversation paths with mental health professionals
- [ ] Expand therapeutic content based on field testing feedback

### Language model integration

- [ ] Connect conversation engine to language models for routing (not independent AI responses -- the model follows conversation maps defined by mental health professionals)
- [ ] Speech-to-text for voice input during crisis (hands may be shaking, typing may not be viable)
- [ ] Text-to-speech for audio output
- [ ] Hebrew translation layer for user responses
- [ ] Arabic and Russian translation support

### Accessibility

- [ ] Full WCAG 2.2 compliance audit and remediation
- [ ] Chat interface optimized for hearing impairment
- [ ] Animated avatar interface for more natural user connection
- [ ] Sign language avatar integration (varies by country -- ISL for Israel, ASL for US, etc.)

### Platform integration

- [ ] Connect to Home Front Command (Pikud HaOref) API to trigger crisis mode automatically on siren alert
- [ ] Demonstrate full offline functionality on user devices (no network at all, not just cached)
- [ ] Explore peer-to-peer distribution for scenarios where app stores and websites are unreachable

### UI and experience

- [ ] Complete user interface including light/dark mode polish
- [ ] Expand activity library based on user feedback
- [ ] Caregiver-specific flows (parent with child, bystander with injured stranger)

## Contributing

If you're a mental health professional, translator, accessibility specialist, or developer interested in contributing, open an issue or reach out to the team.
