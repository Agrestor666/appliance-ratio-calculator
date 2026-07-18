/**
 * One-shot generator for fitting-weight-candidates.md (Phase 1).
 * Run: node context/changes/b16-9-fitting-catalog-schedule/_gen_candidates.js
 * Delete after Sign-off if desired — not runtime code.
 */
const fs = require("fs");
const path = require("path");

const PIPE_KEYS = [
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
];

function normNps(s) {
  return String(s)
    .replace(/(\d)\.(\d)\/(\d)/g, "$1-$2/$3") // 1.1/4 → 1-1/4
    .replace(/-/g, (m, offset, str) => {
      // keep fraction hyphens; convert pair hyphens later
      return m;
    })
    .replace(/(\d+(?:-\d+\/\d+|\d*\/\d+|\d+))-(\d+(?:-\d+\/\d+|\d*\/\d+|\d+))/g, "$1x$2");
}

// Fix pair: "3/4-1/2" → "3/4x1/2"; already handled if we convert last hyphen between sizes
function pairNps(s) {
  // Wermac uses 3/4-1/2, 1.1/4-1, 8-6
  const parts = String(s).split("-");
  if (parts.length === 2 && !parts[0].includes("/") && !parts[1].includes("/")) {
    // could be 8-6 or 1.1/4 broken — handle 1.1/4 specially below
  }
  // Normalize dotted fractions first on whole string carefully
  let t = String(s).replace(/(\d)\.(\d)\/(\d)/g, "$1-$2/$3");
  // Split on last hyphen that separates two NPS tokens
  const m = t.match(/^(.+)-(.+)$/);
  if (!m) return t;
  // If left ends with digit or fraction and right starts with digit — it's a pair
  return `${m[1]}x${m[2]}`;
}

function npsSimple(s) {
  return String(s).replace(/(\d)\.(\d)\/(\d)/g, "$1-$2/$3");
}

