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

  addUtilities(utilities);
};
