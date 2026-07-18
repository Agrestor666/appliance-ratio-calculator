---
change_id: verified-fill-media-v1
title: Verified fill media v1
status: implementing
created: 2026-07-17
updated: 2026-07-18
archived_at: null
---

## Notes

<!-- Free-form notes for this change: links, ad-hoc context, decisions that don't belong in research/frame/plan. -->

Plan: `context/changes/verified-fill-media-v1/plan.md`
Brief: `context/changes/verified-fill-media-v1/plan-brief.md`

S-02 handoff (to be confirmed after Phase 2 implementation):
- Path: `data/fill_media_catalog.js`
- Global: `window.FILL_MEDIA_CATALOG`
- Media: `empty` (0), `fresh-water` (1000), `seawater` (1025), `light-oil` (850) kg/m³
- Not loaded by `index.html` until S-02
