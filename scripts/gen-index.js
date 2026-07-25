'use strict';
// Generator for tailwind-oklch index.css.
// Emits readable, commented CSS. Every color-painting utility resolves chroma
// as calc(var(--X-c) * var(--X-cs)) so per-hue normalization applies uniformly.
//
// Axis prefixes: lum (luminance) · chroma · hue.

// Named hues map to real hue angles. There is deliberately no "neutral" — a
// neutral is the absence of chroma (chroma-low, or chroma-[0] for a flat gray), not a
// hue. Keeping the axes decomposed means neutrality lives on chroma.
const HUES = [
  ['primary', 233], ['accent', 350], ['success', 145],
  ['warning', 55], ['danger', 15], ['info', 220],
];
// Per-hue chroma multipliers. Blue reaches perceived saturation at lower chroma
// (so it scales down); green is the ~1.0 reference. Calibrated by eye.
const CSCALE = {
  primary: 0.86, accent: 0.90, success: 1.0,
  warning: 1.0, danger: 0.93, info: 0.88,
};
// Luminance scale: 0 = pure white (light) / pure black (dark); 10 = the opposite.
// Front-loaded near the page: 1–2 hug the page surface, steps open up lower down.
const L_LIGHT = ['1', '.965', '.95', '.885', '.80', '.69', '.575', '.46', '.345', '.22', '0'];
const L_DARK  = ['0', '.185', '.22', '.30', '.395', '.49', '.58', '.67', '.76', '.86', '1'];
const CHROMA = [['low', '.02'], ['mlow', '.05'], ['mid', '.09'], ['mhigh', '.13'], ['high', '.17']];
const ADJ = [['1', '.08'], ['2', '.16'], ['3', '.24'], ['4', '.32'], ['5', '.40']];
// Contrast strength: ΔL stepped off the background, toward contrast. Reuses the
// low·mlow·mid·mhigh·high vocabulary — here it means "how much contrast".
const CON = [['low', '.18'], ['mlow', '.25'], ['mid', '.32'], ['mhigh', '.42'], ['high', '.55']];

// property stem, utility prefix, and how it applies the resolved color.
const PROPS = [
  { stem: 'bg',  pre: 'bg',       apply: (col) => `background-color: ${col};` },
  { stem: 'tx',  pre: 'text',     apply: (col) => `color: ${col};` },
  { stem: 'bd',  pre: 'border',   apply: (col) => `border-color: ${col};` },
  { stem: 'bdb', pre: 'border-b', apply: (col) => `border-bottom-color: ${col};` },
  { stem: 'ac',  pre: 'accent',   apply: (col) => `accent-color: ${col};` },
  { stem: 'sh',  pre: 'shadow',   apply: (col) => `--tw-shadow-color: ${col};` },
  { stem: 'gf',  pre: 'from',     grad: 'from' },
  { stem: 'gt',  pre: 'to',       grad: 'to' },
];

const STOPS = 'var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))';

// col() builds an oklch() with a given luminance expression for a stem.
const col = (stem, lExpr) =>
  `oklch(${lExpr} calc(var(--${stem}-c) * var(--${stem}-cs)) var(--${stem}-h))`;

// applyColor emits the declaration(s) that paint `color` for a property.
function applyColor(p, lExpr) {
  const c = col(p.stem, lExpr);
  if (p.grad === 'from') return `  --tw-gradient-from: ${c};\n  --tw-gradient-stops: ${STOPS};`;
  if (p.grad === 'to')   return `  --tw-gradient-to: ${c};\n  --tw-gradient-stops: ${STOPS};`;
  return '  ' + p.apply(c);
}

let out = [];
const w = (s) => out.push(s);

// ── header ──────────────────────────────────────────────────────────────
w(`/* tailwind-oklch — a cascade-first OKLCH color system for Tailwind v4
 *
 * Pure CSS. No JavaScript plugin. Install with a single import:
 *
 *   @import "tailwindcss";
 *   @import "tailwind-oklch";
 *
 * Each class states ONE fact about ONE axis. Every color is composed from three
 * independent axes — luminance (lum), chroma, and hue — two of which
 * cascade, so most elements only ever state their luminance.
 *
 *   - Cascade seeders set an axis for every descendant and paint nothing:
 *       hue-primary · hue-danger · …    seeds hue (and its chroma scale)
 *       chroma-mlow · chroma-high · …            seeds chroma
 *
 *   - Per-property setters paint one property from one axis; hue and chroma
 *     inherit from a seeder (or the :root default) unless set explicitly:
 *       bg-lum-2     bg-chroma-mlow     bg-hue-accent
 *       text-lum-9   text-chroma-high    text-hue-info
 *       …plus border-*, border-b-*, accent-*, shadow-*, from-*, to-*
 *
 *   - Relative adjustments nudge off the inherited luminance without rewriting
 *     it (so they don't compound down the tree): bg-lum-up-1 · text-lum-down-1 · …
 *
 * Luminance scale: 0–10, a plain white→black ramp that auto-flips, measuring
 * contrast with the page.
 *   0  = pure white (light) / pure black (dark) — the page-ward extreme
 *   1  = blends with the page (the lightest usable surface)
 *   10 = pure black (light) / pure white (dark) — maximum foreground contrast
 * The low end is finely graded (the eye is most sensitive next to the page);
 * steps open up toward the dark end.
 *
 * Per-hue chroma: hues don't reach perceived saturation at the same chroma
 * (blue peaks early, yellow late), so each hue carries a --cscale-* multiplier
 * and every color resolves chroma as calc(chroma × scale). A given chroma stop
 * then looks about equally saturated across hues. Override --cscale-* to taste.
 */
`);

