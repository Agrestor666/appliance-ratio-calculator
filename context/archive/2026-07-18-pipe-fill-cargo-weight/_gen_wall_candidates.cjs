/* One-shot generator for wall-thickness-candidates.md — not loaded at runtime. */
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync("data/piping_catalog.js", "utf8");
eval(src.replace("window.PIPING_CATALOG", "global.PIPING_CATALOG"));
const pipes = PIPING_CATALOG.pipes;

const OD = {
  "1/8": 10.3,
  "1/4": 13.7,
  "3/8": 17.1,
  "1/2": 21.3,
  "3/4": 26.7,
  "1": 33.4,
  "1-1/4": 42.2,
  "1-1/2": 48.3,
  "2": 60.3,
  "2-1/2": 73.0,
  "3": 88.9,
  "3-1/2": 101.6,
  "4": 114.3,
  "5": 141.3,
  "6": 168.3,
  "8": 219.1,
  "10": 273.1,
  "12": 323.9,
  "14": 355.6,
  "16": 406.4,
  "18": 457.2,
  "20": 508.0,
  "22": 558.8,
  "24": 609.6,
  "26": 660.4,
  "28": 711.2,
  "30": 762.0,
  "32": 812.8,
  "34": 863.6,
  "36": 914.4,
};

const W = {};
function set(sch, map) {
  W[sch] = Object.assign(W[sch] || {}, map);
}

set("Sch 5", {
  "1/2": 1.65,
  "3/4": 1.65,
  "1": 1.65,
  "1-1/4": 1.65,
  "1-1/2": 1.65,
  "2": 1.65,
  "2-1/2": 2.11,
  "3": 2.11,
  "3-1/2": 2.11,
  "4": 2.11,
  "5": 2.77,
  "6": 2.77,
  "8": 2.77,
  "10": 3.4,
  "12": 3.96,
  "14": 3.96,
  "16": 4.19,
  "18": 4.19,
  "20": 4.78,
  "22": 4.78,
  "24": 5.54,
  "26": 6.35,
  "28": 6.35,
  "30": 6.35,
  "32": 6.35,
  "34": 6.35,
  "36": 6.35,
});
set("Sch 5S", { ...W["Sch 5"] });

set("Sch 10", {
  "1/8": 1.24,
  "1/4": 1.65,
  "3/8": 1.65,
  "1/2": 2.11,
  "3/4": 2.11,
  "1": 2.77,
  "1-1/4": 2.77,
  "1-1/2": 2.77,
  "2": 2.77,
  "2-1/2": 3.05,
  "3": 3.05,
  "3-1/2": 3.05,
  "4": 3.05,
  "5": 3.4,
  "6": 3.4,
  "8": 3.76,
  "10": 4.19,
  "12": 4.57,
  "14": 6.35,
  "16": 6.35,
  "18": 6.35,
  "20": 6.35,
  "22": 6.35,
  "24": 6.35,
  "26": 7.92,
  "28": 7.92,
  "30": 7.92,
  "32": 7.92,
  "34": 7.92,
  "36": 7.92,
});
set("Sch 10S", {
  "1/8": 1.24,
  "1/4": 1.65,
  "3/8": 1.65,
  "1/2": 2.11,
  "3/4": 2.11,
  "1": 2.77,
  "1-1/4": 2.77,
  "1-1/2": 2.77,
  "2": 2.77,
  "2-1/2": 3.05,
  "3": 3.05,
  "3-1/2": 3.05,
  "4": 3.05,
  "5": 3.4,
  "6": 3.4,
  "8": 3.76,
  "10": 4.19,
  "12": 4.57,
  "14": 4.78,
  "16": 4.78,
  "18": 4.78,
  "20": 5.54,
  "22": 5.54,
  "24": 6.35,
  "30": 7.92,
});

set("Sch 20", {
  "8": 6.35,
  "10": 6.35,
  "12": 6.35,
  "14": 7.92,
  "16": 7.92,
  "18": 7.92,
  "20": 9.53,
  "22": 9.53,
  "24": 9.53,
  "26": 12.7,
  "28": 12.7,
  "30": 12.7,
  "32": 12.7,
  "34": 12.7,
  "36": 12.7,
});

