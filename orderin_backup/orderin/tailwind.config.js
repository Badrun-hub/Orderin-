/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-container-low": "var(--theme-surface-container-low, #121c2a)",
        "tertiary-fixed-dim": "#ffb95f",
        "primary-fixed": "#6ffbbe",
        "on-primary": "var(--theme-on-primary, #003824)",
        "on-secondary": "#003825",
        "on-secondary-container": "#00311f",
        "surface-container-highest": "var(--theme-surface-container-highest, #2b3544)",
        "surface-tint": "#4edea3",
        "outline-variant": "var(--theme-outline-variant, #3c4a42)",
        "on-surface": "var(--theme-on-surface, #d9e3f6)",
        "surface-variant": "var(--theme-surface-variant, #2b3544)",
        "secondary-fixed-dim": "#68dba9",
        "primary-fixed-dim": "#4edea3",
        "surface-bright": "#303a48",
        "inverse-surface": "#d9e3f6",
        "outline": "var(--theme-outline, #86948a)",
        "secondary-container": "#25a475",
        "inverse-on-surface": "#27313f",
        "primary": "var(--theme-primary, #4edea3)",
        "tertiary-fixed": "#ffddb8",
        "on-tertiary-container": "#523200",
        "tertiary-container": "#e29100",
        "surface-container": "var(--theme-surface-container, #16202e)",
        "surface": "var(--theme-surface, #091421)",
        "inverse-primary": "#006c49",
        "on-primary-fixed-variant": "#005236",
        "primary-container": "var(--theme-primary-container, #10b981)",
        "on-primary-container": "var(--theme-on-primary-container, #00422b)",
        "on-tertiary": "#472a00",
        "on-tertiary-fixed-variant": "#653e00",
        "secondary": "var(--theme-secondary, #68dba9)",
        "tertiary": "#ffb95f",
        "error": "#ffb4ab",
        "error-container": "#93000a",
        "surface-container-lowest": "var(--theme-surface-container-lowest, #050f1c)",
        "on-error-container": "#ffdad6",
        "on-tertiary-fixed": "#2a1700",
        "background": "var(--theme-background, #091421)",
        "secondary-fixed": "#85f8c4",
        "surface-container-high": "var(--theme-surface-container-high, #212b39)",
        "on-secondary-fixed-variant": "#005137",
        "on-surface-variant": "var(--theme-on-surface-variant, #bbcabf)",
        "on-error": "#690005",
        "surface-dim": "var(--theme-surface, #091421)",
        "on-background": "var(--theme-on-background, #d9e3f6)",
        "on-primary-fixed": "#002113",
        "on-secondary-fixed": "#002114"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
