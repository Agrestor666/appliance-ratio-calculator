/**
 * Phase 3: apply Accepted A+B+C rows from schedule-weight-candidates.md
 * into src/lib/data/piping-catalog.js and sync legacy/data/piping_catalog.js.
 *
 * Run: node context/changes/full-schedule-flange-fitting/_apply_p3.cjs
 *
 * - Fittings: merge chart + alias rows; never overwrite existing nps×schedule wt
 * - WN: merge calculated schedules; never overwrite chart STD / Sch 40 / Sch 40S
 * - Slip-On / Blind / deferred flanges untouched (byte-stable slice)
 * Re-runnable: skips already-present nps cells; safe if re-applied.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "../../..");
const CANDIDATES = path.join(__dirname, "schedule-weight-candidates.md");
const SRC_CATALOG = path.join(ROOT, "src/lib/data/piping-catalog.js");
const LEGACY_CATALOG = path.join(ROOT, "legacy/data/piping_catalog.js");

const PIPE_KEYS = [
  "Sch 5S",
  "Sch 5",
  "Sch 10S",
  "Sch 10",
  "Sch 20",
  "Sch 30",
  "Sch 40S",
  "Sch 40",
  "Sch 60",
  "Sch 80S",
  "Sch 80",
  "Sch 100",
  "Sch 120",
  "Sch 140",
  "Sch 160",
  "STD",
  "XS",
  "XXS",
];

const TYPE_ORDER = [
  "90° LR Elbow",
  "90° SR Elbow",
  "45° LR Elbow",
  "180° LR Return",
  "180° SR Return",
  "90° 3D Elbow",
  "45° 3D Elbow",
  "Equal Tee",
  "Cap",
  "Concentric Reducer",
  "Eccentric Reducer",
  "Lap Joint Stub End (Long)",
];

const CLASS_ORDER = ["150", "300", "600", "900", "1500", "2500"];
const WN_CHART_KEEP = new Set(["STD", "Sch 40", "Sch 40S"]);

const EXPECTED = { A: 118, B: 108, C: 1280 };

function npsOrderKey(nps) {
  const frac = (p) => {
    if (p.includes("-")) {
      const [a, b] = p.split("-");
      const [n, d] = b.split("/").map(Number);
      return Number(a) + n / d;
    }
    if (p.includes("/")) {
      const [n, d] = p.split("/").map(Number);
      return n / d;
    }
    return Number(p);
  };
  if (String(nps).includes("x")) {
    const [L, S] = String(nps).split("x");
    return frac(L) * 1000 + frac(S);
  }
  return frac(String(nps));
}

function sectionBlock(md, heading, endMarkers) {
  const start = md.indexOf(heading);
  if (start < 0) throw new Error(`Missing section ${heading}`);
  let end = md.length;
  for (const marker of endMarkers) {
    const i = md.indexOf(marker, start + heading.length);
    if (i >= 0 && i < end) end = i;
  }
  return md.slice(start, end);
}

function parseFittingRows(block) {
  const rows = [];
  for (const line of block.split("\n")) {
    if (!line.startsWith("| ")) continue;
    if (line.includes("| kind |") || line.includes("| ---")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 5) continue;
    const [kind, type, schedule, nps, wtStr] = cells;
    if (kind !== "fitting") continue;
    const wt = Number(wtStr);
    if (!type || !schedule || !nps || !(wt > 0)) {
      throw new Error(`Bad fitting row: ${line}`);
    }
    if (!PIPE_KEYS.includes(schedule)) {
      throw new Error(`Non-pipe schedule key: ${schedule}`);
    }
    rows.push({ kind, type, schedule, nps, wt });
  }
  return rows;
}

function parseWnRows(block) {
  const rows = [];
  for (const line of block.split("\n")) {
    if (!line.startsWith("| ")) continue;
    if (line.includes("| kind |") || line.includes("| ---")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 5) continue;
    const [kind, classId, schedule, nps, wtStr] = cells;
    if (kind !== "wn") continue;
    const wt = Number(wtStr);
    if (!classId || !schedule || !nps || !(wt > 0)) {
      throw new Error(`Bad WN row: ${line}`);
    }
    if (!PIPE_KEYS.includes(schedule)) {
      throw new Error(`Non-pipe schedule key: ${schedule}`);
    }
    if (WN_CHART_KEEP.has(schedule)) {
      throw new Error(`WN row must not target chart-keep schedule: ${line}`);
    }
    rows.push({ kind, class: classId, schedule, nps, wt });
  }
  return rows;
}

function parseAccepted(md) {
  const hasDecision = /\*\*Decision:\*\*\s*Accept all\b/m.test(md);
  const hasCheckbox = /^- \[x\] \*\*Accept all\*\*/m.test(md);
  if (!hasDecision || !hasCheckbox) {
    throw new Error(
      "Sign-off must have both checked Accept all and Decision: Accept all — refusing to apply"
    );
  }
  const a = sectionBlock(md, "### A. Recommended", ["### B. Needs review", "## Skipped"]);
  const b = sectionBlock(md, "### B. Needs review", [
    "### C. Weld Neck",
    "## Skipped",
  ]);
  const c = sectionBlock(md, "### C. Weld Neck", ["## Skipped", "## Alias notes"]);
  const fittingRows = [...parseFittingRows(a), ...parseFittingRows(b)];
  const wnRows = parseWnRows(c);
  return {
    fittingRows,
    wnRows,
    counts: {
      A: parseFittingRows(a).length,
      B: parseFittingRows(b).length,
      C: wnRows.length,
    },
  };
}