set("Sch 30", {
  "1/4": 1.85,
  "3/8": 1.85,
  "1/2": 2.41,
  "3/4": 2.41,
  "1": 2.9,
  "1-1/4": 2.97,
  "1-1/2": 3.17,
  "2": 3.17,
  "2-1/2": 4.78,
  "3": 4.78,
  "3-1/2": 4.78,
  "4": 4.78,
  "8": 7.04,
  "10": 7.8,
  "12": 8.38,
  "14": 9.53,
  "16": 9.53,
  "18": 11.13,
  "20": 12.7,
  "22": 12.7,
  "24": 14.27,
  "26": 15.88,
  "28": 15.88,
  "30": 15.88,
  "32": 15.88,
  "34": 15.88,
  "36": 15.88,
});

set("Sch 40", {
  "1/8": 1.73,
  "1/4": 2.24,
  "3/8": 2.31,
  "1/2": 2.77,
  "3/4": 2.87,
  "1": 3.38,
  "1-1/4": 3.56,
  "1-1/2": 3.68,
  "2": 3.91,
  "2-1/2": 5.16,
  "3": 5.49,
  "3-1/2": 5.74,
  "4": 6.02,
  "5": 6.55,
  "6": 7.11,
  "8": 8.18,
  "10": 9.27,
  "12": 10.31,
  "14": 11.13,
  "16": 12.7,
  "18": 14.27,
  "20": 15.09,
  "24": 17.48,
  "32": 17.48,
  "34": 17.48,
  "36": 19.05,
});

set("STD", {
  "1/8": 1.73,
  "1/4": 2.24,
  "3/8": 2.31,
  "1/2": 2.77,
  "3/4": 2.87,
  "1": 3.38,
  "1-1/4": 3.56,
  "1-1/2": 3.68,
  "2": 3.91,
  "2-1/2": 5.16,
  "3": 5.49,
  "3-1/2": 5.74,
  "4": 6.02,
  "5": 6.55,
  "6": 7.11,
  "8": 8.18,
  "10": 9.27,
  "12": 9.53,
  "14": 9.53,
  "16": 9.53,
  "18": 9.53,
  "20": 9.53,
  "22": 9.53,
  "24": 9.53,
  "26": 9.53,
  "28": 9.53,
  "30": 9.53,
  "32": 9.53,
  "34": 9.53,
  "36": 9.53,
});

set("Sch 40S", {
  "1/8": 1.73,
  "1/4": 2.24,
  "3/8": 2.31,
  "1/2": 2.77,
  "3/4": 2.87,
  "1": 3.38,
  "1-1/4": 3.56,
  "1-1/2": 3.68,
  "2": 3.91,
  "2-1/2": 5.16,
  "3": 5.49,
  "3-1/2": 5.74,
  "4": 6.02,
  "5": 6.55,
  "6": 7.11,
  "8": 8.18,
  "10": 9.27,
  "12": 9.53,
});

set("Sch 60", {
  "8": 10.31,
  "10": 12.7,
  "12": 14.27,
  "14": 15.09,
  "16": 16.66,
  "18": 19.05,
  "20": 20.62,
  "22": 22.23,
  "24": 24.61,
});

set("Sch 80", {
  "1/8": 2.41,
  "1/4": 3.02,
  "3/8": 3.2,
  "1/2": 3.73,
  "3/4": 3.91,
  "1": 4.55,
  "1-1/4": 4.85,
  "1-1/2": 5.08,
  "2": 5.54,
  "2-1/2": 7.01,
  "3": 7.62,
  "3-1/2": 8.08,
  "4": 8.56,
  "5": 9.53,
  "6": 10.97,
  "8": 12.7,
  "10": 15.09,
  "12": 17.48,
  "14": 19.05,
  "16": 21.44,
  "18": 23.83,
  "20": 26.19,
  "22": 28.58,
  "24": 30.96,
});

set("XS", {
  "1/8": 2.41,
  "1/4": 3.02,
  "3/8": 3.2,
  "1/2": 3.73,
  "3/4": 3.91,
  "1": 4.55,
  "1-1/4": 4.85,
  "1-1/2": 5.08,
  "2": 5.54,
  "2-1/2": 7.01,
  "3": 7.62,
  "3-1/2": 8.08,
  "4": 8.56,
  "5": 9.53,
  "6": 10.97,
  "8": 12.7,
  "10": 12.7,
  "12": 12.7,
  "14": 12.7,
  "16": 12.7,
  "18": 12.7,
  "20": 12.7,
  "22": 12.7,
  "24": 12.7,
  "26": 12.7,
  "28": 12.7,
  "30": 12.7,
  "32": 12.7,
  "34": 12.7,
  "36": 12.7,
});

