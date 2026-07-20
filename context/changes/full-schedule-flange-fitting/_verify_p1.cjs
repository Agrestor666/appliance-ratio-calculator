/**
 * Phase 1 automated checks for full-schedule-flange-fitting.
 * Run: node context/changes/full-schedule-flange-fitting/_verify_p1.cjs
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "../../..");
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

let failed = 0;
function ok(msg) {
  console.log("OK  ", msg);
}
function fail(msg) {
  console.error("FAIL", msg);
  failed++;
}

if (!fs.existsSync(CANDIDATES)) {
  fail("schedule-weight-candidates.md missing");
} else {
  ok("schedule-weight-candidates.md exists");
}

const md = fs.existsSync(CANDIDATES)
  ? fs.readFileSync(CANDIDATES, "utf8")
  : "";

for (const section of [
  "## Sources",
  "## Schedule keys",
  "## WN calc contract",
  "## Gap inventory",
  "## Proposed rows",
  "## Skipped",
  "## Alias notes",
  "## Conflict / mass policy",
  "## Sign-off",
]) {
  if (!md.includes(section)) fail(`missing section ${section}`);
  else ok(`section ${section}`);
}

const proposedSchedules = new Set();
let calculatedWnRows = 0;

// Fitting rows: | fitting | type | schedule | nps | wt | note |
const fittingRow =
  /^\| fitting \| [^|]+ \| ([^|]+) \| [^|]+ \| [^|]+ \| ([^|]*) \|/;
// WN rows: | wn | class | schedule | nps | wt | note |
const wnRow = /^\| wn \| [^|]+ \| ([^|]+) \| [^|]+ \| [^|]+ \| ([^|]*) \|/;

for (const line of md.split("\n")) {
  let m = line.match(fittingRow);
  if (m) {
    const sch = m[1].trim();
    proposedSchedules.add(sch);
    if (!PIPE_KEYS.has(sch)) fail(`proposed schedule outside 18 keys: ${sch}`);
    continue;
  }
  m = line.match(wnRow);
  if (m) {
    const sch = m[1].trim();
    const note = m[2];
    proposedSchedules.add(sch);
    if (!PIPE_KEYS.has(sch)) fail(`proposed schedule outside 18 keys: ${sch}`);
    if (/calculated/i.test(note)) calculatedWnRows++;
  }
}

if (proposedSchedules.size === 0) {
  fail("no proposed schedule rows parsed from A/B/C tables");
} else {
  ok(
    `proposed schedules ⊆ 18 (${[...proposedSchedules].join(", ")}; n=${proposedSchedules.size} distinct)`,
  );
}

if (calculatedWnRows === 0) {
  fail("no Proposed WN row with source note containing 'calculated'");
} else {
  ok(`Proposed WN rows with calculated note: ${calculatedWnRows}`);
}

// Fail only on content modifications of the two SSOT catalogs.
const status = execSync("git status --porcelain", {
  cwd: ROOT,
  encoding: "utf8",
});
const catalogPaths = [
  "src/lib/data/piping-catalog.js",
  "legacy/data/piping_catalog.js",
];
const dirtyCatalogs = status.split("\n").filter((line) => {
  if (!line.trim()) return false;
  const xy = line.slice(0, 2);
  const rest = line.slice(3).replace(/\\/g, "/");
  const touches = catalogPaths.some(
    (p) =>
      rest === p || rest.endsWith(" -> " + p) || rest.startsWith(p + " ->"),
  );
  if (!touches) return false;
  return /[MADU]/.test(xy) && !/^R/.test(xy.trim()) && xy !== "R ";
});
if (dirtyCatalogs.length) {
  fail(
    "catalog files content-modified in working tree this phase:\n  " +
      dirtyCatalogs.join("\n  "),
  );
} else {
  ok("no content edits to src/legacy piping catalogs this phase");
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll Phase 1 automated checks passed");
