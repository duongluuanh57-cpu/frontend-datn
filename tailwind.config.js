/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#D4A5A5",
        accent: "#E7B8B8",
        background: "#FFF5F5",
        content: "#7A5C5C",
        contrast: "#C08497",
      },
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-montserrat)", "sans-serif"],
      },
      maxWidth: {
        container: "1400px",
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}