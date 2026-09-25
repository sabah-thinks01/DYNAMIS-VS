import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        page: "var(--bg-page)",
        surface: "var(--bg-surface)",
        "surface-subtle": "var(--bg-surface-subtle)",
        "surface-hover": "var(--bg-surface-hover)",
        "border-default": "var(--border-default)",
        "border-strong": "var(--border-strong)",
        main: "var(--text-main)",
        muted: "var(--text-muted)",
        inverse: "var(--text-inverse)",
        accent: "var(--accent)",
        "accent-strong": "var(--accent-strong)",
        "accent-subtle": "var(--accent-subtle)",
        "status-good": "var(--status-good)",
        "status-good-bg": "var(--status-good-bg)",
        "status-good-border": "var(--status-good-border)",
        "status-warning": "var(--status-warning)",
        "status-warning-bg": "var(--status-warning-bg)",
        "status-warning-border": "var(--status-warning-border)",
        "status-error": "var(--status-error)",
        "status-error-bg": "var(--status-error-bg)",
        "status-error-border": "var(--status-error-border)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        hover: "var(--shadow-hover)",
      }
    },
  },
  plugins: [],
};
export default config;
