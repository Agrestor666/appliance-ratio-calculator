const el = (id) => document.getElementById(id);

const notificationNumber = el("notificationNumber");
const riggingWeight = el("riggingWeight");
const cargoWeight = el("cargoWeight");
const contingency = el("contingency");
const daf = el("daf");
const wll = el("wll");
const resetBtn = el("resetBtn");
const riggingCalcBtn = el("riggingCalcBtn");
const riggingCalcHint = el("riggingCalcHint");

const totalWeightOut = el("totalWeightOut");
const ratioOut = el("ratioOut");
const usedOut = el("usedOut");
const remainingOut = el("remainingOut");

const thresholdsWrap = el("thresholds");
const generateReportBtn = el("generateReportBtn");

const alerts = el("alerts");
const alertsList = el("alertsList");

let chart = null;
let lastSeverity = "none"; // none | warn | crit

const EXCEL_DEFAULTS = {
  riggingWeight: 0.07,
  cargoWeight: 1.5,
  contingency: 1.05,
  daf: 1.05,
  wll: 3
};

function parseNumber(v) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  // PL-friendly: "1 234,56" or "1234,56"
  const cleaned = s.replace(/\s+/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

let thresholdState = { warn: 0.85, crit: 0.9, enabled: true };

function renderThresholdControls() {
  thresholdsWrap.innerHTML = "";
  const row = document.createElement("div");
  row.className = "thRow";
  row.innerHTML = `
    <div class="stack">
      <div style="font-weight:720">Utilization ratio</div>
      <div class="muted">Rule of thumb: keep utilization below 90%.</div>
    </div>
    <div class="field" style="min-width:0">
      <label>Warn (%)</label>
      <input id="thWarn" type="text" inputmode="decimal" value="${String(thresholdState.warn)}" />
    </div>
    <div class="field" style="min-width:0">
      <label>Critical (%)</label>
      <input id="thCrit" type="text" inputmode="decimal" value="${String(thresholdState.crit)}" />
    </div>
    <div class="row" style="justify-content:flex-end">
      <label class="tag ${thresholdState.enabled ? "tag--ok" : ""}" style="cursor:pointer">
        <input id="thEnabled" type="checkbox" ${thresholdState.enabled ? "checked" : ""} />
        Enabled
      </label>
    </div>
  `;
  thresholdsWrap.appendChild(row);

  const thWarn = el("thWarn");
  const thCrit = el("thCrit");
  const thEnabled = el("thEnabled");

  const sync = () => {
    thresholdState = {
      warn: parseNumber(thWarn.value) ?? 0.85,
      crit: parseNumber(thCrit.value) ?? 0.9,
      enabled: thEnabled.checked
    };
    recompute();
  };

  thWarn.addEventListener("input", sync);
  thCrit.addEventListener("input", sync);
  thEnabled.addEventListener("change", sync);
}

function ensureChart() {
  const ctx = el("chart").getContext("2d");
  if (chart) return chart;
  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Used", "Remaining"],
      datasets: [
        {
          label: "Capacity",
          data: [0, 100],
          borderWidth: 1,
          borderColor: "rgba(255,255,255,.12)",
          backgroundColor: ["rgba(124,92,255,.55)", "rgba(49,214,196,.35)"]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: true, labels: { color: "rgba(255,255,255,.86)" } },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (ctx) => {
              const label = ctx.label || "";
              const v = Number(ctx.parsed);
              const pct = Number.isFinite(v) ? `${v.toFixed(1)}%` : "—";
              return `${label}: ${pct}`;
            }
          }
        }
      }
    }
  });
  return chart;
}

function updateChart(usedPercent, remainingPercent) {
  const c = ensureChart();
  c.data.datasets[0].data = [usedPercent, remainingPercent];
  c.update();
}

function updateAlerts(utilRatio) {
  alertsList.innerHTML = "";
  alerts.classList.remove("is-warn", "is-crit", "is-flash");
  if (!thresholdState.enabled) {
    alerts.hidden = true;
    lastSeverity = "none";
    return;
  }

  const warn = thresholdState.warn;
  const crit = thresholdState.crit;
  const items = [];
  let severity = "none";

  if (Number.isFinite(crit) && utilRatio >= crit) {
    severity = "crit";
    items.push({
      level: "crit",
      text: `Utilization ${formatPercent(utilRatio)} ≥ ${formatPercent(crit)}. Reduce load or increase WLL before lifting.`
    });
  } else if (Number.isFinite(warn) && utilRatio >= warn) {
    severity = "warn";
    items.push({
      level: "warn",
      text: `Utilization ${formatPercent(utilRatio)} ≥ ${formatPercent(warn)}. Approaching the limit.`
    });
  }

  if (items.length === 0) {
    alerts.hidden = true;
    lastSeverity = "none";
    return;
  }

  alerts.hidden = false;
  if (severity === "warn") alerts.classList.add("is-warn", "is-flash");
  if (severity === "crit") alerts.classList.add("is-crit");

  if (severity === "crit" && lastSeverity !== "crit") {
    playCriticalBeep();
  }
  lastSeverity = severity;

  for (const it of items) {
    const li = document.createElement("li");
    const tag = document.createElement("span");
    tag.className = `tag ${it.level === "crit" ? "tag--crit" : "tag--warn"}`;
    tag.textContent = it.level === "crit" ? "CRITICAL" : "WARN";
    li.appendChild(tag);
    li.appendChild(document.createTextNode(" " + it.text));
    alertsList.appendChild(li);
  }
}

/** Shared context so Chrome/Edge unlock audio after first user gesture (resume). */
let reportAudioCtx = null;

function getReportAudioContext() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!reportAudioCtx || reportAudioCtx.state === "closed") reportAudioCtx = new AC();
  return reportAudioCtx;
}

/** Short fanfare + spoken line; must run from a user gesture (button click). */
async function playReportMabokoStinger() {
  try {
    const ctx = getReportAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume();

    const t0 = ctx.currentTime;
    const notes = [
      { f: 523.25, at: 0 },
      { f: 659.25, at: 0.16 },
      { f: 783.99, at: 0.32 }
    ];
    for (const { f, at } of notes) {
      const start = t0 + at;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, start);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.16, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.24);
    }

    window.setTimeout(() => {
      try {
        const s = window.speechSynthesis;
        if (!s) return;
        s.cancel();
        const u = new SpeechSynthesisUtterance("eeeeee MAboko!!");
        u.lang = "en-US";
        u.rate = 1;
        u.pitch = 1.12;
        u.volume = 1;
        s.speak(u);
      } catch {
        // ignore
      }
    }, 420);
  } catch {
    // ignore
  }
}

function playCriticalBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.start(t);
    o.stop(t + 0.26);
    o.onended = () => ctx.close?.();
  } catch {
    // ignore audio errors (autoplay policies etc.)
  }
}

function formatTe(n) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 3 });
}

function formatKg(n) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatPercent(n) {
  if (!Number.isFinite(n)) return "—";
  return (n * 100).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "%";
}

function formatNumber(n, maxFractionDigits = 6) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: maxFractionDigits });
}

function computeFromInputs() {
  const C2 = parseNumber(riggingWeight.value);
  const C3 = parseNumber(cargoWeight.value);
  const C4 = parseNumber(contingency.value);
  const C5 = parseNumber(daf.value);
  const C7 = parseNumber(wll.value);

  if ([C2, C3, C4, C5, C7].some((x) => x === null)) {
    return { ok: false, error: "Please enter valid numbers in all inputs." };
  }
  if (C7 <= 0) return { ok: false, error: "WLL must be greater than 0." };
  if (C4 <= 0 || C5 <= 0) return { ok: false, error: "Factors must be greater than 0." };

  const E6 = (C3 + C2) * C4 * C5;
  const E8 = E6 / C7;
  const H2 = E8;
  const H3 = 1 - E8;

  return { ok: true, C2, C3, C4, C5, C7, E6, E8, H2, H3 };
}

function recompute() {
  const res = computeFromInputs();
  if (!res.ok) {
    totalWeightOut.textContent = "—";
    ratioOut.textContent = "—";
    usedOut.textContent = "—";
    remainingOut.textContent = "—";
    updateChart(0, 100);
    alerts.hidden = false;
    alertsList.innerHTML = "";
    const li = document.createElement("li");
    const tag = document.createElement("span");
    tag.className = "tag tag--warn";
    tag.textContent = "INPUT";
    li.appendChild(tag);
    li.appendChild(document.createTextNode(" " + res.error));
    alertsList.appendChild(li);
    return;
  }

  totalWeightOut.textContent = `${formatTe(res.E6)} Te`;
  ratioOut.textContent = formatPercent(res.E8);
  usedOut.textContent = formatPercent(res.H2);
  remainingOut.textContent = formatPercent(res.H3);

  const usedRatio = clamp01(res.E8);
  const usedPct = usedRatio * 100;
  const remainingPct = clamp01(1 - usedRatio) * 100;
  updateChart(usedPct, remainingPct);
  updateAlerts(res.E8);
}

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function formatWllT(v) {
  const n = parseNumber(v);
  if (n == null) {
    const s = String(v ?? "").trim();
    return s ? (/\bt\b/i.test(s) ? s : `${s}t`) : "—";
  }
  const txt = Number.isInteger(n) ? String(n) : formatNumber(n, 3);
  return `${txt}t`;
}

function formatMeters(v) {
  const n = typeof v === "number" ? v : parseNumber(v);
  if (n == null) return "—";
  const txt = Number.isInteger(n) ? String(n) : formatNumber(n, 3);
  return `${txt}m`;
}

