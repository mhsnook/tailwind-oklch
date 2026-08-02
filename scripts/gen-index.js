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
// Luminance scale. The numbered stops 1..N run between a near-page endpoint and a
// far (foreground) endpoint — never the pure extremes. The pure poles live OUTSIDE
// the numbered scale, as named stops:
//   none = the page color (white in light / black in dark) — zero contrast
//   max  = full contrast   (black in light / white in dark)
// Distribution concentrates stops toward high lightness (small gaps on light
// shades, large on dark — even perceptual steps), with a gentle symmetric
// edge-tightening on top — two shaping knobs:
//   LUM_CRUNCH (medium): concentrate stops toward HIGH lightness, so stop-to-stop
//     gaps are small on light shades and large on dark — even PERCEPTUAL steps
//     (a fixed ΔL reads big near white, tiny near black). This is what makes
//     lum-1→lum-2 tight in light mode and loose in dark, automatically: light
//     stop 1 lives at high L, dark stop 1 at low L.
//   LUM_EDGE (small): a gentle symmetric tightening at both ends, blended in.
const LUM_N = 10;
const LUM_CRUNCH = 1.4; // medium: stops denser toward high lightness
const LUM_EDGE = 0.18;  // small: blend weight of the symmetric edge-ease
const EDGE_K = 2;       // sharpness of the edge-ease curve
const l3 = (x) => String(Math.round(x * 1000) / 1000).replace(/^0\./, '.');
const sCurve = (t, k) => {
  const a = Math.pow(t, k), b = Math.pow(1 - t, k);
  return a / (a + b);
};
// warp t∈[0,1]: crunch toward the higher-lightness endpoint (near for light, far
// for dark), plus a small symmetric edge-ease blended in.
const warp = (t, hiAtNear) => {
  const crunch = hiAtNear ? Math.pow(t, LUM_CRUNCH) : 1 - Math.pow(1 - t, LUM_CRUNCH);
  return (1 - LUM_EDGE) * crunch + LUM_EDGE * sCurve(t, EDGE_K);
};
const ramp = (near, far) =>
  Array.from({ length: LUM_N }, (_, i) => l3(near + (far - near) * warp(i / (LUM_N - 1), near > far)));
