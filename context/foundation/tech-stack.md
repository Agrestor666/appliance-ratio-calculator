---
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
---

## Why this stack

A medium-scale browser web-app (Appliance Ratio + cargo + rigging) with a 3-week delivery window and an explicit Cloudflare deploy preference. The recommended JS web default is Astro + React islands + TypeScript + Tailwind with Cloudflare Pages/Workers — matching the host choice and keeping the stack typed and convention-based for agent workflows. Auth, payments, realtime, AI, and background jobs are out of scope per the PRD; Supabase in the starter can stay unused until needed. CI is GitHub Actions with auto-deploy on merge to main. Scaffolding confidence is first-class.