function slingColorClass(colorName) {
  const n = normalizeKey(colorName);
  if (n.includes("violet") || n.includes("purple")) return "colorSwatch--violet";
  if (n.includes("green")) return "colorSwatch--green";
  if (n.includes("yellow")) return "colorSwatch--yellow";
  if (n.includes("grey") || n.includes("gray")) return "colorSwatch--grey";
  if (n.includes("red")) return "colorSwatch--red";
  if (n.includes("brown")) return "colorSwatch--brown";
  if (n.includes("blue")) return "colorSwatch--blue";
  if (n.includes("orange")) return "colorSwatch--orange";
  return "colorSwatch--unknown";
}

function buildStepperInput({ value, disabled, inputMode, ariaLabel, onChange, min = null, allowDecimal = false }) {
  const wrap = document.createElement("div");
  wrap.className = "stepper";

  const btnMinus = document.createElement("button");
  btnMinus.type = "button";
  btnMinus.className = "btn stepper__btn";
  btnMinus.textContent = "−";
  btnMinus.disabled = !!disabled;

  const inp = document.createElement("input");
  inp.type = "text";
  inp.inputMode = inputMode || "numeric";
  inp.className = "stepper__input";
  inp.value = String(value ?? "");
  inp.disabled = !!disabled;
  if (ariaLabel) inp.setAttribute("aria-label", ariaLabel);

  const btnPlus = document.createElement("button");
  btnPlus.type = "button";
  btnPlus.className = "btn stepper__btn";
  btnPlus.textContent = "+";
  btnPlus.disabled = !!disabled;

  const parse = () => {
    const n = parseNumber(inp.value);
    if (n == null) return null;
    const v = allowDecimal ? n : Math.floor(n);
    if (min != null) return Math.max(min, v);
    return v;
  };

  const commit = () => {
    const v = parse();
    if (v == null) return;
    inp.value = String(v);
    onChange?.(v);
  };

  inp.addEventListener("input", () => commit());
  inp.addEventListener("change", () => commit());

  btnMinus.addEventListener("click", () => {
    const cur = parse() ?? (min != null ? min : 0);
    const next = min != null ? Math.max(min, cur - 1) : cur - 1;
    inp.value = String(next);
    onChange?.(next);
  });
  btnPlus.addEventListener("click", () => {
    const cur = parse() ?? (min != null ? min : 0);
    const next = cur + 1;
    inp.value = String(next);
    onChange?.(next);
  });

  wrap.appendChild(btnMinus);
  wrap.appendChild(inp);
  wrap.appendChild(btnPlus);
  return { wrap, input: inp };
}

// ----------------------------
// Rigging weight calculator UI
// ----------------------------

const riggingModal = el("riggingModal");
const riggingModalCloseBtn = el("riggingModalCloseBtn");
const riggingHelpBtn = el("riggingHelpBtn");
const riggingHelpModal = el("riggingHelpModal");
const riggingHelpCloseBtn = el("riggingHelpCloseBtn");
const riggingTabs = el("riggingTabs");
const riggingTable = el("riggingTable");
const riggingSumPill = el("riggingSumPill");
const riggingConfirmBtn = el("riggingConfirmBtn");
const riggingClearSelectionBtn = el("riggingClearSelectionBtn");
const riggingClearLogBtn = el("riggingClearLogBtn");
const riggingSendToMainBtn = el("riggingSendToMainBtn");
const riggingLogTable = el("riggingLogTable");
const riggingModalSubtitle = el("riggingModalSubtitle");

const riggingState = {
  loading: false,
  loaded: false,
  loadError: null,
  sheets: [], // { name, url, columns, rows, baseWeightKgKey, perMeterKgKey, extraPerMeterKgKey, standardLiftMKey }
  activeSheet: null,
  filter: "",
  selections: new Map(), // key -> { qty, lengthM }
  log: [], // { ts, sheet, label, qty, lengthM, unitKg, subtotalKg }
  lastSumKg: null
};

function showRiggingModal() {
  if (!riggingModal) return;
  riggingModal.hidden = false;
  riggingModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  ensureRiggingCatalogLoaded();
  renderRiggingUI();
}

