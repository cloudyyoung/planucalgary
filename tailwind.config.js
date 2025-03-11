/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");

export default {
  content: [
    "./src/**/*.{html,js,jsx,tsx,ts}",
    flowbite.content(),
  ],
  theme: {
    fontFamily: {
      sans: ['Overpass', 'sans-serif'],
      serif: ['Overpass', 'serif'],
      mono: ['Overpass Mono', 'monospace'],
    },
    extend: {
      colors: {
        // Schemes
        "primary": "#066B5B",
        "surface-tint": "#066B5B",
        "on-primary": "#FFFFFF",
        "primary-container": "#A0F2DE",
        "on-primary-container": "#00201A",
        "secondary": "#4A635D",
        "on-secondary": "#FFFFFF",
        "secondary-container": "#CDE8E0",
        "on-secondary-container": "#06201A",
        "tertiary": "#436278",
        "on-tertiary": "#FFFFFF",
        "tertiary-container": "#C8E6FF",
        "on-tertiary-container": "#001E2E",
        "error": "#BA1A1A",
        "on-error": "#FFFFFF",
        "error-container": "#FFDAD6",
        "on-error-container": "#410002",
        "background": "#F5FBF7",
        "on-background": "#171D1B",
        "surface": "#F5FBF7",
        "on-surface": "#171D1B",
        "surface-variant": "#DBE5E0",
        "on-surface-variant": "#3F4946",
        "outline": "#6F7976",
        "outline-variant": "#BFC9C4",
        "shadow": "#000000",
        "scrim": "#000000",
        "inverse-surface": "#2B3230",
        "inverse-on-surface": "#ECF2EF",
        "inverse-primary": "#84D6C2",
        "primary-fixed": "#A0F2DE",
        "on-primary-fixed": "#00201A",
        "primary-fixed-dim": "#84D6C2",
        "on-primary-fixed-variant": "#005144",
        "secondary-fixed": "#CDE8E0",
        "on-secondary-fixed": "#06201A",
        "secondary-fixed-dim": "#B1CCC4",
        "on-secondary-fixed-variant": "#334B45",
        "tertiary-fixed": "#C8E6FF",
        "on-tertiary-fixed": "#001E2E",
        "tertiary-fixed-dim": "#AACBE4",
        "on-tertiary-fixed-variant": "#2A4A5F",
        "surface-dim": "#D5DBD8",
        "surface-bright": "#F5FBF7",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#EFF5F1",
        "surface-container": "#E9EFEC",
        "surface-container-high": "#E3EAE6",
        "surface-container-highest": "#DEE4E0",

        // Palette
        "primary": {
          "DEFAULT": "#066B5B",
          "0": "#000000",
          "5": "#001410",
          "10": "#00201A",
          "15": "#002C24",
          "20": "#00382E",
          "25": "#004439",
          "30": "#005144",
          "35": "#005E4F",
          "40": "#006B5B",
          "50": "#2D8473",
          "60": "#4B9F8D",
          "70": "#67BAA7",
          "80": "#83D6C2",
          "90": "#9FF2DE",
          "95": "#B7FFEC",
          "98": "#E5FFF6",
          "99": "#F3FFFA",
          "100": "#FFFFFF"
        },
        "secondary": {
          "DEFAULT": "#4A635D",
          "0": "#000000",
          "5": "#041410",
          "10": "#0E1F1B",
          "15": "#192925",
          "20": "#23342F",
          "25": "#2E3F3A",
          "30": "#394A45",
          "35": "#455651",
          "40": "#51625D",
          "50": "#697B75",
          "60": "#82958F",
          "70": "#9DAFA9",
          "80": "#B8CBC4",
          "90": "#D4E7E0",
          "95": "#E2F5EE",
          "98": "#EAFEF7",
          "99": "#F3FFFA",
          "100": "#FFFFFF"
        },
        "tertiary": {
          "DEFAULT": "#436278",
          "0": "#000000",
          "5": "#00131F",
          "10": "#061E2B",
          "15": "#122836",
          "20": "#1E3341",
          "25": "#293E4C",
          "30": "#344958",
          "35": "#405564",
          "40": "#4C6171",
          "50": "#657A8A",
          "60": "#7E93A5",
          "70": "#98AEC0",
          "80": "#B3C9DC",
          "90": "#CFE5F8",
          "95": "#E5F2FF",
          "98": "#F6FAFF",
          "99": "#FBFCFF",
          "100": "#FFFFFF"
        },
        "neutral": {
          "0": "#000000",
          "5": "#0F1111",
          "10": "#1A1C1B",
          "15": "#242625",
          "20": "#2E3130",
          "25": "#3A3C3B",
          "30": "#454746",
          "35": "#515352",
          "40": "#5D5F5D",
          "50": "#767776",
          "60": "#8F918F",
          "70": "#AAABAA",
          "80": "#C6C7C5",
          "90": "#E2E3E1",
          "95": "#F0F1EF",
          "98": "#F9FAF7",
          "99": "#FCFCFA",
          "100": "#FFFFFF"
        },
        "neutral-variant": {
          "0": "#000000",
          "5": "#0C1210",
          "10": "#161D1B",
          "15": "#212725",
          "20": "#2B3230",
          "25": "#363D3B",
          "30": "#414846",
          "35": "#4D5451",
          "40": "#59605D",
          "50": "#727976",
          "60": "#8B928F",
          "70": "#A6ADA9",
          "80": "#C1C8C5",
          "90": "#DDE4E0",
          "95": "#ECF2EF",
          "98": "#F4FBF7",
          "99": "#F7FEFA",
          "100": "#FFFFFF"
        }
      },
      opacity: {
        '8': '0.08',
        '12': '0.12',
        '16': '0.16',
        '38': '0.38',

        'hover-state-layer': '0.08',
        'focus-state-layer': '0.10',
      }
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
}

