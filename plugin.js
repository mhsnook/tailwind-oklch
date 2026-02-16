/**
 * tailwind-oklch shorthand generator
 *
 * Generates .{prop}-{L}-{C}-{H} utilities for all combinations of
 * the 0–10 luminance scale × chroma × hue stops across bg/text/border.
 *
 * Each shorthand sets the three axis variables AND applies the
 * resolved color, so children can inherit and override single axes
 * via decomposed utilities (e.g. hover:bg-lc-8).
 *
 * Load via: @plugin "tailwind-oklch/plugin";
 */

module.exports = function ({ addUtilities }) {
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
    for (const l of luminances) {
      for (const c of chromas) {
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
};
