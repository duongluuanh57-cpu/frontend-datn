/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        surface: "#F5F5F5",
        foreground: "#1A1A1A",
        primary: "#C9A96E",
        "primary-dark": "#B8944F",
        "primary-light": "#D4BC82",
        gold: "#C9A96E",
        "rich-black": "#0A0A0A",
        border: "#E8E8E8",
        "text-primary": "#1A1A1A",
        "text-secondary": "#666666",
        "text-muted": "#999999",
        price: "#C9A96E",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      maxWidth: {
        container: "1400px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scroll-reveal": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        aurora: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "heart-pop": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "35%": { transform: "scale(1.15)", opacity: "1" },
          "60%": { transform: "scale(0.95)", opacity: "1" },
          "80%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.8)", opacity: "0" },
        },
        "heart-ripple": {
          "0%": { transform: "scale(0.3)", opacity: "0.5" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        "heart-float": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "60%": { opacity: "1" },
          "100%": { transform: "translateY(-120px) scale(0.3)", opacity: "0" },
        },
        "heart-badge-in": {
          "0%": { transform: "scale(0) rotate(-20deg)", opacity: "0" },
          "60%": { transform: "scale(1.3) rotate(5deg)", opacity: "1" },
          "80%": { transform: "scale(0.9) rotate(-2deg)" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "scale-pop": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out forwards",
        "scroll-reveal": "scroll-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 2s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        aurora: "aurora 12s ease infinite",
        "heart-pop": "heart-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "heart-ripple": "heart-ripple 0.8s ease-out",
        "heart-float": "heart-float 0.9s ease-out forwards",
        "heart-badge-in": "heart-badge-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "scale-pop": "scale-pop 0.3s ease-out",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0, 0, 0, 0.04)",
        card: "0 8px 32px rgba(0, 0, 0, 0.06)",
        elevated: "0 20px 60px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 24px 48px -12px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};