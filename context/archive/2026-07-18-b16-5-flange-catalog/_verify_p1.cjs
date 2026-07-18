/**
 * Phase 1 automated checks for flange-weight-candidates.md
 * Run: node context/changes/b16-5-flange-catalog/_verify_p1.cjs
 */
const fs = require("fs");
const path = require("path");

const mdPath = path.join(__dirname, "flange-weight-candidates.md");
const md = fs.readFileSync(mdPath, "utf8");

const PIPE = new Set([
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

let fail = 0;

function ok(cond, msg) {
  console.log((cond ? "OK" : "FAIL") + ": " + msg);
  if (!cond) fail++;
}

ok(fs.existsSync(mdPath), "flange-weight-candidates.md exists");

const sections = [
  "## Sources",
  "## Type inventory",
  "## Schedule keys",
  "## Proposed rows",
  "## Skipped",
  "## Conflict policy",
  "## Sign-off",
];
for (const s of sections) {
  ok(md.includes(s), "section " + s);
}

ok(md.includes("`Weld Neck`") || md.includes("| Weld Neck |"), "Weld Neck mentioned");
ok(md.includes("`Slip-On`") || md.includes("| Slip-On |"), "Slip-On mentioned");
ok(md.includes("`Blind`") || md.includes("| Blind |"), "Blind mentioned");
ok(
  /Socket Weld[\s\S]{0,80}deferred/i.test(md) || md.includes("| `Socket Weld` | **deferred**"),
  "Socket Weld deferred",
);
ok(
  /Threaded[\s\S]{0,80}deferred/i.test(md) || md.includes("| `Threaded` | **deferred**"),
  "Threaded deferred",
);
ok(
  /Lap Joint[\s\S]{0,80}deferred/i.test(md) || md.includes("| `Lap Joint` | **deferred**"),
  "Lap Joint deferred",
);
ok(/in \(rewrite\)/i.test(md) || /\*\*in \(rewrite\)\*\*/.test(md), "core 3 marked in-scope");

const badSch = new Set();
let wnProposed = 0;
let inAuto = false;
let inConflict = false;
for (const line of md.split(/\n/)) {
  if (line.startsWith("### Auto-apply")) {
    inAuto = true;
    inConflict = false;
    continue;
  }
  if (line.startsWith("### Conflict")) {
    inAuto = false;
    inConflict = true;
    continue;
  }
  if (line.startsWith("## ") || line.startsWith("### ")) {
    if (!line.startsWith("### Auto-apply") && !line.startsWith("### Conflict")) {
      inAuto = false;
      inConflict = false;
    }
  }
  if (!(inAuto || inConflict)) continue;
  if (!line.startsWith("| ")) continue;
  const cells = line.split("|").map((s) => s.trim());
  // | type | class | schedule | nps | ...
  if (cells.length < 6) continue;
  const type = cells[1];
  const sch = cells[3];
  const nps = cells[4];
  if (!type || type === "type" || type.startsWith("-") || type === "—") continue;
  if (type !== "Weld Neck") continue;
  if (!nps || nps === "nps" || nps === "—") continue;
  wnProposed++;
  if (sch && sch !== "—" && !PIPE.has(sch)) badSch.add(sch);
}

ok(wnProposed > 0, "WN proposed rows scanned (" + wnProposed + ")");
ok(badSch.size === 0, "WN schedule keys ⊆ 18 pipe keys" + (badSch.size ? " bad=" + [...badSch] : ""));

// Ensure live catalog / UI not modified by checking git if available — soft check via mtime note only
const live = [
  path.join(__dirname, "../../../data/piping_catalog.js"),
  path.join(__dirname, "../../../app.js"),
  path.join(__dirname, "../../../index.html"),
];
for (const f of live) {
  ok(fs.existsSync(f), "live file still present: " + path.basename(f));
}

process.exit(fail ? 1 : 0);
