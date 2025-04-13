import { ButtonHTMLAttributes, HTMLAttributes } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge"

type ButtonAppearance = "filled" | "outlined" | "text" | "elevated" | "tonal"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  appearance: ButtonAppearance
}

const Button = ({ appearance = "text", className, ...args }: ButtonProps) => {
  const lookup: Record<ButtonAppearance, HTMLAttributes<HTMLElement>["className"]> = {
    filled: "bg-primary text-on-primary hover:shadow-md active:shadow-none disabled:bg-on-surface/12",
    outlined: "text-primary border border-outline disabled:border-on-surface/12",
    text: "text-primary px-3 hover:after:bg-primary/8 focus:after:bg-primary/12",
    elevated: clsx(
      "bg-surface-container-low text-primary shadow-md",
      "hover:after:bg-primary/8 focus:after:bg-primary/12 active:shadow",
      "disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:after:bg-transparent disabled:shadow-none",
    ),
    tonal: clsx(
      "bg-secondary-container text-on-secondary-container hover:shadow active:shadow-none",
      "after:bg-transparent hover:after:bg-on-secondary-container/8 focus:after:bg-on-secondary-container/12",
      "disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:after:bg-transparent",
    ),
  }

  const classNames: HTMLAttributes<HTMLElement>["className"] = twMerge(clsx(
    "rounded-full after:rounded-full group relative flex items-center justify-center text-sm px-4 h-10 text-center font-medium transition-[color,background-color,border-color,text-decoration-color,fill,stroke,box-shadow] outline-none z-0",
    "focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:text-on-surface/38",

    // State layer
    "after:pointer-events-none after:absolute after:top-0 after:left-0 after:w-full after:h-full after:z-[-1] after:transition-[color,background-color,border-color,text-decoration-color,fill,stroke,box-shadow]",
    "after:bg-on-primary/0 hover:after:bg-on-primary/8 focus:after:bg-on-primary/12",

    lookup[appearance],

    className,
  ))

  return (
    <button className={classNames} {...args} />
  )
}

export default Button
export { Button }
export type { ButtonProps }