const L_LIGHT = ramp(0.95, 0.13);  // light: stop 1 hugs white closely (.95, low contrast with the page); opens toward the dark foreground
const L_DARK  = ramp(0.22, 0.92);  // dark: stop 1 just off black (a little lift; a theme can lift it further)
const L_NONE = ['1', '0']; // [light, dark]
const L_MAX  = ['0', '1'];
// Contrast crossover: the surface L where con-* flips text direction (black↔white).
// Use the scale's own midpoint (between lum-5 and lum-6) rather than a fixed 0.6,
// so the flip lands at the SAME stop in light and dark even though the two scales
// aren't symmetric. Themeable via --con-flip.
const conMid = (arr) => l3((+arr[4] + +arr[5]) / 2);
const CON_MID = [conMid(L_LIGHT), conMid(L_DARK)]; // [light, dark]
// Chroma stops. `max` overshoots the sRGB gamut on purpose: oklch() gamut-maps
// it to the most saturated displayable color at each L/H — "give me the full
// color, whatever that is here" — so a given hue clamps to its own ceiling.
const CHROMA = [['low', '.02'], ['mlow', '.05'], ['mid', '.09'], ['mhigh', '.13'], ['high', '.17'], ['max', '.25']];
const ADJ = [['1', '.08'], ['2', '.16'], ['3', '.24'], ['4', '.32'], ['5', '.40']];
// Contrast strength: ΔL stepped off the background, toward contrast. Reuses the
// low·mlow·mid·mhigh·high vocabulary — here it means "how much contrast". `high`
// is a fixed ΔL that may or may not reach the extreme depending on the surface;
// `max` uses a ≥1 offset so the clamp always snaps to pure black/white — a
// guaranteed contrast-color(), regardless of surface.
const CON = [['low', '.18'], ['mlow', '.25'], ['mid', '.32'], ['mhigh', '.42'], ['high', '.55'], ['max', '1']];
// Dark surfaces need a bigger ΔL for the same apparent contrast, so the named
// ramp is bumped in dark mode (numbered bumps stay put — they're decorative).
const CON_DARK = [['low', '.24'], ['mlow', '.32'], ['mid', '.40'], ['mhigh', '.50'], ['high', '.65'], ['max', '1']];
const conLines = (flip, pad) => (flip ? CON_DARK : CON).map(([n, v]) => `${pad}--con-${n}: ${v};`).join('\n');
// Numbered contrast ramp — a finer "bump" scale for decorative edges (borders,
// outlines, SVG strokes). Smaller ΔL steps than the named ramp: text reaches for
// the named stops, decoration for these numbers. Same background-relative math,
// same utilities (border-con-2 resolves --con-2 just like border-con-low resolves
// --con-low).
const CON_STEP = [['1', '.06'], ['2', '.10'], ['3', '.15'], ['4', '.22'], ['5', '.30']];
// resolve a con scale key (named or numbered) to its numeric ΔL
const conVal = (k) => (CON.find(([n]) => n === k) || CON_STEP.find(([n]) => n === k))[1];
// Contrast "moods": a named profile that fans one intent out across properties,
// each to its own step (text a little more than borders, etc.). Set on an
// ancestor; the bare *-con leaves below inherit these as their default ΔL. Values
// are con scale keys, so a profile stays readable and re-themes with the scale.
const CONTRAST = [
  ['low',  { tx: 'mlow', dc: 'low',  bd: '1', ol: '1', rg: '1', st: '2', fl: 'mlow' }],
  ['mid',  { tx: 'mid',  dc: 'mlow', bd: '2', ol: '2', rg: '2', st: '3', fl: 'mid' }],
  ['high', { tx: 'high', dc: 'mid',  bd: '3', ol: '3', rg: '3', st: '4', fl: 'high' }],
];
// The per-property default-ΔL vars (one per con-capable leaf), and the 'mid'
// profile that seeds their @property initial-value (so bare *-con works with no
// mood set).
const CON_DEF = ['tx', 'dc', 'bd', 'ol', 'rg', 'st', 'fl'];
const CON_DEF_INIT = CONTRAST.find(([n]) => n === 'mid')[1];

// property stem, utility prefix, and how it applies the resolved color.
const PROPS = [
  { stem: 'bg',  pre: 'bg',       apply: (col) => `background-color: ${col};` },
  { stem: 'tx',  pre: 'text',     apply: (col) => `color: ${col};` },
  { stem: 'dc',  pre: 'decoration', apply: (col) => `text-decoration-color: ${col};` },
  { stem: 'bd',  pre: 'border',   apply: (col) => `border-color: ${col};` },
  { stem: 'bdt', pre: 'border-t', apply: (col) => `border-top-color: ${col};` },
  { stem: 'bdr', pre: 'border-r', apply: (col) => `border-right-color: ${col};` },
  { stem: 'bdb', pre: 'border-b', apply: (col) => `border-bottom-color: ${col};` },
  { stem: 'bdl', pre: 'border-l', apply: (col) => `border-left-color: ${col};` },
  { stem: 'bdx', pre: 'border-x', apply: (col) => `border-inline-color: ${col};` },
  { stem: 'bdy', pre: 'border-y', apply: (col) => `border-block-color: ${col};` },
  { stem: 'bds', pre: 'border-s', apply: (col) => `border-inline-start-color: ${col};` },
  { stem: 'bde', pre: 'border-e', apply: (col) => `border-inline-end-color: ${col};` },
  { stem: 'ac',  pre: 'accent',   apply: (col) => `accent-color: ${col};` },
  { stem: 'sh',  pre: 'shadow',   apply: (col) => `--tw-shadow-color: ${col};` },
  { stem: 'rg',  pre: 'ring',     apply: (col) => `--tw-ring-color: ${col};` },
  { stem: 'ro',  pre: 'ring-offset', apply: (col) => `--tw-ring-offset-color: ${col};` },
  { stem: 'st',  pre: 'stroke',   apply: (col) => `stroke: ${col};` },
  { stem: 'fl',  pre: 'fill',     apply: (col) => `fill: ${col};` },
  { stem: 'gf',  pre: 'from',     grad: 'from' },
  { stem: 'gt',  pre: 'to',       grad: 'to' },
];

