/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        darkBlue: "#061D30",
        lightBlue: "#8DE0EE",
        lightOrange: "#FFDCA1",
        blue: "#00B6C9",
        orange: "#FFA829",
        darkBrown: "#231F20",
        lightYellow: "#FFEDCF",
        lightBlue2: "#E7FCFF",
      },
    },
  },
  plugins: [],
};