function loadCatalogObject(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const exportIdx = src.indexOf("export const PIPING_CATALOG =");
  const windowIdx = src.indexOf("window.PIPING_CATALOG =");
  const start = exportIdx >= 0 ? exportIdx : windowIdx;
  if (start < 0) throw new Error(`No PIPING_CATALOG in ${filePath}`);
  const objStart = src.indexOf("{", start);
  const end = src.lastIndexOf("};");
  return vm.runInNewContext("(" + src.slice(objStart, end + 1) + ")");
}

function sortItems(items) {
  return items.slice().sort((a, b) => npsOrderKey(a.nps) - npsOrderKey(b.nps));
}

function mergeFittingRows(fittings, rows) {
  let added = 0;
  let skippedExisting = 0;
  for (const r of rows) {
    if (!fittings[r.type]) {
      throw new Error(`Unknown fitting type: ${r.type}`);
    }
    fittings[r.type][r.schedule] ??= [];
    const arr = fittings[r.type][r.schedule];
    const existing = arr.find((x) => x.nps === r.nps);
    if (existing) {
      if (existing.wt !== r.wt) {
        throw new Error(
          `Conflict: ${r.type} ${r.schedule} ${r.nps} catalog=${existing.wt} proposed=${r.wt}`
        );
      }
      skippedExisting++;
      continue;
    }
    arr.push({ nps: r.nps, wt: r.wt });
    added++;
  }
  for (const type of Object.keys(fittings)) {
    for (const sch of Object.keys(fittings[type])) {
      fittings[type][sch] = sortItems(fittings[type][sch]);
    }
  }
  return { added, skippedExisting };
}

function snapshotWnChart(wn) {
  /** @type {Record<string, Record<string, Record<string, number>>>} */
  const snap = {};
  for (const classId of CLASS_ORDER) {
    snap[classId] = {};
    for (const sch of WN_CHART_KEEP) {
      snap[classId][sch] = {};
      for (const item of wn[classId]?.[sch] || []) {
        snap[classId][sch][item.nps] = item.wt;
      }
    }
  }
  return snap;
}

function assertWnChartUntouched(wn, snap) {
  for (const classId of CLASS_ORDER) {
    for (const sch of WN_CHART_KEEP) {
      const before = snap[classId][sch];
      const afterItems = wn[classId]?.[sch] || [];
      if (Object.keys(before).length !== afterItems.length) {
        throw new Error(`WN chart wiped/resized: ${classId} ${sch}`);
      }
      for (const item of afterItems) {
        if (before[item.nps] !== item.wt) {
          throw new Error(
            `WN chart overwritten: ${classId} ${sch} ${item.nps} ${before[item.nps]} → ${item.wt}`
          );
        }
      }
    }
  }
}

