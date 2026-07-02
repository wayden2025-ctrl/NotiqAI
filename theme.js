// ============================================================
// NOTIQ AI — COLOR THEMES (shared across all pages)
// The chosen palette is saved in localStorage as "notiq_theme".
// ============================================================

const NOTIQ_THEMES = {
  midnight: { name: "Midnight", dark: false,
    coral: "#1e3a6e", amber: "#4a7cc9", g1: "#2a4d8a", g1b: "#2e5490", g2: "#163264",
    ink: "#241d18", muted: "#7c7168", line: "rgba(36,29,24,.10)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f2f5fb", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(252,251,249,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#f0f4fa", bgB: "#e8eef8", bgC1: "#f9f6f2", bgC2: "#f4efe9",
    orb1: "#b8cceb", orb2: "#3a6aaf", orb4: "#0d1f42", orbBtn: "#122650",
    tipbg: "#241d18", tipfg: "#ffffff" },

  forest: { name: "Forest", dark: false,
    coral: "#1d5c37", amber: "#4f9e6b", g1: "#2c7a4b", g1b: "#2f7d4f", g2: "#143f28",
    ink: "#241d18", muted: "#77716a", line: "rgba(36,29,24,.10)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f1f7f2", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(251,252,249,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#eef6f0", bgB: "#e6f1e9", bgC1: "#f8faf6", bgC2: "#eff4ec",
    orb1: "#bfe3cc", orb2: "#2f8a55", orb4: "#0b2b19", orbBtn: "#0f3320",
    tipbg: "#241d18", tipfg: "#ffffff" },

  plum: { name: "Plum", dark: false,
    coral: "#4a2c6b", amber: "#8a5fc9", g1: "#5d3f8a", g1b: "#62458f", g2: "#32204f",
    ink: "#241d18", muted: "#7a7280", line: "rgba(36,29,24,.10)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f4f1f9", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(252,250,253,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#f3f0fa", bgB: "#ece6f6", bgC1: "#f9f7fc", bgC2: "#f1edf6",
    orb1: "#d6c6ee", orb2: "#6b4a9e", orb4: "#1d1230", orbBtn: "#2a1745",
    tipbg: "#241d18", tipfg: "#ffffff" },

  crimson: { name: "Crimson", dark: false,
    coral: "#8a2433", amber: "#c9564a", g1: "#a03a49", g1b: "#a4404e", g2: "#5e1822",
    ink: "#241d18", muted: "#7c6f6d", line: "rgba(36,29,24,.10)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f8f1f2", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(253,250,250,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#faeef0", bgB: "#f6e7e9", bgC1: "#fbf7f6", bgC2: "#f4eeec",
    orb1: "#eec2c6", orb2: "#a43b4a", orb4: "#380d14", orbBtn: "#4d121c",
    tipbg: "#241d18", tipfg: "#ffffff" },

  slate: { name: "Slate (dark)", dark: true,
    coral: "#7aa7e0", amber: "#4a7cc9", g1: "#2a4d8a", g1b: "#2e5490", g2: "#163264",
    ink: "#edf0f5", muted: "#9aa3b2", line: "rgba(255,255,255,.12)", glass: "rgba(255,255,255,.06)",
    card1: "#1e232d", card2: "#171c25", field: "#12161d",
    surface: "rgba(26,31,40,.85)", panel: "rgba(21,25,33,.98)", rail: "rgba(17,21,28,.8)",
    bgA: "#1b2230", bgB: "#161c28", bgC1: "#14171e", bgC2: "#0f1217",
    orb1: "#b8cceb", orb2: "#3a6aaf", orb4: "#0d1f42", orbBtn: "#122650",
    tipbg: "#f2f4f8", tipfg: "#1a1d24" },

  ember: { name: "Ember (dark)", dark: true,
    coral: "#e2a63d", amber: "#c9812e", g1: "#a8791f", g1b: "#ad7e24", g2: "#6e4c12",
    ink: "#f2ede4", muted: "#b3a996", line: "rgba(255,255,255,.12)", glass: "rgba(255,255,255,.06)",
    card1: "#211d18", card2: "#191612", field: "#141210",
    surface: "rgba(30,26,21,.85)", panel: "rgba(24,21,17,.98)", rail: "rgba(20,18,14,.8)",
    bgA: "#2a2318", bgB: "#221c14", bgC1: "#17140f", bgC2: "#100e0b",
    orb1: "#f2d9a8", orb2: "#c9993a", orb4: "#3f2c08", orbBtn: "#5c400e",
    tipbg: "#f4efe4", tipfg: "#241d18" },

  pacific: { name: "Pacific", dark: false,
    coral: "#1b5e70", amber: "#3f93a8", g1: "#23768a", g1b: "#277b90", g2: "#123f4d",
    ink: "#241d18", muted: "#6e7678", line: "rgba(36,29,24,.10)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#eff6f7", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(249,252,252,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#eaf4f6", bgB: "#e0eef1", bgC1: "#f6faf9", bgC2: "#ecf3f2",
    orb1: "#b3dbe4", orb2: "#2f8299", orb4: "#08262e", orbBtn: "#0d3540",
    tipbg: "#241d18", tipfg: "#ffffff" },

  alpine: { name: "Alpine", dark: false,
    coral: "#3a5d48", amber: "#6d987f", g1: "#4b7a5e", g1b: "#507f63", g2: "#2a4635",
    ink: "#241d18", muted: "#75786f", line: "rgba(36,29,24,.10)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f0f6f1", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(250,252,249,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#edf5ee", bgB: "#e4efe6", bgC1: "#f7faf6", bgC2: "#eef3ec",
    orb1: "#c5dccb", orb2: "#55806a", orb4: "#16281d", orbBtn: "#21382a",
    tipbg: "#241d18", tipfg: "#ffffff" },

  rose: { name: "Rose", dark: false,
    coral: "#a34d60", amber: "#cf8391", g1: "#b25a6e", g1b: "#b76073", g2: "#6e2c3c",
    ink: "#241d18", muted: "#7d7174", line: "rgba(36,29,24,.10)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f9f0f2", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(253,250,250,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#faeef1", bgB: "#f6e5e9", bgC1: "#fcf7f7", bgC2: "#f5edee",
    orb1: "#f0ccd3", orb2: "#bb6478", orb4: "#3d1019", orbBtn: "#521826",
    tipbg: "#241d18", tipfg: "#ffffff" },

  sunset: { name: "Sunset", dark: false,
    coral: "#b34a1f", amber: "#e07a3f", g1: "#c25a2a", g1b: "#c66030", g2: "#7a3012",
    ink: "#241d18", muted: "#7d746c", line: "rgba(36,29,24,.10)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f9f1ea", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(253,250,247,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#faf0e8", bgB: "#f6e8dc", bgC1: "#fcf8f4", bgC2: "#f5eee6",
    orb1: "#f5cdb3", orb2: "#cf6a35", orb4: "#401704", orbBtn: "#571f08",
    tipbg: "#241d18", tipfg: "#ffffff" },

  sky: { name: "Sky", dark: false,
    coral: "#2e6ba8", amber: "#6fa8dc", g1: "#3a7cba", g1b: "#3f81bf", g2: "#1c4a78",
    ink: "#241d18", muted: "#71767c", line: "rgba(36,29,24,.10)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#eff5fb", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(250,252,254,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#edf4fb", bgB: "#e3eef8", bgC1: "#f7fafd", bgC2: "#edf2f8",
    orb1: "#bcd8f0", orb2: "#4585c0", orb4: "#0a2440", orbBtn: "#123a5c",
    tipbg: "#241d18", tipfg: "#ffffff" },

  graphite: { name: "Graphite (dark)", dark: true,
    coral: "#b9c2cf", amber: "#8e99ab", g1: "#4a5568", g1b: "#505b6e", g2: "#2b333f",
    ink: "#eef0f3", muted: "#9aa1ac", line: "rgba(255,255,255,.12)", glass: "rgba(255,255,255,.06)",
    card1: "#1c1f24", card2: "#16181d", field: "#101215",
    surface: "rgba(25,28,33,.85)", panel: "rgba(20,23,27,.98)", rail: "rgba(16,18,22,.8)",
    bgA: "#202531", bgB: "#191d26", bgC1: "#131519", bgC2: "#0e1013",
    orb1: "#c9cfd8", orb2: "#5d6878", orb4: "#0d1013", orbBtn: "#1f242c",
    tipbg: "#f0f2f5", tipfg: "#1a1d22" },

  pine: { name: "Pine (dark)", dark: true,
    coral: "#7fb8a4", amber: "#52907c", g1: "#2e6355", g1b: "#336a5b", g2: "#17362e",
    ink: "#ebf2ef", muted: "#93a8a0", line: "rgba(255,255,255,.12)", glass: "rgba(255,255,255,.06)",
    card1: "#1a221f", card2: "#141b18", field: "#0f1513",
    surface: "rgba(23,30,27,.85)", panel: "rgba(18,24,22,.98)", rail: "rgba(14,19,17,.8)",
    bgA: "#1c2a25", bgB: "#16211d", bgC1: "#101715", bgC2: "#0b100e",
    orb1: "#bcd9d0", orb2: "#3f7a69", orb4: "#081511", orbBtn: "#122a24",
    tipbg: "#eef4f1", tipfg: "#16211d" },

  scarlet: { name: "Scarlet (dark)", dark: true,
    coral: "#e0685c", amber: "#c94a3d", g1: "#a83228", g1b: "#ad3a30", g2: "#5e150e",
    ink: "#f4ecea", muted: "#b3a09c", line: "rgba(255,255,255,.12)", glass: "rgba(255,255,255,.06)",
    card1: "#221715", card2: "#1a1210", field: "#130d0c",
    surface: "rgba(31,21,19,.85)", panel: "rgba(25,17,15,.98)", rail: "rgba(20,13,12,.8)",
    bgA: "#2a1a17", bgB: "#221412", bgC1: "#170f0d", bgC2: "#100a09",
    orb1: "#efc4bf", orb2: "#b03d32", orb4: "#2c0906", orbBtn: "#4d110b",
    tipbg: "#f4eeec", tipfg: "#241d18" },
};

const NOTIQ_VAR_KEYS = ["coral","amber","g1","g1b","g2","ink","muted","line","glass","card1","card2","field","surface","panel","rail","bgA","bgB","bgC1","bgC2","orb1","orb2","orb4","orbBtn","tipbg","tipfg"];

function notiqTheme() {
  try { return localStorage.getItem("notiq_theme") || "midnight"; } catch (e) { return "midnight"; }
}
function notiqApplyTheme(id) {
  const t = NOTIQ_THEMES[id] || NOTIQ_THEMES.midnight;
  const s = document.documentElement.style;
  NOTIQ_VAR_KEYS.forEach(k => s.setProperty("--" + k, t[k]));
  document.documentElement.dataset.notiqTheme = id;
}
notiqApplyTheme(notiqTheme());