function hideRiggingModal() {
  if (!riggingModal) return;
  riggingModal.hidden = true;
  riggingModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function showRiggingHelp() {
  if (!riggingHelpModal) return;
  riggingHelpModal.hidden = false;
  riggingHelpModal.setAttribute("aria-hidden", "false");
}

function hideRiggingHelp() {
  if (!riggingHelpModal) return;
  riggingHelpModal.hidden = true;
  riggingHelpModal.setAttribute("aria-hidden", "true");
}

function normalizeKey(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function detectCatalogKeys(columns) {
  const keys = columns.map((c) => ({ raw: c, norm: normalizeKey(c) }));

  const baseWeightKgKey =
    keys.find((k) => /\bweight\b/.test(k.norm) && /\bkg\b/.test(k.norm) && !/\bkg\/m\b/.test(k.norm) && !/\bper meter\b/.test(k.norm))?.raw ||
    keys.find((k) => /\bweight\s*\(kg\)\b/.test(k.norm))?.raw ||
    keys.find((k) => /\bweight\b/.test(k.norm) && !/\bper\b/.test(k.norm))?.raw ||
    null;

  const perMeterKgKey =
    keys.find((k) => /\bkg\/m\b/.test(k.norm))?.raw ||
    keys.find((k) => /\bper meter\b/.test(k.norm) && /\bkg\b/.test(k.norm))?.raw ||
    null;

  const extraPerMeterKgKey =
    keys.find((k) => /\bextra\b/.test(k.norm) && /\bper m\b/.test(k.norm))?.raw ||
    keys.find((k) => /\bextra\b/.test(k.norm) && /\bper meter\b/.test(k.norm))?.raw ||
    null;

  const standardLiftMKey =
    keys.find((k) => /\bstandard lift\b/.test(k.norm) && /\bm\b/.test(k.norm))?.raw ||
    keys.find((k) => /\blift\b/.test(k.norm) && /\bm\b/.test(k.norm))?.raw ||
    null;

  return { baseWeightKgKey, perMeterKgKey, extraPerMeterKgKey, standardLiftMKey };
}

function getRowLabel(row, columns) {
  const normCols = columns.map((c) => ({ raw: c, norm: normalizeKey(c) }));
  const labelKey =
    normCols.find((c) => /\b(description|item|name|type)\b/.test(c.norm))?.raw ||
    normCols.find((c) => /\b(model|size|rating|wll)\b/.test(c.norm))?.raw ||
    columns[0];
  const a = row?.[labelKey];
  if (a != null && String(a).trim()) return String(a).trim();
  // fallback: join first 2 columns
  const parts = [];
  for (const c of columns.slice(0, 2)) {
    const v = row?.[c];
    if (v != null && String(v).trim()) parts.push(String(v).trim());
  }
  return parts.join(" · ") || "Item";
}

async function ensureRiggingCatalogLoaded() {
  if (riggingState.loaded || riggingState.loading) return;
  riggingState.loading = true;
  riggingState.loadError = null;
  try {
    const inline = globalThis?.RIGGING_CATALOG?.sheets;
    let rawSheets = null;
    if (Array.isArray(inline) && inline.length) {
      rawSheets = inline.map((s) => ({ name: s.name, url: null, rows: Array.isArray(s.rows) ? s.rows : [] }));
    } else {
      // Fallback for http(s) usage where fetch works
      const catalog = [
        { name: "Shackles", url: "./data/Shackles.json" },
        { name: "Beam Clamps", url: "./data/Beam Clamps.json" },
        { name: "Chain Blocks", url: "./data/Chain Blocks.json" },
        { name: "Slings", url: "./data/Slings.json" }
      ];
      rawSheets = [];
      for (const item of catalog) {
        const res = await fetch(item.url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load ${item.url} (HTTP ${res.status})`);
        const rows = await res.json();
        rawSheets.push({ name: item.name, url: item.url, rows });
      }
    }

    const loadedSheets = [];
    for (const s of rawSheets) {
      const columns = s.rows.length ? Object.keys(s.rows[0]) : [];
      const { baseWeightKgKey, perMeterKgKey, extraPerMeterKgKey, standardLiftMKey } = detectCatalogKeys(columns);
      loadedSheets.push({
        name: s.name,
        url: s.url,
        columns,
        rows: s.rows,
        baseWeightKgKey,
        perMeterKgKey,
        extraPerMeterKgKey,
        standardLiftMKey
      });
    }

    riggingState.sheets = loadedSheets;
    riggingState.activeSheet = loadedSheets[0]?.name ?? null;
    riggingState.loaded = true;
  } catch (e) {
    riggingState.loadError = e?.message || String(e);
  } finally {
    riggingState.loading = false;
    renderRiggingUI();
  }
}

function getActiveSheet() {
  return riggingState.sheets.find((s) => s.name === riggingState.activeSheet) || riggingState.sheets[0] || null;
}

function selectionKey(sheetName, rowIndex) {
  return `${sheetName}::${rowIndex}`;
}

function getFilteredRows(sheet) {
  const q = normalizeKey(riggingState.filter);
  if (!q) return sheet.rows.map((r, idx) => ({ r, idx }));
  return sheet.rows
    .map((r, idx) => ({ r, idx }))
    .filter(({ r }) => {
      for (const c of sheet.columns) {
        const v = r?.[c];
        if (v == null) continue;
        if (normalizeKey(v).includes(q)) return true;
      }
      return false;
    });
}

function renderRiggingTabs() {
  if (!riggingTabs) return;
  riggingTabs.innerHTML = "";
  for (const s of riggingState.sheets) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tab";
    b.textContent = s.name;
    const active = s.name === riggingState.activeSheet;
    b.setAttribute("aria-selected", active ? "true" : "false");
    b.addEventListener("click", () => {
      riggingState.activeSheet = s.name;
      renderRiggingUI();
    });
    riggingTabs.appendChild(b);
  }
}

function renderRiggingTable() {
  if (!riggingTable) return;

  if (riggingState.loading) {
    riggingTable.innerHTML = `<thead><tr><th>Loading…</th></tr></thead><tbody><tr><td>Loading JSON catalog…</td></tr></tbody>`;
    return;
  }
  if (riggingState.loadError) {
    riggingTable.innerHTML = `<thead><tr><th>Error</th></tr></thead><tbody><tr><td>${escapeHtml(riggingState.loadError)}</td></tr></tbody>`;
    return;
  }
  const sheet = getActiveSheet();
  if (!sheet) {
    riggingTable.innerHTML = `<thead><tr><th>No data</th></tr></thead><tbody><tr><td>No catalog files found.</td></tr></tbody>`;
    return;
  }

  const { baseWeightKgKey, perMeterKgKey, extraPerMeterKgKey, standardLiftMKey } = sheet;
  const hasLength = Boolean(perMeterKgKey || extraPerMeterKgKey || standardLiftMKey);
  const rows = getFilteredRows(sheet);
  const isShackles = sheet.name === "Shackles";
  const isBeamClamps = sheet.name === "Beam Clamps";
  const isChainBlocks = sheet.name === "Chain Blocks";
  const isSlings = sheet.name === "Slings";
  const wllKey = sheet.columns.find((c) => /\bwll\b/i.test(c)) || "WLL (t)";
  const compactWllWeightOnly = isShackles || isBeamClamps;
  const cols =
    compactWllWeightOnly || isChainBlocks || isSlings ? [wllKey, baseWeightKgKey, perMeterKgKey].filter(Boolean) : sheet.columns.slice(0, 6);
  if (baseWeightKgKey && !cols.includes(baseWeightKgKey)) cols.push(baseWeightKgKey);
  if (perMeterKgKey && !cols.includes(perMeterKgKey)) cols.push(perMeterKgKey);
  if (extraPerMeterKgKey && !cols.includes(extraPerMeterKgKey)) cols.push(extraPerMeterKgKey);
  if (standardLiftMKey && !cols.includes(standardLiftMKey)) cols.push(standardLiftMKey);

  const thead = document.createElement("thead");
  const hr = document.createElement("tr");
  if (compactWllWeightOnly) {
    hr.innerHTML =
      `<th style="width:120px">${escapeHtml(wllKey)}</th>` +
      (baseWeightKgKey ? `<th style="width:140px" class="num">${escapeHtml(baseWeightKgKey)}</th>` : `<th style="width:140px" class="num">Weight (kg)</th>`) +
      `<th style="width:96px">Qty</th>` +
      `<th style="width:64px">Pick</th>`;
  } else if (isChainBlocks) {
    // Order: WLL -> Len -> Weight(kg) @ 3m -> Extra per m -> Weight at Len -> Qty -> Pick
    hr.innerHTML =
      `<th style="width:120px">${escapeHtml(wllKey)}</th>` +
      `<th style="width:110px">Len (m)</th>` +
      (baseWeightKgKey ? `<th style="width:160px" class="num">${escapeHtml(baseWeightKgKey)} @ 3m</th>` : `<th style="width:160px" class="num">Weight (kg) @ 3m</th>`) +
      (extraPerMeterKgKey ? `<th style="width:190px" class="num">${escapeHtml(extraPerMeterKgKey)}</th>` : `<th style="width:190px" class="num">Extra / m (kg)</th>`) +
      `<th style="width:150px" class="num">Weight at Len (kg)</th>` +
      `<th style="width:96px">Qty</th>` +
      `<th style="width:64px">Pick</th>`;
  } else if (isSlings) {
    const colorKey = sheet.columns.find((c) => /color\s*code/i.test(c)) || "Color Code";
    const perMKey = perMeterKgKey || sheet.columns.find((c) => /kg\/m|per meter/i.test(c)) || "Approx. Weight per Meter (kg/m)";
    hr.innerHTML =
      `<th style="width:140px">${escapeHtml(colorKey)}</th>` +
      `<th style="width:120px">${escapeHtml(wllKey)}</th>` +
      `<th style="width:110px">Len (m)</th>` +
      `<th style="width:190px" class="num">${escapeHtml(perMKey)}</th>` +
      `<th style="width:96px">Qty</th>` +
      `<th style="width:64px">Pick</th>`;
  } else {
    hr.innerHTML =
      `<th style="width:64px">Pick</th><th style="width:96px">Qty</th>` +
      (hasLength ? `<th style="width:110px">Len (m)</th>` : ``) +
      cols
        .map((c) => {
          const isWeightCol =
            c === baseWeightKgKey || c === perMeterKgKey || c === extraPerMeterKgKey || c === standardLiftMKey;
          return `<th${isWeightCol ? ` class="num"` : ""}>${escapeHtml(c)}</th>`;
        })
        .join("");
  }
  thead.appendChild(hr);

  const tbody = document.createElement("tbody");
  const maxRows = 250; // keep UI snappy
  for (const { r, idx } of rows.slice(0, maxRows)) {
    const tr = document.createElement("tr");
    const key = selectionKey(sheet.name, idx);
    const sel = riggingState.selections.get(key);
    const picked = !!sel;
    const qty = sel?.qty ?? 1;
    const lengthM = sel?.lengthM ?? 3;

    // show base weight values formatted in table (raw values stay in JSON)
    const baseKg = baseWeightKgKey ? parseNumber(r?.[baseWeightKgKey]) : null;
    const baseKgStr = baseKg == null ? "—" : formatKg(baseKg);
    const perM = perMeterKgKey ? parseNumber(r?.[perMeterKgKey]) : null;
    const perMStr = perM == null ? "—" : formatKg(perM);
    const extraPerM = extraPerMeterKgKey ? parseNumber(r?.[extraPerMeterKgKey]) : null;
    const extraPerMStr = extraPerM == null ? "—" : formatKg(extraPerM);
    const stdLift = standardLiftMKey ? parseNumber(r?.[standardLiftMKey]) : null;
    const stdLiftStr = stdLift == null ? "—" : formatNumber(stdLift, 3);

    const pickTd = document.createElement("td");
    pickTd.innerHTML = `<input type="checkbox" ${picked ? "checked" : ""} aria-label="Pick row" />`;
    const pickCb = pickTd.querySelector("input");
    pickCb.addEventListener("change", () => {
      if (pickCb.checked) riggingState.selections.set(key, { qty: 1, lengthM: 3 });
      else riggingState.selections.delete(key);
      renderRiggingUI();
    });

    const shouldIgnoreRowDblClick = (evt) => {
      const t = evt?.target;
      if (!t || typeof t !== "object") return false;
      const tag = String(t.tagName || "").toLowerCase();
      if (tag === "input" || tag === "button" || tag === "select" || tag === "textarea" || tag === "label") return true;
      // clicks inside an input wrapper should not toggle pick
      return false;
    };

    tr.addEventListener("dblclick", (evt) => {
      if (shouldIgnoreRowDblClick(evt)) return;
      pickCb.checked = !pickCb.checked;
      pickCb.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const qtyTd = document.createElement("td");
    const qtyStepper = buildStepperInput({
      value: qty,
      disabled: !picked,
      inputMode: "numeric",
      ariaLabel: "Quantity",
      min: 1,
      allowDecimal: false,
      onChange: (n) => {
        riggingState.selections.set(key, { qty: n, lengthM: sel?.lengthM ?? 3 });
        updateRiggingSumPreview();
      }
    });
    qtyTd.appendChild(qtyStepper.wrap);

    if (compactWllWeightOnly) {
      // Order: WLL, Weight, Qty, Pick. (Beam Clamps: removes Flange Width; Shackles: removes Size)
      const wllTd = document.createElement("td");
      wllTd.className = "mono";
      wllTd.textContent = r?.[wllKey] == null || r?.[wllKey] === "" ? "—" : String(r?.[wllKey]);

      const wTd = document.createElement("td");
      wTd.className = "num mono";
      wTd.textContent = baseWeightKgKey ? baseKgStr : "—";

      tr.appendChild(wllTd);
      tr.appendChild(wTd);
      tr.appendChild(qtyTd);
      tr.appendChild(pickTd);
    } else if (isChainBlocks) {
      const wllTd = document.createElement("td");
      wllTd.className = "mono";
      wllTd.textContent = r?.[wllKey] == null || r?.[wllKey] === "" ? "—" : String(r?.[wllKey]);

      // Length input (enabled only if picked)
      const lenTd = document.createElement("td");
      const lenStepper = buildStepperInput({
        value: lengthM,
        disabled: !picked,
        inputMode: "decimal",
        ariaLabel: "Length meters",
        min: 1,
        allowDecimal: false,
        onChange: (n) => {
          const cur = riggingState.selections.get(key) || { qty: 1, lengthM: 3 };
          riggingState.selections.set(key, { qty: cur.qty ?? 1, lengthM: n });
          renderRiggingTable();
          updateRiggingSumPreview();
        }
      });
      lenTd.appendChild(lenStepper.wrap);

      // Compute unit weight for chosen length: base@3m + (len - 3) * extra/m (can decrease below 3m)
      const stdLift = standardLiftMKey ? parseNumber(r?.[standardLiftMKey]) : 3;
      const baseKgNum = baseWeightKgKey ? parseNumber(r?.[baseWeightKgKey]) : null;
      const extraPerMNum = extraPerMeterKgKey ? parseNumber(r?.[extraPerMeterKgKey]) : null;
      let computedKg = null;
      if (baseKgNum != null && extraPerMNum != null && Number.isFinite(stdLift)) {
        computedKg = Math.max(0, baseKgNum + (lengthM - stdLift) * extraPerMNum);
      } else if (baseKgNum != null) {
        computedKg = baseKgNum;
      }

      const base3mTd = document.createElement("td");
      base3mTd.className = "num mono";
      base3mTd.textContent = baseKgNum == null ? "—" : formatKg(baseKgNum);

      const extraTd = document.createElement("td");
      extraTd.className = "num mono";
      extraTd.textContent = extraPerMNum == null ? "—" : formatKg(extraPerMNum);

      const computedTd = document.createElement("td");
      computedTd.className = "num mono";
      computedTd.textContent = computedKg == null ? "—" : formatKg(computedKg);
      if (lengthM !== (stdLift ?? 3)) {
        computedTd.style.fontWeight = "700";
        computedTd.style.color = lengthM < (stdLift ?? 3) ? "var(--accent-teal, #31d6c4)" : "var(--accent, #7c5cff)";
      }

      tr.appendChild(wllTd);
      tr.appendChild(lenTd);
      tr.appendChild(base3mTd);
      tr.appendChild(extraTd);
      tr.appendChild(computedTd);
      tr.appendChild(qtyTd);
      tr.appendChild(pickTd);
    } else if (isSlings) {
      const colorKey = sheet.columns.find((c) => /color\s*code/i.test(c)) || "Color Code";
      const perMKey = perMeterKgKey || sheet.columns.find((c) => /kg\/m|per meter/i.test(c)) || "Approx. Weight per Meter (kg/m)";
      const colorTd = document.createElement("td");
      const colorName = r?.[colorKey] == null || r?.[colorKey] === "" ? "—" : String(r?.[colorKey]);
      if (colorName === "—") {
        colorTd.textContent = "—";
      } else {
        const sw = document.createElement("span");
        sw.className = `colorSwatch ${slingColorClass(colorName)}`;
        sw.setAttribute("aria-hidden", "true");
        const label = document.createElement("span");
        label.textContent = colorName;
        const wrap = document.createElement("span");
        wrap.className = "colorCell";
        wrap.appendChild(sw);
        wrap.appendChild(label);
        colorTd.appendChild(wrap);
      }

      const wllTd = document.createElement("td");
      wllTd.className = "mono";
      wllTd.textContent = r?.[wllKey] == null || r?.[wllKey] === "" ? "—" : String(r?.[wllKey]);

      const lenTd = document.createElement("td");
      const lenStepper = buildStepperInput({
        value: lengthM,
        disabled: !picked,
        inputMode: "decimal",
        ariaLabel: "Length meters",
        min: 0,
        allowDecimal: false,
        onChange: (n) => {
          const cur = riggingState.selections.get(key) || { qty: 1, lengthM: 3 };
          riggingState.selections.set(key, { qty: cur.qty ?? 1, lengthM: n });
          updateRiggingSumPreview();
        }
      });
      lenTd.appendChild(lenStepper.wrap);

      const perMTd = document.createElement("td");
      perMTd.className = "num mono";
      perMTd.textContent = r?.[perMKey] == null || r?.[perMKey] === "" ? "—" : String(perMStr);

      tr.appendChild(colorTd);
      tr.appendChild(wllTd);
      tr.appendChild(lenTd);
      tr.appendChild(perMTd);
      tr.appendChild(qtyTd);
      tr.appendChild(pickTd);
    } else {
      tr.appendChild(pickTd);
      tr.appendChild(qtyTd);

      if (hasLength) {
        const lenTd = document.createElement("td");
        const lenStepper = buildStepperInput({
          value: lengthM,
          disabled: !picked,
          inputMode: "decimal",
          ariaLabel: "Length meters",
          min: 0,
          allowDecimal: false,
          onChange: (n) => {
            const cur = riggingState.selections.get(key) || { qty: 1, lengthM: 3 };
            riggingState.selections.set(key, { qty: cur.qty ?? 1, lengthM: n });
            updateRiggingSumPreview();
          }
        });
        lenTd.appendChild(lenStepper.wrap);
        tr.appendChild(lenTd);
      }

      for (const c of cols) {
        const td = document.createElement("td");
        let v = r?.[c];
        if (c === baseWeightKgKey) v = baseKgStr;
        if (c === perMeterKgKey) v = perMStr;
        if (c === extraPerMeterKgKey) v = extraPerMStr;
        if (c === standardLiftMKey) v = stdLiftStr;
        td.textContent = v == null || v === "" ? "—" : String(v);
        if (c === baseWeightKgKey || c === perMeterKgKey || c === extraPerMeterKgKey) td.className = "num";
        tr.appendChild(td);
      }
    }
    tbody.appendChild(tr);
  }

  riggingTable.innerHTML = "";
  riggingTable.appendChild(thead);
  riggingTable.appendChild(tbody);
}

function computeSelectionSumKg() {
  const sheet = getActiveSheet();
  if (!sheet) return null;
  if (!sheet.baseWeightKgKey && !sheet.perMeterKgKey) return null;
  let sum = 0;
  for (const [key, sel] of riggingState.selections.entries()) {
    const [sheetName, rowIndexStr] = key.split("::");
    if (sheetName !== sheet.name) continue;
    const idx = Number(rowIndexStr);
    const row = sheet.rows[idx];
    const qty = Math.max(1, Math.floor(sel.qty ?? 1));
    const lengthM = Math.max(0, Number(sel.lengthM ?? 0));

    const baseKg = sheet.baseWeightKgKey ? parseNumber(row?.[sheet.baseWeightKgKey]) : null;
    const perM = sheet.perMeterKgKey ? parseNumber(row?.[sheet.perMeterKgKey]) : null;
    const extraPerM = sheet.extraPerMeterKgKey ? parseNumber(row?.[sheet.extraPerMeterKgKey]) : null;
    const stdLift = sheet.standardLiftMKey ? parseNumber(row?.[sheet.standardLiftMKey]) : null;

    let unitKg = null;
    if (perM != null) {
      unitKg = perM * lengthM;
    } else if (baseKg != null && extraPerM != null && stdLift != null) {
      // Allow reduction below standard lift (e.g. 2m < 3m standard → lighter)
      unitKg = Math.max(0, baseKg + (lengthM - stdLift) * extraPerM);
    } else if (baseKg != null) {
      unitKg = baseKg;
    }
    if (unitKg == null) continue;
    sum += unitKg * qty;
  }
  return sum;
}

function updateRiggingSumPreview() {
  if (!riggingSumPill) return;
  const kg = computeSelectionSumKg();
  if (kg == null) {
    riggingSumPill.textContent = "Sum: —";
    riggingState.lastSumKg = null;
    riggingSendToMainBtn && (riggingSendToMainBtn.disabled = true);
    return;
  }
  riggingSumPill.textContent = `Sum: ${formatKg(kg)} kg (${formatNumber(kg / 1000, 6)} Te)`;
}

function renderRiggingLog() {
  if (!riggingLogTable) return;
  const entries = riggingState.log.slice().reverse();

  let totalKg = 0;
  for (const e of riggingState.log) totalKg += e.subtotalKg;
  riggingState.lastSumKg = riggingState.log.length ? totalKg : null;

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>Item</th>
      <th style="width:80px">Qty</th>
      <th style="width:130px" class="num">Unit (kg)</th>
      <th style="width:150px" class="num">Subtotal (kg)</th>
    </tr>`;

  const tbody = document.createElement("tbody");
  if (entries.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="4">No log entries yet. Pick rows and confirm.</td>`;
    tbody.appendChild(tr);
  } else {
    for (const e of entries) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(e.label)}</td>
        <td class="mono">${escapeHtml(String(e.qty))}</td>
        <td class="num mono">${escapeHtml(formatKg(e.unitKg))}</td>
        <td class="num mono">${escapeHtml(formatKg(e.subtotalKg))}</td>`;
      tbody.appendChild(tr);
    }
  }

  const tfoot = document.createElement("tfoot");
  tfoot.innerHTML = `
    <tr>
      <th colspan="3" style="text-align:right">Total</th>
      <th class="num mono">${riggingState.log.length ? escapeHtml(formatKg(totalKg)) : "—"}</th>
    </tr>`;

  riggingLogTable.innerHTML = "";
  riggingLogTable.appendChild(thead);
  riggingLogTable.appendChild(tbody);
  riggingLogTable.appendChild(tfoot);

  if (riggingSendToMainBtn) riggingSendToMainBtn.disabled = riggingState.lastSumKg == null;
  if (riggingCalcHint) {
    if (riggingState.lastSumKg == null) {
      riggingCalcHint.textContent = "";
      riggingCalcHint.hidden = true;
    } else {
      riggingCalcHint.textContent = `Rigging log sum: ${formatNumber(riggingState.lastSumKg / 1000, 6)} Te`;
      riggingCalcHint.hidden = false;
    }
  }
}

function renderRiggingUI() {
  if (riggingModalSubtitle) {
    riggingModalSubtitle.textContent = riggingState.loadError
      ? riggingState.loadError
      : "Pick elements from the catalog and confirm to compute total weight.";
  }
  renderRiggingTabs();
  renderRiggingTable();
  updateRiggingSumPreview();
  renderRiggingLog();
}

function confirmRiggingSelectionToLog() {
  const sheet = getActiveSheet();
  if (!sheet) return;
  const now = new Date();
  const ts = now.toISOString().replace("T", " ").replace("Z", "Z");
  const newEntries = [];
  const wllKey = sheet.columns.find((c) => /\bwll\b/i.test(c)) || "WLL (t)";
  const colorKey = sheet.columns.find((c) => /color\s*code/i.test(c)) || "Color Code";

  for (const [key, sel] of riggingState.selections.entries()) {
    const [sheetName, rowIndexStr] = key.split("::");
    if (sheetName !== sheet.name) continue;
    const idx = Number(rowIndexStr);
    const row = sheet.rows[idx];
    const qty = Math.max(1, Math.floor(sel.qty ?? 1));
    const lengthM = Math.max(0, Number(sel.lengthM ?? 0));

    const wllText = formatWllT(row?.[wllKey]);

    const baseKg = sheet.baseWeightKgKey ? parseNumber(row?.[sheet.baseWeightKgKey]) : null;
    const perM = sheet.perMeterKgKey ? parseNumber(row?.[sheet.perMeterKgKey]) : null;
    const extraPerM = sheet.extraPerMeterKgKey ? parseNumber(row?.[sheet.extraPerMeterKgKey]) : null;
    const stdLift = sheet.standardLiftMKey ? parseNumber(row?.[sheet.standardLiftMKey]) : null;

    let unitKg = null;
    if (perM != null) {
      unitKg = perM * lengthM;
    } else if (baseKg != null && extraPerM != null && stdLift != null) {
      // Allow reduction below standard lift (e.g. 2m < 3m standard → lighter)
      unitKg = Math.max(0, baseKg + (lengthM - stdLift) * extraPerM);
    } else if (baseKg != null) {
      unitKg = baseKg;
    }
    if (unitKg == null) continue;

    let labelMain = null;
    if (sheet.name === "Slings") {
      labelMain = `${wllText} ${formatMeters(lengthM)}`;
    } else if (sheet.name === "Chain Blocks") {
      labelMain = `${wllText} ${formatMeters(lengthM)}`;
    } else if (sheet.name === "Shackles" || sheet.name === "Beam Clamps") {
      labelMain = `${wllText}`;
    } else {
      labelMain = `${getRowLabel(row, sheet.columns)}`;
    }

    const label = `${labelMain} (${sheet.name})`;
    newEntries.push({ ts, sheet: sheet.name, label, qty, lengthM, unitKg, subtotalKg: unitKg * qty });
  }

  riggingState.log.push(...newEntries);
  riggingState.selections.clear();
  renderRiggingUI();
}

function sendRiggingSumToMain() {
  if (riggingState.lastSumKg == null) return;
  const te = riggingState.lastSumKg / 1000;
  riggingWeight.value = String(formatNumber(te, 6));
  recompute();
}

function getReportPayload() {
  const res = computeFromInputs();
  if (!res.ok) return { ok: false, error: res.error };

  const usedRatio = res.E8;
  const remainingRatio = 1 - usedRatio;

  const warn = thresholdState.warn;
  const crit = thresholdState.crit;
  const severity =
    thresholdState.enabled && Number.isFinite(crit) && usedRatio >= crit
      ? "CRITICAL"
      : thresholdState.enabled && Number.isFinite(warn) && usedRatio >= warn
        ? "WARN"
        : "OK";

  const chartPng = chart ? chart.toBase64Image("image/png", 1) : null;

  return {
    ok: true,
    meta: {
      notificationNumber: (notificationNumber?.value || "Input").trim() || "Input",
      generatedAt: new Date().toISOString()
    },
    thresholds: {
      enabled: thresholdState.enabled,
      warnRatio: warn,
      critRatio: crit
    },
    inputs: {
      riggingWeightTe: res.C2,
      cargoWeightTe: res.C3,
      contingencyFactor: res.C4,
      dafFactor: res.C5,
      wllTe: res.C7
    },
    outputs: {
      totalWeightTe: res.E6,
      utilizationRatio: usedRatio,
      usedCapacityRatio: usedRatio,
      remainingCapacityRatio: remainingRatio
    },
    severity,
    chartPng,
    cargoLog: Array.isArray(cargoState.sentLog) ? cargoState.sentLog : [],
    cargoSumKg: cargoState.sentSumKg
  };
}

function generateTechnicalReport() {
  const payload = getReportPayload();
  if (!payload.ok) {
    playCriticalBeep();
    alert(payload.error);
    return;
  }

  void playReportMabokoStinger();

  const nn = payload.meta.notificationNumber;
  const ts = payload.meta.generatedAt.replace("T", " ").replace("Z", " UTC");
  const safeName = nn.replace(/[^\w\-]+/g, "_");
  const fileName = `technical-report_${safeName || "Input"}.html`;

  const rigLog = Array.isArray(riggingState?.log) ? riggingState.log : [];
  const rigTotalKg = rigLog.reduce((a, e) => a + (Number(e?.subtotalKg) || 0), 0);
  const rigTotalTe = rigTotalKg / 1000;
  const rigRows =
    rigLog.length === 0
      ? `<tr><td colspan="4" style="color: var(--muted);">No rigging log entries.</td></tr>`
      : rigLog
          .slice()
          .reverse()
          .map((e) => {
            const qty = e?.qty ?? "—";
            const label = e?.label ?? "—";
            const unitKg = Number(e?.unitKg);
            const subKg = Number(e?.subtotalKg);
            return `<tr>
  <td class="mono">${escapeHtml(String(label))}</td>
  <td class="right mono">${escapeHtml(String(qty))}</td>
  <td class="right mono">${escapeHtml(Number.isFinite(unitKg) ? formatNumber(unitKg, 3) : "—")}</td>
  <td class="right mono">${escapeHtml(Number.isFinite(subKg) ? formatNumber(subKg, 3) : "—")}</td>
</tr>`;
          })
          .join("");

  const crgLog = Array.isArray(payload.cargoLog) ? payload.cargoLog : [];
  const crgTotalKg = payload.cargoSumKg ?? crgLog.reduce((a, e) => a + (Number(e?.totalKg) || 0), 0);
  const crgTotalTe = crgTotalKg / 1000;
  const crgRows =
    crgLog.length === 0
      ? `<tr><td colspan="4" style="color: var(--muted);">Cargo weight was not sent from the Cargo calculator (entered manually).</td></tr>`
      : crgLog.map((e) => {
            const qty    = e?.qty ?? "—";
            const label  = e?.label ?? "—";
            const unitKg = Number(e?.unitKg);
            const totKg  = Number(e?.totalKg);
            return `<tr>
  <td class="mono">${escapeHtml(String(label))}</td>
  <td class="right mono">${escapeHtml(String(qty))}</td>
  <td class="right mono">${escapeHtml(Number.isFinite(unitKg) ? formatNumber(unitKg, 3) : "—")}</td>
  <td class="right mono">${escapeHtml(Number.isFinite(totKg)  ? formatNumber(totKg,  3) : "—")}</td>
</tr>`;
        }).join("");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Technical Report - ${escapeHtml(nn)}</title>
  <style>
    :root { --text:#0b1220; --muted:#4a5568; --border:#e2e8f0; --bg:#ffffff; --warn:#b7791f; --crit:#c53030; --ok:#2f855a; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: var(--text); background: var(--bg); }
    .page { max-width: 980px; margin: 0 auto; padding: 28px 22px 40px; }
    .top { display:flex; align-items:flex-start; justify-content:space-between; gap: 16px; }
    h1 { margin: 0; font-size: 22px; letter-spacing:.2px; }
    .sub { margin-top: 6px; color: var(--muted); font-size: 13px; line-height: 1.35; }
    .badge { display:inline-flex; align-items:center; gap:8px; border: 1px solid var(--border); padding: 6px 10px; border-radius: 999px; font-size: 12px; color: var(--muted); }
    .sev { font-weight: 800; color: ${payload.severity === "CRITICAL" ? "var(--crit)" : payload.severity === "WARN" ? "var(--warn)" : "var(--ok)"}; }
    hr { border:0; border-top: 1px solid var(--border); margin: 18px 0; }
    .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 860px){ .grid { grid-template-columns: 1fr; } }
    .card { border:1px solid var(--border); border-radius: 14px; padding: 14px; }
    .card h2 { margin: 0 0 10px; font-size: 14px; letter-spacing:.2px; }
    table { width:100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 8px 10px; border-bottom: 1px solid var(--border); text-align:left; vertical-align: top; }
    th { color: var(--muted); font-weight: 700; width: 52%; }
    .th2 th { width: auto; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    .right { text-align:right; }
    .chart { margin-top: 8px; border:1px solid var(--border); border-radius: 14px; padding: 10px; }
    .legend { display:flex; gap: 10px; flex-wrap:wrap; margin: 8px 0 2px; }
    .legItem { display:flex; align-items:center; gap:8px; border:1px solid var(--border); padding: 6px 10px; border-radius: 999px; font-size: 12px; color: var(--muted); }
    .swatch { width: 10px; height: 10px; border-radius: 3px; display:inline-block; }
    .actions { margin-top: 14px; display:flex; gap: 10px; flex-wrap:wrap; }
    .btn { appearance:none; border:1px solid var(--border); background: #f7fafc; padding: 10px 12px; border-radius: 12px; cursor:pointer; font-weight: 700; }
    .btn:hover { background: #edf2f7; }
  </style>
</head>
<body>
  <div class="page">
    <div class="top">
      <div>
        <h1>Technical Report</h1>
        <div class="sub">
          Notification Number: <span class="mono">${escapeHtml(nn)}</span><br/>
          Generated: <span class="mono">${escapeHtml(ts)}</span>
        </div>
      </div>
      <div class="badge">
        Status: <span class="sev">${escapeHtml(payload.severity)}</span>
      </div>
    </div>

    <hr/>

    <div class="grid">
      <div class="card">
        <h2>Inputs</h2>
        <table>
          <tr><th>Rigging Weight</th><td class="right mono">${escapeHtml(formatNumber(payload.inputs.riggingWeightTe, 6))} Te</td></tr>
          <tr><th>Cargo Weight</th><td class="right mono">${escapeHtml(formatNumber(payload.inputs.cargoWeightTe, 6))} Te</td></tr>
          <tr><th>Weight Contingencies</th><td class="right mono">${escapeHtml(formatNumber(payload.inputs.contingencyFactor, 6))}</td></tr>
          <tr><th>DAF</th><td class="right mono">${escapeHtml(formatNumber(payload.inputs.dafFactor, 6))}</td></tr>
          <tr><th>Appliance WLL at Radius</th><td class="right mono">${escapeHtml(formatNumber(payload.inputs.wllTe, 6))} Te</td></tr>
        </table>
      </div>

      <div class="card">
        <h2>Thresholds</h2>
        <table>
          <tr><th>Enabled</th><td class="right mono">${payload.thresholds.enabled ? "Yes" : "No"}</td></tr>
          <tr><th>Warn</th><td class="right mono">${escapeHtml(formatPercent(payload.thresholds.warnRatio))}</td></tr>
          <tr><th>Critical</th><td class="right mono">${escapeHtml(formatPercent(payload.thresholds.critRatio))}</td></tr>
        </table>
      </div>

      <div class="card">
        <h2>Results</h2>
        <table>
          <tr><th>Total Weight</th><td class="right mono">${escapeHtml(formatNumber(payload.outputs.totalWeightTe, 6))} Te</td></tr>
          <tr><th>Utilization Ratio</th><td class="right mono">${escapeHtml(formatPercent(payload.outputs.utilizationRatio))}</td></tr>
          <tr><th>Used Capacity</th><td class="right mono">${escapeHtml(formatPercent(payload.outputs.usedCapacityRatio))}</td></tr>
          <tr><th>Remaining Capacity</th><td class="right mono">${escapeHtml(formatPercent(payload.outputs.remainingCapacityRatio))}</td></tr>
        </table>
      </div>
    </div>

    <div class="card" style="margin-top:14px">
      <h2>Rigging calculator log</h2>
      <div class="sub">Total: <span class="mono">${escapeHtml(formatNumber(rigTotalKg, 3))} kg</span> (${escapeHtml(formatNumber(rigTotalTe, 6))} Te)</div>
      <table class="th2" style="margin-top:8px">
        <tr>
          <th>Item</th>
          <th class="right">Qty</th>
          <th class="right">Unit (kg)</th>
          <th class="right">Subtotal (kg)</th>
        </tr>
        ${rigRows}
      </table>
    </div>

    <div class="card" style="margin-top:14px">
      <h2>Cargo calculator log</h2>
      <div class="sub">${crgLog.length > 0
        ? `Total: <span class="mono">${escapeHtml(formatNumber(crgTotalKg, 3))} kg</span> (${escapeHtml(formatNumber(crgTotalTe, 6))} Te) — sent to main form`
        : `No cargo log — cargo weight entered manually as <span class="mono">${escapeHtml(formatNumber(payload.inputs.cargoWeightTe, 6))} Te</span>`
      }</div>
      <table class="th2" style="margin-top:8px">
        <tr>
          <th>Component</th>
          <th class="right">Qty</th>
          <th class="right">Unit (kg)</th>
          <th class="right">Total (kg)</th>
        </tr>
        ${crgRows}
      </table>
    </div>

    <div class="card" style="margin-top:14px">
      <h2>Calculations</h2>
      <table>
        <tr>
          <th>Total Weight</th>
          <td class="mono right">
            (${escapeHtml(formatNumber(payload.inputs.cargoWeightTe, 6))} + ${escapeHtml(formatNumber(payload.inputs.riggingWeightTe, 6))})
            × ${escapeHtml(formatNumber(payload.inputs.contingencyFactor, 6))}
            × ${escapeHtml(formatNumber(payload.inputs.dafFactor, 6))}
            = ${escapeHtml(formatNumber(payload.outputs.totalWeightTe, 6))} Te
          </td>
        </tr>
        <tr>
          <th>Utilization</th>
          <td class="mono right">
            ${escapeHtml(formatNumber(payload.outputs.totalWeightTe, 6))} ÷ ${escapeHtml(formatNumber(payload.inputs.wllTe, 6))}
            = ${escapeHtml(formatPercent(payload.outputs.utilizationRatio))}
          </td>
        </tr>
      </table>
    </div>

    <div class="chart">
      <h2 style="margin:0 0 10px; font-size:14px; letter-spacing:.2px;">Chart</h2>
      <div class="legend" aria-label="Chart legend">
        <div class="legItem">
          <span class="swatch" style="background: rgba(124,92,255,.80)"></span>
          Used: <span class="mono">${escapeHtml(formatPercent(payload.outputs.usedCapacityRatio))}</span>
        </div>
        <div class="legItem">
          <span class="swatch" style="background: rgba(49,214,196,.60)"></span>
          Remaining: <span class="mono">${escapeHtml(formatPercent(payload.outputs.remainingCapacityRatio))}</span>
        </div>
      </div>
      ${payload.chartPng ? `<img alt="Used vs Remaining chart" src="${payload.chartPng}" style="max-width:100%; height:auto; display:block;" />` : `<div class="sub">Chart unavailable.</div>`}
    </div>

    <div class="actions">
      <button class="btn" onclick="window.print()">Print / Save as PDF</button>
      <button class="btn" onclick="downloadHtml()">Download HTML</button>
    </div>
  </div>
  <script>
    function downloadHtml(){
      const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html;charset=utf-8' });
      const a = document.createElement('a');
      a.download = ${JSON.stringify(fileName)};
      a.href = URL.createObjectURL(blob);
      a.click();
      URL.revokeObjectURL(a.href);
    }
  </script>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) {
    alert("Popup blocked. Please allow popups to generate the report.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function wireEvents() {
  for (const inp of [riggingWeight, cargoWeight, contingency, daf, wll]) {
    inp.addEventListener("input", recompute);
    inp.addEventListener("change", recompute);
  }
  resetBtn.addEventListener("click", () => {
    if (notificationNumber) notificationNumber.value = "Input";
    riggingWeight.value = String(EXCEL_DEFAULTS.riggingWeight);
    cargoWeight.value = String(EXCEL_DEFAULTS.cargoWeight);
    contingency.value = String(EXCEL_DEFAULTS.contingency);
    daf.value = String(EXCEL_DEFAULTS.daf);
    wll.value = String(EXCEL_DEFAULTS.wll);
    // Clear cargo calculator list + Send snapshot so report/hints cannot lie after Reset
    cargoState.log = [];
    cargoState.sentLog = [];
    cargoState.sentSumKg = null;
    renderCargoLog();
    recompute();
  });
  generateReportBtn.addEventListener("click", generateTechnicalReport);

  if (riggingCalcBtn) riggingCalcBtn.addEventListener("click", showRiggingModal);
  if (riggingModalCloseBtn) riggingModalCloseBtn.addEventListener("click", hideRiggingModal);
  if (riggingModal) {
    riggingModal.addEventListener("click", (e) => {
      if (e.target === riggingModal) hideRiggingModal();
    });
  }

  if (riggingHelpBtn) riggingHelpBtn.addEventListener("click", showRiggingHelp);
  if (riggingHelpCloseBtn) riggingHelpCloseBtn.addEventListener("click", hideRiggingHelp);
  if (riggingHelpModal) {
    riggingHelpModal.addEventListener("click", (e) => {
      if (e.target === riggingHelpModal) hideRiggingHelp();
    });
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && riggingModal && !riggingModal.hidden) hideRiggingModal();
    if (e.key === "Escape" && riggingHelpModal && !riggingHelpModal.hidden) hideRiggingHelp();
    if (e.key === "Escape" && cargoModal && !cargoModal.hidden) hideCargoModal();
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey && riggingModal && !riggingModal.hidden) {
      const t = e.target;
      const tag = String(t?.tagName || "").toLowerCase();
      // allow Enter in inputs, but do not submit/refresh page
      if (tag !== "textarea") {
        e.preventDefault();
        riggingConfirmBtn?.click();
      }
    }
  });
  if (riggingClearSelectionBtn) {
    riggingClearSelectionBtn.addEventListener("click", () => {
      riggingState.selections.clear();
      renderRiggingUI();
    });
  }
  if (riggingClearLogBtn) {
    riggingClearLogBtn.addEventListener("click", () => {
      riggingState.log = [];
      riggingState.lastSumKg = null;
      renderRiggingUI();
    });
  }
  if (riggingConfirmBtn) riggingConfirmBtn.addEventListener("click", confirmRiggingSelectionToLog);
  if (riggingSendToMainBtn) riggingSendToMainBtn.addEventListener("click", sendRiggingSumToMain);
}

/**
 * Dialogflow Messenger keeps the composer inside nested Shadow DOM; CSS variables
 * sometimes don't reach <textarea>/inputs → white box / invisible text. Force contrast.
 */
function styleDfMessengerWritableFields(root, depth = 0) {
  if (!root || depth > 28) return;
  try {
    const fields =
      root.querySelectorAll?.("textarea, input, [contenteditable=\"true\"], [role=\"textbox\"]") ?? [];
    for (const el of fields) {
      const tag = el.tagName?.toLowerCase();
      if (tag === "input") {
        const type = String(el.type || "text").toLowerCase();
        if (type !== "text" && type !== "search") continue;
      }
      el.style.setProperty("background-color", "#0f1628", "important");
      el.style.setProperty("color", "#ffffff", "important");
      el.style.setProperty("caret-color", "#31d6c4", "important");
      el.style.setProperty("-webkit-text-fill-color", "#ffffff", "important");
    }
    const all = root.querySelectorAll?.("*") ?? [];
    for (const el of all) {
      if (el.shadowRoot) styleDfMessengerWritableFields(el.shadowRoot, depth + 1);
    }
  } catch {
    /* ignore */
  }
}

function wireDfMessengerComposerContrast() {
  const run = () => {
    const m = document.querySelector("df-messenger");
    if (!m) return;
    styleDfMessengerWritableFields(m);
    if (m.shadowRoot) styleDfMessengerWritableFields(m.shadowRoot);
  };

  let debounceId = null;
  const scheduleRun = () => {
    window.clearTimeout(debounceId);
    debounceId = window.setTimeout(run, 40);
  };

  run();
  window.setTimeout(run, 400);
  window.setTimeout(run, 1200);

  for (const evt of ["df-chat-opened", "df-chat-open", "DF_CHAT_OPENED"]) {
    window.addEventListener(evt, scheduleRun);
    document.addEventListener(evt, scheduleRun);
  }

  const attachObserver = () => {
    const m = document.querySelector("df-messenger");
    if (!m || m.dataset.dfComposerObs === "1") return;
    m.dataset.dfComposerObs = "1";
    const obs = new MutationObserver(scheduleRun);
    obs.observe(m, { childList: true, subtree: true });
    try {
      if (m.shadowRoot) obs.observe(m.shadowRoot, { childList: true, subtree: true });
    } catch {
      /* ignore */
    }
  };

  attachObserver();
  if (window.customElements?.whenDefined) {
    window.customElements.whenDefined("df-messenger").then(() => {
      attachObserver();
      run();
    }).catch(() => {});
  }
  window.setTimeout(() => {
    attachObserver();
    run();
  }, 800);
}

/** Optional: log full Dialogflow Messenger responses (helps verify webhook vs widget). Enable with ?dfDebug=1 or localStorage dfMessengerDebug=1 */
function wireDfMessengerDebugLogging() {
  try {
    const sp = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const enabled =
      sp?.has("dfDebug") ||
      (typeof window !== "undefined" && window.localStorage?.getItem("dfMessengerDebug") === "1");
    if (!enabled) return;

    window.addEventListener("df-response-received", (e) => {
      const d = e?.detail;
      console.groupCollapsed("[Dialogflow] df-response-received");
      console.log("detail", d);
      console.log("raw (verbatim)", d?.raw);
      console.log("messages (parsed)", d?.data?.messages);
      console.groupEnd();
    });
  } catch {
    /* ignore */
  }
}

function init() {
  renderThresholdControls();
  wireEvents();
  wireDfMessengerComposerContrast();
  wireDfMessengerDebugLogging();
  ensureChart();
  recompute();
  renderRiggingUI();
  if (window.speechSynthesis) {
    const warm = () => speechSynthesis.getVoices();
    warm();
    speechSynthesis.onvoiceschanged = warm;
  }
}

init();

// ═══════════════════════════════════════════════════════════════════════════
// CARGO WEIGHT CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════

const cargoModal        = el("cargoModal");
const cargoModalCloseBtn= el("cargoModalCloseBtn");
const cargoCalcBtn      = el("cargoCalcBtn");
const cargoCalcHint     = el("cargoCalcHint");
const cargoCatSel       = el("cargoCatSel");
const cargoTypeSel      = el("cargoTypeSel");
const cargoClassWrap    = el("cargoClassWrap");
const cargoClassSel     = el("cargoClassSel");
const cargoNpsSel       = el("cargoNpsSel");
const cargoLenWrap      = el("cargoLenWrap");
const cargoLenInput     = el("cargoLenInput");
const cargoFillSel      = el("cargoFillSel");
const cargoTypeLabel    = el("cargoTypeLabel");
const cargoClassLabel   = el("cargoClassLabel");
const cargoQtyWrap      = el("cargoQtyWrap");
const cargoPreview      = el("cargoPreview");
const cargoAddBtn       = el("cargoAddBtn");
const cargoLogTable     = el("cargoLogTable");
const cargoSumPill      = el("cargoSumPill");
const cargoClearLogBtn  = el("cargoClearLogBtn");
const cargoSendBtn      = el("cargoSendBtn");

const cargoState = {
  qty: 1,
  log: [],        // { id, label, qty, unitKg, totalKg, fillId?, fillLabel? }
  lastSumKg: null,
  savedLen: "1",  // restored when switching back to Pipe
  sentLog: [],    // snapshot saved when "Send to Cargo Weight" is clicked
  sentSumKg: null
};

// ── Helpers ────────────────────────────────────────────────────────────────

function getCatalog() { return window.PIPING_CATALOG || null; }

function getFillMediaItems() {
  const items = window.FILL_MEDIA_CATALOG?.items;
  return Array.isArray(items) ? items : [];
}

function findFillMedia(fillId) {
  return getFillMediaItems().find((i) => i.id === fillId) || null;
}

/** Pipe steel + fill mass. Fill applies only when geometry (t, ID) is valid. */
function pipeUnitMass(item, lenM, densityKgPerM3) {
  const steelKg = item.wt * lenM;
  const density = Number.isFinite(densityKgPerM3) ? densityKgPerM3 : 0;
  if (!(density > 0)) {
    return { steelKg, fillKg: 0, unitKg: steelKg, geometryOk: true };
  }
  const t = item.t;
  if (typeof t !== "number" || !(t > 0)) {
    return { steelKg, fillKg: 0, unitKg: steelKg, geometryOk: false };
  }
  const idMm = item.od - 2 * t;
  if (!(idMm > 0)) {
    return { steelKg, fillKg: 0, unitKg: steelKg, geometryOk: false };
  }
  const V_m3 = Math.PI * (idMm / 2000) ** 2 * lenM;
  const fillKg = V_m3 * density;
  return { steelKg, fillKg, unitKg: steelKg + fillKg, geometryOk: true };
}

function cargoCategories() {
  return [
    { id: "pipe",    label: "Pipe",                hasClass: false, hasLength: true  },
    { id: "fitting", label: "Butt-Weld Fitting",   hasClass: true,  hasLength: false },
    { id: "flange",  label: "Flange",              hasClass: true,  hasLength: false },
    { id: "valve",   label: "Valve",               hasClass: true,  hasLength: false }
  ];
}

function getTypeList(catId) {
  const cat = getCatalog();
  if (!cat) return [];
  if (catId === "pipe")    return Object.keys(cat.pipes   || {});
  if (catId === "fitting") return Object.keys(cat.fittings|| {});
  if (catId === "flange")  return Object.keys(cat.flanges || {});
  if (catId === "valve")   return Object.keys(cat.valves  || {});
  return [];
}

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

function findItem(catId, typeId, classId, nps) {
  return getNpsList(catId, typeId, classId).find(i => i.nps === nps) || null;
}

function calcUnitKg(item, catId, classId, lenM, fillId) {
  if (!item) return null;
  if (catId === "pipe") {
    const fill = findFillMedia(fillId);
    const density = fill?.densityKgPerM3 ?? 0;
    return pipeUnitMass(item, lenM, density).unitKg;
  }
  return item.wt;
}

// ── Build selects ──────────────────────────────────────────────────────────

function fillSelect(sel, options, valueKey, labelKey) {
  sel.innerHTML = "";
  for (const opt of options) {
    const o = document.createElement("option");
    o.value  = typeof opt === "string" ? opt : opt[valueKey];
    o.textContent = typeof opt === "string" ? opt : opt[labelKey];
    sel.appendChild(o);
  }
}

function buildCargoFillSelect() {
  if (!cargoFillSel) return;
  const items = getFillMediaItems();
  if (!items.length) {
    cargoFillSel.innerHTML = '<option value="empty">Empty</option>';
    if (cargoPreview) cargoPreview.textContent = "⚠ fill_media_catalog.js not loaded";
    console.error("CARGO: window.FILL_MEDIA_CATALOG is not defined. Check that data/fill_media_catalog.js loads without errors.");
    return;
  }
  fillSelect(cargoFillSel, items, "id", "label");
  cargoFillSel.value = "empty";
}

function buildCargoSelects() {
  // Category options are static HTML – no need to rebuild them.
  if (!getCatalog()) {
    if (cargoPreview) cargoPreview.textContent = "⚠ piping_catalog.js not loaded";
    console.error("CARGO: window.PIPING_CATALOG is not defined. Check that data/piping_catalog.js loads without errors.");
  }
  buildCargoFillSelect();
  syncCargoType();
}

function syncCargoType() {
  const catId = cargoCatSel.value;
  const types = getTypeList(catId);
  console.log("CARGO syncCargoType:", catId, "→", types.length, "types");
  if (cargoTypeLabel) {
    cargoTypeLabel.textContent = catId === "pipe" ? "Schedule" : "Type";
  }
  fillSelect(cargoTypeSel, types);
  syncCargoClass();
}

function syncCargoClass() {
  const catId  = cargoCatSel.value;
  const typeId = cargoTypeSel.value;
  const cats   = cargoCategories();
  const cat    = cats.find(c => c.id === catId);
  const hasClass = cat?.hasClass || false;
  const hasLen   = cat?.hasLength || false;

  // Class/Rating label: dynamic based on category
  if (cargoClassLabel) {
    if (catId === "fitting") cargoClassLabel.textContent = "Schedule";
    else if (hasClass)       cargoClassLabel.textContent = "Class / Rating";
    else                     cargoClassLabel.textContent = "Class / Rating";
  }

  // Class/Rating: always visible, disabled with "—" when not applicable (Pipe only now)
  if (cargoClassSel) {
    if (hasClass) {
      cargoClassSel.disabled = false;
      const classes = getClassList(catId, typeId);
      fillSelect(cargoClassSel, classes);
    } else {
      cargoClassSel.disabled = true;
      cargoClassSel.innerHTML = '<option value="">—</option>';
    }
  }

  // Length: always visible, disabled with "—" when not applicable
  if (cargoLenInput) {
    if (hasLen) {
      cargoLenInput.disabled = false;
      if (cargoLenInput.value === "—" || cargoLenInput.value === "") {
        cargoLenInput.value = cargoState.savedLen || "1";
      }
    } else {
      if (!cargoLenInput.disabled) {
        cargoState.savedLen = cargoLenInput.value;
      }
      cargoLenInput.disabled = true;
      cargoLenInput.value = "—";
    }
  }
  syncCargoNps();
}

function syncCargoNps() {
  const catId   = cargoCatSel.value;
  const typeId  = cargoTypeSel.value;
  const classId = cargoClassSel.value;
  const items   = getNpsList(catId, typeId, classId);
  fillSelect(cargoNpsSel, items, "nps", "nps");
  updateCargoPreview();
}

function updateCargoPreview() {
  const catId   = cargoCatSel.value;
  const typeId  = cargoTypeSel.value;
  const classId = cargoClassSel.value;
  const nps     = cargoNpsSel.value;
  const lenM    = parseNumber(cargoLenInput?.value) ?? 1;
  const fillId  = cargoFillSel?.value || "empty";
  const fill    = findFillMedia(fillId);
  const item    = findItem(catId, typeId, classId, nps);
  const unitKg  = calcUnitKg(item, catId, classId, lenM, fillId);

  if (!cargoPreview) return;
  const cats = cargoCategories();
  const cat  = cats.find(c => c.id === catId);
  if (cat?.hasLength && !(lenM > 0)) {
    cargoPreview.textContent = "—";
    return;
  }
  if (unitKg == null || !Number.isFinite(unitKg)) {
    cargoPreview.textContent = "—";
    return;
  }

  if (cat?.hasLength) {
    const density = fill?.densityKgPerM3 ?? 0;
    const mass = pipeUnitMass(item, lenM, density);
    let text = `${formatKg(item.wt)} kg/m × ${lenM} m`;
    if (density > 0) {
      if (!mass.geometryOk) {
        text += ` = ${formatKg(mass.unitKg)} kg/pc (fill geometry unavailable)`;
      } else {
        const fillLabel = fill?.label || fillId;
        text += ` + ${fillLabel} = ${formatKg(mass.unitKg)} kg/pc`;
      }
    } else {
      text += ` = ${formatKg(mass.unitKg)} kg/pc`;
    }
    cargoPreview.textContent = text;
  } else {
    cargoPreview.textContent = `${formatKg(unitKg)} kg/pc`;
  }
}

// ── Add item to log ────────────────────────────────────────────────────────

function cargoAddItem() {
  const catId   = cargoCatSel.value;
  const typeId  = cargoTypeSel.value;
  const classId = cargoClassSel.value;
  const nps     = cargoNpsSel.value;
  const lenM    = parseNumber(cargoLenInput?.value) ?? 1;
  const fillId  = cargoFillSel?.value || "empty";
  const fill    = findFillMedia(fillId);
  const qty     = cargoState.qty;
  const item    = findItem(catId, typeId, classId, nps);
  const needsLen = !cargoLenInput?.disabled;

  if (!item || qty < 1) return;
  if (needsLen && !(lenM > 0)) return;

  let unitKg;
  let pipeMass = null;
  if (catId === "pipe") {
    pipeMass = pipeUnitMass(item, lenM, fill?.densityKgPerM3 ?? 0);
    unitKg = pipeMass.unitKg;
  } else {
    unitKg = calcUnitKg(item, catId, classId, lenM, fillId);
  }
  if (!Number.isFinite(unitKg)) return;

  const cats    = cargoCategories();
  const catLabel= cats.find(c => c.id === catId)?.label || catId;

  let label = `${catLabel} | ${typeId}`;
  if (classId && !cargoClassSel.disabled) label += ` | ${classId}`;
  label += ` | NPS ${nps}"`;
  if (!cargoLenInput.disabled) label += ` | ${lenM} m`;

  const entry = {
    id: Date.now() + Math.random(),
    label,
    qty,
    unitKg,
    totalKg: unitKg * qty
  };

  if (catId === "pipe" && pipeMass) {
    const fillLabel = fill?.label || "Empty";
    const density = fill?.densityKgPerM3 ?? 0;
    const displayFill =
      density > 0 && !pipeMass.geometryOk
        ? `${fillLabel} (geometry unavailable)`
        : fillLabel;
    entry.fillId = fill?.id || "empty";
    entry.fillLabel = displayFill;
    entry.label = `${label} | ${displayFill}`;
  }

  cargoState.log.push(entry);

  renderCargoLog();
}

// ── Render log ─────────────────────────────────────────────────────────────

function renderCargoLog() {
  if (!cargoLogTable) return;
  const log = cargoState.log;

  const thead = document.createElement("thead");
  thead.innerHTML = `<tr>
    <th>Component</th>
    <th class="num" style="width:90px">Unit (kg)</th>
    <th class="num" style="width:70px">Qty</th>
    <th class="num" style="width:100px">Total (kg)</th>
    <th style="width:50px"></th>
  </tr>`;

  const tbody = document.createElement("tbody");
  if (log.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5" style="color:var(--muted);text-align:center;padding:18px">No items yet. Select a component and click Add.</td>`;
    tbody.appendChild(tr);
  } else {
    for (const entry of log) {
      const tr = document.createElement("tr");
      const delBtn = document.createElement("button");
      delBtn.className = "cargoLog__del";
      delBtn.textContent = "✕";
      delBtn.title = "Remove";
      delBtn.addEventListener("click", () => {
        cargoState.log = cargoState.log.filter(e => e.id !== entry.id);
        renderCargoLog();
      });

      const tdLabel = document.createElement("td");
      tdLabel.textContent = entry.label;

      const tdUnit = document.createElement("td");
      tdUnit.className = "num mono";
      tdUnit.textContent = formatKg(entry.unitKg);

      const tdQty = document.createElement("td");
      tdQty.className = "num mono";
      tdQty.textContent = String(entry.qty);

      const tdTotal = document.createElement("td");
      tdTotal.className = "num mono";
      tdTotal.textContent = formatKg(entry.totalKg);

      const tdDel = document.createElement("td");
      tdDel.style.textAlign = "center";
      tdDel.appendChild(delBtn);

      tr.appendChild(tdLabel);
      tr.appendChild(tdUnit);
      tr.appendChild(tdQty);
      tr.appendChild(tdTotal);
      tr.appendChild(tdDel);
      tbody.appendChild(tr);
    }
  }

  cargoLogTable.innerHTML = "";
  cargoLogTable.appendChild(thead);
  cargoLogTable.appendChild(tbody);

  const totalKg = log.reduce((s, e) => s + e.totalKg, 0);
  cargoState.lastSumKg = log.length > 0 ? totalKg : null;

  if (cargoSumPill) {
    cargoSumPill.textContent = log.length > 0
      ? `Total: ${formatKg(totalKg)} kg (${formatNumber(totalKg / 1000, 4)} Te)`
      : "Total: —";
  }

  if (cargoSendBtn) cargoSendBtn.disabled = (log.length === 0);

  // update hint on main page
  if (cargoCalcHint) {
    if (log.length > 0) {
      cargoCalcHint.textContent = `${log.length} item(s) · ${formatKg(totalKg)} kg total`;
      cargoCalcHint.hidden = false;
    } else {
      cargoCalcHint.hidden = true;
    }
  }
}

// ── Modal show/hide ────────────────────────────────────────────────────────

function showCargoModal() {
  if (!cargoModal) return;
  cargoModal.hidden = false;
  cargoModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  buildCargoSelects();
  renderCargoLog();
}

function hideCargoModal() {
  if (!cargoModal) return;
  cargoModal.hidden = true;
  cargoModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// ── Qty stepper ────────────────────────────────────────────────────────────

function buildCargoQtyStepper() {
  if (!cargoQtyWrap) return;
  cargoQtyWrap.innerHTML = "";
  const stepper = buildStepperInput({
    value: cargoState.qty,
    min: 1,
    inputMode: "numeric",
    allowDecimal: false,
    ariaLabel: "Quantity",
    onChange: (n) => {
      cargoState.qty = n;
      updateCargoPreview();
    }
  });
  cargoQtyWrap.appendChild(stepper.wrap);
}

// ── Wire events ────────────────────────────────────────────────────────────

if (cargoCalcBtn)       cargoCalcBtn.addEventListener("click", showCargoModal);
if (cargoModalCloseBtn) cargoModalCloseBtn.addEventListener("click", hideCargoModal);

if (cargoModal) {
  cargoModal.addEventListener("click", (e) => {
    if (e.target === cargoModal) hideCargoModal();
  });
}

if (cargoCatSel) {
  cargoCatSel.addEventListener("change", () => { syncCargoType(); buildCargoQtyStepper(); });
}
if (cargoTypeSel) {
  cargoTypeSel.addEventListener("change", () => syncCargoClass());
}
if (cargoClassSel) {
  cargoClassSel.addEventListener("change", () => syncCargoNps());
}
if (cargoNpsSel) {
  cargoNpsSel.addEventListener("change", () => updateCargoPreview());
}
if (cargoLenInput) {
  cargoLenInput.addEventListener("input", () => updateCargoPreview());
}
if (cargoFillSel) {
  cargoFillSel.addEventListener("change", () => updateCargoPreview());
}
if (cargoAddBtn) {
  cargoAddBtn.addEventListener("click", () => cargoAddItem());
}
if (cargoClearLogBtn) {
  cargoClearLogBtn.addEventListener("click", () => {
    cargoState.log = [];
    renderCargoLog();
  });
}
if (cargoSendBtn) {
  cargoSendBtn.addEventListener("click", () => {
    if (cargoState.lastSumKg == null) return;
    const te = cargoState.lastSumKg / 1000;
    // Save snapshot for report
    cargoState.sentLog    = cargoState.log.map(e => ({ ...e }));
    cargoState.sentSumKg  = cargoState.lastSumKg;
    cargoWeight.value = String(formatNumber(te, 6));
    recompute();
    hideCargoModal();
  });
}

// Initialise qty stepper on first open
document.addEventListener("DOMContentLoaded", () => {
  buildCargoQtyStepper();
}, { once: true });
// Fallback if DOMContentLoaded already fired
if (document.readyState !== "loading") buildCargoQtyStepper();
