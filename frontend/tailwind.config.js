/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#F8F7F4",
          secondary: "#FCFBF9",
          card: "#FFFFFF",
          subtle: "#F1EFEA",
          muted: "#EAE7E0",
        },
        text: {
          primary: "#1A1917",
          secondary: "#5E5B54",
          muted: "#88847C",
        },
        border: {
          subtle: "rgba(26, 25, 23, 0.09)",
          medium: "rgba(26, 25, 23, 0.18)",
          strong: "rgba(26, 25, 23, 0.32)",
        },
        accent: {
          DEFAULT: "#4338CA",
          hover: "#3730A3",
          light: "#EEF2FF",
        },
        surface: {
          lavender: "#F5F3FF",
          mist: "#F0F7FF",
          apricot: "#FFFBEB",
          sage: "#F0FDF4",
        },
        status: {
          verified: "#15803D",
          verifiedBg: "#F0FDF4",
          verifiedBorder: "rgba(21, 128, 61, 0.2)",
          review: "#B45309",
          reviewBg: "#FFFBEB",
          reviewBorder: "rgba(180, 83, 9, 0.22)",
          blocked: "#B91C1C",
          blockedBg: "#FEF2F2",
          blockedBorder: "rgba(185, 28, 28, 0.22)",
        },
      },
      fontFamily: {
        serif: ["DM Serif Display", "Instrument Serif", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(26,25,23,0.04)",
        card: "0 2px 8px rgba(26,25,23,0.04), 0 1px 2px rgba(26,25,23,0.02)",
        modal: "0 20px 48px -12px rgba(26,25,23,0.12), 0 1px 2px rgba(26,25,23,0.04)",
      },
      borderRadius: {
        'sm': "0.25rem",
        'DEFAULT': "0.375rem",
        'md': "0.5rem",
        'lg': "0.625rem",
        'xl': "0.75rem",
        '2xl': "1rem",
        '3xl': "1.25rem",
      }
    },
  },
  plugins: [],
}