// ── @theme ──────────────────────────────────────────────────────────────
w(`@theme {`);
w(`  /* ── Hues — change to re-theme the whole app ──────────────────────── */`);
for (const [n, deg] of HUES) w(`  --hue-${n}: ${deg};`);
w('');
w(`  /* ── Per-hue chroma scale — perceptual normalization multipliers ───── */`);
for (const [n] of HUES) w(`  --cscale-${n}: ${CSCALE[n]};`);
w('');
w(`  /* ── Luminance scale (light): 0 = white … 10 = black ──────────────── */`);
for (let i = 0; i <= 10; i++) w(`  --lum-${i}: ${L_LIGHT[i]};`);
w('');
w(`  /* ── Chroma stops (base, before per-hue scale) ────────────────────── */`);
for (const [n, v] of CHROMA) w(`  --chroma-${n}: ${v};`);
w('');
w(`  /* ── Contrast strength (ΔL off the background, toward contrast) ─────── */`);
for (const [n, v] of CON) w(`  --con-${n}: ${v};`);
w('');
w(`  /* ── Luminance adjustment steps (~one 0–10 position each) ─────────── */`);
for (const [n, v] of ADJ) w(`  --lum-adj-${n}: ${v};`);
w(`}`);
w('');

// ── dark ────────────────────────────────────────────────────────────────
w(`/* ── Dark mode: the scale flips (0 = black, 10 = white) ─────────────────
   0/blends and 10/max-contrast keep their meaning; the numbers just map to
   flipped luminances. --lum-flip drives arbitrary-value auto-flip. */`);
w(`.dark {`);
w(`  --lum-dir: 1;`);
w(`  --lum-flip: 1;`);
for (let i = 0; i <= 10; i++) w(`  --lum-${i}: ${L_DARK[i]};`);
w(`}`);
w('');

// ── :root defaults ───────────────────────────────────────────────────────
w(`/* ── Cascade defaults ──────────────────────────────────────────────────
   Sensible fallbacks so any single-axis setter resolves immediately. These
   inherit down the DOM, so a parent's hue/chroma flows to children. */`);
w(`:root {`);
w(`  --lum-dir: -1;`);
w(`  --lum-flip: 0;`);
w('');
const defL = { bg: '5', tx: '10', bd: '3', bdb: '3', ac: '5', sh: '5', gf: '5', gt: '5' };
const defC = { bg: 'low', tx: 'low', bd: 'low', bdb: 'low', ac: 'mid', sh: 'low', gf: 'mid', gt: 'mid' };
for (const p of PROPS) {
  w(`  --${p.stem}-l: var(--lum-${defL[p.stem]});`);
  w(`  --${p.stem}-c: var(--chroma-${defC[p.stem]});`);
  w(`  --${p.stem}-cs: var(--cscale-primary);`);
  w(`  --${p.stem}-h: var(--hue-primary);`);
  if (p.stem !== 'gt') w('');
}
w(`}`);
w('');

// ── seeders ───────────────────────────────────────────────────────────────
w(`/* ── Global hue seeder — sets hue (and its chroma scale) for every property,
   painting nothing. Per-property hue utilities still override. ───────────── */`);
w(`@utility hue-* {`);
for (const p of PROPS) w(`  --${p.stem}-h: --value(--hue-*);`);
for (const p of PROPS) w(`  --${p.stem}-cs: --value(--cscale-*);`);
w(`}`);
w(`@utility hue-* {`);
w(`  /* arbitrary hue-[280]: degrees as-is; no per-hue scale (unknown hue) */`);
for (const p of PROPS) w(`  --${p.stem}-h: --value([integer]);`);
for (const p of PROPS) w(`  --${p.stem}-cs: 1;`);
w(`}`);
w('');
w(`/* ── Global chroma seeder — sets chroma for every property, painting nothing.
   Per-property chroma utilities still override. ─────────────────────────── */`);
w(`@utility chroma-* {`);
for (const p of PROPS) w(`  --${p.stem}-c: --value(--chroma-*);`);
w(`}`);
w(`@utility chroma-* {`);
w(`  /* arbitrary chroma-[8]: chroma = n / 100 */`);
for (const p of PROPS) w(`  --${p.stem}-c: calc(--value([integer]) / 100);`);
w(`}`);
w('');