set("Sch 80S", {
  "1/8": 2.41,
  "1/4": 3.02,
  "3/8": 3.2,
  "1/2": 3.73,
  "3/4": 3.91,
  "1": 4.55,
  "1-1/4": 4.85,
  "1-1/2": 5.08,
  "2": 5.54,
  "2-1/2": 7.01,
  "3": 7.62,
  "3-1/2": 8.08,
  "4": 8.56,
  "5": 9.53,
  "6": 10.97,
  "8": 12.7,
  "10": 12.7,
  "12": 12.7,
  "14": 12.7,
  "16": 12.7,
  "18": 12.7,
  "20": 12.7,
  "22": 12.7,
  "24": 12.7,
});

set("Sch 100", {
  "8": 15.09,
  "10": 18.26,
  "12": 21.44,
  "14": 23.83,
  "16": 26.19,
  "18": 29.36,
  "20": 32.54,
  "24": 38.89,
});

set("Sch 120", {
  "4": 11.13,
  "5": 12.7,
  "6": 14.27,
  "8": 18.26,
  "10": 21.44,
  "12": 25.4,
  "14": 27.79,
  "16": 30.96,
  "18": 34.93,
  "20": 38.1,
  "24": 46.02,
});

set("Sch 140", {
  "8": 20.62,
  "10": 25.4,
  "12": 28.58,
  "14": 31.75,
  "16": 36.53,
  "18": 39.67,
  "20": 44.45,
  "24": 52.37,
});

set("Sch 160", {
  "1/2": 4.78,
  "3/4": 5.56,
  "1": 6.35,
  "1-1/4": 6.35,
  "1-1/2": 7.14,
  "2": 8.74,
  "2-1/2": 9.53,
  "3": 11.13,
  "4": 13.49,
  "5": 15.88,
  "6": 18.26,
  "8": 23.01,
  "10": 28.58,
  "12": 33.32,
  "14": 35.71,
  "16": 40.49,
  "18": 45.24,
  "20": 50.01,
  "24": 59.54,
});

set("XXS", {
  "1/2": 7.47,
  "3/4": 7.82,
  "1": 9.09,
  "1-1/4": 9.7,
  "1-1/2": 10.15,
  "2": 11.07,
  "2-1/2": 14.02,
  "3": 15.24,
  "4": 17.12,
  "5": 19.05,
  "6": 21.95,
  "8": 22.23,
  "10": 25.4,
  "12": 25.4,
});

function theoWt(od, t) {
  return 0.0246615 * t * (od - t);
}

function parseNps(nps) {
  if (nps.includes("-")) {
    const [a, b] = nps.split("-");
    return Number(a) + Number(b.split("/")[0]) / Number(b.split("/")[1]);
  }
  if (nps.includes("/")) {
    const [a, b] = nps.split("/");
    return Number(a) / Number(b);
  }
  return Number(nps);
}

const A = [];
const B = [];
let odMismatch = 0;
let b36Missing = 0;
let wtSuspect = 0;

for (const sch of Object.keys(pipes)) {
  for (const row of pipes[sch]) {
    const { nps, od, wt } = row;
    const canonOd = OD[nps];
    const t = (W[sch] || {})[nps];
    const odDelta = canonOd != null ? Math.abs(od - canonOd) : null;
    const odOk = odDelta != null && odDelta <= 0.15;
    const id = t != null ? od - 2 * t : null;
    const idOk = id != null && id > 0;
    const tw = t != null ? theoWt(od, t) : null;
    const wtDelta = tw != null ? Math.abs(wt - tw) : null;
    const wtOk = wtDelta == null || wtDelta <= Math.max(0.5, 0.12 * Math.max(wt, tw));
    const base = { sch, nps, od, wt, t, canonOd, odDelta, id, tw, wtDelta, odOk, idOk, wtOk };

    if (t == null) {
      b36Missing++;
      B.push({ ...base, reason: "B36-missing: no published wall for this schedule×NPS in sources used" });
      continue;
    }
    if (!odOk) {
      odMismatch++;
      B.push({ ...base, reason: `OD-mismatch: catalog od=${od} vs B36 OD=${canonOd}` });
      continue;
    }
    if (!idOk) {
      B.push({ ...base, reason: "geometry: ID=od-2t ≤ 0" });
      continue;
    }

    const reasons = [];
    const n = parseNps(nps);
    if (sch === "STD" && n >= 12) reasons.push("STD≥12 uses fixed 9.53 mm (≠ Sch 40)");
    if (sch === "XS" && n >= 10) reasons.push("XS≥10 uses fixed 12.70 mm (≠ Sch 80)");
    if (sch === "Sch 40S" && n >= 12) reasons.push("Sch 40S≥12 = STD wall 9.53; verify vs catalog wt");
    if (sch === "Sch 80S" && n >= 10) reasons.push("Sch 80S≥10 = XS wall 12.70; verify vs catalog wt");
    if (sch === "Sch 10S" && n >= 14) reasons.push("Sch 10S≥14 thin wall (B36.19); catalog wt may match Sch 10 6.35 instead");
    if (sch === "Sch 5S" && n > 12) reasons.push("Sch 5S beyond common B36.19 chart range; using Sch 5 wall");
    if (sch === "Sch 30" && n < 8) reasons.push("Sch 30 small NPS: catalog wt often equals Sch 40 — verify designation");
    if (!wtOk) {
      wtSuspect++;
      reasons.push(`wt-suspect: catalog wt=${wt} vs theo≈${tw.toFixed(2)} (Δ=${wtDelta.toFixed(2)})`);
    }

    if (reasons.length) B.push({ ...base, reason: reasons.join("; ") });
    else A.push(base);
  }
}

