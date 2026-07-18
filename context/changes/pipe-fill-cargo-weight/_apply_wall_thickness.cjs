/**
 * Phase 2: apply signed-off wall thickness `t` from wall-thickness-candidates.md
 * onto data/piping_catalog.js (add-only; never rewrite od/wt).
 *
 * Accepted set (Sign-off): all A + all B rows with numeric proposed `t`.
 * B36-missing (t = —) are skipped.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");
const CANDIDATES = path.join(__dirname, "wall-thickness-candidates.md");
const CATALOG = path.join(ROOT, "data", "piping_catalog.js");

function parseAcceptedT(md) {
  /** @type {Map<string, number>} key = `${schedule}\t${nps}` */
  const map = new Map();
  const rowRe =
    /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+|—)\s*\|/;
  for (const line of md.split(/\r?\n/)) {
    const m = line.match(rowRe);
    if (!m) continue;
    const schedule = m[1].trim();
    const nps = m[2].trim();
    // Skip header / mapping rows
    if (schedule === "schedule" || schedule.startsWith("`") || schedule === "-----") continue;
    if (!/^(Sch |STD|XS|XXS)/.test(schedule)) continue;
    const tRaw = m[5].trim();
    if (tRaw === "—" || tRaw === "-") continue;
    const t = Number(tRaw);
    if (!(t > 0)) continue;
    map.set(`${schedule}\t${nps}`, t);
  }
  return map;
}

function extractPipesBlock(src) {
  const start = src.indexOf("pipes: {");
  if (start < 0) throw new Error("pipes: { not found");
  // Find matching close for pipes object — ends before next top-level key or end of PIPING_CATALOG
  let i = start + "pipes: {".length - 1; // at '{'
  let depth = 0;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return { start, end: i + 1, block: src.slice(start, i + 1) };
      }
    }
  }
  throw new Error("unclosed pipes block");
}

function applyT(src, accepted) {
  const before = extractPipesBlock(src);
  let block = before.block;
  let applied = 0;
  let skippedNoT = 0;
  const missingAccepted = new Set(accepted.keys());
  const odWtSnapshot = [];

  // Walk schedule sections: "Sch 40": [ ... ],
  const schRe = /"((?:Sch [^"]+|STD|XS|XXS))":\s*\[/g;
  let schMatch;
  const replacements = [];

  while ((schMatch = schRe.exec(block)) !== null) {
    const schedule = schMatch[1];
    const arrStart = schMatch.index + schMatch[0].length;
    let depth = 1; // inside [
    let j = arrStart;
    for (; j < block.length; j++) {
      if (block[j] === "[") depth++;
      else if (block[j] === "]") {
        depth--;
        if (depth === 0) break;
      }
    }
    const arrBody = block.slice(arrStart, j);
    const itemRe = /\{nps:"([^"]+)",od:([\d.]+),wt:([\d.]+)\}/g;
    let itemMatch;
    let newBody = arrBody;
    // Rebuild by replacing each item once from original body
    const items = [];
    while ((itemMatch = itemRe.exec(arrBody)) !== null) {
      items.push({
        full: itemMatch[0],
        nps: itemMatch[1],
        od: itemMatch[2],
        wt: itemMatch[3],
        index: itemMatch.index,
      });
    }
    let rebuilt = "";
    let cursor = 0;
    for (const it of items) {
      rebuilt += arrBody.slice(cursor, it.index);
      const key = `${schedule}\t${it.nps}`;
      const t = accepted.get(key);
      odWtSnapshot.push({
        schedule,
        nps: it.nps,
        od: Number(it.od),
        wt: Number(it.wt),
      });
      if (t != null) {
        rebuilt += `{nps:"${it.nps}",od:${it.od},wt:${it.wt},t:${formatT(t)}}`;
        applied++;
        missingAccepted.delete(key);
      } else {
        rebuilt += it.full;
        skippedNoT++;
      }
      cursor = it.index + it.full.length;
    }
    rebuilt += arrBody.slice(cursor);
    replacements.push({
      from: arrStart,
      to: j,
      body: rebuilt,
    });
  }

  // Apply replacements from end to start
  for (let k = replacements.length - 1; k >= 0; k--) {
    const r = replacements[k];
    block = block.slice(0, r.from) + r.body + block.slice(r.to);
  }

  let out = src.slice(0, before.start) + block + src.slice(before.end);
  out = out.replace(
    "// Items: { nps, od (mm), wt (kg/m) }",
    "// Items: { nps, od (mm), wt (kg/m), t (wall mm) } — t optional when B36 wall unpublished",
  );

  return { out, applied, skippedNoT, missingAccepted, odWtSnapshot };
}