function assertNestParity(srcNest, legNest, label) {
  if (JSON.stringify(srcNest) !== JSON.stringify(legNest)) {
    throw new Error(`Post-write ${label} src↔legacy parity failed`);
  }
}

function mergeWnRows(wn, rows) {
  let added = 0;
  let skippedExisting = 0;
  for (const r of rows) {
    if (!wn[r.class]) throw new Error(`Unknown WN class: ${r.class}`);
    if (WN_CHART_KEEP.has(r.schedule)) {
      throw new Error(`Refusing to write chart-keep schedule ${r.schedule}`);
    }
    wn[r.class][r.schedule] ??= [];
    const arr = wn[r.class][r.schedule];
    const existing = arr.find((x) => x.nps === r.nps);
    if (existing) {
      if (existing.wt !== r.wt) {
        throw new Error(
          `Conflict: WN ${r.class} ${r.schedule} ${r.nps} catalog=${existing.wt} proposed=${r.wt}`
        );
      }
      skippedExisting++;
      continue;
    }
    arr.push({ nps: r.nps, wt: r.wt });
    added++;
  }
  for (const classId of Object.keys(wn)) {
    for (const sch of Object.keys(wn[classId])) {
      wn[classId][sch] = sortItems(wn[classId][sch]);
    }
  }
  return { added, skippedExisting };
}

function formatWt(wt) {
  if (Number.isInteger(wt)) return String(wt);
  return String(wt);
}

function formatItems(items) {
  const parts = items.map((i) => `{nps:"${i.nps}",wt:${formatWt(i.wt)}}`);
  const lines = [];
  for (let i = 0; i < parts.length; i += 4) {
    lines.push(
      "  " + parts.slice(i, i + 4).join(",") + (i + 4 < parts.length ? "," : "")
    );
  }
  return lines.join("\n");
}

function emitFittingsBlock(fittings) {
  const types = [
    ...TYPE_ORDER.filter((t) => fittings[t]),
    ...Object.keys(fittings)
      .filter((t) => !TYPE_ORDER.includes(t))
      .sort(),
  ];
  const chunks = [];
  chunks.push(
    `// ─── FITTINGS (ASME B16.9 BW product family) ────────────────────────────────\n` +
      `// Masses: manufacturer/industry charts cited in\n` +
      `// context/archive/2026-07-18-b16-9-fitting-catalog-schedule/fitting-weight-candidates.md\n` +
      `// and context/changes/full-schedule-flange-fitting/schedule-weight-candidates.md\n` +
      `// (Wermac/Hackney Ladish primary). Not from B16.9 PDF (dims only).\n` +
      `// Shape: fittings[type][schedule] = [{ nps, wt (kg/pc) }] — schedule keys ⊆ pipe keys.\n` +
      `fittings: {`
  );
  for (let ti = 0; ti < types.length; ti++) {
    const type = types[ti];
    const bySch = fittings[type];
    const schedules = PIPE_KEYS.filter((k) => bySch[k]?.length);
    chunks.push(`"${type}": {`);
    for (let si = 0; si < schedules.length; si++) {
      const sch = schedules[si];
      const comma = si < schedules.length - 1 ? "," : "";
      chunks.push(`"${sch}": [\n${formatItems(bySch[sch])}\n]${comma}`);
    }
    const typeComma = ti < types.length - 1 ? "," : "";
    chunks.push(`}${typeComma}`);
  }
  chunks.push(`},`);
  return chunks.join("\n");
}

function emitWnBlock(wn) {
  const chunks = [];
  for (let ci = 0; ci < CLASS_ORDER.length; ci++) {
    const classId = CLASS_ORDER[ci];
    const bySch = wn[classId];
    if (!bySch) continue;
    const schedules = PIPE_KEYS.filter((k) => bySch[k]?.length);
    const classComma = ci < CLASS_ORDER.length - 1 ? "," : "";
    const schChunks = [];
    for (let si = 0; si < schedules.length; si++) {
      const sch = schedules[si];
      const schComma = si < schedules.length - 1 ? "," : "";
      schChunks.push(`"${sch}": [\n${formatItems(bySch[sch])}\n]${schComma}`);
    }
    chunks.push(`"${classId}": {\n${schChunks.join("\n")}\n}${classComma}`);
  }
  return `"Weld Neck": {\n${chunks.join("\n")}\n},`;
}

