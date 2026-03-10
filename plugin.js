/**
 * tailwind-oklch plugin — arbitrary values for hue, chroma, and luminance
 *
 * The core named-stop API lives in index.css (@utility directives):
 *   hue-{name}     — cascading hue (set once on container)
 *   bg-lum-{N}     — luminance: 1–12 (bezier-distributed)
 *   bg-c-{stop}    — chroma: lo, mlo, mid, mhi, hi
 *   chroma-{stop}  — global chroma override
 *
 * This plugin adds arbitrary bracket values for all three axes:
 *   hue-[180]      — exact hue in degrees
 *   chroma-[8]     — exact chroma (N/100 → 0.08)
 *   bg-lum-[80]    — exact luminance, auto-flips in dark mode
 *
 * Load via: @plugin "tailwind-oklch/plugin";
 */

module.exports = function ({ matchUtilities }) {
  const properties = [
    { prefix: 'bg',       css: 'background-color',    vars: ['--bg-l',  '--bg-c',  '--bg-h']  },
    { prefix: 'text',     css: 'color',               vars: ['--tx-l',  '--tx-c',  '--tx-h']  },
    { prefix: 'border',   css: 'border-color',        vars: ['--bd-l',  '--bd-c',  '--bd-h']  },
    { prefix: 'accent',   css: 'accent-color',        vars: ['--ac-l',  '--ac-c',  '--ac-h']  },
    { prefix: 'border-b', css: 'border-bottom-color',  vars: ['--bdb-l', '--bdb-c', '--bdb-h'] },
  ];

  const stopsExpr = 'var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))';

  // ── Arbitrary hue ─────────────────────────────────────────────────────
  const hueVars = ['--bg-h', '--tx-h', '--bd-h', '--bdb-h', '--ac-h', '--gf-h', '--gt-h', '--sh-h'];

  matchUtilities(
    { hue: (value) => Object.fromEntries(hueVars.map((v) => [v, value])) },
    { type: ['integer'] },
  );

  for (const prop of properties) {
    matchUtilities(
      {
        [`${prop.prefix}-h`]: (value) => ({
          [prop.vars[2]]: value,
          [prop.css]: `oklch(var(${prop.vars[0]}) var(${prop.vars[1]}) var(${prop.vars[2]}))`,
        }),
      },
      { type: ['integer'] },
    );
  }

  matchUtilities(
    {
      'from-h': (value) => ({
        '--gf-h': value,
        '--tw-gradient-from': 'oklch(var(--gf-l) var(--gf-c) var(--gf-h))',
        '--tw-gradient-stops': stopsExpr,
      }),
      'to-h': (value) => ({
        '--gt-h': value,
        '--tw-gradient-to': 'oklch(var(--gt-l) var(--gt-c) var(--gt-h))',
        '--tw-gradient-stops': stopsExpr,
      }),
      'shadow-h': (value) => ({
        '--sh-h': value,
        '--tw-shadow-color': 'oklch(var(--sh-l) var(--sh-c) var(--sh-h))',
      }),
    },
    { type: ['integer'] },
  );

  // ── Arbitrary chroma ──────────────────────────────────────────────────
  const chromaVars = ['--bg-c', '--tx-c', '--bd-c', '--bdb-c', '--ac-c', '--gf-c', '--gt-c', '--sh-c'];

  const chromaValue = (value) => {
    const v = Number(value) / 100;
    return `${Math.round(v * 1e6) / 1e6}`;
  };

  matchUtilities(
    {
      chroma: (value) => {
        const c = chromaValue(value);
        return Object.fromEntries(chromaVars.map((v) => [v, c]));
      },
    },
    { type: ['integer'] },
  );

  for (const prop of properties) {
    matchUtilities(
      {
        [`${prop.prefix}-c`]: (value) => ({
          [prop.vars[1]]: chromaValue(value),
          [prop.css]: `oklch(var(${prop.vars[0]}) var(${prop.vars[1]}) var(${prop.vars[2]}))`,
        }),
      },
      { type: ['integer'] },
    );
  }

  matchUtilities(
    {
      'from-c': (value) => ({
        '--gf-c': chromaValue(value),
        '--tw-gradient-from': 'oklch(var(--gf-l) var(--gf-c) var(--gf-h))',
        '--tw-gradient-stops': stopsExpr,
      }),
      'to-c': (value) => ({
        '--gt-c': chromaValue(value),
        '--tw-gradient-to': 'oklch(var(--gt-l) var(--gt-c) var(--gt-h))',
        '--tw-gradient-stops': stopsExpr,
      }),
      'shadow-c': (value) => ({
        '--sh-c': chromaValue(value),
        '--tw-shadow-color': 'oklch(var(--sh-l) var(--sh-c) var(--sh-h))',
      }),
    },
    { type: ['integer'] },
  );

  // ── Arbitrary luminance (auto-flip) ───────────────────────────────────
  // bg-lum-[60] → L=0.60 light, L=0.40 dark. Pure CSS via --lum-flip.
  // Formula: L = v + flip × (1 − 2v)

  const lumFlipValue = (value) => {
    const v = Number(value) / 100;
    const delta = 1 - 2 * v;
    const vR = Math.round(v * 1e6) / 1e6;
    const dR = Math.round(delta * 1e6) / 1e6;
    return `calc(${vR} + var(--lum-flip) * ${dR})`;
  };

  for (const prop of properties) {
    matchUtilities(
      {
        [`${prop.prefix}-lum`]: (value) => ({
          [prop.vars[0]]: lumFlipValue(value),
          [prop.css]: `oklch(var(${prop.vars[0]}) var(${prop.vars[1]}) var(${prop.vars[2]}))`,
        }),
      },
      { type: ['integer'] },
    );
  }

  matchUtilities(
    {
      'from-lum': (value) => ({
        '--gf-l': lumFlipValue(value),
        '--tw-gradient-from': 'oklch(var(--gf-l) var(--gf-c) var(--gf-h))',
        '--tw-gradient-stops': stopsExpr,
      }),
      'to-lum': (value) => ({
        '--gt-l': lumFlipValue(value),
        '--tw-gradient-to': 'oklch(var(--gt-l) var(--gt-c) var(--gt-h))',
        '--tw-gradient-stops': stopsExpr,
      }),
      'shadow-lum': (value) => ({
        '--sh-l': lumFlipValue(value),
        '--tw-shadow-color': 'oklch(var(--sh-l) var(--sh-c) var(--sh-h))',
      }),
    },
    { type: ['integer'] },
  );
};
