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
      },
    },
  },
  plugins: [],
}
