/**
 * Phase 2 automated spot-checks for flange catalog reshape.
 * Run: node context/changes/b16-5-flange-catalog/_verify_p2.cjs
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "../../..");
const CATALOG = path.join(ROOT, "data/piping_catalog.js");
const CANDIDATES = path.join(__dirname, "flange-weight-candidates.md");

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(CATALOG, "utf8"), ctx);
const flanges = ctx.window.PIPING_CATALOG.flanges;

const fails = [];
function ok(cond, msg) {
  if (!cond) fails.push(msg);
  else console.log("OK:", msg);
}

function isPlainObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

// Shape: SO / Blind = class → array
for (const type of ["Slip-On", "Blind"]) {
  ok(isPlainObject(flanges[type]), `${type} exists as object`);
  for (const classId of Object.keys(flanges[type])) {
    ok(
      Array.isArray(flanges[type][classId]),
      `${type} class ${classId} is NPS array`
    );
    ok(
      flanges[type][classId].every((r) => r.nps && typeof r.wt === "number"),
      `${type} class ${classId} rows have {nps,wt}`
    );
  }
}

// Shape: WN = class → schedule → array
ok(isPlainObject(flanges["Weld Neck"]), "Weld Neck exists as object");
for (const classId of Object.keys(flanges["Weld Neck"])) {
  const classVal = flanges["Weld Neck"][classId];
  ok(isPlainObject(classVal) && !Array.isArray(classVal), `WN class ${classId} is schedule object`);
  for (const sch of Object.keys(classVal)) {
    ok(Array.isArray(classVal[sch]), `WN ${classId} ${sch} is NPS array`);
  }
}

// Deferred types still present (unchanged shape)
for (const type of ["Socket Weld", "Threaded", "Lap Joint"]) {
  ok(!!flanges[type], `deferred type exists: ${type}`);
  ok(
    Object.values(flanges[type]).every((v) => Array.isArray(v)),
    `deferred ${type} stays class → array`
  );
}

// Slip-On 2500 omitted (Skipped)
ok(!flanges["Slip-On"]["2500"], "Slip-On Class 2500 omitted (no chart)");

// Sample Auto-apply / accepted Conflict chart_wt
const samples = [
  ["Weld Neck", "150", "STD", "6", 11.7],
  ["Weld Neck", "150", "Sch 40", "6", 11.7],
  ["Weld Neck", "150", "Sch 40S", "6", 11.7],
  ["Weld Neck", "150", "STD", "3-1/2", 5.4],
  ["Slip-On", "150", null, "8", 13.5],
  ["Slip-On", "150", null, "3-1/2", 4],
  ["Blind", "150", null, "8", 21.2],
  ["Blind", "150", null, "1/2", 0.9],
  ["Weld Neck", "2500", "STD", "12", 723.6],
];

for (const [type, classId, sch, nps, wt] of samples) {
  let row;
  if (type === "Weld Neck") {
    row = flanges[type]?.[classId]?.[sch]?.find((x) => x.nps === nps);
  } else {
    row = flanges[type]?.[classId]?.find((x) => x.nps === nps);
  }
  ok(row && row.wt === wt, `catalog ${type} ${classId} ${sch || "—"} ${nps}=${wt} (got ${row?.wt})`);
}

// No Class 400; no invent Sch 80 on WN
ok(
  !Object.keys(flanges["Weld Neck"]).includes("400") &&
    !Object.keys(flanges["Slip-On"]).includes("400") &&
    !Object.keys(flanges.Blind).includes("400"),
  "no Class 400"
);
ok(!flanges["Weld Neck"]["150"]["Sch 80"], "WN 150 has no Sch 80 (skipped)");
ok(!flanges["Weld Neck"]["150"]["XS"], "WN 150 has no XS (skipped)");

// Sch 40 only ≤10″
const sch40nps = (flanges["Weld Neck"]["150"]["Sch 40"] || []).map((r) => r.nps);
ok(!sch40nps.includes("12"), "WN 150 Sch 40 omits NPS 12+");
ok(sch40nps.includes("10"), "WN 150 Sch 40 includes NPS 10");

// Header / section comments
const src = fs.readFileSync(CATALOG, "utf8");
ok(
  src.includes("flange-weight-candidates") || src.includes("manufacturer charts"),
  "catalog mentions chart mass source"
);
ok(src.includes("class → schedule") || src.includes("schedule →"), "catalog documents WN nest shape");

// Deferred byte-stability: Socket Weld Class 150 NPS 2 still 1.4
const sw = flanges["Socket Weld"]["150"].find((x) => x.nps === "2");
ok(sw && sw.wt === 1.4, `Socket Weld 150 NPS 2 unchanged (got ${sw?.wt})`);

// Candidates md still has Sign-off accept-all
const md = fs.readFileSync(CANDIDATES, "utf8");
ok(md.includes("accept all") || md.includes("Accept all"), "candidates Sign-off accepts conflicts");

if (fails.length) {
  console.error("\nFAILS:");
  for (const m of fails) console.error(" -", m);
  process.exit(1);
}
console.log("\nAll Phase 2 checks passed.");
