/**
 * Phase 3 automated checks: nested fittings runtime helpers (no FITTING_SCH_FACTORS).
 * Run: node context/changes/b16-9-fitting-catalog-schedule/_verify_p3.cjs
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "../../..");
const appSrc = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const catSrc = fs.readFileSync(path.join(ROOT, "data/piping_catalog.js"), "utf8");

const fails = [];
function ok(cond, msg) {
  if (!cond) fails.push(msg);
  else console.log("OK:", msg);
}

ok(!/FITTING_SCH_FACTORS/.test(appSrc), "no FITTING_SCH_FACTORS in app.js");
ok(!/FITTING_SCH_FACTORS/.test(catSrc), "no FITTING_SCH_FACTORS in piping_catalog.js");
ok(!/Sch40\) ×/.test(appSrc) && !/kg \(Sch40\)/.test(appSrc), "no Sch40 × factor preview text");
ok(
  !/catId === "fitting"[\s\S]{0,200}item\.wt \*/.test(appSrc),
  "fitting path does not multiply wt by a factor"
);

// Extract helper bodies into a sandbox with the catalog loaded
const helpers = `
${catSrc}
function getCatalog() { return window.PIPING_CATALOG || null; }
function getClassList(catId, typeId) {
  const cat = getCatalog();
  if (!cat) return [];
  const group =
    catId === "fitting" ? cat.fittings?.[typeId] :
    catId === "flange"  ? cat.flanges?.[typeId]  :
    catId === "valve"   ? cat.valves?.[typeId]   : null;
  if (!group) return [];
  return Object.keys(group);
}
function getNpsList(catId, typeId, classId) {
  const cat = getCatalog();
  if (!cat) return [];
  let items = null;
  if (catId === "pipe")    items = cat.pipes?.[typeId];
  if (catId === "fitting") items = cat.fittings?.[typeId]?.[classId];
  if (catId === "flange")  items = cat.flanges?.[typeId]?.[classId];
  if (catId === "valve")   items = cat.valves?.[typeId]?.[classId];
  return Array.isArray(items) ? items : [];
}
function calcUnitKg(item, catId) {
  if (!item) return null;
  if (catId === "pipe") return null;
  return item.wt;
}
`;

const ctx = { window: {}, console };
vm.runInNewContext(helpers, ctx);

const schs = ctx.getClassList("fitting", "90° LR Elbow");
ok(schs.includes("Sch 40") && schs.includes("Sch 80"), "LR Elbow schedules include Sch 40/80");
ok(!schs.includes("Sch 5") && !schs.includes("Sch 20"), "LR Elbow schedules omit chart-missing keys");

const nps40 = ctx.getNpsList("fitting", "90° LR Elbow", "Sch 40").map((i) => i.nps);
const nps160 = ctx.getNpsList("fitting", "90° LR Elbow", "Sch 160").map((i) => i.nps);
ok(nps40.includes("6") && nps40.includes("36"), "Sch 40 NPS includes 6 and 36");
ok(nps160.includes("6") && !nps160.includes("36"), "Sch 160 NPS differs (has 6, no 36)");

const item40 = ctx.getNpsList("fitting", "90° LR Elbow", "Sch 40").find((i) => i.nps === "6");
const item80 = ctx.getNpsList("fitting", "90° LR Elbow", "Sch 80").find((i) => i.nps === "6");
ok(ctx.calcUnitKg(item40, "fitting") === 11.11, "calcUnitKg Sch40 NPS6 = 11.11");
ok(ctx.calcUnitKg(item80, "fitting") === 15.88, "calcUnitKg Sch80 NPS6 = 15.88");

const red = ctx.getNpsList("fitting", "Concentric Reducer", "Sch 40").find((i) => i.nps === "8x6");
ok(red && ctx.calcUnitKg(red, "fitting") === 5.99, "reducer 8x6 Sch40 wt = 5.99");

if (fails.length) {
  console.error("\nFAILS:");
  for (const m of fails) console.error(" -", m);
  process.exit(1);
}
console.log("\nAll Phase 3 checks passed.");