// ── per-property setters ───────────────────────────────────────────────────
const titleOf = {
  bg: 'Background', tx: 'Text', bd: 'Border', bdb: 'Border Bottom',
  ac: 'Accent Color', sh: 'Shadow Color', gf: 'Gradient From', gt: 'Gradient To',
};
for (const p of PROPS) {
  const s = p.stem;
  w(`/* ── ${titleOf[s]} ─────────────────────────────────────────────────── */`);
  // luminance (named + arbitrary)
  w(`@utility ${p.pre}-lum-* {`);
  w(`  --${s}-l: --value(--lum-*);`);
  w(applyColor(p, `var(--${s}-l)`));
  w(`}`);
  w(`@utility ${p.pre}-lum-* {`);
  w(`  /* arbitrary ${p.pre}-lum-[60]: auto-flip L = v + flip × (1 − 2v) */`);
  w(`  --${s}-lv: calc(--value([integer]) / 100);`);
  w(`  --${s}-l: calc(var(--${s}-lv) + var(--lum-flip) * (1 - 2 * var(--${s}-lv)));`);
  w(applyColor(p, `var(--${s}-l)`));
  w(`}`);
  // chroma (named + arbitrary)
  w(`@utility ${p.pre}-chroma-* {`);
  w(`  --${s}-c: --value(--chroma-*);`);
  w(applyColor(p, `var(--${s}-l)`));
  w(`}`);
  w(`@utility ${p.pre}-chroma-* {`);
  w(`  --${s}-c: calc(--value([integer]) / 100);`);
  w(applyColor(p, `var(--${s}-l)`));
  w(`}`);
  // hue (named + arbitrary), also sets the chroma scale
  w(`@utility ${p.pre}-hue-* {`);
  w(`  --${s}-h: --value(--hue-*);`);
  w(`  --${s}-cs: --value(--cscale-*);`);
  w(applyColor(p, `var(--${s}-l)`));
  w(`}`);
  w(`@utility ${p.pre}-hue-* {`);
  w(`  --${s}-h: --value([integer]);`);
  w(`  --${s}-cs: 1;`);
  w(applyColor(p, `var(--${s}-l)`));
  w(`}`);
  // relative adjustments (bg + text only, matching prior scope)
  if (s === 'bg' || s === 'tx') {
    const up = `clamp(0, calc(var(--${s}-l) + var(--lum-dir) * var(--${s}-l-adj)), 1)`;
    const dn = `clamp(0, calc(var(--${s}-l) - var(--lum-dir) * var(--${s}-l-adj)), 1)`;
    w(`@utility ${p.pre}-lum-up-* {`);
    w(`  --${s}-l-adj: --value(--lum-adj-*);`);
    w(applyColor(p, up));
    w(`}`);
    w(`@utility ${p.pre}-lum-down-* {`);
    w(`  --${s}-l-adj: --value(--lum-adj-*);`);
    w(applyColor(p, dn));
    w(`}`);
  }
  w('');
}

// ── contrast (con-*) utilities ─────────────────────────────────────────────
// Background-relative and auto-directional: luminance is chosen to contrast
// with the element's own inherited background (--bg-l), moving toward whichever
// pole (lighter/darker) gives contrast. One class works on a light OR dark
// surface. Chroma/hue are inherited (text-con reads --tx-*, border/outline read
// --bd-*); only luminance is computed. Like lum-up/down it's a leaf utility —
// it paints without rewriting the cascading axis vars.
const CON_PROPS = [
  { pre: 'text',    stem: 'tx', apply: (c) => `  color: ${c};` },
  { pre: 'border',  stem: 'bd', apply: (c) => `  border-color: ${c};` },
  { pre: 'outline', stem: 'bd', apply: (c) => `  outline-color: ${c};` },
];
// direction: +1 when the background is dark (go lighter), −1 when light (go
// darker); the ×1000 makes the clamp snap hard at the 0.6 luminance midpoint.
const CON_DIR = `clamp(-1, calc((0.6 - var(--bg-l)) * 1000), 1)`;
const conL = `clamp(0, calc(var(--bg-l) + var(--con-dir) * var(--con-off)), 1)`;

w(`/* ── Contrast (con-*) — luminance chosen to contrast with the element's own
   background (--bg-l), auto-directional so one class works on light OR dark
   surfaces. Inherits chroma/hue; only luminance is computed. A leaf utility:
   like lum-up/down it paints without rewriting the cascading vars. ────────── */`);
for (const p of CON_PROPS) {
  w(`@utility ${p.pre}-con-* {`);
  w(`  --con-off: --value(--con-*);`);
  w(`  --con-dir: ${CON_DIR};`);
  w(p.apply(col(p.stem, conL)));
  w(`}`);
  w(`@utility ${p.pre}-con-* {`);
  w(`  /* arbitrary ${p.pre}-con-[40]: ΔL = n / 100 off the background */`);
  w(`  --con-off: calc(--value([integer]) / 100);`);
  w(`  --con-dir: ${CON_DIR};`);
  w(p.apply(col(p.stem, conL)));
  w(`}`);
  w('');
}

require('fs').writeFileSync(process.argv[2] || 'index.css', out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
console.log('wrote', process.argv[2]);
