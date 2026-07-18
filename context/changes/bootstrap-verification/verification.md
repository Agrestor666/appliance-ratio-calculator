---
bootstrapped_at: 2026-07-17T21:28:00Z
starter_id: 10x-astro-starter
starter_name: "10x Astro Starter (Astro + Supabase + Cloudflare)"
project_name: appliance-ratio-calculator
language_family: js
package_manager: npm
cwd_strategy: git-clone
bootstrapper_confidence: first-class
phase_3_status: ok
audit_command: "npm audit --json"
---

## Hand-off

```yaml
starter_id: 10x-astro-starter
package_manager: npm
project_name: appliance-ratio-calculator
hints:
  language_family: js
  team_size: solo
  deployment_target: cloudflare-pages
  ci_provider: github-actions
  ci_default_flow: auto-deploy-on-merge
  bootstrapper_confidence: first-class
  path_taken: standard
  quality_override: false
  self_check_answers: null
  has_auth: false
  has_payments: false
  has_realtime: false
  has_ai: false
  has_background_jobs: false
```

## Why this stack

A medium-scale browser web-app (Appliance Ratio + cargo + rigging) with a 3-week delivery window and an explicit Cloudflare deploy preference. The recommended JS web default is Astro + React islands + TypeScript + Tailwind with Cloudflare Pages/Workers — matching the host choice and keeping the stack typed and convention-based for agent workflows. Auth, payments, realtime, AI, and background jobs are out of scope per the PRD; Supabase in the starter can stay unused until needed. CI is GitHub Actions with auto-deploy on merge to main. Scaffolding confidence is first-class.

## Pre-scaffold verification

| Signal             | Value                                              | Severity | Notes                                      |
| ------------------ | -------------------------------------------------- | -------- | ------------------------------------------ |
| npm package        | not run                                            | —        | cmd_template is git clone; npm step skipped |
| GitHub repo        | przeprogramowani/10x-astro-starter last pushed 2026-05-17T10:33:39Z | fresh    | from card.docs_url                         |

## Scaffold log

**Resolved invocation**: `git clone https://github.com/przeprogramowani/10x-astro-starter .bootstrap-scaffold && cd .bootstrap-scaffold && npm install`
**Strategy**: git-clone
**Exit code**: 0 (after retry via `registry.npmmirror.com`; first attempt against registry.npmjs.org failed with UNABLE_TO_VERIFY_LEAF_SIGNATURE)
**Files moved**: 31536 (includes `node_modules`)
**Conflicts (.scaffold siblings)**: `.npmrc.scaffold`
**`.gitignore` handling**: moved silently
**.bootstrap-scaffold cleanup**: deleted (empty leftover dir may remain briefly if locked by a shell cwd)

Notes:
- Project `.npmrc` forced to `registry=https://registry.npmmirror.com` after merge.
- Existing app files (`index.html`, `app.js`, `styles.css`, `data/`, etc.) preserved; starter files landed alongside.
- `context/` preserved.

## Post-scaffold audit

**Tool**: npm audit --json
**Status**: failed to run
**Reason**: npmmirror does not implement the npm security audit API (`404 [NOT_IMPLEMENTED] /-/npm/v1/security/*`). Project registry is the mirror by policy.
**Partial output (if any)**:

```
404 Not Found - POST https://registry.npmmirror.com/-/npm/v1/security/audits/quick - [NOT_IMPLEMENTED] /-/npm/v1/security/* not implemented yet
```

## Hints recorded but not acted on

| Hint                       | Value                |
| -------------------------- | -------------------- |
| bootstrapper_confidence    | first-class          |
| quality_override           | false                |
| path_taken                 | standard             |
| self_check_answers         | null                 |
| team_size                  | solo                 |
| deployment_target          | cloudflare-pages     |
| ci_provider                | github-actions       |
| ci_default_flow            | auto-deploy-on-merge |
| has_auth                   | false                |
| has_payments               | false                |
| has_realtime               | false                |
| has_ai                     | false                |
| has_background_jobs        | false                |

## Next steps

Next: a future skill will set up agent context (CLAUDE.md, AGENTS.md). For now, your project is scaffolded and verified — happy hacking.

Useful manual steps in the meantime:
- `git init` (if you have not already) to start your own repo history.
- Review any `.scaffold` siblings the conflict policy created and decide which version of each file to keep.
- Address audit findings per your project's risk tolerance — the full breakdown is in this log.
- Note: with the npm mirror, `npm audit` is unavailable until you point audit at a registry that supports it (or use another scanner).