function formatT(t) {
  // Preserve compact representation used in candidates (avoid 12.70 vs 12.7 noise)
  if (Number.isInteger(t)) return String(t);
  const s = String(t);
  return s;
}

function verify(out, accepted, odWtBefore) {
  // Syntax via vm after wrapping
  const vm = require("vm");
  const sandbox = { window: {} };
  vm.runInNewContext(out, sandbox);
  const pipes = sandbox.window.PIPING_CATALOG.pipes;
  if (!pipes) throw new Error("PIPING_CATALOG.pipes missing after apply");

  let withT = 0;
  let withoutT = 0;
  const bad = [];
  for (const [sch, rows] of Object.entries(pipes)) {
    for (const row of rows) {
      const key = `${sch}\t${row.nps}`;
      if (accepted.has(key)) {
        if (!(typeof row.t === "number" && row.t > 0)) {
          bad.push(`${key}: missing/invalid t`);
        } else if (!(row.od - 2 * row.t > 0)) {
          bad.push(`${key}: ID<=0 (od=${row.od}, t=${row.t})`);
        } else if (Math.abs(row.t - accepted.get(key)) > 1e-9) {
          bad.push(`${key}: t mismatch catalog=${row.t} accepted=${accepted.get(key)}`);
        } else {
          withT++;
        }
      } else {
        if (row.t != null) bad.push(`${key}: unexpected t on non-accepted row`);
        withoutT++;
      }
    }
  }

  // od/wt unchanged vs snapshot
  const afterMap = new Map();
  for (const [sch, rows] of Object.entries(pipes)) {
    for (const row of rows) {
      afterMap.set(`${sch}\t${row.nps}`, { od: row.od, wt: row.wt });
    }
  }
  const odWtChanged = [];
  for (const s of odWtBefore) {
    const a = afterMap.get(`${s.schedule}\t${s.nps}`);
    if (!a) {
      odWtChanged.push(`${s.schedule} ${s.nps}: row missing`);
      continue;
    }
    if (a.od !== s.od || a.wt !== s.wt) {
      odWtChanged.push(
        `${s.schedule} ${s.nps}: od ${s.od}->${a.od} wt ${s.wt}->${a.wt}`,
      );
    }
  }

  return { withT, withoutT, bad, odWtChanged, spot: spotCheck(pipes) };
}

function spotCheck(pipes) {
  const picks = [
    ["Sch 40", "2", 3.91],
    ["Sch 40", "12", 10.31],
    ["Sch 80", "2", 5.54],
    ["Sch 80", "12", 17.48],
    ["STD", "2", 3.91],
    ["STD", "12", 9.53],
  ];
  return picks.map(([sch, nps, expectT]) => {
    const row = (pipes[sch] || []).find((r) => r.nps === nps);
    if (!row) return { sch, nps, ok: false, detail: "missing row" };
    return {
      sch,
      nps,
      ok: row.t === expectT,
      detail: `t=${row.t} (expect ${expectT}), od=${row.od}, wt=${row.wt}`,
    };
  });
}

function main() {
  const md = fs.readFileSync(CANDIDATES, "utf8");
  const accepted = parseAcceptedT(md);
  console.log(`Accepted numeric t rows from candidates: ${accepted.size}`);

  const src = fs.readFileSync(CATALOG, "utf8");
  // Pre-snapshot od/wt from source parse (before write)
  const { out, applied, skippedNoT, missingAccepted, odWtSnapshot } = applyT(
    src,
    accepted,
  );

  if (missingAccepted.size) {
    console.error(
      "Accepted keys not found in catalog:",
      [...missingAccepted].slice(0, 20),
    );
    process.exit(1);
  }

  fs.writeFileSync(CATALOG, out, "utf8");
  console.log(`Applied t to ${applied} rows; left without t: ${skippedNoT}`);

  const v = verify(out, accepted, odWtSnapshot);
  console.log(`Verify: withT=${v.withT} withoutT=${v.withoutT}`);
  if (v.bad.length) {
    console.error("BAD:", v.bad);
    process.exit(1);
  }
  if (v.odWtChanged.length) {
    console.error("od/wt CHANGED:", v.odWtChanged);
    process.exit(1);
  }
  console.log("Spot-check:");
  for (const s of v.spot) {
    console.log(`  ${s.ok ? "OK" : "FAIL"} ${s.sch} ${s.nps}: ${s.detail}`);
  }
  if (v.spot.some((s) => !s.ok)) process.exit(1);
  console.log("Done.");
}

main();
