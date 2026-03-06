/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "primary": "#128c7e",
        "background-light": "#f6f8f8",
        "background-dark": "#11211f",
      },
      fontFamily: {
        "display": ["Public Sans", "sans-serif"]
      }
    },
  },
  plugins: [],
}