/** @type {Record<string, Record<string, [string, number][]>>} */
const CHART = {
  "90° LR Elbow": {
    STD: [
      ["1/2", 0.08],
      ["3/4", 0.09],
      ["1", 0.18],
      ["1-1/4", 0.27],
      ["1-1/2", 0.41],
      ["2", 0.73],
      ["2-1/2", 1.47],
      ["3", 2.27],
      ["3-1/2", 3.06],
      ["4", 4.08],
      ["5", 6.8],
      ["6", 11.11],
      ["8", 22.68],
      ["10", 39.92],
      ["12", 56.7],
      ["14", 72.57],
      ["16", 93.44],
      ["18", 117.93],
      ["20", 145.15],
      ["22", 178.72],
      ["24", 208.65],
      ["26", 249.48],
      ["30", 332.94],
      ["36", 481.72],
    ],
    XS: [
      ["1/2", 0.11],
      ["3/4", 0.11],
      ["1", 0.23],
      ["1-1/4", 0.41],
      ["1-1/2", 0.52],
      ["2", 1.0],
      ["2-1/2", 1.81],
      ["3", 2.95],
      ["3-1/2", 3.79],
      ["4", 6.12],
      ["5", 9.98],
      ["6", 15.88],
      ["8", 32.21],
      ["10", 48.53],
      ["12", 72.57],
      ["14", 92.99],
      ["16", 125.19],
      ["18", 154.22],
      ["20", 190.51],
      ["22", 235.87],
      ["24", 272.16],
      ["26", 330.67],
      ["30", 442.25],
      ["36", 640.47],
    ],
    "Sch 160": [
      ["1", 0.27],
      ["1-1/4", 0.45],
      ["1-1/2", 0.82],
      ["2", 1.47],
      ["2-1/2", 2.33],
      ["3", 3.86],
      ["4", 8.16],
      ["5", 14.51],
      ["6", 25.85],
      ["8", 54.43],
      ["10", 117.93],
      ["12", 204.12],
      ["14", 259.45],
    ],
    XXS: [
      ["1", 0.34],
      ["1-1/4", 0.63],
      ["1-1/2", 0.68],
      ["2", 1.59],
      ["2-1/2", 3.18],
      ["3", 4.99],
      ["3-1/2", 7.26],
      ["4", 9.07],
      ["5", 16.33],
      ["6", 29.48],
      ["8", 53.52],
    ],
  },
  "90° SR Elbow": {
    STD: [
      ["1", 0.11],
      ["1-1/4", 0.18],
      ["1-1/2", 0.25],
      ["2", 0.45],
      ["2-1/2", 0.97],
      ["3", 1.36],
      ["3-1/2", 2.04],
      ["4", 2.83],
      ["5", 4.35],
      ["6", 8.16],
      ["8", 15.42],
      ["10", 26.31],
      ["12", 36.29],
      ["14", 47.63],
      ["16", 59.87],
      ["18", 75.75],
      ["20", 95.25],
      ["24", 135.17],
    ],
    XS: [
      ["1-1/2", 0.34],
      ["2", 0.68],
      ["2-1/2", 1.27],
      ["3", 1.93],
      ["3-1/2", 2.72],
      ["4", 3.86],
      ["5", 6.35],
      ["6", 10.43],
      ["8", 21.55],
      ["10", 31.75],
      ["12", 47.17],
      ["14", 63.5],
      ["16", 78.93],
      ["18", 99.34],
      ["20", 124.74],
      ["24", 177.81],
    ],
  },
  "45° LR Elbow": {
    STD: [
      ["1/2", 0.04],
      ["3/4", 0.04],
      ["1", 0.11],
      ["1-1/4", 0.17],
      ["1-1/2", 0.18],
      ["2", 0.37],
      ["2-1/2", 0.79],
      ["3", 1.19],
      ["3-1/2", 1.59],
      ["4", 2.04],
      ["5", 3.4],
      ["6", 5.44],
      ["8", 10.43],
      ["10", 19.5],
      ["12", 28.12],
      ["14", 36.29],
      ["16", 45.36],
      ["18", 57.15],
      ["20", 72.57],
      ["22", 89.36],
      ["24", 107.95],
      ["26", 124.74],
      ["30", 166.47],
      ["36", 240.86],
    ],
    XS: [
      ["1/2", 0.09],
      ["3/4", 0.09],
      ["1", 0.14],
      ["1-1/4", 0.23],
      ["1-1/2", 0.31],
      ["2", 0.54],
      ["2-1/2", 0.97],
      ["3", 1.59],
      ["3-1/2", 2.04],
      ["4", 2.77],
      ["5", 4.85],
      ["6", 7.94],
      ["8", 15.88],
      ["10", 24.04],
      ["12", 38.1],
      ["14", 45.36],
      ["16", 61.23],
      ["18", 75.75],
      ["20", 93.44],
      ["22", 117.93],
      ["24", 136.08],
      ["26", 165.56],
      ["30", 221.35],
      ["36", 320.24],
    ],
  },
  "180° LR Return": {
    STD: [
      ["1/2", 0.16],
      ["3/4", 0.18],
      ["1", 0.34],
      ["1-1/4", 0.57],
      ["1-1/2", 0.85],
      ["2", 1.47],
      ["2-1/2", 2.95],
      ["3", 4.65],
      ["3-1/2", 5.9],
      ["4", 8.39],
      ["5", 13.61],
      ["6", 22.68],
      ["8", 43.09],
      ["10", 53.07],
      ["12", 104.33],
      ["14", 147.42],
      ["16", 186.88],
      ["18", 231.33],
      ["20", 290.3],
      ["22", 356.98],
      ["24", 403.7],
    ],
    XS: [
      ["3/4", 0.29],
      ["1", 0.45],
      ["1-1/4", 0.79],
      ["1-1/2", 1.08],
      ["2", 2.0],
      ["2-1/2", 3.63],
      ["3", 5.9],
      ["3-1/2", 7.6],
      ["4", 11.34],
      ["5", 19.96],
      ["6", 31.75],
      ["8", 64.41],
      ["10", 97.52],
      ["12", 145.15],
      ["14", 181.44],
      ["16", 249.48],
      ["18", 312.98],
      ["20", 376.48],
      ["22", 471.74],
      ["24", 544.31],
    ],
  },
  "180° SR Return": {
    STD: [
      ["1", 0.23],
      ["1-1/4", 0.36],
      ["1-1/2", 0.51],
      ["2", 0.91],
      ["2-1/2", 1.93],
      ["3", 2.72],
      ["3-1/2", 4.08],
      ["4", 5.67],
      ["5", 8.62],
      ["6", 15.88],
      ["8", 30.84],
      ["10", 52.16],
      ["12", 70.31],
      ["14", 95.25],
      ["16", 117.93],
      ["18", 149.69],
      ["20", 185.97],
      ["24", 267.62],
    ],
    XS: [
      ["1-1/2", 0.68],
      ["2", 1.36],
      ["2-1/2", 2.54],
      ["3", 3.86],
      ["3-1/2", 5.44],
      ["4", 7.71],
      ["5", 12.7],
      ["6", 20.87],
      ["8", 45.36],
      ["10", 63.5],
      ["12", 98.88],
      ["14", 124.74],
      ["16", 154.22],
      ["18", 195.04],
      ["20", 249.48],
      ["24", 353.8],
    ],
  },
  "90° 3D Elbow": {
    STD: [
      ["2", 1.36],
      ["2-1/2", 2.72],
      ["3", 4.54],
      ["3-1/2", 5.9],
      ["4", 8.16],
      ["5", 13.15],
      ["6", 20.41],
      ["8", 40.82],
      ["10", 72.12],
      ["12", 105.69],
      ["14", 135.17],
      ["16", 176.9],
      ["18", 224.53],
      ["20", 276.69],
      ["22", 333.39],
      ["24", 396.89],
      ["26", 467.2],
      ["30", 621.42],
      ["36", 893.58],
    ],
    XS: [
      ["2", 1.81],
      ["2-1/2", 3.63],
      ["3", 5.9],
      ["3-1/2", 8.16],
      ["4", 11.34],
      ["5", 19.5],
      ["6", 31.75],
      ["8", 63.5],
      ["10", 98.88],
      ["12", 140.61],
      ["14", 181.44],
      ["16", 235.87],
      ["18", 299.37],
      ["20", 367.41],
      ["22", 444.52],
      ["24", 530.7],
      ["26", 621.42],
      ["30", 830.07],
      ["36", 1192.95],
    ],
  },
  "45° 3D Elbow": {
    STD: [
      ["2", 0.68],
      ["2-1/2", 1.36],
      ["3", 2.27],
      ["3-1/2", 3.18],
      ["4", 4.08],
      ["5", 6.8],
      ["6", 10.43],
      ["8", 20.41],
      ["10", 36.29],
      ["12", 53.07],
      ["14", 67.59],
      ["16", 88.45],
      ["18", 112.49],
      ["20", 138.35],
      ["22", 166.92],
      ["24", 198.67],
      ["26", 233.6],
      ["30", 310.71],
      ["36", 446.79],
    ],
    XS: [
      ["2", 0.95],
      ["2-1/2", 1.81],
      ["3", 3.18],
      ["3-1/2", 4.08],
      ["4", 5.9],
      ["5", 9.98],
      ["6", 15.88],
      ["8", 31.75],
      ["10", 49.44],
      ["12", 70.31],
      ["14", 90.72],
      ["16", 117.93],
      ["18", 149.69],
      ["20", 183.7],
      ["22", 222.26],
      ["24", 265.35],
      ["26", 310.71],
      ["30", 415.04],
      ["36", 596.47],
    ],
  },
  "Equal Tee": {
    STD: [
      ["1/2", 0.16],
      ["3/4", 0.2],
      ["1", 0.34],
      ["1-1/4", 0.59],
      ["1-1/2", 0.91],
      ["2", 1.59],
      ["2-1/2", 2.72],
      ["3", 3.18],
      ["3-1/2", 4.08],
      ["4", 5.44],
      ["5", 9.53],
      ["6", 15.42],
      ["8", 24.95],
      ["10", 38.56],
      ["12", 54.43],
      ["14", 74.84],
      ["16", 88.45],
      ["18", 112.94],
      ["20", 155.13],
      ["22", 187.79],
      ["24", 239.5],
      ["26", 349.27],
      ["30", 480.81],
      ["36", 675.85],
    ],
    XS: [
      ["1/2", 0.2],
      ["3/4", 0.27],
      ["1", 0.4],
      ["1-1/4", 0.73],
      ["1-1/2", 1.02],
      ["2", 1.81],
      ["2-1/2", 3.18],
      ["3", 3.86],
      ["3-1/2", 5.44],
      ["4", 7.17],
      ["5", 11.79],
      ["6", 18.14],
      ["8", 34.02],
      ["10", 47.63],
      ["12", 72.57],
      ["14", 108.86],
      ["16", 127.01],
      ["18", 150.59],
      ["20", 217.72],
      ["22", 249.48],
      ["24", 276.69],
      ["26", 396.89],
      ["30", 544.31],
      ["36", 771.11],
    ],
    "Sch 160": [
      ["1/2", 0.16],
      ["3/4", 0.26],
      ["1", 0.45],
      ["1-1/4", 0.91],
      ["1-1/2", 1.36],
      ["2", 2.27],
      ["2-1/2", 3.63],
      ["3", 4.54],
      ["4", 11.34],
      ["5", 24.95],
      ["6", 28.12],
      ["8", 49.9],
      ["10", 117.93],
      ["12", 217.72],
    ],
    XXS: [
      ["1", 0.57],
      ["1-1/4", 1.13],
      ["1-1/2", 1.53],
      ["2", 2.83],
      ["2-1/2", 4.76],
      ["3", 6.12],
      ["3-1/2", 8.16],
      ["4", 11.34],
      ["5", 18.14],
      ["6", 30.84],
      ["8", 54.43],
    ],
  },
  Cap: {
    STD: [
      ["1", 0.09],
      ["1-1/4", 0.14],
      ["1-1/2", 0.18],
      ["2", 0.27],
      ["2-1/2", 0.41],
      ["3", 0.68],
      ["3-1/2", 0.91],
      ["4", 1.13],
      ["5", 2.04],
      ["6", 2.95],
      ["8", 5.44],
      ["10", 9.07],
      ["12", 13.61],
      ["14", 16.33],
      ["16", 18.14],
      ["18", 24.49],
      ["20", 34.02],
      ["22", 42.64],
      ["24", 43.54],
      ["26", 53.98],
      ["30", 78.02],
    ],
    XS: [
      ["1", 0.14],
      ["1-1/4", 0.18],
      ["1-1/2", 0.23],
      ["2", 0.34],
      ["2-1/2", 0.45],
      ["3", 0.79],
      ["3-1/2", 1.13],
      ["4", 1.36],
      ["5", 2.49],
      ["6", 4.08],
      ["8", 7.26],
      ["10", 11.34],
      ["12", 16.33],
      ["14", 20.41],
      ["16", 24.49],
      ["18", 32.66],
      ["20", 39.01],
      ["22", 56.7],
      ["24", 58.97],
      ["26", 72.12],
      ["30", 103.87],
    ],
    "Sch 160": [
      ["1", 0.18],
      ["1-1/4", 0.23],
      ["1-1/2", 0.27],
      ["2", 0.57],
      ["2-1/2", 0.79],
      ["3", 1.32],
      ["4", 2.68],
      ["5", 4.54],
      ["6", 6.8],
      ["8", 14.06],
      ["10", 25.85],
      ["12", 43.09],
    ],
    XXS: [
      ["1", 0.23],
      ["1-1/4", 0.34],
      ["1-1/2", 0.41],
      ["2", 0.68],
      ["2-1/2", 1.13],
      ["3", 1.81],
      ["3-1/2", 2.72],
      ["4", 3.4],
      ["5", 5.44],
      ["6", 8.16],
      ["8", 13.61],
    ],
  },
  "Lap Joint Stub End (Long)": {
    // Wermac / Hackney Ladish style lap-joint stub end kg (STD wall table)
    STD: [
      ["1/2", 0.16],
      ["3/4", 0.23],
      ["1", 0.35],
      ["1-1/4", 0.5],
      ["1-1/2", 0.61],
      ["2", 1.1],
      ["2-1/2", 1.5],
      ["3", 2.1],
      ["3-1/2", 2.5],
      ["4", 3.0],
      ["5", 5.4],
      ["6", 7.3],
      ["8", 11.6],
      ["10", 18.0],
      ["12", 25.6],
      ["14", 34.0],
      ["16", 39.0],
      ["18", 44.0],
      ["20", 53.0],
      ["24", 76.0],
    ],
    XS: [
      ["1/2", 0.2],
      ["3/4", 0.3],
      ["1", 0.4],
      ["1-1/4", 0.6],
      ["1-1/2", 0.7],
      ["2", 1.4],
      ["2-1/2", 2.0],
      ["3", 2.9],
      ["3-1/2", 3.4],
      ["4", 4.1],
      ["5", 7.5],
      ["6", 10.0],
      ["8", 16.0],
      ["10", 24.0],
      ["12", 29.0],
      ["14", 38.0],
      ["16", 43.0],
      ["18", 49.0],
      ["20", 63.0],
      ["24", 76.0],
    ],
  },
};

