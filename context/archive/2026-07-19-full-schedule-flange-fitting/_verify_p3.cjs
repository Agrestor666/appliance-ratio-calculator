/**
 * Phase 3 automated verification for full-schedule-flange-fitting.
 * Run: node context/changes/full-schedule-flange-fitting/_verify_p3.cjs
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "../../..");
const SRC = path.join(ROOT, "src/lib/data/piping-catalog.js");
const LEGACY = path.join(ROOT, "legacy/data/piping_catalog.js");
const CANDIDATES = path.join(__dirname, "schedule-weight-candidates.md");

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

function loadCatalog(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const exportIdx = src.indexOf("export const PIPING_CATALOG =");
  const windowIdx = src.indexOf("window.PIPING_CATALOG =");
  const start = exportIdx >= 0 ? exportIdx : windowIdx;
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

function main() {
  execFileSync(process.execPath, ["--check", SRC], { stdio: "inherit" });
  execFileSync(process.execPath, ["--check", LEGACY], { stdio: "inherit" });
  console.log("OK 3.1 node --check both catalogs");

  const src = loadCatalog(SRC);
  const leg = loadCatalog(LEGACY);

  const fitKeys = collectFittingSchedules(src.fittings);
  const wnKeys = collectWnSchedules(src.flanges["Weld Neck"]);
  assertSubset(fitKeys, "fittings");
  assertSubset(wnKeys, "Weld Neck");
  console.log(
    `OK 3.2 schedule keys ⊆ 18 (fittings=${fitKeys.size}, WN=${wnKeys.size})`
  );

  const red = src.fittings["Concentric Reducer"]["Sch 160"]?.find(
    (x) => x.nps === "6x4"
  );
  if (!red || red.wt !== 7.48) {
    throw new Error(`Spot-check fitting failed: ${JSON.stringify(red)}`);
  }
  const wn = src.flanges["Weld Neck"]["150"]["Sch 5S"]?.find((x) => x.nps === "6");
  if (!wn || wn.wt !== 10.2) {
    throw new Error(`Spot-check WN calc failed: ${JSON.stringify(wn)}`);
  }
  console.log("OK 3.3 spot-check fitting Sch 160 6x4=7.48 + WN 150 Sch 5S 6=10.2");

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
  console.log("OK 3.4 src↔legacy fittings + WN parity");

  const srcText = fs.readFileSync(SRC, "utf8");
  const legText = fs.readFileSync(LEGACY, "utf8");
  const cite = "full-schedule-flange-fitting/schedule-weight-candidates.md";
  if (!srcText.includes(cite) || !legText.includes(cite)) {
    throw new Error("Catalog headers missing candidates path citation");
  }
  if (!srcText.includes("calculated (ρ=7850") && !srcText.includes("ρ=7850")) {
    throw new Error("Catalog headers missing WN calc note");
  }
  console.log("OK headers cite candidates + WN calc (informational for 3.5)");

  // Chart keep smoke
  const std6 = src.flanges["Weld Neck"]["150"].STD.find((x) => x.nps === "6");
  if (!std6 || std6.wt !== 11.7) throw new Error("WN STD chart wiped");
  const sch40 = src.fittings["90° LR Elbow"]["Sch 40"].find((x) => x.nps === "6");
  if (!sch40 || sch40.wt !== 11.11) throw new Error("Fitting Sch 40 chart wiped");
  const sch80 = src.fittings["90° LR Elbow"]["Sch 80"].find((x) => x.nps === "6");
  if (!sch80 || sch80.wt !== 15.88) throw new Error("Fitting Sch 80 chart wiped");
  console.log("OK chart STD/40/80 preserved (informational for 3.6)");

  if (!fs.existsSync(CANDIDATES)) throw new Error("candidates missing");
  console.log("Phase 3 automated verification passed");
}

main();