const total = Object.values(pipes).reduce((n, a) => n + a.length, 0);
const lines = [];
const L = (s = "") => lines.push(s);

L("# Wall-thickness candidates");
L("");
L(
  "Approval artifact for `pipe-fill-cargo-weight` Phase 1. **Do not edit** `data/piping_catalog.js` until this file’s `## Sign-off` (or equivalent chat confirmation) accepts a set of rows.",
);
L("");
L(
  "Source of truth remains `data/piping_catalog.js` (`PIPING_CATALOG.pipes`). Proposed field: add-only `t` (nominal wall thickness, mm). Existing `od` / `wt` must not be rewritten.",
);
L("");
L("## Edition / source note");
L("");
L(
  "Wall proposals are drawn from published ASME B36.10M (carbon/alloy) and ASME B36.19M (stainless *S schedules) nominal wall tables, as compiled in common engineering charts (Projectmaterials B36.10/19 wall charts; cross-checked against ZC Steel ASME B36.10M-2018 schedule tables). Values use millimetre nominal walls (e.g. STD large sizes **9.53** mm = 0.375″; XS large sizes **12.70** mm = 0.500″).",
);
L("");
L(
  "This is **not** a licensed reprint of the ASME standard. Human sign-off should spot-check critical sizes against an owned B36.10M / B36.19M edition before Phase 2.",
);
L("");
L("## Mapping");
L("");
L("### Schedule keys");
L("");
L("| Catalog key | ASME designation | Notes |");
L("| ------------ | ---------------- | ----- |");
L("| `Sch 5S` | B36.19M Sch 5S | Aligns with Sch 5 walls for listed NPS |");
L("| `Sch 5` | B36.10M Sch 5 | |");
L("| `Sch 10S` | B36.19M Sch 10S | Thin wall ≥14″ may differ from Sch 10 |");
L("| `Sch 10` | B36.10M Sch 10 | |");
L("| `Sch 20` | B36.10M Sch 20 | |");
L("| `Sch 30` | B36.10M Sch 30 | Small NPS rarely used; catalog wt may look like Sch 40 |");
L("| `Sch 40S` | B36.19M Sch 40S | = Sch 40 ≤10″; = STD (≥12″ → 9.53 mm) |");
L("| `Sch 40` | B36.10M Sch 40 | ≠ STD for NPS ≥12 |");
L("| `Sch 60` | B36.10M Sch 60 | |");
L("| `Sch 80S` | B36.19M Sch 80S | = Sch 80 ≤8″; = XS (≥10″ → 12.70 mm) |");
L("| `Sch 80` | B36.10M Sch 80 | ≠ XS for NPS ≥10 |");
L("| `Sch 100` … `Sch 160` | B36.10M | |");
L("| `STD` | Standard | = Sch 40 ≤10″; fixed 9.53 mm ≥12″ |");
L("| `XS` | Extra Strong | = Sch 80 ≤8″; fixed 12.70 mm ≥10″ |");
L("| `XXS` | Double Extra Strong | Not a schedule number |");
L("");
L("### NPS / OD");
L("");
L(
  "Catalog `nps` strings are used as-is (`1-1/4`, `2-1/2`, …). Catalog `od` is accepted when within **0.15 mm** of the B36 OD (covers catalog `12″ → 323.8` vs B36 `323.9`).",
);
L("");
L("### Field mapping");
L("");
L("| Proposal field | Catalog field | Unit |");
L("| -------------- | ------------- | ---- |");
L("| `t` (new, add-only) | — | mm (nominal wall) |");
L("| (unchanged) | `od` | mm |");
L("| (unchanged) | `wt` | kg/m (mass/length — **not** wall) |");
L("| (unchanged) | `nps` | string |");
L("");
L("Internal volume (later phases): `ID = od − 2·t` (mm).");
L("");
L("### Coverage summary");
L("");
L("| Metric | Count |");
L("| ------ | ----- |");
L(`| Catalog pipe rows | ${total} |`);
L(`| Schedules | ${Object.keys(pipes).length} |`);
L(`| A. recommended (clean B36 match) | ${A.length} |`);
L(`| B. needs review | ${B.length} |`);
L(`| · subset: B36 wall missing | ${b36Missing} |`);
L(`| · subset: OD mismatch | ${odMismatch} |`);
L(`| · subset: flagged with wt-suspect (may overlap other B reasons) | ${wtSuspect} |`);
L("");
L("## Proposed wall thicknesses");
L("");
L("Proposed catalog shape after Phase 2: `{ nps, od, wt, t }` under `PIPING_CATALOG.pipes[<schedule>]`.");
L("");
L("### A. Recommended");
L("");
L(
  "Clean matches: B36 wall published, catalog OD within 0.15 mm, `ID > 0`, no STD/XS/S-alias caveat, and catalog `wt` within tolerance of theoretical mass from `od`+`t`.",
);
L("");
L("| schedule | nps | od | wt | t (mm) | ID (mm) | source note |");
L("| -------- | --- | -- | -- | ------ | ------- | ----------- |");
for (const r of A) {
  L(`| ${r.sch} | ${r.nps} | ${r.od} | ${r.wt} | ${r.t} | ${r.id.toFixed(2)} | ASME B36 nominal wall |`);
}
L("");
L("Catalog-ready `t` additions (schedule → nps → t):");
L("");
L("```");
const bySchA = {};
for (const r of A) (bySchA[r.sch] ||= []).push(r);
for (const sch of Object.keys(bySchA)) {
  L(`${sch}:`);
  for (const r of bySchA[sch]) {
    L(`  { nps: "${r.nps}", od: ${r.od}, wt: ${r.wt}, t: ${r.t} }`);
  }
}
L("```");
L("");
L("### B. Needs review");
L("");
L(
  "Includes: missing B36 wall for schedule×NPS; OD mismatch; STD/XS vs Sch 40/80 divergence; Sch *S vs non-S alias risk; Sch 30 small-NPS designation doubt; catalog `wt` far from theoretical mass for the proposed `t`.",
);
L("");
L("| schedule | nps | od | wt | proposed t (mm) | ID (mm) | review reason |");
L("| -------- | --- | -- | -- | --------------- | ------- | ------------- |");
for (const r of B) {
  const t = r.t != null ? r.t : "—";
  const id = r.id != null ? r.id.toFixed(2) : "—";
  L(`| ${r.sch} | ${r.nps} | ${r.od} | ${r.wt} | ${t} | ${id} | ${r.reason} |`);
}
L("");
L("## Conflict policy");
L("");
L("- **Do not rewrite** existing `od` or `wt` during Phase 2.");
L("- Only **add** `t` on accepted rows.");
L("- Skip rejected / unsigned bucket-B rows (leave without `t`; Phase 3 treats missing/`ID≤0` as fill mass 0 + geometry-unavailable).");
L("- If a bucket-B row is accepted, record the chosen `t` explicitly in Sign-off (may differ from the proposed column).");
L("");
L("## Out of scope");
L("");
L("- Deriving `t` from `wt` (steel density back-calc)");
L("- Loading `pipes.json` at runtime");
L("- Changing fittings / flanges / valves");
L("- Fill-media UI / mass math (Phase 3)");
L("- Appliance Ratio formula (S-03)");
L("");
L("## Sign-off");
L("");
L("| Field | Value |");
L("| ----- | ----- |");
L("| Reviewer | _pending_ |");
L("| Date | _pending_ |");
L("| Decision | _pending — accept all A / accept A+subset of B / reject_ |");
L("| Accepted set | _pending — e.g. “all A; B rows: …”_ |");
L("| Notes | _pending_ |");
L("");
L(
  "Phase 2 must not edit `data/piping_catalog.js` until this section (or an equivalent chat confirmation) records acceptance.",
);

const out = path.join("context/changes/pipe-fill-cargo-weight/wall-thickness-candidates.md");
fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
console.log("Wrote", out);
console.log({ total, A: A.length, B: B.length, b36Missing, odMismatch, wtSuspect });

const freq = {};
for (const r of B) {
  const key = r.reason.split(";")[0].slice(0, 90);
  freq[key] = (freq[key] || 0) + 1;
}
console.log(
  "B reason tops:",
  Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20),
);