// Reducers: Wermac Con & Ecc same wt — propose for both types
const REDUCER_STD = [
  ["3/4x1/2", 0.08],
  ["1x3/4", 0.18],
  ["1x1/2", 0.18],
  ["1-1/4x1", 0.23],
  ["1-1/4x3/4", 0.18],
  ["1-1/4x1/2", 0.18],
  ["1-1/2x1-1/4", 0.32],
  ["1-1/2x1", 0.28],
  ["1-1/2x3/4", 0.24],
  ["1-1/2x1/2", 0.23],
  ["2x1-1/2", 0.41],
  ["2x1-1/4", 0.38],
  ["2x1", 0.34],
  ["2x3/4", 0.32],
  ["2-1/2x2", 0.68],
  ["2-1/2x1-1/2", 0.63],
  ["2-1/2x1-1/4", 0.57],
  ["2-1/2x1", 0.57],
  ["3x2-1/2", 0.91],
  ["3x2", 0.82],
  ["3x1-1/2", 0.77],
  ["3x1-1/4", 0.73],
  ["3-1/2x3", 1.43],
  ["3-1/2x2-1/2", 1.31],
  ["3-1/2x2", 1.25],
  ["3-1/2x1-1/2", 1.13],
  ["3-1/2x1-1/4", 1.09],
  ["4x3-1/2", 1.59],
  ["4x3", 1.53],
  ["4x2-1/2", 1.47],
  ["4x2", 1.36],
  ["4x1-1/2", 1.31],
  ["5x4", 2.72],
  ["5x3-1/2", 2.61],
  ["5x3", 2.49],
  ["5x2-1/2", 2.38],
  ["5x2", 2.27],
  ["6x5", 3.86],
  ["6x4", 3.74],
  ["6x3-1/2", 3.74],
  ["6x3", 3.63],
  ["6x2-1/2", 3.29],
  ["8x6", 5.99],
  ["8x5", 5.44],
  ["8x4", 4.99],
  ["8x3-1/2", 4.99],
  ["10x8", 9.98],
  ["10x6", 9.75],
  ["10x5", 9.53],
  ["10x4", 9.07],
  ["12x10", 15.42],
  ["12x8", 14.51],
  ["12x6", 14.06],
  ["12x5", 13.61],
  ["14x12", 27.22],
  ["14x10", 26.85],
  ["14x8", 26.54],
  ["14x6", 26.31],
  ["16x14", 32.21],
  ["16x12", 31.75],
  ["16x10", 31.52],
  ["16x8", 31.07],
  ["18x16", 38.56],
  ["18x14", 38.1],
  ["18x12", 37.65],
  ["18x10", 37.19],
  ["20x18", 56.7],
  ["20x16", 56.25],
  ["20x14", 55.34],
  ["20x12", 54.43],
  ["22x20", 64.41],
  ["22x18", 62.6],
  ["22x16", 59.42],
  ["22x14", 55.79],
  ["24x20", 68.04],
  ["24x18", 67.13],
  ["24x16", 65.77],
  ["26x24", 93.89],
  ["26x22", 90.72],
  ["26x20", 86.18],
  ["26x18", 82.55],
  ["28x26", 101.6],
  ["28x24", 97.98],
  ["28x22", 95.25],
  ["28x20", 90.26],
  ["30x28", 109.32],
  ["30x26", 105.23],
  ["30x24", 101.6],
  ["30x22", 99.79],
  ["30x20", 99.79],
];

