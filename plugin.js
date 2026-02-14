/**
 * tailwind-oklch shorthand generator
 *
 * Generates .{prop}-{L}-{C}-{H} utilities for all combinations of
 * named luminance × chroma × hue stops across bg/text/border.
 *
 * Load via: @plugin "tailwind-oklch/plugin";
 */

module.exports = function ({ addUtilities }) {
  const luminances = ['lo', 'mlo', 'mid', 'mhi', 'hi'];
  const chromas = ['lo', 'mlo', 'mid', 'mhi', 'hi'];
  const hues = ['primary', 'accent', 'success', 'warning', 'danger', 'info', 'neutral'];
  const properties = [
    { prefix: 'bg', css: 'background-color' },
    { prefix: 'text', css: 'color' },
    { prefix: 'border', css: 'border-color' },
    { prefix: 'accent', css: 'accent-color' },
    { prefix: 'border-b', css: 'border-bottom-color' },
  ];

  const utilities = {};

  for (const prop of properties) {
    for (const l of luminances) {
      for (const c of chromas) {
        for (const h of hues) {
          utilities[`.${prop.prefix}-${l}-${c}-${h}`] = {
            [prop.css]: `oklch(var(--l-${l}) var(--c-${c}) var(--hue-${h}))`,
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
        const color = `oklch(var(--l-${l}) var(--c-${c}) var(--hue-${h}))`;
        utilities[`.from-${l}-${c}-${h}`] = {
          '--tw-gradient-from': color,
          '--tw-gradient-stops': stopsExpr,
        };
        utilities[`.to-${l}-${c}-${h}`] = {
          '--tw-gradient-to': color,
          '--tw-gradient-stops': stopsExpr,
        };
      }
    }
  }

  addUtilities(utilities);
};
