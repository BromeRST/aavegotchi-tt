const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', ...defaultTheme.fontFamily.sans],
        alagard: ["alagard"],
      },
      backgroundImage: {
        mainBg: "url('/brand/bg.png')",
        cardsGrid: "url('/brand/cardsGrid.png')",
        purpleCard: "url('/brand/CARDS/BASE_CARD_PURPLE.png')",
        fucsiaCard: "url('/brand/CARDS/BASE_CARD_FUCSIA.png')",
        waterCard: "url('/brand/CARDS/BASE_CARD_WATER.png')",
        boardBg: "url('/brand/BOARD/BASE_BOARD_GRID.png')",
        board00: "url('/brand/BOARD/BASE_BOARD_00.png')",
        board01: "url('/brand/BOARD/BASE_BOARD_01.png')",
        board02: "url('/brand/BOARD/BASE_BOARD_02.png')",
        board10: "url('/brand/BOARD/BASE_BOARD_10.png')",
        board11: "url('/brand/BOARD/BASE_BOARD_11.png')",
        board12: "url('/brand/BOARD/BASE_BOARD_12.png')",
        board20: "url('/brand/BOARD/BASE_BOARD_20.png')",
        board21: "url('/brand/BOARD/BASE_BOARD_21.png')",
        board22: "url('/brand/BOARD/BASE_BOARD_22.png')",
      },
      colors: {
        brand: {
          darkPurple: "#250B4F",
          pink: "#FA34F3",
          semiTran: "rgba(12, 12, 12, 0.25)",
          purple: "#8F17F9",
          modal: "rgba(12, 12, 12, 0.8)",
          darkRed: "#6A0000",
          red: "#CA3200",
          modal: "rgba(12, 12, 12, 0.8)",
        },
      },
      spacing: {
        38: "155px",
        50: "200px",
        "30%": "31%",
        "32%": "33%",
        "40%": "40%",
        "70%": "80%",
        "90%": "94%",
        "97%": "97%",
        "99%": "99%",
        gridW: "93%",
        gridY: "92%",
      },
      screens: {
        "3xl": "1700px",
        "2xl": "1600px",
      },
    },
  },
  plugins: [],
};
