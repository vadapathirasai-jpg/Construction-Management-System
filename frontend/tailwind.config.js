/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "sans-serif"],
        industry: ["'Barlow Condensed'", "sans-serif"],
      },
      colors: {
        "blueprint-navy": "#1B2A41",
        "safety-orange": "#F5821F",
        "safety-yellow": "#FFC72C",
        "site-paper": "#F7F5F0",
        "concrete-gray": "#8E9AA6",
        primary: {
          50: "#fffaf0",
          100: "#ffeacc",
          200: "#ffd099",
          300: "#ffb066",
          400: "#fa9633",
          500: "#F5821F",
          600: "#d96b14",
          700: "#b3520b",
          800: "#8c3c04",
          900: "#662800",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(27, 42, 65, 0.08), 0 4px 12px rgba(27, 42, 65, 0.04)",
        cardHover: "0 4px 16px rgba(27, 42, 65, 0.12)",
        button: "0 4px 12px -4px rgba(245, 130, 31, 0.5)",
        modal: "0 20px 25px -5px rgba(27, 42, 65, 0.15), 0 10px 10px -5px rgba(27, 42, 65, 0.05)",
      },
    },
  },
  plugins: [],
};