const REDUCER_XS = [
  ["3/4x1/2", 0.1],
  ["1x3/4", 0.2],
  ["1x1/2", 0.2],
  ["1-1/4x1", 0.23],
  ["1-1/4x3/4", 0.23],
  ["1-1/4x1/2", 0.23],
  ["1-1/2x1-1/4", 0.35],
  ["1-1/2x1", 0.34],
  ["1-1/2x3/4", 0.32],
  ["1-1/2x1/2", 0.29],
  ["2x1-1/2", 0.54],
  ["2x1-1/4", 0.52],
  ["2x1", 0.5],
  ["2x3/4", 0.45],
  ["2-1/2x2", 0.91],
  ["2-1/2x1-1/2", 0.86],
  ["2-1/2x1-1/4", 0.84],
  ["2-1/2x1", 0.79],
  ["3x2-1/2", 1.25],
  ["3x2", 1.18],
  ["3x1-1/2", 1.13],
  ["3x1-1/4", 1.09],
  ["3-1/2x3", 1.81],
  ["3-1/2x2-1/2", 1.59],
  ["3-1/2x2", 1.59],
  ["3-1/2x1-1/2", 1.47],
  ["3-1/2x1-1/4", 1.47],
  ["4x3-1/2", 2.15],
  ["4x3", 2.04],
  ["4x2-1/2", 1.99],
  ["4x2", 1.93],
  ["4x1-1/2", 1.81],
  ["5x4", 3.74],
  ["5x3-1/2", 3.52],
  ["5x3", 3.4],
  ["5x2-1/2", 3.18],
  ["5x2", 2.95],
  ["6x5", 5.44],
  ["6x4", 5.22],
  ["6x3-1/2", 4.99],
  ["6x3", 4.76],
  ["6x2-1/2", 4.54],
  ["8x6", 8.48],
  ["8x5", 8.16],
  ["8x4", 7.71],
  ["8x3-1/2", 7.48],
  ["10x8", 13.38],
  ["10x6", 13.38],
  ["10x5", 12.7],
  ["10x4", 11.57],
  ["12x10", 19.73],
  ["12x8", 19.05],
  ["12x6", 18.14],
  ["12x5", 17.69],
  ["14x12", 36.29],
  ["14x10", 35.92],
  ["14x8", 35.61],
  ["14x6", 35.38],
  ["16x14", 41.28],
  ["16x12", 40.82],
  ["16x10", 40.37],
  ["16x8", 40.14],
  ["18x16", 52.16],
  ["18x14", 51.71],
  ["18x12", 51.26],
  ["18x10", 50.8],
  ["20x18", 77.11],
  ["20x16", 76.66],
  ["20x14", 76.2],
  ["20x12", 75.75],
  ["22x20", 84.37],
  ["22x18", 82.55],
  ["22x16", 78.47],
  ["22x14", 73.94],
  ["24x20", 90.72],
  ["24x18", 88.45],
  ["24x16", 86.18],
  ["26x24", 125.19],
  ["26x22", 123.38],
  ["26x20", 114.76],
  ["26x18", 109.77],
  ["28x26", 135.62],
  ["28x24", 130.63],
  ["28x22", 113.4],
  ["28x20", 119.75],
  ["30x28", 146.06],
  ["30x26", 140.61],
  ["30x24", 135.62],
  ["30x22", 129.27],
  ["30x20", 124.3],
];

