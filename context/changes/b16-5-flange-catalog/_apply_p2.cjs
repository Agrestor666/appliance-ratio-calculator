/**
 * Phase 2: apply Auto-apply + Conflict-accepted rows from
 * flange-weight-candidates.md into data/piping_catalog.js.
 *
 * Sign-off: accept all Conflicts → S1 chart_wt.
 * WN → class → schedule → [{nps,wt}]; SO/Blind → class → [{nps,wt}].
 * Deferred types (Socket Weld / Threaded / Lap Joint) left byte-stable.
 *
 * Run: node context/changes/b16-5-flange-catalog/_apply_p2.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");
const CANDIDATES = path.join(__dirname, "flange-weight-candidates.md");
const CATALOG = path.join(ROOT, "data/piping_catalog.js");

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

const NPS_ORDER = [
  "1/2",
  "3/4",
  "1",
  "1-1/4",
  "1-1/2",
  "2",
  "2-1/2",
  "3",
  "3-1/2",
  "4",
  "5",
  "6",
  "8",
  "10",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
  "24",
];

const CLASS_ORDER = ["150", "300", "600", "900", "1500", "2500"];

function npsRank(nps) {
  const i = NPS_ORDER.indexOf(nps);
  return i < 0 ? 999 : i;
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

function parseProposedRows(block) {
  const rows = [];
  for (const line of block.split("\n")) {
    if (!line.startsWith("| ")) continue;
    if (line.includes("| type |") || line.includes("| ----")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 6) continue;
    const [type, classId, schedule, nps, , chartWtStr] = cells;
    const wt = Number(chartWtStr);
    if (!type || !classId || !nps || !(wt > 0)) {
      throw new Error(`Bad row: ${line}`);
    }
    const sch = schedule === "—" || schedule === "-" || schedule === "" ? null : schedule;
    if (type === "Weld Neck") {
      if (!sch || !PIPE_KEYS.includes(sch)) {
        throw new Error(`WN row missing/invalid schedule: ${line}`);
      }
    } else if (sch != null) {
      throw new Error(`Non-WN row has schedule: ${line}`);
    }
    rows.push({ type, class: classId, schedule: sch, nps, wt });
  }
  return rows;
}

function parseRows(md) {
  const auto = sectionBlock(md, "### Auto-apply", ["### Conflict", "## Skipped"]);
  const conflict = sectionBlock(md, "### Conflict", ["## Skipped", "## Conflict policy"]);
  return [...parseProposedRows(auto), ...parseProposedRows(conflict)];
}

function buildCatalog(rows) {
  /** @type {Record<string, any>} */
  const out = {
    "Weld Neck": {},
    "Slip-On": {},
    Blind: {},
  };

  for (const r of rows) {
    if (r.type === "Weld Neck") {
      out["Weld Neck"][r.class] ??= {};
      out["Weld Neck"][r.class][r.schedule] ??= [];
      out["Weld Neck"][r.class][r.schedule].push({ nps: r.nps, wt: r.wt });
    } else {
      out[r.type][r.class] ??= [];
      out[r.type][r.class].push({ nps: r.nps, wt: r.wt });
    }
  }

  // Deduplicate + sort
  for (const classId of Object.keys(out["Weld Neck"])) {
    for (const sch of Object.keys(out["Weld Neck"][classId])) {
      const seen = new Set();
      out["Weld Neck"][classId][sch] = out["Weld Neck"][classId][sch]
        .filter((item) => {
          if (seen.has(item.nps)) return false;
          seen.add(item.nps);
          return true;
        })
        .sort((a, b) => npsRank(a.nps) - npsRank(b.nps));
    }
  }
  for (const type of ["Slip-On", "Blind"]) {
    for (const classId of Object.keys(out[type])) {
      const seen = new Set();
      out[type][classId] = out[type][classId]
        .filter((item) => {
          if (seen.has(item.nps)) return false;
          seen.add(item.nps);
          return true;
        })
        .sort((a, b) => npsRank(a.nps) - npsRank(b.nps));
    }
  }

  return out;
}

function formatWt(wt) {
  // Preserve chart precision; avoid trailing float noise
  if (Number.isInteger(wt)) return String(wt);
  const s = String(wt);
  return s;
}

function formatItems(items) {
  const parts = items.map((i) => `{nps:"${i.nps}",wt:${formatWt(i.wt)}}`);
  const lines = [];
  for (let i = 0; i < parts.length; i += 4) {
    lines.push("  " + parts.slice(i, i + 4).join(",") + (i + 4 < parts.length ? "," : ""));
  }
  return lines.join("\n");
}

function emitClassArrayBlock(byClass) {
  const classes = CLASS_ORDER.filter((c) => byClass[c] && byClass[c].length);
  const chunks = [];
  for (let i = 0; i < classes.length; i++) {
    const classId = classes[i];
    const comma = i < classes.length - 1 ? "," : "";
    chunks.push(`"${classId}": [\n${formatItems(byClass[classId])}\n]${comma}`);
  }
  return chunks.join("\n");
}

