/**
 * Phase 4 automated verification for full-schedule-flange-fitting.
 * Run: node context/changes/full-schedule-flange-fitting/_verify_p4.cjs
 *
 * Checks: schedule keys ⊆ pipe keys; src↔legacy parity; Accepted spot-checks;
 * recomputes one WN sample via locked Δm formula vs catalog.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "../../..");
const SRC = path.join(ROOT, "src/lib/data/piping-catalog.js");
const LEGACY = path.join(ROOT, "legacy/data/piping_catalog.js");
const CANDIDATES = path.join(__dirname, "schedule-weight-candidates.md");
const FLANGES_DIR = path.join(ROOT, "flanges");

const RHO = 7850;
const WT_FLOOR = 0.01;

const PIPE_KEYS = new Set([
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
]);

/** Spot-check: WN Class 150 / Sch 5S / NPS 6 → Accepted 10.2 */
const WN_SAMPLE = { classId: "150", schedule: "Sch 5S", nps: "6", expectedWt: 10.2 };
const WN_CHART_KEEP = new Set(["STD", "Sch 40", "Sch 40S"]);

function loadCatalog(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const exportIdx = src.indexOf("export const PIPING_CATALOG =");
  const windowIdx = src.indexOf("window.PIPING_CATALOG =");
  const start = exportIdx >= 0 ? exportIdx : windowIdx;
  if (start < 0) throw new Error(`No PIPING_CATALOG in ${filePath}`);
  const objStart = src.indexOf("{", start);
  const end = src.lastIndexOf("};");
  return vm.runInNewContext("(" + src.slice(objStart, end + 1) + ")");
}

function scheduleKeys(obj) {
  return Object.keys(obj || {});
}

function collectFittingSchedules(fittings) {
  const keys = new Set();
  for (const type of Object.keys(fittings)) {
    for (const sch of scheduleKeys(fittings[type])) keys.add(sch);
  }
  return keys;
}

function collectWnSchedules(wn) {
  const keys = new Set();
  for (const classId of Object.keys(wn)) {
    for (const sch of scheduleKeys(wn[classId])) keys.add(sch);
  }
  return keys;
}

function assertSubset(keys, label) {
  for (const k of keys) {
    if (!PIPE_KEYS.has(k)) throw new Error(`${label}: illegal schedule key ${k}`);
  }
}

function keySetEqual(a, b, label) {
  const as = [...a].sort().join("|");
  const bs = [...b].sort().join("|");
  if (as !== bs) throw new Error(`${label} key-set mismatch\n src: ${as}\n leg: ${bs}`);
}

function deepSchParity(srcNest, legNest, label) {
  const srcTypes = Object.keys(srcNest).sort();
  const legTypes = Object.keys(legNest).sort();
  if (srcTypes.join("|") !== legTypes.join("|")) {
    throw new Error(`${label}: top-level keys differ`);
  }
  for (const t of srcTypes) {
    const sKeys = Object.keys(srcNest[t]).sort();
    const lKeys = Object.keys(legNest[t]).sort();
    if (sKeys.join("|") !== lKeys.join("|")) {
      throw new Error(`${label}: ${t} schedule keys differ`);
    }
    for (const sch of sKeys) {
      const sArr = srcNest[t][sch];
      const lArr = legNest[t][sch];
      if (JSON.stringify(sArr) !== JSON.stringify(lArr)) {
        throw new Error(`${label}: ${t} ${sch} row data differs`);
      }
    }
  }
}

function csvNbToNps(nb) {
  const s = String(nb).trim();
  if (s.startsWith("0+")) return s.slice(2);
  return s.replace(/\+/g, "-");
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQ = !inQ;
      continue;
    }
    if (ch === "," && !inQ) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