CHART["Concentric Reducer"] = { STD: REDUCER_STD, XS: REDUCER_XS };
CHART["Eccentric Reducer"] = { STD: REDUCER_STD, XS: REDUCER_XS };

/** Existing catalog Sch40 baseline (for conflict notes only) */
const EXISTING_SCH40 = {
  "90° LR Elbow": {
    "1/2": 0.13,
    "3/4": 0.18,
    "1": 0.29,
    "1-1/4": 0.45,
    "1-1/2": 0.61,
    "2": 0.95,
    "2-1/2": 1.59,
    "3": 2.41,
    "3-1/2": 3.35,
    "4": 4.67,
    "5": 7.48,
    "6": 11.34,
    "8": 22.68,
    "10": 41.28,
    "12": 63.5,
    "14": 95.26,
    "16": 135.2,
    "18": 181.4,
    "20": 235.9,
    "22": 298.8,
    "24": 362.9,
    "26": 453.6,
    "28": 544.3,
    "30": 634.9,
    "32": 735.0,
    "34": 835.0,
    "36": 1000.0,
  },
};

const NEW_TYPES_B = new Set([
  "180° LR Return",
  "180° SR Return",
  "90° 3D Elbow",
  "45° 3D Elbow",
  "Lap Joint Stub End (Long)",
]);

function scheduleAliases(chartSch) {
  // Map chart designation → catalog keys to propose (same wt)
  if (chartSch === "STD") return ["STD", "Sch 40"];
  if (chartSch === "XS") return ["XS", "Sch 80"];
  if (chartSch === "Sch 160") return ["Sch 160"];
  if (chartSch === "XXS") return ["XXS"];
  return [chartSch];
}

function sAliasNote(chartSch, catalogKey) {
  if (chartSch === "STD" && catalogKey === "Sch 40")
    return "Wermac/Hackney Ladish STD (alias→Sch 40)";
  if (chartSch === "XS" && catalogKey === "Sch 80")
    return "Wermac/Hackney Ladish XS (alias→Sch 80)";
  if (chartSch === "STD") return "Wermac/Hackney Ladish STD";
  if (chartSch === "XS") return "Wermac/Hackney Ladish XS";
  if (chartSch === "Sch 160") return "Wermac/Hackney Ladish Sch 160";
  if (chartSch === "XXS") return "Wermac/Hackney Ladish XXS";
  return "Wermac/Hackney Ladish";
}

function npsOrderKey(nps) {
  const frac = (p) => {
    if (p.includes("-")) {
      const [a, b] = p.split("-");
      const [n, d] = b.split("/").map(Number);
      return Number(a) + n / d;
    }
    if (p.includes("/")) {
      const [n, d] = p.split("/").map(Number);
      return n / d;
    }
    return Number(p);
  };
  if (nps.includes("x")) {
    const [L, S] = nps.split("x");
    return frac(L) * 1000 + frac(S);
  }
  return frac(nps);
}

const rowsA = [];
const rowsB = [];

for (const [type, bySch] of Object.entries(CHART)) {
  for (const [chartSch, items] of Object.entries(bySch)) {
    for (const [nps, wt] of items) {
      if (wt == null || !(wt > 0)) continue;
      for (const catalogKey of scheduleAliases(chartSch)) {
        if (!PIPE_KEYS.includes(catalogKey)) {
          throw new Error(`Bad schedule key ${catalogKey}`);
        }
        const note = sAliasNote(chartSch, catalogKey);
        const row = { type, schedule: catalogKey, nps, wt, note };
        const isCore = [
          "90° LR Elbow",
          "90° SR Elbow",
          "45° LR Elbow",
          "Equal Tee",
          "Concentric Reducer",
          "Eccentric Reducer",
          "Cap",
        ].includes(type);
        const isPrimaryWall = ["STD", "Sch 40", "XS", "Sch 80"].includes(catalogKey);
        if (isCore && isPrimaryWall) rowsA.push(row);
        else if (isCore && (catalogKey === "Sch 160" || catalogKey === "XXS")) rowsB.push(row);
        else if (NEW_TYPES_B.has(type) && isPrimaryWall) rowsB.push(row);
        else rowsB.push(row);
      }
    }
  }
}

