import type { CustomFlowbiteTheme } from "flowbite-react";

const theme: CustomFlowbiteTheme = {
  button: {},

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