const STOPS = 'var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))';

// col() builds an oklch() with a given luminance expression for a stem.
// Chroma is tapered toward white: at high L a fixed chroma reads as far more
// saturated (it fills more of the visible gamut), so we scale it down as L→1.
// taper = clamp(0, (1 − L) × --chroma-taper, 1): full chroma below L ≈ 1−1/k,
// falling to 0 at pure white — so a given chroma stop looks about equally
// saturated across the scale, and the lightest stop resolves to clean white.
const taper = (lExpr) =>
  `clamp(0, calc((1 - (${lExpr})) * var(--chroma-taper)), 1)`;
const col = (stem, lExpr) =>
  `oklch(${lExpr} calc(var(--${stem}-c) * var(--${stem}-cs) * ${taper(lExpr)}) var(--${stem}-h))`;

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
 * independent axes — luminance (lum), chroma, and hue — two of which cascade,
 * so most elements only ever state their luminance.
 *
 *   - Property-less axis classes carry no property; they set an axis for every
 *     LCH calculation that cascades to them, and paint nothing themselves —
 *     ordinary CSS custom-property inheritance:
 *       hue-primary · hue-danger · …    sets hue (and its chroma scale) below
 *       chroma-mlow · chroma-high · …   sets chroma below
 *       contrast-low · contrast-mid · … sets the default contrast ΔL below
 *
 *   - Per-property setters paint one property from one axis; hue and chroma
 *     inherit from an ancestor (or the :root default) unless set explicitly:
 *       bg-lum-2     bg-chroma-mlow     bg-hue-accent
 *       text-lum-9   text-chroma-high    text-hue-info
 *       …plus border-*, border-b-*, accent-*, shadow-*, ring-*, ring-offset-*,
 *       stroke-*, fill-*, from-*, to-*
 *
 *   - Contrast (con-*) is background-relative: text-con-mid picks a luminance a
 *     ΔL off the surface, toward contrast. Valued (text-con-mid, text-con-2),
 *     arbitrary (text-con-[40]), or BARE (text-con) — the bare form paints at the
 *     ΔL the nearest contrast-* mood set. text · border · outline · ring ·
 *     decoration · stroke · fill.
 *
 *   - Relative adjustments nudge off the nearest absolute luminance, and DON'T
 *     compound: bg-lum-up-1 · text-lum-down-1 · …. The numbered stops are your
 *     reference points — a nudge always measures from the nearest ancestor's
 *     absolute lum-N, so nested nudges don't stack. (CSS requires this: a custom
 *     property can't derive from its own inherited value without forming a
 *     cycle.) bg nudges read a separate --bg-anchor-l (the nearest absolute) and
 *     write the result to --bg-l, so --bg-l always holds the REAL surface — which
 *     is what the con-* contrast utilities read.
 *
 * Luminance scale: numbered stops 1..10 on an ease-in-out curve that auto-flips
 * for dark mode, measuring contrast with the page. The pure poles are named:
 *   none = the page color: white (light) / black (dark) — zero contrast
 *   1    = the lightest usable surface (light hugs the page; dark sits off black)
 *   10   = a strong foreground (near, but not, the max)
 *   max  = full contrast: black (light) / white (dark)
 * Stops bunch at BOTH edges (fine control near the page and near the foreground)
 * and open up through the middle; none/max sit outside the curve so a theme can
 * pull the numbered range in without losing the extremes.
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
w(`  /* ── Luminance scale (light). Numbered 1..${LUM_N} on an ease-in-out curve;`);
w(`     the pure poles are named: none = white (page), max = black (contrast). ── */`);
w(`  --lum-none: ${L_NONE[0]};`);
for (let i = 1; i <= LUM_N; i++) w(`  --lum-${i}: ${L_LIGHT[i - 1]};`);
w(`  --lum-max: ${L_MAX[0]};`);
w('');
w(`  /* ── Chroma stops (base, before per-hue scale) ────────────────────── */`);
for (const [n, v] of CHROMA) w(`  --chroma-${n}: ${v};`);
w('');
w(`  /* ── Chroma taper toward white: full chroma below L ≈ 0.67, → 0 at L=1,`);
w(`     so a chroma stop looks about equally saturated across the scale and the`);
w(`     lightest surfaces stay subtle. Higher = chroma survives closer to white. ─ */`);
w(`  --chroma-taper: 3;`);
w('');
w(`  /* ── Contrast strength (ΔL off the background, toward contrast) ─────── */`);
for (const [n, v] of CON) w(`  --con-${n}: ${v};`);
w('');
w(`  /* ── Numbered contrast bumps — finer decorative steps (borders, strokes).`);
w(`     border-con-2 resolves --con-2 through the same utility as border-con-low. ─ */`);
for (const [n, v] of CON_STEP) w(`  --con-${n}: ${v};`);
w('');
w(`  /* ── Luminance adjustment steps (~one 0–10 position each) ─────────── */`);
for (const [n, v] of ADJ) w(`  --lum-adj-${n}: ${v};`);
w(`}`);
w('');