// Sch 40S / Sch 80S alias copies for sizes where walls match (≤10" / ≤8")
function npsNum(nps) {
  if (nps.includes("x")) return npsNum(nps.split("x")[0]);
  if (nps.includes("-")) {
    const [a, b] = nps.split("-");
    const [n, d] = b.split("/").map(Number);
    return Number(a) + n / d;
  }
  if (nps.includes("/")) {
    const [n, d] = nps.split("/").map(Number);
    return n / d;
  }
  return Number(nps);
}

for (const row of [...rowsA]) {
  if (row.schedule === "Sch 40" && npsNum(row.nps) <= 10) {
    rowsB.push({
      ...row,
      schedule: "Sch 40S",
      note: "Alias of Sch 40 / STD wt (B36.19: Sch 40S = Sch 40 ≤10″)",
    });
  }
  if (row.schedule === "Sch 80" && npsNum(row.nps) <= 8) {
    rowsB.push({
      ...row,
      schedule: "Sch 80S",
      note: "Alias of Sch 80 / XS wt (B36.19: Sch 80S = Sch 80 ≤8″)",
    });
  }
}

function sortRows(a, b) {
  return (
    a.type.localeCompare(b.type) ||
    PIPE_KEYS.indexOf(a.schedule) - PIPE_KEYS.indexOf(b.schedule) ||
    npsOrderKey(a.nps) - npsOrderKey(b.nps)
  );
}
rowsA.sort(sortRows);
rowsB.sort(sortRows);

function table(rows) {
  const lines = [
    "| type | schedule | nps | wt | source note |",
    "| ---- | -------- | --- | -- | ----------- |",
  ];
  for (const r of rows) {
    lines.push(`| ${r.type} | ${r.schedule} | ${r.nps} | ${r.wt} | ${r.note} |`);
  }
  return lines.join("\n");
}

// Conflict spot-check: existing Sch40 vs proposed Sch 40 for 90° LR Elbow
const conflictLines = [];
const proposedSch40 = rowsA.filter(
  (r) => r.type === "90° LR Elbow" && r.schedule === "Sch 40"
);
for (const r of proposedSch40) {
  const old = EXISTING_SCH40["90° LR Elbow"][r.nps];
  if (old != null && Math.abs(old - r.wt) > 0.15) {
    conflictLines.push(
      `| 90° LR Elbow | Sch 40 | ${r.nps} | ${old} | ${r.wt} | replace with chart (do not keep old) |`
    );
  }
}

