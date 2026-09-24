/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        brand: {
          purple: "#6C5CE7",
          amber: "#FF9F43",
          coral: "#FF6B6B",
          mint: "#1DD1A1",
          sky: "#48DBFB",
        },
      },
    },
  },
  plugins: [],
};

export default config;