// ── :root defaults ───────────────────────────────────────────────────────
// NOTE: :root is emitted BEFORE .dark on purpose. :root and .dark have equal
// specificity, so for any variable set in both, source order decides — the dark
// override only wins if it comes later.
w(`/* ── Cascade defaults ──────────────────────────────────────────────────
   Sensible fallbacks so any single-axis setter resolves immediately. These
   inherit down the DOM, so a parent's hue/chroma flows to children. */`);
w(`:root {`);
w(`  --lum-dir: -1;`);
w(`  --lum-flip: 0;`);
w(`  --con-flip: ${CON_MID[0]};`);
w('');
// ring-offset defaults to the page pole (lum-none): the offset is the gap the
// ring sits in, so matching the page reads as a detached ring — and it auto-flips
// white↔black for dark mode, unlike Tailwind's static white default.
const defL = { bg: '5', tx: '10', dc: '6', bd: '3', bdt: '3', bdr: '3', bdb: '3', bdl: '3', bdx: '3', bdy: '3', bds: '3', bde: '3', ac: '5', sh: '5', rg: '5', ro: 'none', st: '6', fl: '6', gf: '5', gt: '5' };
const defC = { bg: 'low', tx: 'low', dc: 'low', bd: 'low', bdt: 'low', bdr: 'low', bdb: 'low', bdl: 'low', bdx: 'low', bdy: 'low', bds: 'low', bde: 'low', ac: 'mid', sh: 'low', rg: 'low', ro: 'low', st: 'low', fl: 'low', gf: 'mid', gt: 'mid' };
for (const p of PROPS) {
  w(`  --${p.stem}-l: var(--lum-${defL[p.stem]});`);
  if (p.stem === 'bg') w(`  --bg-anchor-l: var(--bg-l);`);
  w(`  --${p.stem}-c: var(--chroma-${defC[p.stem]});`);
  w(`  --${p.stem}-cs: var(--cscale-primary);`);
  w(`  --${p.stem}-h: var(--hue-primary);`);
  if (p.stem !== 'gt') w('');
}
w(`}`);
w('');

// ── dark ────────────────────────────────────────────────────────────────
w(`/* ── Dark mode: the scale flips. none = black (page), max = white (contrast);
   the numbered stops map to their flipped luminances. --lum-flip drives
   arbitrary-value auto-flip. Comes after :root so these overrides win. */`);
w(`.dark {`);
w(`  --lum-dir: 1;`);
w(`  --lum-flip: 1;`);
w(`  --con-flip: ${CON_MID[1]};`);
w(`  --lum-none: ${L_NONE[1]};`);
for (let i = 1; i <= LUM_N; i++) w(`  --lum-${i}: ${L_DARK[i - 1]};`);
w(`  --lum-max: ${L_MAX[1]};`);
w(conLines(1, '  '));
w(`}`);
w('');

// ── light ───────────────────────────────────────────────────────────────
// The explicit inverse of .dark, so the scale flip NESTS both ways: a .light
// subtree of a dark page (or of a .dark region) flips back to the light scale.
// .dark/.light are absolute, not toggles — each just sets its scale — so they can
// alternate to any depth. Emitted after .dark so an element carrying both resolves
// to light. (:root is the implicit light default; this is the class form.)
w(`/* ── Light scale (explicit) — the inverse of .dark, for a light island inside a
   dark context. Absolute like .dark, so the two nest/alternate to any depth. */`);