const out = [];
out.push(`# Fitting weight candidates`);
out.push(``);
out.push(
  `Approval artifact for \`b16-9-fitting-catalog-schedule\` Phase 1. **Do not edit** \`data/piping_catalog.js\` or \`app.js\` until this file’s \`## Sign-off\` (or equivalent chat confirmation) accepts a set of rows.`
);
out.push(``);
out.push(
  `Product family: ASME B16.9 wrought butt-welding fittings. **Masses are not from the B16.9 PDF** (dimensions/tolerances/markings only). Proposed \`wt\` values are approximate manufacturer/industry chart kg/pc for carbon steel BW fittings.`
);
out.push(``);
out.push(`## Sources`);
out.push(``);
out.push(`| # | Source | What it provides | Units / material | URL or path |`);
out.push(`| - | ------ | ---------------- | ---------------- | ----------- |`);
out.push(
  `| S1 | Wermac.org BW fitting weight tables (compiled from **Hackney Ladish, Inc.** manufacturer data) | 90°/45° LR & SR elbows, 180° returns, 3D elbows, equal tees, caps, concentric/eccentric reducers — STD / XS / Sch 160 / XXS where published | kg/pc (approx.), carbon steel | https://www.wermac.org/fittings/weights_bw_elbows.html ; …/weights_bw_elbows_180.html ; …/weights_bw_elbows_3d.html ; …/weights_bw_tees.html ; …/dim_caps.html ; …/weights_bw_reducers.html ; …/weights_bw_reducers_xs.html |`
);
out.push(
  `| S2 | Atlas Steels — Carbon & Stainless Steel Buttwelding Fittings (weights sheet) | Cross-check STD/XS elbows, returns, tees, caps, reducers, stub ends | kg/unit approx., carbon steel; SS guide notes | https://www.atlassteels.com.au/documents/carbon-steel-fittings-dimensions.pdf |`
);
out.push(
  `| S3 | Ozlinc Industries — ANSI flanges & buttweld fittings weights | Spot-check popular NPS Sch 40/80 elbows, tees, reducers | kg/ea approx. | https://www.ozlinc.com.au/ansi-flanges-buttweld-fittings-weights/ |`
);
out.push(
  `| S4 | ASME B16.9-2024 PDF (repo) | **Type inventory / dimensions only** — zero mass tables | n/a | \`data/ASME B16.9.pdf\` |`
);
out.push(``);
out.push(`Notes:`);
out.push(``);
out.push(
  `- Chart publishers state weights are approximate; manufacturer-to-manufacturer variation is expected.`
);
out.push(
  `- Primary proposed numbers use **S1 (Wermac / Hackney Ladish)**. S2/S3 are corroboration references for Sign-off spot-checks.`
);
out.push(
  `- Material assumption: **carbon steel** BW. Stainless: charts often suggest ≈ CS Sch 40S/80S or ×1.015 — not applied here (steel-only cargo path).`
);
out.push(``);
out.push(`## Type inventory`);
out.push(``);
out.push(`| B16.9 table (approx.) | Proposed catalog type key | In/out | Notes |`);
out.push(`| --------------------- | ------------------------- | ------ | ----- |`);
out.push(`| 6.1-1 | \`90° LR Elbow\` | **in** | Existing |`);
out.push(`| 6.1-4 | \`90° SR Elbow\` | **in** | Existing; chart STD starts NPS 1 (no ½/¾) |`);
out.push(`| 6.1-1 | \`45° LR Elbow\` | **in** | Existing |`);
out.push(`| 6.1-2 | \`LR Reducing Elbow\` | **in** | New — **no numeric rows this round** (see Skipped) |`);
out.push(`| 6.1-3 | \`180° LR Return\` | **in** | New — Bucket B |`);
out.push(`| 6.1-5 | \`180° SR Return\` | **in** | New — Bucket B |`);
out.push(`| 6.1-6 | \`90° 3D Elbow\` | **in** | New — Bucket B |`);
out.push(`| 6.1-6 | \`45° 3D Elbow\` | **in** | New — Bucket B |`);
out.push(`| 6.1-7 | \`Equal Tee\` | **in** | Existing |`);
out.push(`| 6.1-7 | \`Reducing Tee\` | **in** | New — **no numeric rows this round** (see Skipped) |`);
out.push(`| 6.1-8 | \`Equal Cross\` | **in** | New — **no numeric rows this round** (see Skipped) |`);
out.push(`| 6.1-8 | \`Reducing Cross\` | **in** | New — **no numeric rows this round** (see Skipped) |`);
out.push(`| 6.1-9 | \`Lap Joint Stub End (Long)\` | **in** | New — Bucket B (Wermac stub-end kg) |`);
out.push(
  `| 6.1-9 | \`Lap Joint Stub End (Short)\` | **in** | New — **no numeric rows this round** (MSS short pattern; see Skipped) |`
);
out.push(`| 6.1-10 | \`Cap\` | **in** | Existing |`);
out.push(`| 6.1-11 | \`Concentric Reducer\` | **in** | Existing; compound \`large×small\` |`);
out.push(`| 6.1-11 | \`Eccentric Reducer\` | **in** | Existing; same chart wt as concentric (S1) |`);
out.push(`| — | Laterals | **out** | Outside B16.9 §1.3 |`);
out.push(
  `| — | 45° SR Elbow (separate type) | **out** | Not tabulated as separate type in B16.9 6.1-4 |`
);
out.push(``);
out.push(`## Schedule keys`);
out.push(``);
out.push(`Pipe catalog vocabulary (18 keys) — fittings must use these strings only:`);
out.push(``);
out.push(`| Catalog key | Chart alias / proposal rule |`);
out.push(`| ----------- | --------------------------- |`);
out.push(`| \`Sch 5S\` | No S1 cells → **Skipped** |`);
out.push(`| \`Sch 5\` | No S1 cells → **Skipped** |`);
out.push(`| \`Sch 10S\` | No S1 cells → **Skipped** |`);
out.push(`| \`Sch 10\` | No S1 cells → **Skipped** |`);
out.push(`| \`Sch 20\` | No S1 cells → **Skipped** |`);
out.push(`| \`Sch 30\` | No S1 cells → **Skipped** |`);
out.push(
  `| \`Sch 40S\` | Bucket B alias of STD/Sch 40 wt for NPS ≤ 10″ (B36.19 wall equality) |`
);
out.push(`| \`Sch 40\` | = chart **STD** weight (alias) |`);
out.push(`| \`Sch 60\` | No S1 cells → **Skipped** |`);
out.push(
  `| \`Sch 80S\` | Bucket B alias of XS/Sch 80 wt for NPS ≤ 8″ (B36.19 wall equality) |`
);
out.push(`| \`Sch 80\` | = chart **XS** weight (alias) |`);
out.push(`| \`Sch 100\` | No S1 cells → **Skipped** |`);
out.push(`| \`Sch 120\` | No S1 cells → **Skipped** |`);
out.push(`| \`Sch 140\` | No S1 cells → **Skipped** |`);
out.push(`| \`Sch 160\` | Chart Sch 160 where published (Bucket B) |`);
out.push(`| \`STD\` | Chart STD (same wt as Sch 40 rows) |`);
out.push(`| \`XS\` | Chart XS (same wt as Sch 80 rows) |`);
out.push(`| \`XXS\` | Chart XXS where published (Bucket B) |`);
out.push(``);
out.push(
  `Do **not** invent \`Sch 20S\`. Do not keep \`FITTING_SCH_FACTORS\` as a fill-in for missing schedule cells.`
);
out.push(``);
out.push(`## Proposed rows`);
out.push(``);
out.push(`Proposed nested catalog shape after Phase 2: \`fittings[type][schedule] = [{ nps, wt }]\`.`);
out.push(``);
out.push(`### Coverage summary`);
out.push(``);
out.push(`| Metric | Count |`);
out.push(`| ------ | ----- |`);
out.push(`| A. recommended | ${rowsA.length} |`);
out.push(`| B. needs review | ${rowsB.length} |`);
out.push(
  `| Schedules with proposed rows | ${[...new Set([...rowsA, ...rowsB].map((r) => r.schedule))].sort((a, b) => PIPE_KEYS.indexOf(a) - PIPE_KEYS.indexOf(b)).join(", ")} |`
);
out.push(``);
out.push(`### A. Recommended`);
out.push(``);
out.push(
  `Core cargo types × primary walls (Sch 40/STD + Sch 80/XS) from S1. Prefer these for Phase 2 v1 if Sign-off accepts “A only”.`
);
out.push(``);
out.push(table(rowsA));
out.push(``);
out.push(`### B. Needs review`);
out.push(``);
out.push(
  `New B16.9 types (returns, 3D, stub ends), heavier walls (Sch 160 / XXS), and Sch 40S/80S wall-alias copies. Accept selectively.`
);
out.push(``);
out.push(table(rowsB));
out.push(``);
out.push(`## Skipped`);
out.push(``);
out.push(`### Chart-missing schedules (all types)`);
out.push(``);
out.push(
  `| schedule | reason |`
);
out.push(`| -------- | ------ |`);
for (const k of [
  "Sch 5S",
  "Sch 5",
  "Sch 10S",
  "Sch 10",
  "Sch 20",
  "Sch 30",
  "Sch 60",
  "Sch 100",
  "Sch 120",
  "Sch 140",
]) {
  out.push(`| ${k} | No Hackney Ladish / Wermac cells in S1 for fittings; do not invent or scale via B36 factors |`);
}
out.push(``);
out.push(`### Types locked in but without numeric proposals this round`);
out.push(``);
out.push(`| type | reason |`);
out.push(`| ---- | ------ |`);
out.push(
  `| \`LR Reducing Elbow\` | Wermac has a reducing-elbow weight page; not transcribed into rows yet — defer to Sign-off round 2 |`
);
out.push(
  `| \`Reducing Tee\` | Wermac reducing-tee weights not transcribed; omit until chart extract |`
);
out.push(
  `| \`Equal Cross\` / \`Reducing Cross\` | No S1 kg tables used this round; omit rather than invent (= tee × factor) |`
);
out.push(
  `| \`Lap Joint Stub End (Short)\` | Short-pattern MSS lengths not fully paired with kg in transcribed sources |`
);
out.push(``);
out.push(`### Existing-catalog cells without chart counterpart`);
out.push(``);
out.push(
  `| type | nps | reason |`
);
out.push(`| ---- | --- | ------ |`);
out.push(
  `| \`90° LR Elbow\` | 28, 32, 34 (and other catalog-only sizes) | Present in current Sch40 SSOT but absent from S1 STD table → omit unless another chart is signed |`
);
out.push(
  `| \`90° SR Elbow\` | 1/2, 3/4 | Current catalog has them; S1 STD SR starts at NPS 1 (aligns with B16.9 SR practice) → omit ½/¾ |`
);
out.push(
  `| \`Cap\` | 1/2, 3/4, 36 | Catalog has ½/¾/36; S1 cap table starts at NPS 1 and stops at 30 → omit missing |`
);
out.push(
  `| Reducers | \`36x30\` etc. | Catalog pair beyond S1 extract → omit |`
);
out.push(``);
out.push(`### Existing Sch 40 vs proposed chart (conflict sample — 90° LR Elbow)`);
out.push(``);
out.push(
  `Current \`piping_catalog.js\` Sch40-equiv weights are often **heavier** than S1. Conflict policy: **replace with signed chart wt**; do not average; do not keep Sch40×factor.`
);
out.push(``);
out.push(`| type | schedule | nps | catalog wt | proposed wt | action |`);
out.push(`| ---- | -------- | --- | ---------- | ------------ | ------ |`);
out.push(conflictLines.join("\n") || `| — | — | — | — | — | no Δ>0.15 in sample |`);
out.push(``);
out.push(`## Conflict policy`);
out.push(``);
out.push(`1. **Do not invent \`wt\`** when the chart has no cell — omit the schedule/NPS from Phase 2.`);
out.push(
  `2. **Do not keep \`FITTING_SCH_FACTORS\` / Sch40×B36** as a production fill-in for missing schedules.`
);
out.push(
  `3. On catalog vs chart disagreement for the same type×schedule×NPS: prefer signed chart value (S1 unless Sign-off names another source).`
);
out.push(
  `4. Concentric and eccentric reducers: S1 publishes one weight table for both — propose identical \`wt\` unless Sign-off splits them.`
);
out.push(
  `5. STD/Sch 40 and XS/Sch 80 are **duplicate keys with the same proposed wt** (alias). Phase 2 may load both so the Schedule dropdown matches pipe vocabulary.`
);
out.push(``);
out.push(`## Sign-off`);
out.push(``);
out.push(`Record decision before Phase 2 edits \`data/piping_catalog.js\`:`);
out.push(``);
out.push(`- [ ] **Accept all** — load A + B as proposed`);
out.push(`- [ ] **Accept subset** — describe below (e.g. “A only”, “A + returns/3D”, “drop Sch 40S/80S aliases”)`);
out.push(`- [ ] **Reject** — stay on flat Sch40 catalog until new sources`);
out.push(``);
out.push(`**Decision:** _pending_`);
out.push(``);
out.push(`**Accepted set:** _pending_`);
out.push(``);
out.push(`**Notes / alternate sources:** _pending_`);
out.push(``);
out.push(`**Signer / date:** _pending_`);
out.push(``);

const dest = path.join(__dirname, "fitting-weight-candidates.md");
fs.writeFileSync(dest, out.join("\n"), "utf8");
console.log(`Wrote ${dest}`);
console.log(`A=${rowsA.length} B=${rowsB.length}`);
console.log(
  "Schedules:",
  [...new Set([...rowsA, ...rowsB].map((r) => r.schedule))]
    .sort((a, b) => PIPE_KEYS.indexOf(a) - PIPE_KEYS.indexOf(b))
    .join(", ")
);