function emitFlangesHeader() {
  return [
    "// ─── FLANGES (ASME B16.5 product family) ─────────────────────────────────────",
    "// Masses: manufacturer/industry charts cited in",
    "// context/archive/2026-07-18-b16-5-flange-catalog/flange-weight-candidates.md",
    "// and context/changes/full-schedule-flange-fitting/schedule-weight-candidates.md",
    "// (Wermac/Texas Flange primary, RF CS A105). Not from B16.5 PDF (dims only).",
    "// WN non-baseline schedules (beyond chart STD / Sch 40 / Sch 40S) may be",
    "// calculated (ρ=7850, L=wn thk) per schedule-weight-candidates.md Sign-off.",
    "// Shape: Weld Neck → class → schedule → [{ nps, wt }]; Slip-On/Blind/deferred →",
    "//         class → [{ nps, wt }]. WN schedule keys ⊆ pipe keys.",
    "// Items: { nps, wt (kg/pc) }",
  ].join("\n");
}

function applyToFile(filePath, fittingsBlock, wnBlock, flangesHeader) {
  let catalog = fs.readFileSync(filePath, "utf8");
  const nl = catalog.includes("\r\n") ? "\r\n" : "\n";

  // Top-of-file mass source lines
  catalog = catalog.replace(
    /\/\/ Flanges  : ASME B16\.5 product family; masses from manufacturer charts\r?\n\/\/              \(see flange-weight-candidates\.md — not from B16\.5 PDF\)/,
    [
      "// Flanges  : ASME B16.5 product family; masses from manufacturer charts + WN calc",
      "//              (see schedule-weight-candidates.md / flange-weight-candidates.md)",
    ].join(nl)
  );
  catalog = catalog.replace(
    /\/\/ Fittings : ASME B16\.9 BW product family; masses from manufacturer charts\r?\n\/\/              \(see fitting-weight-candidates\.md — not from B16\.9 PDF\)/,
    [
      "// Fittings : ASME B16.9 BW product family; masses from manufacturer charts",
      "//              (see schedule-weight-candidates.md / fitting-weight-candidates.md)",
    ].join(nl)
  );

  const fitStart = catalog.indexOf("// ─── FITTINGS (ASME B16.9 BW product family)");
  const flgStart = catalog.indexOf("// ─── FLANGES (ASME B16.5 product family)");
  if (fitStart < 0 || flgStart < 0 || flgStart <= fitStart) {
    throw new Error(`Could not locate fittings/flanges markers in ${filePath}`);
  }
  catalog =
    catalog.slice(0, fitStart) +
    fittingsBlock.split("\n").join(nl) +
    nl +
    nl +
    catalog.slice(flgStart);

  // Refresh flanges section header comments (between FLANGES marker and flanges:)
  const flgMark = catalog.indexOf("// ─── FLANGES (ASME B16.5 product family)");
  const flangesKey = catalog.indexOf("flanges: {", flgMark);
  if (flgMark < 0 || flangesKey < 0) {
    throw new Error(`Could not locate flanges header in ${filePath}`);
  }
  catalog =
    catalog.slice(0, flgMark) +
    flangesHeader.split("\n").join(nl) +
    nl +
    catalog.slice(flangesKey);

  const wnStart = catalog.indexOf('"Weld Neck":');
  const soStart = catalog.indexOf('"Slip-On":');
  if (wnStart < 0 || soStart < 0 || soStart <= wnStart) {
    throw new Error(`Could not locate Weld Neck / Slip-On in ${filePath}`);
  }
  catalog =
    catalog.slice(0, wnStart) +
    wnBlock.split("\n").join(nl) +
    nl +
    catalog.slice(soStart);

  fs.writeFileSync(filePath, catalog, "utf8");
}