w(`.light {`);
w(`  --lum-dir: -1;`);
w(`  --lum-flip: 0;`);
w(`  --con-flip: ${CON_MID[0]};`);
w(`  --lum-none: ${L_NONE[0]};`);
for (let i = 1; i <= LUM_N; i++) w(`  --lum-${i}: ${L_LIGHT[i - 1]};`);
w(`  --lum-max: ${L_MAX[0]};`);
w(conLines(0, '  '));
w(`}`);
w('');

// ── lum-flip (context-relative) ───────────────────────────────────────────
// .lum-flip becomes the OPPOSITE of its surroundings — invert a subtree without
// knowing whether you're light or dark, and nested .lum-flips alternate. A class
// can't read its own inherited polarity and negate it (that's a cycle — see
// cascade.md), so this queries the ANCESTOR's polarity (--lum-flip, already 0/1)
// via a style container query and sets its own scale to the opposite. Different
// scopes → no cycle. Requires style-query support (Chrome 111+, Safari 18+,
// Firefox 128+); where unsupported it's a no-op (subtree keeps its scale), so
// .dark/.light remain the universally-supported absolute tools.
const scaleBlock = (flip, pad) => {
  const L = flip ? L_DARK : L_LIGHT;
  const lines = [
    `${pad}--lum-dir: ${flip ? 1 : -1};`,
    `${pad}--lum-flip: ${flip};`,
    `${pad}--con-flip: ${CON_MID[flip]};`,
    `${pad}--lum-none: ${L_NONE[flip]};`,
  ];
  for (let i = 1; i <= LUM_N; i++) lines.push(`${pad}--lum-${i}: ${L[i - 1]};`);
  lines.push(`${pad}--lum-max: ${L_MAX[flip]};`);
  lines.push(conLines(flip, pad));
  return lines.join('\n');
};
w(`/* ── Flip (context-relative) — .lum-flip inverts whatever scale it sits in, and
   nested .lum-flips alternate. Reads the ancestor's polarity (--lum-flip) via a
   style query and applies the opposite scale, so there's no self-reference
   cycle. Progressive: no-op where style queries are unsupported. */`);
w(`@container style(--lum-flip: 0) {`);
w(`  .lum-flip {`);
w(scaleBlock(1, '    '));
w(`  }`);
w(`}`);
w(`@container style(--lum-flip: 1) {`);
w(`  .lum-flip {`);
w(scaleBlock(0, '    '));
w(`  }`);
w(`}`);
w('');

// ── @property: contrast defaults ──────────────────────────────────────────
// The per-property default ΔL that the bare *-con leaves read and the contrast-*
// moods write. Registered so they're typed, inheriting (a mood cascades to a
// subtree), and always resolve to a real number — the 'mid' profile — even before
// any contrast-* is set, so a bare text-con paints out of the box.
w(`/* ── Contrast defaults (@property) — the default ΔL each bare *-con leaf reads;
   contrast-* moods write these. Registered so they inherit and always resolve to
   a real number (the 'mid' profile) even with no contrast-* mood set. ───────── */`);
for (const k of CON_DEF) {
  w(`@property --${k}-con { syntax: "<number>"; inherits: true; initial-value: ${conVal(CON_DEF_INIT[k])}; }`);
}
w('');

// ── property-less axis classes ──────────────────────────────────────────────
w(`/* ── Global (property-less) hue — sets hue (and its chroma scale) for every
   property that cascades below, painting nothing. Per-property hue utilities
   still override. ──────────────────────────────────────────────────────────── */`);
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
w(`/* ── Global (property-less) chroma — sets chroma for every property that
   cascades below, painting nothing. Per-property chroma utilities still
   override. ────────────────────────────────────────────────────────────────── */`);
w(`@utility chroma-* {`);
for (const p of PROPS) w(`  --${p.stem}-c: --value(--chroma-*);`);
w(`}`);
w(`@utility chroma-* {`);
w(`  /* arbitrary chroma-[8]: chroma = n / 100 */`);
for (const p of PROPS) w(`  --${p.stem}-c: calc(--value([integer]) / 100);`);
w(`}`);
w('');
w(`/* ── Global (property-less) contrast — a named profile that sets the default
   ΔL for every bare *-con leaf below, each property to its own step (text a
   little, borders a lot). Paints nothing; a bare *-con (or valued *-con-*) does
   the painting. The third mood axis, alongside hue-* and chroma-*. ─────────── */`);
