# Architecture (Agent-Focused)

Short technical map for contributors and coding agents.

## Stack

- React + TypeScript + Vite
- React Router for page-level flows
- shadcn/ui + Tailwind for UI
- LocalStorage-based persistence for user settings/progress/favorites

## App Shape

- `src/App.tsx`
  - Router and top-level providers.
  - Main route groups:
    - `/exercises/*`
    - `/vocabulary`
    - `/settings`
    - `/resources`

- `src/pages/*`
  - Exercise setup/play screens and utility screens.

- `src/components/*`
  - Reusable UI and exercise interaction components.

- `src/data/*`
  - Static learning datasets (verbs, vocabulary, separable verbs, etc.).

- `src/lib/localStorage.ts`
  - Robust storage helper used by multiple features.

- `src/services/*`
  - Audio/speech/haptic side-effect services.

## Core Runtime Flow

1. User picks an exercise from `/exercises`.
2. Setup page stores chosen options in localStorage.
3. Play page reads setup + data and runs interaction loop.
4. Session ends with summary/retry/back actions.
5. Global settings affect behavior across exercises (translation/random/voice).

## Key Invariants

1. **Learning-state persistence remains stable**
   - Existing localStorage keys are part of user continuity.

2. **Exercise loop stays fast**
   - Setup and replay should remain low-friction.

3. **UX consistency across exercises**
   - Similar control patterns, feedback language, and summary behavior.

4. **Audio behavior remains optional and predictable**
   - Voice/speech should respect settings and avoid noisy overlap.

## Verification Baseline

```bash
pnpm lint
pnpm build
```

For interaction-heavy changes, also run:

```bash
pnpm dev
```

## Agent Maintenance Rule

If architecture, routes, persistence model, or exercise flow changes, update this file in the same PR.
