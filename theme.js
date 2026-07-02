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

  fog: { name: "Fog (grey)", dark: false,
    coral: "#3b4a5c", amber: "#7288a0", g1: "#4a5c72", g1b: "#506279", g2: "#29343f",
    ink: "#22262b", muted: "#7c8188", line: "rgba(30,34,40,.12)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#eef0f2", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(250,251,251,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#eceef0", bgB: "#e3e6e9", bgC1: "#f4f5f6", bgC2: "#e9ebed",
    orb1: "#ccd6e0", orb2: "#5c7186", orb4: "#12171d", orbBtn: "#202932",
    tipbg: "#22262b", tipfg: "#ffffff" },

  lilac: { name: "Lilac", dark: false,
    coral: "#503080", amber: "#8a68c8", g1: "#64459e", g1b: "#6a4ba4", g2: "#371f5c",
    ink: "#241d2b", muted: "#7c7484", line: "rgba(36,29,43,.11)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f4f0fa", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(251,249,253,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#efe8f8", bgB: "#e5dcf2", bgC1: "#f6f1fb", bgC2: "#ebe3f5",
    orb1: "#d9c9f0", orb2: "#7a55b8", orb4: "#241145", orbBtn: "#301a52",
    tipbg: "#241d2b", tipfg: "#ffffff" },

  mint: { name: "Mint", dark: false,
    coral: "#17604a", amber: "#3d9c7f", g1: "#1f7a5f", g1b: "#248065", g2: "#0e4234",
    ink: "#1d2622", muted: "#6f7a75", line: "rgba(29,38,34,.11)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#edf6f1", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(249,252,250,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#e8f4ee", bgB: "#dcede4", bgC1: "#f0f8f3", bgC2: "#e2efe8",
    orb1: "#b6e2d2", orb2: "#2c8a6d", orb4: "#06251c", orbBtn: "#0b3529",
    tipbg: "#1d2622", tipfg: "#ffffff" },

  honey: { name: "Honey", dark: false,
    coral: "#7a5a12", amber: "#b08a26", g1: "#96731a", g1b: "#9b7820", g2: "#57400c",
    ink: "#28221a", muted: "#7e786a", line: "rgba(40,34,26,.11)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f8f3e3", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(253,251,245,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#f9f4e2", bgB: "#f4ecd2", bgC1: "#fbf7e9", bgC2: "#f3ecd8",
    orb1: "#eddba8", orb2: "#a8842a", orb4: "#33250a", orbBtn: "#46340c",
    tipbg: "#28221a", tipfg: "#ffffff" },

  horizon: { name: "Horizon", dark: false,
    coral: "#33427a", amber: "#d97848", g1: "#45549c", g1b: "#4a59a2", g2: "#232e5c",
    ink: "#232331", muted: "#767585", line: "rgba(35,35,49,.11)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f1f2fa", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(250,250,253,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#dfecfa", bgB: "#fbe4d4", bgC1: "#ecf3fc", bgC2: "#fceee2",
    orb1: "#c3cdf0", orb2: "#5a6ac0", orb4: "#101638", orbBtn: "#1a2148",
    tipbg: "#232331", tipfg: "#ffffff" },

  noir: { name: "Noir (black)", dark: true,
    coral: "#f2f2f2", amber: "#b8b8b8", g1: "#3d3d3d", g1b: "#444444", g2: "#141414",
    ink: "#f4f4f4", muted: "#9a9a9a", line: "rgba(255,255,255,.14)", glass: "rgba(255,255,255,.07)",
    card1: "#161616", card2: "#0f0f0f", field: "#0a0a0a",
    surface: "rgba(20,20,20,.85)", panel: "rgba(15,15,15,.98)", rail: "rgba(10,10,10,.85)",
    bgA: "#1c1c1c", bgB: "#141414", bgC1: "#0a0a0a", bgC2: "#000000",
    orb1: "#d9d9d9", orb2: "#6a6a6a", orb4: "#050505", orbBtn: "#1f1f1f",
    tipbg: "#f2f2f2", tipfg: "#111111" },

  nebula: { name: "Nebula (dark)", dark: true,
    coral: "#b39df0", amber: "#7a90e8", g1: "#6d5bd0", g1b: "#7161d6", g2: "#3a2f80",
    ink: "#efedf8", muted: "#a49ec0", line: "rgba(255,255,255,.13)", glass: "rgba(255,255,255,.06)",
    card1: "#1e1b30", card2: "#171428", field: "#110f20",
    surface: "rgba(28,25,48,.85)", panel: "rgba(22,19,38,.98)", rail: "rgba(17,15,30,.82)",
    bgA: "#2a2145", bgB: "#14283e", bgC1: "#151226", bgC2: "#0b0918",
    orb1: "#d3c6f5", orb2: "#7a63d8", orb4: "#171040", orbBtn: "#241a55",
    tipbg: "#f1eefb", tipfg: "#1c1830" },

  abyss: { name: "Abyss (dark)", dark: true,
    coral: "#6fd3e0", amber: "#3fa6b8", g1: "#1b7a8c", g1b: "#208090", g2: "#0d4550",
    ink: "#e8f4f6", muted: "#8fb0b6", line: "rgba(255,255,255,.12)", glass: "rgba(255,255,255,.06)",
    card1: "#122023", card2: "#0d181b", field: "#091214",
    surface: "rgba(16,28,31,.85)", panel: "rgba(13,23,26,.98)", rail: "rgba(10,18,20,.82)",
    bgA: "#12262a", bgB: "#0d1c20", bgC1: "#0c1517", bgC2: "#060c0d",
    orb1: "#b0e2ea", orb2: "#2b93a6", orb4: "#04181c", orbBtn: "#0a2c33",
    tipbg: "#eef6f7", tipfg: "#122023" },

  citrus: { name: "Citrus", dark: false,
    coral: "#3a7d44", amber: "#f08c3a", g1: "#4a9457", g1b: "#4f9a5c", g2: "#275c31",
    ink: "#242a20", muted: "#75786c", line: "rgba(36,42,32,.11)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f0f7ee", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(250,252,248,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#e9f5e6", bgB: "#fdeeda", bgC1: "#f7fbf4", bgC2: "#f2f0e2",
    orb1: "#c2e3c4", orb2: "#4d9a5a", orb4: "#12351a", orbBtn: "#1d4a26",
    tipbg: "#242a20", tipfg: "#ffffff" },

  tide: { name: "Tide", dark: false,
    coral: "#2563a8", amber: "#ed8936", g1: "#2f74bd", g1b: "#3579c2", g2: "#17416f",
    ink: "#22262e", muted: "#71767e", line: "rgba(34,38,46,.11)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#eef4fb", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(249,251,253,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#e6f0fb", bgB: "#fdeeda", bgC1: "#f5f9fd", bgC2: "#f6efe4",
    orb1: "#bcd8f0", orb2: "#3f7fc0", orb4: "#0c2440", orbBtn: "#143a5e",
    tipbg: "#22262e", tipfg: "#ffffff" },

  melon: { name: "Melon", dark: false,
    coral: "#c14b40", amber: "#6cbf8b", g1: "#cf5a4e", g1b: "#d25f53", g2: "#7e2b23",
    ink: "#2a2220", muted: "#7d7370", line: "rgba(42,34,32,.11)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f7f1ec", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(252,251,248,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#e5f5ea", bgB: "#fde8e4", bgC1: "#f9faf5", bgC2: "#f7efe9",
    orb1: "#f2c7c1", orb2: "#c4544a", orb4: "#3f120d", orbBtn: "#571a13",
    tipbg: "#2a2220", tipfg: "#ffffff" },

  sorbet: { name: "Sorbet", dark: false,
    coral: "#c05f2e", amber: "#5da4dd", g1: "#d06c39", g1b: "#d4713e", g2: "#7c3a17",
    ink: "#2a231d", muted: "#7d746c", line: "rgba(42,35,29,.11)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#faf1e9", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(253,251,248,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#fdeadb", bgB: "#e3f0fb", bgC1: "#fdf6ef", bgC2: "#eff4f8",
    orb1: "#f5cdb3", orb2: "#cf6a35", orb4: "#401704", orbBtn: "#571f08",
    tipbg: "#2a231d", tipfg: "#ffffff" },

  spring: { name: "Spring", dark: false,
    coral: "#6d4fb4", amber: "#d9b32f", g1: "#7c5fc4", g1b: "#8064c8", g2: "#48327e",
    ink: "#252030", muted: "#78727f", line: "rgba(37,32,48,.11)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f3effa", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(251,250,253,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#efe9fa", bgB: "#fbf5d9", bgC1: "#f8f5fc", bgC2: "#f7f3e3",
    orb1: "#d5c8f0", orb2: "#7a5fc0", orb4: "#221145", orbBtn: "#2f1a55",
    tipbg: "#252030", tipfg: "#ffffff" },

  reef: { name: "Reef", dark: false,
    coral: "#0e7c85", amber: "#f2836b", g1: "#14919b", g1b: "#1997a1", g2: "#0a4c52",
    ink: "#1e2828", muted: "#6e7b7a", line: "rgba(30,40,40,.11)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#ebf6f5", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(248,252,251,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#e2f4f4", bgB: "#fdeae4", bgC1: "#f2fafa", bgC2: "#f7efe9",
    orb1: "#b5e2e4", orb2: "#2596a0", orb4: "#05282b", orbBtn: "#0a3a3f",
    tipbg: "#1e2828", tipfg: "#ffffff" },
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

// For light-canvas pages (features, sign-in, share, reset): keep the page light,
// take only the palette's accents. Dark themes contribute readable deep variants.
const NOTIQ_LIGHT_ACCENTS = {
  slate:    { coral: "#2a4d8a", amber: "#4a7cc9" },
  ember:    { coral: "#a8791f", amber: "#c9812e" },
  graphite: { coral: "#3d4654", amber: "#6b7484" },
  pine:     { coral: "#2e6355", amber: "#52907c" },
  scarlet:  { coral: "#a83228", amber: "#c94a3d" },
  noir:     { coral: "#2b2b2b", amber: "#6a6a6a" },
  nebula:   { coral: "#5b48c0", amber: "#7a90e8" },
  abyss:    { coral: "#14707f", amber: "#3fa6b8" },
};
function notiqLightCanvas() {
  const id = notiqTheme();
  const t = NOTIQ_THEMES[id] || NOTIQ_THEMES.midnight;
  const s = document.documentElement.style;
  const L = NOTIQ_THEMES.midnight;
  ["ink","muted","line","glass","card1","card2","field","surface","panel","rail","bgA","bgB","bgC1","bgC2","tipbg","tipfg"]
    .forEach(k => s.setProperty("--" + k, L[k]));
  if (t.dark) {
    const a = NOTIQ_LIGHT_ACCENTS[id] || {};
    if (a.coral) s.setProperty("--coral", a.coral);
    if (a.amber) s.setProperty("--amber", a.amber);
  }
}