for (const [name, map] of CONTRAST) {
  w(`@utility contrast-${name} {`);
  for (const k of CON_DEF) w(`  --${k}-con: var(--con-${map[k]});`);
  w(`}`);
}
w('');

// ── per-property setters ───────────────────────────────────────────────────
const titleOf = {
  bg: 'Background', tx: 'Text', dc: 'Text Decoration',
  bd: 'Border', bdt: 'Border Top', bdr: 'Border Right', bdb: 'Border Bottom', bdl: 'Border Left',
  bdx: 'Border Inline (x)', bdy: 'Border Block (y)', bds: 'Border Inline Start', bde: 'Border Inline End',
  ac: 'Accent Color', sh: 'Shadow Color', rg: 'Ring Color', ro: 'Ring Offset Color',
  st: 'Stroke', fl: 'Fill',
  gf: 'Gradient From', gt: 'Gradient To',
};
for (const p of PROPS) {
  const s = p.stem;
  w(`/* ── ${titleOf[s]} ─────────────────────────────────────────────────── */`);
  // luminance (named + arbitrary). Absolute bg setters also reset --bg-anchor-l:
  // this is the reference point that bg-lum-up/down nudges measure from.
  w(`@utility ${p.pre}-lum-* {`);
  w(`  --${s}-l: --value(--lum-*);`);
  if (s === 'bg') w(`  --bg-anchor-l: var(--bg-l);`);
  w(applyColor(p, `var(--${s}-l)`));
  w(`}`);
  w(`@utility ${p.pre}-lum-* {`);
  w(`  /* arbitrary ${p.pre}-lum-[60]: auto-flip L = v + flip × (1 − 2v) */`);
  w(`  --${s}-lv: calc(--value([integer]) / 100);`);
  w(`  --${s}-l: calc(var(--${s}-lv) + var(--lum-flip) * (1 - 2 * var(--${s}-lv)));`);
  if (s === 'bg') w(`  --bg-anchor-l: var(--bg-l);`);
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
  // relative adjustments (bg + text only, matching prior scope). Non-compounding:
  // a nudge measures from the nearest absolute lum-N, never from a parent's
  // already-nudged value. bg reads a separate --bg-anchor-l (the nearest
  // absolute) and writes the nudged value into --bg-l, so --bg-l always holds the
  // real surface that con-* reads. text paints inline (nothing downstream reads
  // --tx-l). A property can't derive from its own inherited value (that's a CSS
  // cycle → invalid), which is exactly why the anchor exists and why nudges can't
  // compound.
  if (s === 'bg' || s === 'tx') {
    const base = s === 'bg' ? 'var(--bg-anchor-l)' : `var(--${s}-l)`;
    // Track the stop spacing so a nudge ≈ one local stop (bg-lum-up-1 ≈ bg-lum-2):
    // stop gaps are widest through low/mid L and tighten toward white, so scale the
    // step by a factor of the surface's own L — full through the low/mid plateau,
    // dropping to ~0.4 near white. See the ramp's LUM_CRUNCH.
    const factor = `clamp(0.4, calc(1.35 - (${base} - 0.6) * 3), 1.35)`;
    const step = `calc(var(--${s}-l-adj) * ${factor})`;
    const up = `clamp(0, calc(${base} + var(--lum-dir) * ${step}), 1)`;
    const dn = `clamp(0, calc(${base} - var(--lum-dir) * ${step}), 1)`;
    w(`@utility ${p.pre}-lum-up-* {`);
    w(`  --${s}-l-adj: --value(--lum-adj-*);`);
    if (s === 'bg') { w(`  --bg-l: ${up};`); w(applyColor(p, 'var(--bg-l)')); }
    else            { w(applyColor(p, up)); }
    w(`}`);
    w(`@utility ${p.pre}-lum-down-* {`);
    w(`  --${s}-l-adj: --value(--lum-adj-*);`);
    if (s === 'bg') { w(`  --bg-l: ${dn};`); w(applyColor(p, 'var(--bg-l)')); }
    else            { w(applyColor(p, dn)); }
    w(`}`);
  }
  w('');
}