/** Load wn thk (mm) by catalog NPS from flanges/FLG{class}.csv */
function loadWnThkByNps(cls) {
  const file = path.join(FLANGES_DIR, `FLG${cls}.csv`);
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const header = parseCsvLine(lines[1]);
  const thkIdx = header.indexOf("wn thk");
  const nbIdx = header.indexOf("nb");
  if (thkIdx < 0 || nbIdx < 0) throw new Error(`FLG${cls}.csv: missing wn thk/nb`);
  const map = new Map();
  for (let i = 2; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const nps = csvNbToNps(cols[nbIdx]);
    const raw = cols[thkIdx];
    if (raw == null || raw === "" || raw === "N/A") continue;
    const thk = Number(raw);
    if (!Number.isFinite(thk) || thk <= 0) continue;
    map.set(nps, thk);
  }
  return map;
}

function pipeRow(catalog, schedule, nps) {
  const rows = catalog.pipes[schedule];
  if (!rows) return null;
  return rows.find((r) => r.nps === nps) || null;
}

/** Locked WN Δm model (same as _gen_candidates.cjs). */
function calcWnWt(wtStd, odMm, tStdMm, tSchMm, lMm) {
  const idStdM = (odMm - 2 * tStdMm) / 1000;
  const idSchM = (odMm - 2 * tSchMm) / 1000;
  const lM = lMm / 1000;
  const dV = (Math.PI / 4) * lM * (idStdM * idStdM - idSchM * idSchM);
  const dM = RHO * dV;
  const wt = Math.max(wtStd + dM, WT_FLOOR);
  return Math.round(wt * 10) / 10;
}

