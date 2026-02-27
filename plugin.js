/**
 * tailwind-oklch shorthand generator
 *
 * Generates two kinds of shorthand utilities:
 *
 * Three-axis: .{prop}-{L}-{C}-{H}  — sets all three axes explicitly
 *   e.g. bg-3-mhi-accent
 *
 * Two-axis:   .{prop}-{L}-{C}      — sets L and C, inherits H from
 *   the cascade (set by hue-* or :root default)
 *   e.g. bg-3-mhi (pair with hue-accent on a parent)
 *
 * Each shorthand sets the axis variables AND applies the resolved
 * color, so children can inherit and override single axes via
 * decomposed utilities (e.g. hover:bg-lc-8).
 *
 * Load via: @plugin "tailwind-oklch/plugin";
 */

module.exports = function ({ addUtilities, matchUtilities }) {
  const luminances = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'base', 'fore', 'none', 'full'];
  const chromas = ['lo', 'mlo', 'mid', 'mhi', 'hi'];
  const hues = ['primary', 'accent', 'success', 'warning', 'danger', 'info', 'neutral'];

  // Map each prefix to its CSS property and internal variable names
  const properties = [
    { prefix: 'bg',       css: 'background-color',   vars: ['--bg-l',  '--bg-c',  '--bg-h']  },
    { prefix: 'text',     css: 'color',              vars: ['--tx-l',  '--tx-c',  '--tx-h']  },
    { prefix: 'border',   css: 'border-color',       vars: ['--bd-l',  '--bd-c',  '--bd-h']  },
    { prefix: 'accent',   css: 'accent-color',       vars: ['--ac-l',  '--ac-c',  '--ac-h']  },
    { prefix: 'border-b', css: 'border-bottom-color', vars: ['--bdb-l', '--bdb-c', '--bdb-h'] },
  ];

  const utilities = {};

  for (const prop of properties) {
    // Two-axis shorthands: .{prop}-{L}-{C} — inherits H from cascade
    for (const l of luminances) {
      for (const c of chromas) {
        utilities[`.${prop.prefix}-${l}-${c}`] = {
          [prop.vars[0]]: `var(--l-${l})`,
          [prop.vars[1]]: `var(--c-${c})`,
          [prop.css]: `oklch(var(${prop.vars[0]}) var(${prop.vars[1]}) var(${prop.vars[2]}))`,
        };

        // Three-axis shorthands: .{prop}-{L}-{C}-{H}
        for (const h of hues) {
          utilities[`.${prop.prefix}-${l}-${c}-${h}`] = {
            [prop.vars[0]]: `var(--l-${l})`,
            [prop.vars[1]]: `var(--c-${c})`,
            [prop.vars[2]]: `var(--hue-${h})`,
            [prop.css]: `oklch(var(${prop.vars[0]}) var(${prop.vars[1]}) var(${prop.vars[2]}))`,
          };
        }
      }
    }
  }

  // Gradient from/to shorthands — must compose --tw-gradient-stops
  // to match Tailwind v4's internal gradient plumbing
  const stopsExpr = 'var(--tw-gradient-via-stops, var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position))';

  for (const l of luminances) {
    for (const c of chromas) {
      // Two-axis gradient shorthands — inherit H from cascade
      utilities[`.from-${l}-${c}`] = {
        '--gf-l': `var(--l-${l})`,
        '--gf-c': `var(--c-${c})`,
        '--tw-gradient-from': `oklch(var(--gf-l) var(--gf-c) var(--gf-h))`,
        '--tw-gradient-stops': stopsExpr,
      };
      utilities[`.to-${l}-${c}`] = {
        '--gt-l': `var(--l-${l})`,
        '--gt-c': `var(--c-${c})`,
        '--tw-gradient-to': `oklch(var(--gt-l) var(--gt-c) var(--gt-h))`,
        '--tw-gradient-stops': stopsExpr,
      };

      // Three-axis gradient shorthands
      for (const h of hues) {
        utilities[`.from-${l}-${c}-${h}`] = {
          '--gf-l': `var(--l-${l})`,
          '--gf-c': `var(--c-${c})`,
          '--gf-h': `var(--hue-${h})`,
          '--tw-gradient-from': `oklch(var(--gf-l) var(--gf-c) var(--gf-h))`,
          '--tw-gradient-stops': stopsExpr,
        };
        utilities[`.to-${l}-${c}-${h}`] = {
          '--gt-l': `var(--l-${l})`,
          '--gt-c': `var(--c-${c})`,
          '--gt-h': `var(--hue-${h})`,
          '--tw-gradient-to': `oklch(var(--gt-l) var(--gt-c) var(--gt-h))`,
          '--tw-gradient-stops': stopsExpr,
        };
      }
    }
  }

  addUtilities(utilities);

  // ── Arbitrary hue values ────────────────────────────────────────────────
  // hue-[180] → sets all hue properties to 180 (degrees).
  // bg-h-[280] → sets only background hue to 280.

  const hueVars = ['--bg-h', '--tx-h', '--bd-h', '--bdb-h', '--ac-h', '--gf-h', '--gt-h', '--sh-h'];

  matchUtilities(
    {
      hue: (value) => Object.fromEntries(hueVars.map((v) => [v, value])),
    },
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

  // Gradient from/to arbitrary hue
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
    },
    { type: ['integer'] },
  );

  // Shadow arbitrary hue
  matchUtilities(
    {
      'shadow-h': (value) => ({
        '--sh-h': value,
        '--tw-shadow-color': 'oklch(var(--sh-l) var(--sh-c) var(--sh-h))',
      }),
    },
    { type: ['integer'] },
  );

  // ── Arbitrary chroma values ───────────────────────────────────────────
  // chroma-[0.15] → sets all chroma properties to 0.15.
  // bg-c-[0.2] → sets only background chroma to 0.2.

  const chromaVars = ['--bg-c', '--tx-c', '--bd-c', '--bdb-c', '--ac-c', '--gf-c', '--gt-c', '--sh-c'];

  matchUtilities(
    {
      chroma: (value) => Object.fromEntries(chromaVars.map((v) => [v, value])),
    },
    { type: ['number'] },
  );

  for (const prop of properties) {
    matchUtilities(
      {
        [`${prop.prefix}-c`]: (value) => ({
          [prop.vars[1]]: value,
          [prop.css]: `oklch(var(${prop.vars[0]}) var(${prop.vars[1]}) var(${prop.vars[2]}))`,
        }),
      },
      { type: ['number'] },
    );
  }

  // Gradient from/to arbitrary chroma
  matchUtilities(
    {
      'from-c': (value) => ({
        '--gf-c': value,
        '--tw-gradient-from': 'oklch(var(--gf-l) var(--gf-c) var(--gf-h))',
        '--tw-gradient-stops': stopsExpr,
      }),
      'to-c': (value) => ({
        '--gt-c': value,
        '--tw-gradient-to': 'oklch(var(--gt-l) var(--gt-c) var(--gt-h))',
        '--tw-gradient-stops': stopsExpr,
      }),
    },
    { type: ['number'] },
  );

  // Shadow arbitrary chroma
  matchUtilities(
    {
      'shadow-c': (value) => ({
        '--sh-c': value,
        '--tw-shadow-color': 'oklch(var(--sh-l) var(--sh-c) var(--sh-h))',
      }),
    },
    { type: ['number'] },
  );

  // ── Auto-flip luminance for arbitrary values ──────────────────────────
  // bg-lc-[60] → light mode L=0.60, dark mode L=0.40 (simple 1−x flip).
  // Uses --lc-flip (0 in light, 1 in dark) so the transform is pure CSS.
  // Formula: L = v + flip × (1 − 2v)  where v = input / 100
  //   flip=0 → v   (light: use value as-is)
  //   flip=1 → 1−v (dark: reflect around 0.5)

  const lcFlipValue = (value) => {
    const v = Number(value) / 100;
    const delta = 1 - 2 * v;
    // Round to avoid floating-point noise in the CSS output
    const vR = Math.round(v * 1e6) / 1e6;
    const dR = Math.round(delta * 1e6) / 1e6;
    return `calc(${vR} + var(--lc-flip) * ${dR})`;
  };

  for (const prop of properties) {
    matchUtilities(
      {
        [`${prop.prefix}-lc`]: (value) => ({
          [prop.vars[0]]: lcFlipValue(value),
          [prop.css]: `oklch(var(${prop.vars[0]}) var(${prop.vars[1]}) var(${prop.vars[2]}))`,
        }),
      },
      { type: ['integer'] },
    );
  }

  // Gradient from/to auto-flip luminance
  matchUtilities(
    {
      'from-lc': (value) => ({
        '--gf-l': lcFlipValue(value),
        '--tw-gradient-from': 'oklch(var(--gf-l) var(--gf-c) var(--gf-h))',
        '--tw-gradient-stops': stopsExpr,
      }),
      'to-lc': (value) => ({
        '--gt-l': lcFlipValue(value),
        '--tw-gradient-to': 'oklch(var(--gt-l) var(--gt-c) var(--gt-h))',
        '--tw-gradient-stops': stopsExpr,
      }),
    },
    { type: ['integer'] },
  );

  // Shadow auto-flip luminance
  matchUtilities(
    {
      'shadow-lc': (value) => ({
        '--sh-l': lcFlipValue(value),
        '--tw-shadow-color': 'oklch(var(--sh-l) var(--sh-c) var(--sh-h))',
      }),
    },
    { type: ['integer'] },
  );
};
