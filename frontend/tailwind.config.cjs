module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,css,html}",
    "./node_modules/@shadcn/ui/**/*.{js,ts,jsx,tsx}"
  ],
  theme: { extend: {
    fontFamily: {
      cursive: ['"Dancing Script"', 'cursive'],
  } },
  plugins: [],
}
}