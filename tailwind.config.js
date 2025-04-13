/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");
const { createThemes } = require('tw-colors');

// Replace camelCase keys with dashed keys
const replaceCamelCaseRecursively = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(replaceCamelCaseRecursively);
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        const newKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        return [newKey, replaceCamelCaseRecursively(value)];
      })
    );
  }
  return obj;
};

// Populate palettes with default values
const populatePalettes = (schemes, palettes) => {
  const newScheme = {}

  for (const [schemaName, scheme] of Object.entries(schemes)) {
    newScheme[schemaName] = {};

    for (const [tokenName, tokenValue] of Object.entries(scheme)) {
      if (palettes[tokenName]) {
        const palette = palettes[tokenName];
        newScheme[schemaName][tokenName] = {
          ...palette,
          DEFAULT: tokenValue,
        };
      } else {
        newScheme[schemaName][tokenName] = tokenValue;
      }
    }
  }

  return newScheme;
}


// Read from material-theme.json
const fs = require('fs');
const path = require('path');
const json_path = path.join(__dirname, 'material-theme.json');
const theme = JSON.parse(fs.readFileSync(json_path, 'utf8'));
const schemes = replaceCamelCaseRecursively(theme.schemes);
const palettes = replaceCamelCaseRecursively(theme.palettes)
const themes = populatePalettes(schemes, palettes)

export default {
  content: [
    "./src/**/*.{html,js,jsx,tsx,ts}",
    flowbite.content(),
  ],
  theme: {
    fontFamily: {
      sans: ['overpass', 'sans-serif'],
      serif: ['overpass', 'serif'],
      mono: ['overpass-mono', 'monospace'],
    },
    extend: {
      opacity: {
        '8': '0.08',
        '12': '0.12',
        '16': '0.16',
        '38': '0.38',

        'hover-state-layer': '0.08',
        'focus-state-layer': '0.12',
      }
    },
  },
  plugins: [
    flowbite.plugin(),
    createThemes(themes)
  ],
}

