const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      primary: colors.sky[700],
      secondary: colors.slate[600],
      dark: colors.slate[900],
      light: colors.slate[200],
      white: colors.slate[50],
      gray: colors.gray[500],
      disabled: colors.gray[400],
      error: colors.red[700],
      chamGreen: {
        DEFAULT: "#C4C56E",
        50: "#F9F9F1",
        100: "#F3F4E3",
        200: "#E8E8C5",
        300: "#DCDCA8",
        400: "#D0D18B",
        500: "#C4C56E",
        600: "#B2B348",
        700: "#8A8B38",
        800: "#626328",
        900: "#3B3B18",
        950: "#272710"
      },
      chamYellow: {
        DEFAULT: "#FDC900",
        50: "#FFF0B6",
        100: "#FFECA1",
        200: "#FFE378",
        300: "#FFDB50",
        400: "#FFD327",
        500: "#FDC900",
        600: "#C59C00",
        700: "#8D7000",
        800: "#554300",
        900: "#1D1700",
        950: "#010000"
      },
      chamBeige: {
        DEFAULT: "#F5C679",
        50: "#FFFFFF",
        100: "#FFFFFF",
        200: "#FEF6EB",
        300: "#FBE6C5",
        400: "#F8D69F",
        500: "#F5C679",
        600: "#F1B045",
        700: "#EC9912",
        800: "#B8770E",
        900: "#84560A",
        950: "#6A4508"
      },
      chamPurple: {
        DEFAULT: "#583B69",
        50: "#B497C5",
        100: "#AA8ABD",
        200: "#9770AF",
        300: "#84589D",
        400: "#6E4A83",
        500: "#583B69",
        600: "#3A2745",
        700: "#1C1321",
        800: "#000000"
      },
      chamGreenSec: {
        DEFAULT: "#C2C500",
        50: "#FDFF7E",
        100: "#FDFF69",
        200: "#FCFF40",
        300: "#FBFF18",
        400: "#EAEE00",
        500: "#C2C500",
        600: "#8B8D00",
        700: "#545500",
        800: "#1C1D00",
        900: "#000000"
      },
      chamPurplrSec: {
        DEFAULT: "#3F284B",
        50: "#9F75B5",
        100: "#9668AE",
        200: "#82539B",
        300: "#6C4480",
        400: "#553666",
        500: "#3F284B",
        600: "#201426",
        700: "#020102",
        800: "#000000"
      }
    },
    extend: {
      opacity: ["disabled"],
      fontSize: {
        base: ["18px", "24px"],
        title: `2.6rem;`,
        paragraph: `1.2rem;`
      },
      fontFamily: {
        brandon: ["Brandon Grotesque", "sans-serif"],
        avenir: ["Avenir", "sans-serif"]
      },
      height: {
        "screen-minus-topBar": "calc(100vh - 80px)"
      }
    }
  },
  plugins: [
    require("tailwind-scrollbar"),
    require("tailwind-scrollbar-hide")
  ]
};
