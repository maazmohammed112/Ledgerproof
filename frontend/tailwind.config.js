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
          primary: "#F7F9F8", // Soft calming off-white with hint of sage/mint
          secondary: "#FAFCFB",
          card: "#FFFFFF",
          subtle: "#F0F4F2",
          muted: "#E5EBE8",
          dark: "#0E332E", // Deep forest green/charcoal for active elements and dark pills
          darkHover: "#092420",
        },
        text: {
          primary: "#0E332E", // Editorial deep dark forest green/charcoal
          secondary: "#3D5954", // Calm balanced readable secondary text
          muted: "#6B8580",
          inverted: "#FFFFFF",
        },
        border: {
          subtle: "rgba(14, 51, 46, 0.08)",
          medium: "rgba(14, 51, 46, 0.16)",
          strong: "rgba(14, 51, 46, 0.28)",
        },
        accent: {
          DEFAULT: "#0E332E", // Deep forest green brand mark
          hover: "#08221E",
          light: "#DDF7EE", // Mint pastel highlight
          indigo: "#4338CA",
          indigoLight: "#ECE7FF",
        },
        // Dedicated Pastel Palette matching Reference Screenshots
        pastel: {
          mint: "#DDF7EE",
          mintBorder: "#B6EDDA",
          aqua: "#DDF8FA",
          aquaBorder: "#B8EEF2",
          lime: "#EFF7C8",
          limeBorder: "#DCEBA3",
          pink: "#F8E3F2",
          pinkBorder: "#ECC3E2",
          lavender: "#ECE7FF",
          lavenderBorder: "#D6CAFC",
          cream: "#FFF4CE",
          creamBorder: "#FCE59F",
          peach: "#FDE8D7",
          sky: "#E3F2FD",
        },
        surface: {
          lavender: "#ECE7FF",
          mist: "#DDF8FA",
          apricot: "#FFF4CE",
          sage: "#DDF7EE",
        },
        status: {
          verified: "#0E332E",
          verifiedGreen: "#15803D",
          verifiedBg: "#DDF7EE",
          verifiedBorder: "rgba(21, 128, 61, 0.22)",
          review: "#B45309",
          reviewBg: "#FFF4CE",
          reviewBorder: "rgba(180, 83, 9, 0.24)",
          blocked: "#B91C1C",
          blockedBg: "#FDE8E8",
          blockedBorder: "rgba(185, 28, 28, 0.24)",
        },
      },
      fontFamily: {
        serif: ["DM Serif Display", "Instrument Serif", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(14, 51, 46, 0.04)",
        card: "0 4px 16px -2px rgba(14, 51, 46, 0.05), 0 1px 3px rgba(14, 51, 46, 0.03)",
        modal: "0 24px 48px -12px rgba(14, 51, 46, 0.14), 0 2px 4px rgba(14, 51, 46, 0.04)",
        glow: "0 8px 32px rgba(221, 247, 238, 0.5)",
      },
      borderRadius: {
        'sm': "0.375rem",
        'DEFAULT': "0.5rem",
        'md': "0.75rem",
        'lg': "1rem",
        'xl': "1.25rem",
        '2xl': "1.5rem",
        '3xl': "2rem",
        'pill': "9999px",
      }
    },
  },
  plugins: [],
}
