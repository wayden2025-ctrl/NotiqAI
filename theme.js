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
    bgA: "#f0f4fa", bgB: "#e8eef8", bgC1: "#f9f6f2", bgC2: "#f4efe9" },

  forest: { name: "Forest", dark: false,
    coral: "#1d5c37", amber: "#4f9e6b", g1: "#2c7a4b", g1b: "#2f7d4f", g2: "#143f28",
    ink: "#241d18", muted: "#77716a", line: "rgba(36,29,24,.10)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f1f7f2", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(251,252,249,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#eef6f0", bgB: "#e6f1e9", bgC1: "#f8faf6", bgC2: "#eff4ec" },

  plum: { name: "Plum", dark: false,
    coral: "#4a2c6b", amber: "#8a5fc9", g1: "#5d3f8a", g1b: "#62458f", g2: "#32204f",
    ink: "#241d18", muted: "#7a7280", line: "rgba(36,29,24,.10)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f4f1f9", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(252,250,253,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#f3f0fa", bgB: "#ece6f6", bgC1: "#f9f7fc", bgC2: "#f1edf6" },

  crimson: { name: "Crimson", dark: false,
    coral: "#8a2433", amber: "#c9564a", g1: "#a03a49", g1b: "#a4404e", g2: "#5e1822",
    ink: "#241d18", muted: "#7c6f6d", line: "rgba(36,29,24,.10)", glass: "rgba(255,255,255,.58)",
    card1: "#ffffff", card2: "#f8f1f2", field: "#ffffff",
    surface: "rgba(255,255,255,.72)", panel: "rgba(253,250,250,.98)", rail: "rgba(255,255,255,.62)",
    bgA: "#faeef0", bgB: "#f6e7e9", bgC1: "#fbf7f6", bgC2: "#f4eeec" },

  slate: { name: "Slate (dark)", dark: true,
    coral: "#7aa7e0", amber: "#4a7cc9", g1: "#2a4d8a", g1b: "#2e5490", g2: "#163264",
    ink: "#edf0f5", muted: "#9aa3b2", line: "rgba(255,255,255,.12)", glass: "rgba(255,255,255,.06)",
    card1: "#1e232d", card2: "#171c25", field: "#12161d",
    surface: "rgba(26,31,40,.85)", panel: "rgba(21,25,33,.98)", rail: "rgba(17,21,28,.8)",
    bgA: "#1b2230", bgB: "#161c28", bgC1: "#14171e", bgC2: "#0f1217" },

  ember: { name: "Ember (dark)", dark: true,
    coral: "#e2a63d", amber: "#c9812e", g1: "#a8791f", g1b: "#ad7e24", g2: "#6e4c12",
    ink: "#f2ede4", muted: "#b3a996", line: "rgba(255,255,255,.12)", glass: "rgba(255,255,255,.06)",
    card1: "#211d18", card2: "#191612", field: "#141210",
    surface: "rgba(30,26,21,.85)", panel: "rgba(24,21,17,.98)", rail: "rgba(20,18,14,.8)",
    bgA: "#2a2318", bgB: "#221c14", bgC1: "#17140f", bgC2: "#100e0b" },
};

const NOTIQ_VAR_KEYS = ["coral","amber","g1","g1b","g2","ink","muted","line","glass","card1","card2","field","surface","panel","rail","bgA","bgB","bgC1","bgC2"];

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