// ── contrast (con-*) utilities ─────────────────────────────────────────────
// Background-relative and auto-directional: luminance is chosen to contrast
// with the element's own inherited background (--bg-l), moving toward whichever
// pole (lighter/darker) gives contrast. One class works on a light OR dark
// surface. Chroma/hue are inherited (text-con reads --tx-*, border/outline read
// --bd-*, ring reads --rg-*); only luminance is computed. A contrast-aware ring
// is ideal for focus states. Like lum-up/down it's a leaf utility —
// it paints without rewriting the cascading axis vars.
//
// Each family gets THREE forms:
//   - valued   text-con-mid / text-con-2  → ΔL from the named or numbered scale
//   - arbitrary text-con-[40]             → ΔL = n / 100
//   - bare     text-con                   → ΔL from the inherited contrast-* mood
// `key` names a PER-PROPERTY scratch offset (--tx-coff, --bd-coff, …) so stacking
// text-con + border-con on one element (e.g. `* { @apply text-con border-con }`)
// doesn't cross-wire — a single shared --con-off would make both read one value.
// `def` is the inherited mood default the bare form reads (set by contrast-*).
const CON_PROPS = [
  { pre: 'text',       stem: 'tx', key: 'tx', apply: (c) => `  color: ${c};` },
  { pre: 'border',     stem: 'bd', key: 'bd', apply: (c) => `  border-color: ${c};` },
  { pre: 'outline',    stem: 'bd', key: 'ol', apply: (c) => `  outline-color: ${c};` },
  { pre: 'ring',       stem: 'rg', key: 'rg', apply: (c) => `  --tw-ring-color: ${c};` },
  { pre: 'decoration', stem: 'dc', key: 'dc', apply: (c) => `  text-decoration-color: ${c};` },
  { pre: 'stroke',     stem: 'st', key: 'st', apply: (c) => `  stroke: ${c};` },
  { pre: 'fill',       stem: 'fl', key: 'fl', apply: (c) => `  fill: ${c};` },
];
// direction: +1 when the background is dark (go lighter), −1 when light (go
// darker); the ×1000 makes the clamp snap hard at the 0.6 luminance midpoint.
// --con-dir is shared (identical for every property on an element — it depends
// only on --bg-l), but the offset is per-property (--KEY-coff).
const CON_DIR = `clamp(-1, calc((var(--con-flip) - var(--bg-l)) * 1000), 1)`;
const conL = (key) => `clamp(0, calc(var(--bg-l) + var(--con-dir) * var(--${key}-coff)), 1)`;

w(`/* ── Contrast (con-*) — luminance chosen to contrast with the element's own
   background (--bg-l), auto-directional so one class works on light OR dark
   surfaces. Inherits chroma/hue; only luminance is computed. A leaf utility:
   like lum-up/down it paints without rewriting the cascading vars. The bare
   form (text-con) reads the inherited contrast-* mood default. ────────────── */`);
for (const p of CON_PROPS) {
  const L = conL(p.key);
  // valued: named (--con-mid) and numbered (--con-2) resolve through one utility
  w(`@utility ${p.pre}-con-* {`);
  w(`  --${p.key}-coff: --value(--con-*);`);
  w(`  --con-dir: ${CON_DIR};`);
  w(p.apply(col(p.stem, L)));
  w(`}`);
  w(`@utility ${p.pre}-con-* {`);
  w(`  /* arbitrary ${p.pre}-con-[40]: ΔL = n / 100 off the background */`);
  w(`  --${p.key}-coff: calc(--value([integer]) / 100);`);
  w(`  --con-dir: ${CON_DIR};`);
  w(p.apply(col(p.stem, L)));
  w(`}`);
  // bare: a no-op paint at the inherited contrast-* default ΔL (--KEY-con)
  w(`@utility ${p.pre}-con {`);
  w(`  --${p.key}-coff: var(--${p.key}-con);`);
  w(`  --con-dir: ${CON_DIR};`);
  w(p.apply(col(p.stem, L)));
  w(`}`);
  w('');
}

require('fs').writeFileSync(process.argv[2] || 'index.css', out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
console.log('wrote', process.argv[2]);