function main() {
  execFileSync(process.execPath, ["--check", SRC], { stdio: "inherit" });
  execFileSync(process.execPath, ["--check", LEGACY], { stdio: "inherit" });
  execFileSync(process.execPath, ["--check", __filename], { stdio: "inherit" });
  console.log("OK parse: catalogs + _verify_p4.cjs");

  const src = loadCatalog(SRC);
  const leg = loadCatalog(LEGACY);

  const fitKeys = collectFittingSchedules(src.fittings);
  const wnKeys = collectWnSchedules(src.flanges["Weld Neck"]);
  assertSubset(fitKeys, "fittings");
  assertSubset(wnKeys, "Weld Neck");
  console.log(
    `OK schedule keys ⊆ 18 (fittings=${fitKeys.size}, WN=${wnKeys.size})`
  );

  keySetEqual(
    collectFittingSchedules(src.fittings),
    collectFittingSchedules(leg.fittings),
    "fittings schedule union"
  );
  keySetEqual(
    collectWnSchedules(src.flanges["Weld Neck"]),
    collectWnSchedules(leg.flanges["Weld Neck"]),
    "WN schedule union"
  );
  deepSchParity(src.fittings, leg.fittings, "fittings");
  deepSchParity(src.flanges["Weld Neck"], leg.flanges["Weld Neck"], "Weld Neck");
  console.log("OK src↔legacy fittings + WN parity");

  const red = src.fittings["Concentric Reducer"]["Sch 160"]?.find(
    (x) => x.nps === "6x4"
  );
  if (!red || red.wt !== 7.48) {
    throw new Error(`Spot-check fitting Sch 160 6x4 failed: ${JSON.stringify(red)}`);
  }
  const ret40s = src.fittings["180° LR Return"]["Sch 40S"]?.find(
    (x) => x.nps === "6"
  );
  if (!ret40s || ret40s.wt !== 22.68) {
    throw new Error(`Spot-check fitting alias Sch 40S failed: ${JSON.stringify(ret40s)}`);
  }
  const wnCat = src.flanges["Weld Neck"][WN_SAMPLE.classId][WN_SAMPLE.schedule]?.find(
    (x) => x.nps === WN_SAMPLE.nps
  );
  if (!wnCat || wnCat.wt !== WN_SAMPLE.expectedWt) {
    throw new Error(
      `Spot-check WN catalog failed: expected ${WN_SAMPLE.expectedWt}, got ${JSON.stringify(wnCat)}`
    );
  }
  console.log(
    "OK spot-check fitting Sch 160 6x4=7.48 + alias Sch 40S 6=22.68 + WN 150 Sch 5S 6=10.2"
  );

  // Recompute every non-chart WN cell from locked formula
  const thkCache = new Map();
  let checked = 0;
  for (const classId of Object.keys(src.flanges["Weld Neck"])) {
    const bySch = src.flanges["Weld Neck"][classId];
    const stdArr = bySch.STD || [];
    if (!thkCache.has(classId)) thkCache.set(classId, loadWnThkByNps(classId));
    const thkByNps = thkCache.get(classId);
    for (const sch of Object.keys(bySch)) {
      if (WN_CHART_KEEP.has(sch)) continue;
      for (const item of bySch[sch]) {
        const stdItem = stdArr.find((x) => x.nps === item.nps);
        const stdPipe = pipeRow(src, "STD", item.nps);
        const schPipe = pipeRow(src, sch, item.nps);
        const lMm = thkByNps.get(item.nps);
        if (!stdItem || !stdPipe || !schPipe || lMm == null) {
          throw new Error(
            `WN calc inputs missing: ${classId} ${sch} ${item.nps}`
          );
        }
        const od = Number(stdPipe.od);
        const odSch = Number(schPipe.od);
        if (od !== odSch) {
          throw new Error(
            `OD mismatch ${classId} ${sch} ${item.nps}: STD=${od} sch=${odSch}`
          );
        }
        const got = calcWnWt(
          stdItem.wt,
          od,
          Number(stdPipe.t),
          Number(schPipe.t),
          lMm
        );
        if (got !== item.wt) {
          throw new Error(
            `WN formula drift: ${classId} ${sch} ${item.nps} catalog=${item.wt} recomputed=${got}`
          );
        }
        checked++;
      }
    }
  }
  if (checked < 1) throw new Error("No non-chart WN cells to recompute");
  const sampleOk =
    src.flanges["Weld Neck"][WN_SAMPLE.classId][WN_SAMPLE.schedule]?.find(
      (x) => x.nps === WN_SAMPLE.nps
    )?.wt === WN_SAMPLE.expectedWt;
  if (!sampleOk) throw new Error("WN sample spot-check lost after full recompute");
  console.log(
    `OK WN formula recompute all non-chart cells (${checked}); sample ${WN_SAMPLE.classId} ${WN_SAMPLE.schedule} ${WN_SAMPLE.nps}=${WN_SAMPLE.expectedWt}`
  );

  // Chart keep + Slip-On / Blind unchanged (flat nest + chart masses)
  const std6 = src.flanges["Weld Neck"]["150"].STD.find((x) => x.nps === "6");
  if (!std6 || std6.wt !== 11.7) throw new Error("WN STD chart wiped");

  function assertFlatFlange(type, cat, label) {
    const group = cat.flanges[type];
    if (!group) throw new Error(`${label}: missing ${type}`);
    for (const classId of Object.keys(group)) {
      if (!Array.isArray(group[classId])) {
        throw new Error(`${label}: ${type} ${classId} is not a flat array`);
      }
    }
  }
  assertFlatFlange("Slip-On", src, "src");
  assertFlatFlange("Blind", src, "src");
  deepSchParity(src.flanges["Slip-On"], leg.flanges["Slip-On"], "Slip-On");
  deepSchParity(src.flanges.Blind, leg.flanges.Blind, "Blind");

  const so8 = src.flanges["Slip-On"]["150"].find((x) => x.nps === "8");
  const bl8 = src.flanges.Blind["150"].find((x) => x.nps === "8");
  if (!so8 || so8.wt !== 13.5) {
    throw new Error(`SO 150 NPS 8 wiped: ${JSON.stringify(so8)}`);
  }
  if (!bl8 || bl8.wt !== 21.2) {
    throw new Error(`Blind 150 NPS 8 wiped: ${JSON.stringify(bl8)}`);
  }
  console.log("OK chart STD preserved; Slip-On/Blind flat + parity + spot masses");

  if (!fs.existsSync(CANDIDATES)) throw new Error("candidates missing");
  const md = fs.readFileSync(CANDIDATES, "utf8");
  const hasDecision = /\*\*Decision:\*\*\s*Accept all\b/m.test(md);
  const hasCheckbox = /^- \[x\] \*\*Accept all\*\*/m.test(md);
  if (!hasDecision || !hasCheckbox) {
    throw new Error("Sign-off must have both checked Accept all and Decision: Accept all");
  }
  console.log("Phase 4 automated verification passed");
}

main();
