/**
 * Phase 3 automated checks: nested fittings runtime helpers (no FITTING_SCH_FACTORS).
 * Helpers are extracted from live app.js (not re-embedded copies).
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

/** Slice a top-level `function name(...) { ... }` from app.js by brace matching. */
function extractFn(src, name) {
  const start = src.search(new RegExp(`^function ${name}\\(`, "m"));
  if (start < 0) throw new Error(`Could not find function ${name} in app.js`);
  let i = src.indexOf("{", start);
  let depth = 0;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error(`Unbalanced braces for function ${name}`);
}

const liveHelpers = [
  extractFn(appSrc, "getCatalog"),
  extractFn(appSrc, "getClassList"),
  extractFn(appSrc, "getNpsList"),
  extractFn(appSrc, "calcUnitKg"),
].join("\n\n");

// Stubs only for pipe branch of calcUnitKg (unused by fitting checks below)
const sandboxSrc = `
${catSrc}
function findFillMedia() { return null; }
function pipeUnitMass() { return { unitKg: 0 }; }
${liveHelpers}
`;

const ctx = { window: {}, console };
vm.runInNewContext(sandboxSrc, ctx);
ok(typeof ctx.getClassList === "function", "live getClassList extracted from app.js");
ok(typeof ctx.getNpsList === "function", "live getNpsList extracted from app.js");
ok(typeof ctx.calcUnitKg === "function", "live calcUnitKg extracted from app.js");

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
