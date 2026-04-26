<!-- Thanks for contributing! Please fill in the sections below. -->

## What

<!-- 1–3 sentences: what does this PR change? -->

## Why

<!-- The problem this solves, or the motivation. Link to the issue if there is one (e.g., "Closes #42"). -->

## How to test

<!-- Steps a reviewer should take to verify. If UI: which step / chain / scenario. -->

## Checklist

- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] No secrets / `.env` / recovery files in the diff
- [ ] Updated `README.md` / `CONTRIBUTING.md` if behavior or setup changed
- [ ] If adding a chain: added to `src/lib/chains.ts` and tested wallet → fund → transfer end-to-end
