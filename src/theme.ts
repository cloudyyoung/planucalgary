import type { CustomFlowbiteTheme } from "flowbite-react";

const theme: CustomFlowbiteTheme = {
  button: {
    "base": "group relative flex items-stretch justify-center py-1 px-2 text-center font-medium transition-[color,background-color,border-color,text-decoration-color,fill,stroke,box-shadow] border border-transparent z-0 focus:z-10 focus:outline-none after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:-z-10 after:transition-[color,background-color,border-color,text-decoration-color,fill,stroke,box-shadow]",
    "color": {
      // Primary
      "filled-primary": "bg-primary text-on-primary hover:after:bg-on-primary/hover-state-layer focus:after:bg-on-primary/focus-state-layer disabled:bg-on-surface/12 disabled:text-on-surface/38",
      "tonal-primary": "bg-secondary-container text-on-secondary-container hover:after:bg-on-secondary-container/hover-state-layer focus:after:bg-on-secondary-container/focus-state-layer disabled:bg-on-surface/12 disabled:text-on-surface/38",
      "outline-primary": "bg-transparent text-primary border border-outline hover:after:bg-primary/hover-state-layer focus:after:bg-primary/focus-state-layer disabled:text-on-surface/38 disabled:border-on-surface/12",
      "text-primary": "bg-transparent text-primary hover:after:bg-primary/hover-state-layer focus:after:bg-primary/focus-state-layer disabled:text-on-surface/38",

      // Secondary
      "filled-secondary": "bg-secondary text-on-secondary hover:after:bg-on-secondary/hover-state-layer focus:after:bg-on-secondary/focus-state-layer disabled:bg-on-surface/12 disabled:text-on-surface/38",
      "tonal-secondary": "bg-secondary-container text-on-secondary-container hover:after:bg-on-secondary-container/hover-state-layer focus:after:bg-on-secondary-container/focus-state-layer disabled:bg-on-surface/12 disabled:text-on-surface/38",
      "outline-secondary": "bg-transparent text-secondary border border-outline hover:after:bg-secondary/hover-state-layer focus:after:bg-secondary/focus-state-layer disabled:text-on-surface/38 disabled:border-on-surface/12",
      "text-secondary": "bg-transparent text-secondary hover:after:bg-secondary/hover-state-layer focus:after:bg-secondary/focus-state-layer disabled:text-on-surface/38",

      // Tertiary
      "filled-tertiary": "bg-tertiary text-on-tertiary hover:after:bg-on-tertiary/hover-state-layer focus:after:bg-on-tertiary/focus-state-layer disabled:bg-on-surface/12 disabled:text-on-surface/38",
      "tonal-tertiary": "bg-tertiary-container text-on-tertiary-container hover:after:bg-on-tertiary-container/hover-state-layer focus:after:bg-on-tertiary-container/focus-state-layer disabled:bg-on-surface/12 disabled:text-on-surface/38",
      "outline-tertiary": "bg-transparent text-tertiary border border-outline hover:after:bg-tertiary/hover-state-layer focus:after:bg-tertiary/focus-state-layer disabled:text-on-surface/38 disabled:border-on-surface/12",
      "text-tertiary": "bg-transparent text-tertiary hover:after:bg-tertiary/hover-state-layer focus:after:bg-tertiary/focus-state-layer disabled:text-on-surface/38",
    },
    "pill": {
      "off": "rounded-2xl after:rounded-2xl",
      "on": "rounded-full after:rounded-full"
    },
  },

  textInput: {
    "field": {
      "base": "block w-full disabled:cursor-not-allowed disabled:opacity-50",
      "input": {
        "sizes": {
        "sm": "p-4 sm:text-sm",
        "md": "p-4.5 text-base",
        "lg": "p-5 sm:text-xl"
      },
      "colors": {
        "gray": "border-none bg-surface text-on-surface focus:ring-2 focus:bg-surface-bright focus:ring-primary-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-primary-500",
        "info": "border-none bg-primary-50 text-primary-90 placeholder-primary-70 focus:ring-2 focus:ring-primary-500 dark:bg-primary-100  dark:focus:ring-primary-500",
        "failure": "border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:ring-2 focus:ring-red-500 dark:bg-red-100 dark:focus:ring-red-500",
        "warning": "border-yellow-500 bg-yellow-50 text-yellow-900 placeholder-yellow-700 focus:ring-2 focus:ring-yellow-500 dark:bg-yellow-100 dark:focus:ring-yellow-500",
        "success": "border-green-500 bg-green-50 text-green-900 placeholder-green-700 focus:ring-2 focus:ring-green-500 dark:bg-green-100 dark:focus:ring-green-500"
      },
        "withAddon": {
          "on": "rounded-full",
          "off": "rounded-full"
        },
      }
    }
  },

  accordion: {
    "root": {
      "base": "border-outline-variant",
      "flush": {
        "off": "rounded-2xl border overflow-hidden",
        "on": "border-b"
      }
    },
    "content": {
      "base": "p-5 first:rounded-t-2xl last:rounded-b-2xl"
    },
    "title": {
      "arrow": {
        "base": "h-6 w-6 shrink-0",
        "open": {
          "off": "",
          "on": "rotate-180"
        }
      },
      "base": "flex w-full items-center justify-between px-4 py-3 text-left font-medium text-on-surface first:rounded-t-2xl last:rounded-b-2xl transition-[color,background-color,border-color,text-decoration-color,fill,stroke,box-shadow]",
      "flush": {
        "off": "hover:bg-surface-container",
        "on": "bg-transparent"
      },
      "heading": "",
      "open": {
        "off": "",
        "on": "bg-surface-container-low text-primary"
      }
    }
  }
};

export default theme;