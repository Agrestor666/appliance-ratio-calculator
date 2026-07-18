// Verified fill-media densities for pipe fill mass planning (kg/m³).
// Empty is zero fill mass (planning convention), not air density.
// The app can read from this object to avoid fetch() issues on file://.
window.FILL_MEDIA_CATALOG = {
  version: 1,
  unit: "kg/m3",
  items: [
    {
      id: "empty",
      label: "Empty",
      densityKgPerM3: 0,
      source: "Planning convention: zero fill mass (not air density).",
      notes: "No fill mass contribution; do not treat as ~1.2 kg/m³ air.",
    },
    {
      id: "fresh-water",
      label: "Fresh water",
      densityKgPerM3: 1000,
      source: "Engineering Toolbox / equivalent engineering reference for pure water ≈1000 kg/m³ at 4 °C, 1 atm.",
      notes: "CIPM/IAPWS max ≈999.97; ~998–999 at 15–20 °C; 1000 is the planning value.",
    },
    {
      id: "seawater",
      label: "Seawater",
      densityKgPerM3: 1025,
      source:
        "TEOS-10 / ITTC seawater density convention; ~1026 kg/m³ at 15 °C, SA≈35.2 g/kg; 1025 is the surface-average planning value.",
      notes: "Surface range typically ~1020–1029 kg/m³.",
    },
    {
      id: "light-oil",
      label: "Light oil",
      densityKgPerM3: 850,
      source:
        "ASTM D1298 density/API gravity reference temperature 15 °C; 850 kg/m³ ≈ mid light-oil / ~35 °API planning value.",
      notes: "Real products typically ~800–900 kg/m³; use SDS/spec when known.",
    },
  ],
};
