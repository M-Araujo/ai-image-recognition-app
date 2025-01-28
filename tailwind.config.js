module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts}",
  ],
  safelist: [
    'h-screen', 'bg-blue-500', 'flex', 'items-center', 'justify-center', 'text-white', 'text-2xl'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
