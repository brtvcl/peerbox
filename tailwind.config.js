import plugin from "tailwindcss/plugin";

export default {
  content: ["./src/**/*.{html,js,jsx}", "./index.html"],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".no-scrollbar": {
          /* IE and Edge */
          "-ms-overflow-style": "none",

          /* Firefox */
          "scrollbar-width": "none",

          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    }),
  ],
};
