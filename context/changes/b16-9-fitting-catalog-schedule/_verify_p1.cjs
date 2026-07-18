const fs = require("fs");
const path = require("path");
const md = fs.readFileSync(path.join(__dirname, "fitting-weight-candidates.md"), "utf8");
const keys = [
  "90° LR Elbow",
  "90° SR Elbow",
  "45° LR Elbow",
  "Equal Tee",
  "Concentric Reducer",
  "Eccentric Reducer",
  "Cap",
  "LR Reducing Elbow",
  "180° LR Return",
  "180° SR Return",
  "90° 3D Elbow",
  "45° 3D Elbow",
  "Equal Cross",
  "Reducing Tee",
  "Reducing Cross",
  "Lap Joint Stub End (Long)",
  "Lap Joint Stub End (Short)",
];
const pipe = new Set([
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
for (const k of keys) {
  const ok = md.includes("`" + k + "`");
  console.log((ok ? "OK" : "MISSING") + ": " + k);
  if (!ok) fail++;
}
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
  const ok = md.includes(s);
  console.log((ok ? "OK" : "MISSING") + ": " + s);
  if (!ok) fail++;
}
const bad = new Set();
let proposed = 0;
for (const line of md.split(/\n/)) {
  if (!line.startsWith("| ")) continue;
  const cells = line.split("|").map((s) => s.trim());
  if (cells.length < 6) continue;
  const type = cells[1];
  const sch = cells[2];
  const nps = cells[3];
  const wt = cells[4];
  if (!type || type === "type" || type.startsWith("-")) continue;
  if (!/Elbow|Tee|Cap|Reducer|Return|Stub|Cross/.test(type)) continue;
  if (!/^\d|x/.test(nps) && !nps.includes("/")) continue;
  proposed++;
  if (!pipe.has(sch)) bad.add(sch);
}
console.log("Proposed-like rows scanned:", proposed);
console.log("Bad schedules:", [...bad]);
if (bad.size) fail++;
process.exit(fail ? 1 : 0);