function main() {
  const md = fs.readFileSync(CANDIDATES, "utf8");
  const { fittingRows, wnRows, counts } = parseAccepted(md);
  console.log(`Parsed A=${counts.A} B=${counts.B} C=${counts.C}`);
  if (counts.A !== EXPECTED.A || counts.B !== EXPECTED.B || counts.C !== EXPECTED.C) {
    throw new Error(
      `Row count mismatch: expected A=${EXPECTED.A} B=${EXPECTED.B} C=${EXPECTED.C}`
    );
  }

  const cat = loadCatalogObject(SRC_CATALOG);
  const chartSnap = snapshotWnChart(cat.flanges["Weld Neck"]);

  // Spot-check baselines before merge
  const lrStd6 = cat.fittings["90° LR Elbow"].STD.find((x) => x.nps === "6");
  if (!lrStd6 || lrStd6.wt !== 11.11) {
    throw new Error(`Pre-check failed: 90° LR Elbow STD 6 = ${JSON.stringify(lrStd6)}`);
  }
  const wn150std6 = cat.flanges["Weld Neck"]["150"].STD.find((x) => x.nps === "6");
  if (!wn150std6 || wn150std6.wt !== 11.7) {
    throw new Error(`Pre-check failed: WN 150 STD 6 = ${JSON.stringify(wn150std6)}`);
  }

  const fitMerge = mergeFittingRows(cat.fittings, fittingRows);
  const wnMerge = mergeWnRows(cat.flanges["Weld Neck"], wnRows);
  assertWnChartUntouched(cat.flanges["Weld Neck"], chartSnap);

  console.log(
    `Fittings merge: added=${fitMerge.added} alreadyPresent=${fitMerge.skippedExisting}`
  );
  console.log(
    `WN merge: added=${wnMerge.added} alreadyPresent=${wnMerge.skippedExisting}`
  );

  // Post spot-checks from Accepted set
  const red160 = cat.fittings["Concentric Reducer"]["Sch 160"]?.find(
    (x) => x.nps === "6x4"
  );
  if (!red160 || red160.wt !== 7.48) {
    throw new Error(`Spot-check fitting Sch 160 6x4: ${JSON.stringify(red160)}`);
  }
  const ret40s = cat.fittings["180° LR Return"]["Sch 40S"]?.find((x) => x.nps === "6");
  if (!ret40s || ret40s.wt !== 22.68) {
    throw new Error(`Spot-check alias Sch 40S 6: ${JSON.stringify(ret40s)}`);
  }
  const wn150s5s = cat.flanges["Weld Neck"]["150"]["Sch 5S"]?.find((x) => x.nps === "6");
  if (!wn150s5s || wn150s5s.wt !== 10.2) {
    throw new Error(`Spot-check WN calc 150 Sch 5S 6: ${JSON.stringify(wn150s5s)}`);
  }
  // Chart keep
  const wn150std6b = cat.flanges["Weld Neck"]["150"].STD.find((x) => x.nps === "6");
  if (wn150std6b.wt !== 11.7) throw new Error("WN STD chart wiped");

  const fittingsBlock = emitFittingsBlock(cat.fittings);
  const wnBlock = emitWnBlock(cat.flanges["Weld Neck"]);
  const flangesHeader = emitFlangesHeader();

  applyToFile(SRC_CATALOG, fittingsBlock, wnBlock, flangesHeader);
  applyToFile(LEGACY_CATALOG, fittingsBlock, wnBlock, flangesHeader);

  const srcWritten = loadCatalogObject(SRC_CATALOG);
  const legWritten = loadCatalogObject(LEGACY_CATALOG);
  assertNestParity(srcWritten.fittings, legWritten.fittings, "fittings");
  assertNestParity(
    srcWritten.flanges["Weld Neck"],
    legWritten.flanges["Weld Neck"],
    "Weld Neck"
  );
  assertNestParity(
    srcWritten.flanges["Slip-On"],
    legWritten.flanges["Slip-On"],
    "Slip-On"
  );
  assertNestParity(srcWritten.flanges.Blind, legWritten.flanges.Blind, "Blind");

  console.log(`Wrote ${path.relative(ROOT, SRC_CATALOG)}`);
  console.log(`Wrote ${path.relative(ROOT, LEGACY_CATALOG)}`);
  console.log("OK post-write src↔legacy parity (fittings + WN + SO + Blind)");
}

main();
