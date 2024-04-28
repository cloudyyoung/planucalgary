import type { CustomFlowbiteTheme } from "flowbite-react";

const theme: CustomFlowbiteTheme = {
  button: {
    "base": "group relative flex items-stretch justify-center py-1 px-2 text-center font-medium transition-[color,background-color,border-color,text-decoration-color,fill,stroke,box-shadow] border border-transparent z-0 focus:z-10 focus:outline-none after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:-z-10",
    "color": {
      // Customized
      "filled": "bg-primary text-on-primary hover:after:bg-on-primary/hover-state-layer focus:after:bg-on-primary/focus-state-layer",
      "tonal": "bg-secondary-container text-on-secondary-container hover:after:bg-on-secondary-container/hover-state-layer focus:after:bg-on-secondary-container/focus-state-layer",
      "outline": "bg-transparent text-primary border border-outline hover:after:bg-primary/hover-state-layer focus:after:bg-primary/focus-state-layer",
      "text": "bg-transparent text-primary hover:after:bg-primary/hover-state-layer focus:after:bg-primary/focus-state-layer",

      // Original
      "info": "",
      "dark": "",
      "failure": "",
      "gray": "",
      "light": "",
      "purple": "",
      "success": "",
      "warning": "",
      "blue": "",
      "cyan": "",
      "green": "",
      "indigo": "",
      "lime": "",
      "pink": "",
      "red": "",
      "teal": "",
      "yellow": ""
    },
    "pill": {
      "off": "rounded-2xl after:rounded-2xl",
      "on": "rounded-full after:rounded-full"
    },
  },
};

export default theme;