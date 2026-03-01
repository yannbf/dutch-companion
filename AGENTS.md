# AGENTS.md

Guidance for AI coding agents working in this repository.

Read these first for implementation tasks:

1. `docs/PRODUCT_UX_INTENT.md`
2. `docs/ARCHITECTURE.md`

## Goals

- Keep Dutch learning outcomes front-and-center.
- Ship focused, verifiable changes.
- Preserve coherent UX across exercises.

## Working Rules

1. **Tests/verification first mindset**
   - If behavior changes, define how to verify it before coding.
   - Prefer one PR containing both verification changes and implementation.

2. **Protect learning UX**
   - Maintain quick exercise loops (setup → play → feedback).
   - Keep interactions mobile-friendly (tap targets, readable cards, clear CTA labels).

3. **Write meaningful tests (not render-only tests)**
   - Tests must verify behavior and outcomes, not just that a page renders.
   - Prefer assertions on:
     - state changes (score/progress)
     - interaction outcomes (correct/incorrect feedback)
     - route transitions and completion states
   - Add stable selectors (`data-testid`) for difficult-to-target interactive elements.

4. **Respect learning-state persistence**
   - Settings/progress/favorites rely on localStorage stores.
   - Do not rename storage keys casually; migration impact must be documented.

5. **Framework and platform assumptions**
   - Current app is a React + Vite web app.
   - Keep framework/platform docs current if this changes.

6. **Do not leave docs stale**
   - If architecture, UX goals, or workflows change, update:
     - `AGENTS.md`
     - `docs/PRODUCT_UX_INTENT.md`
     - `docs/ARCHITECTURE.md`
     - `.github/pull_request_template.md`

## Baseline Validation

Use simple baseline commands unless scope is narrower and explicitly justified:

```bash
pnpm lint
pnpm build
```

For behavior-heavy changes, also run the app locally:

```bash
pnpm dev
```

## PR Hygiene

- Keep PRs focused and reviewer-friendly.
- Include: what changed, why, and exact validation commands run.
- Include screenshots/GIFs for visible UX changes.
