/**
 * Phase 2 automated spot-checks for nested fittings catalog.
 * Run: node context/changes/b16-9-fitting-catalog-schedule/_verify_p2.cjs
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "../../..");
const CATALOG = path.join(ROOT, "data/piping_catalog.js");
const CANDIDATES = path.join(__dirname, "fitting-weight-candidates.md");

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(CATALOG, "utf8"), ctx);
const f = ctx.window.PIPING_CATALOG.fittings;
const types = Object.keys(f);

const fails = [];
function ok(cond, msg) {
  if (!cond) fails.push(msg);
  else console.log("OK:", msg);
}

ok(!Array.isArray(f["90° LR Elbow"]), "90° LR Elbow is schedule object (not top-level array)");
ok(types.every((t) => !Array.isArray(f[t])), "no top-level fittings[type] arrays");

const lr6 = f["90° LR Elbow"]?.["Sch 40"]?.find((x) => x.nps === "6");
ok(lr6 && lr6.wt > 0, `90° LR Elbow Sch 40 NPS 6 wt>0 (got ${JSON.stringify(lr6)})`);

ok(!!f["180° LR Return"]?.["Sch 40"], "new type 180° LR Return has Sch 40");
ok(!!f["Lap Joint Stub End (Long)"]?.["STD"], "new type Lap Joint Stub End (Long) has STD");

for (const t of [
  "LR Reducing Elbow",
  "Reducing Tee",
  "Equal Cross",
  "Reducing Cross",
  "Lap Joint Stub End (Short)",
]) {
  ok(!(t in f), `deferred type absent: ${t}`);
}

for (const s of ["Sch 5", "Sch 10", "Sch 20", "Sch 60", "Sch 100"]) {
  ok(!f["90° LR Elbow"][s], `skipped schedule absent on LR Elbow: ${s}`);
}

// Spot-check a few Sign-off rows vs candidates md
const md = fs.readFileSync(CANDIDATES, "utf8");
const samples = [
  ["90° LR Elbow", "Sch 40", "6", 11.11],
  ["90° LR Elbow", "Sch 80", "6", 15.88],
  ["Concentric Reducer", "Sch 40", "8x6", 5.99],
  ["180° LR Return", "STD", "4", 8.39],
];
for (const [type, sch, nps, wt] of samples) {
  const row = f[type]?.[sch]?.find((x) => x.nps === nps);
  ok(row && row.wt === wt, `catalog matches Sign-off ${type} ${sch} ${nps}=${wt} (got ${row?.wt})`);
  const re = new RegExp(
    `\\| ${type.replace(/[°]/g, "\\$&")} \\| ${sch} \\| ${nps} \\| ${wt} \\|`
  );
  ok(re.test(md), `candidates md contains ${type} ${sch} ${nps} ${wt}`);
}

const header = fs.readFileSync(CATALOG, "utf8").slice(0, 500);
ok(
  header.includes("manufacturer charts") || header.includes("fitting-weight-candidates"),
  "file header mentions chart mass source"
);

if (fails.length) {
  console.error("\nFAILS:");
  for (const m of fails) console.error(" -", m);
  process.exit(1);
}
console.log(`\nAll checks passed (${types.length} types).`);
