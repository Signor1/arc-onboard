# Contributing to Arc Onboard

Thanks for considering a contribution. Arc Onboard is an open-source MIT project — issues, suggestions, and pull requests are all welcome.

## Where to start

- **Bug or feature idea** → [open an issue](https://github.com/Signor1/arc-onboard/issues). Use the bug-report or feature-request template; they prompt for the right details.
- **Code change** → fork the repo, branch off `main`, open a PR.
- **Docs / README / typo** → still goes through a PR. Small docs PRs are very welcome and merge fast.

## Development setup

```bash
git clone https://github.com/Signor1/arc-onboard.git
cd arc-onboard
pnpm install
pnpm dev
```

Open http://localhost:3000.

Required: [Node.js 20+](https://nodejs.org/). pnpm is recommended; npm and yarn also work.

To test the published-package code path locally:

```bash
pnpm build
node bin/arc-onboard.js   # same flow that `npx @signordev/arc-onboard` triggers
```

## Project layout

```
src/
  app/
    page.tsx                  # main wizard host
    layout.tsx, providers.tsx # app shell, providers
    api/*/route.ts            # server-side proxy to Circle's SDK
  components/
    wizard/
      progress-rail.tsx       # left nav
      request-panel.tsx       # right "Swagger-style" inspector
      footer-nav.tsx
      steps/                  # one file per wizard step
    ui/                       # shadcn-style primitives
  lib/
    chains.ts                 # per-chain config (USDC addresses, explorers)
    store.ts                  # Zustand wizard state
    circle.ts                 # server-only SDK wrapper
    api-client.ts             # browser → /api/* helper, redacts secrets in logs
    crypto.ts                 # browser-side entity-secret generation
bin/
  arc-onboard.js              # npx launcher
```

**Adding a new chain** = a single new entry in `src/lib/chains.ts`. Every chain-aware step reads from that list.

## Pull request conventions

- Branch name: `feat/<thing>`, `fix/<thing>`, `docs/<thing>`, or `chore/<thing>`.
- Keep the change focused. Small, reviewable PRs land faster.
- Run before pushing:

  ```bash
  pnpm typecheck
  pnpm build
  ```

- Don't commit secrets, `node_modules`, `.env`, recovery files (`*.dat`), or any wallet credentials. The `.gitignore` already covers the obvious ones.
- Direct commits to `main` are not allowed — every change lands through PR review, including changes from the maintainer.

## Code style

- TypeScript everywhere; strict mode is on.
- Tailwind for styling; reuse the shadcn-style primitives in `src/components/ui/` before introducing new ones.
- Default to no comments. Only explain *why* — what the code does should be obvious from naming.
- No new dependencies without a clear justification in the PR description.

## Reporting bugs

Include in your issue:

- What you tried to do.
- What you expected.
- What actually happened.
- Node version (`node --version`), package version (`@signordev/arc-onboard@x.y.z` or commit SHA), OS.
- Relevant logs from the request inspector (right rail) and/or the `pnpm dev` terminal — **redact API keys and entity secrets** before posting.

## Security disclosures

Please do **not** open a public issue for security concerns (credential leakage, anything that could compromise users' wallets). Instead, open a private security advisory on the repo via GitHub's "Security" tab → "Report a vulnerability".

## Releases

Maintainer-only. Versioning follows [SemVer](https://semver.org/):

- Patch (`0.1.0` → `0.1.1`): bugfix, docs/README change, dependency bump.
- Minor (`0.1.x` → `0.2.0`): new feature, new chain support.
- Major (`0.x.x` → `1.0.0`): breaking change to wizard flow or CLI.

Each published version is permanent on npm — get the change right before tagging.
