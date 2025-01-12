const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./**/*.html", "./**/*.md", "./config.toml"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#FFFFFF',
            '--tw-prose-headings': '#FFFFFF',
            '--tw-prose-lead': '#FFFFFF',
            '--tw-prose-links': '#FFFFFF',
            '--tw-prose-bold': '#FFFFFF',
            '--tw-prose-counters': '#FFFFFF',
            '--tw-prose-bullets': '#FFFFFF',
            '--tw-prose-hr': '#FFFFFF',
            '--tw-prose-quotes': '#FFFFFF',
            '--tw-prose-quote-borders': '#FFFFFF',
            '--tw-prose-captions': '#FFFFFF',
            '--tw-prose-kbd': '#FFFFFF',
            '--tw-prose-kbd-shadows': '255 255 255',
            '--tw-prose-code': '#FFFFFF',
            '--tw-prose-pre-code': '#FFFFFF',
            '--tw-prose-pre-bg': '#000000',
            '--tw-prose-th-borders': '#FFFFFF',
            '--tw-prose-td-borders': '#FFFFFF',
            '--tw-prose-invert-body': '#FFFFFF',
            '--tw-prose-invert-headings': '#FFFFFF',
            '--tw-prose-invert-lead': '#FFFFFF',
            '--tw-prose-invert-links': '#FFFFFF',
            '--tw-prose-invert-bold': '#FFFFFF',
            '--tw-prose-invert-counters': '#FFFFFF',
            '--tw-prose-invert-bullets': '#FFFFFF',
            '--tw-prose-invert-hr': '#FFFFFF',
            '--tw-prose-invert-quotes': '#FFFFFF',
            '--tw-prose-invert-quote-borders': '#FFFFFF',
            '--tw-prose-invert-captions': '#FFFFFF',
            '--tw-prose-invert-kbd': '#FFFFFF',
            '--tw-prose-invert-kbd-shadows': '255 255 255',
            '--tw-prose-invert-code': '#FFFFFF',
            '--tw-prose-invert-pre-code': '#FFFFFF',
            '--tw-prose-invert-pre-bg': '#000000',
            '--tw-prose-invert-th-borders': '#FFFFFF',
            '--tw-prose-invert-td-borders': '#FFFFFF',
          }
        }
      },
      colors: {
        ...defaultTheme.colors,
        tlgray: {
          200: "#E5E7EB",
          400: "#9CA3AF",
          700: "#374151",
          800: "#1F2937"
        }
      }
    }
  },
  variants: {},
  plugins: [require("@tailwindcss/typography")],
};
