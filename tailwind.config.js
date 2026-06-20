/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-brown": "#86644c",
        "input-brown": "#6f4e37",
        "input-hover": "#322a23",
        'leads' : "#322123",
        'table-heading': '#374151',
        'table-text': '#4b5563',
        "brand-brown-hover": "#6c4f3b",
        "menu-active-blue": "#eaf2fd",
        "tab-border": "rgba(221, 221, 221, 0.867)",
        'table-selected': '#e5e7eb',
        'yellownotes': '#e9c607',
        'payment-yellow':'#fde24f',
      },
      fontFamily: {
        sans: ["Inter var", "sans-serif"],
        satoshi: ["Satoshi", "sans-serif"],
        switzer: ["Switzer", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
      },
    },
  },
  plugins: [],
};