function emitWnClassBlock(byClass) {
  const classes = CLASS_ORDER.filter((c) => byClass[c]);
  const chunks = [];
  for (let ci = 0; ci < classes.length; ci++) {
    const classId = classes[ci];
    const bySch = byClass[classId];
    const schedules = PIPE_KEYS.filter((k) => bySch[k] && bySch[k].length);
    const classComma = ci < classes.length - 1 ? "," : "";
    const schChunks = [];
    for (let si = 0; si < schedules.length; si++) {
      const sch = schedules[si];
      const schComma = si < schedules.length - 1 ? "," : "";
      schChunks.push(`"${sch}": [\n${formatItems(bySch[sch])}\n]${schComma}`);
    }
    chunks.push(`"${classId}": {\n${schChunks.join("\n")}\n}${classComma}`);
  }
  return chunks.join("\n");
}

function emitCore3Block(built) {
  return (
    `"Weld Neck": {\n${emitWnClassBlock(built["Weld Neck"])}\n},\n` +
    `"Slip-On": {\n${emitClassArrayBlock(built["Slip-On"])}\n},\n` +
    `"Blind": {\n${emitClassArrayBlock(built.Blind)}\n},`
  );
}

function main() {
  const md = fs.readFileSync(CANDIDATES, "utf8");
  if (!md.includes("accept all") && !md.includes("Accept all")) {
    throw new Error("Sign-off does not appear to accept Conflicts — refusing to apply");
  }

  const rows = parseRows(md);
  console.log(`Parsed apply rows: ${rows.length}`);
  // 175 Auto-apply + 294 Conflict = 469
  if (rows.length !== 469) {
    console.warn(`Expected 469 rows (175+294); got ${rows.length}`);
  }

  const built = buildCatalog(rows);

  // Spot-checks before write
  const wn150std6 = built["Weld Neck"]["150"]?.STD?.find((x) => x.nps === "6");
  if (!wn150std6 || wn150std6.wt !== 11.7) {
    throw new Error(`Spot-check WN 150 STD NPS 6: got ${JSON.stringify(wn150std6)}`);
  }
  const wn150sch40 = built["Weld Neck"]["150"]?.["Sch 40"]?.find((x) => x.nps === "6");
  if (!wn150sch40 || wn150sch40.wt !== 11.7) {
    throw new Error(`Spot-check WN 150 Sch 40 NPS 6: got ${JSON.stringify(wn150sch40)}`);
  }
  if (built["Slip-On"]["2500"]) {
    throw new Error("Slip-On Class 2500 should be omitted (Skipped — no chart)");
  }
  const so150 = built["Slip-On"]["150"]?.find((x) => x.nps === "8");
  if (!so150 || so150.wt !== 13.5) {
    throw new Error(`Spot-check SO 150 NPS 8: got ${JSON.stringify(so150)}`);
  }

  let catalog = fs.readFileSync(CATALOG, "utf8");
  const nl = catalog.includes("\r\n") ? "\r\n" : "\n";

  // Header: clarify product family vs mass source
  catalog = catalog.replace(
    /\/\/ Flanges  : ASME B16\.5/,
    "// Flanges  : ASME B16.5 product family; masses from manufacturer charts\n//              (see flange-weight-candidates.md — not from B16.5 PDF)"
  );

  // Section comment
  catalog = catalog.replace(
    /\/\/ ─── FLANGES \(ASME B16\.5\) ────────────────────────────────────────────────────\r?\n\/\/ Items: \{ nps, wt \(kg\/pc\) \}/,
    [
      "// ─── FLANGES (ASME B16.5 product family) ─────────────────────────────────────",
      "// Masses: manufacturer/industry charts cited in",
      "// context/changes/b16-5-flange-catalog/flange-weight-candidates.md",
      "// (Wermac/Texas Flange primary, RF CS A105). Not from B16.5 PDF (dims only).",
      "// Shape: Weld Neck → class → schedule → [{ nps, wt }]; Slip-On/Blind/deferred →",
      "//         class → [{ nps, wt }]. WN schedule keys ⊆ pipe keys.",
      "// Items: { nps, wt (kg/pc) }",
    ].join(nl)
  );

  const coreStart = catalog.indexOf('"Weld Neck":');
  const deferredStart = catalog.indexOf('"Socket Weld":');
  if (coreStart < 0 || deferredStart < 0 || deferredStart <= coreStart) {
    throw new Error("Could not locate Weld Neck / Socket Weld boundaries");
  }

  const coreBlock = emitCore3Block(built).split("\n").join(nl) + nl;
  catalog = catalog.slice(0, coreStart) + coreBlock + catalog.slice(deferredStart);

  fs.writeFileSync(CATALOG, catalog, "utf8");
  console.log(`Wrote ${path.relative(ROOT, CATALOG)}`);

  // Summary
  for (const type of ["Weld Neck", "Slip-On", "Blind"]) {
    if (type === "Weld Neck") {
      const classes = CLASS_ORDER.filter((c) => built[type][c]);
      let n = 0;
      for (const c of classes) {
        for (const s of PIPE_KEYS) {
          n += built[type][c][s]?.length || 0;
        }
      }
      const schs = new Set();
      for (const c of classes) {
        for (const s of PIPE_KEYS) {
          if (built[type][c][s]?.length) schs.add(s);
        }
      }
      console.log(
        `  ${type}: classes=${classes.join(",")} schedules=[${[...schs].join(", ")}] rows=${n}`
      );
    } else {
      const classes = CLASS_ORDER.filter((c) => built[type][c]?.length);
      const n = classes.reduce((acc, c) => acc + built[type][c].length, 0);
      console.log(`  ${type}: classes=${classes.join(",")} rows=${n}`);
    }
  }
}

main();
