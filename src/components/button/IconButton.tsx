import { ButtonHTMLAttributes, HTMLAttributes } from "react"
import clsx from "clsx"
import { twMerge } from "tailwind-merge"

import { baseCommon, outline, disabledCommon, stateLayerCommon } from "./Button"

export type IconButtonAppearance = "filled" | "outlined" | "standard" | "tonal"

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  appearance: IconButtonAppearance
}


const IconButton = ({ appearance, className, children, onClick, ...args }: IconButtonProps) => {
  const lookup: Record<IconButtonAppearance, HTMLAttributes<HTMLElement>["className"]> = {
    filled: clsx(
      "bg-primary text-on-primary",
      "hover:after:bg-on-primary/8 active:after:bg-on-primary/12",
      "disabled:bg-on-surface/12 disabled:after:bg-transparent",
    ),
    outlined: clsx(
      "text-on-surface-variant border border-outline",
      "hover:after:bg-on-surface-variant/8 active:after:bg-on-surface-variant/12",
      "disabled:border-on-surface/12 disabled:after:bg-transparent",
    ),
    standard: clsx(
      "text-on-surface-variant",
      "hover:after:bg-on-surface-variant/8 active:after:bg-on-surface-variant/12",
      "disabled:bg-on-surface/12 disabled:after:bg-transparent",
    ),
    tonal: clsx(
      "bg-secondary-container text-on-secondary-container",
      "hover:after:bg-on-secondary-container/8 active:after:bg-on-secondary-container/12",
      "disabled:bg-on-surface/12 disabled:after:bg-transparent",
    ),
  }

  const classNames = twMerge(clsx(
    baseCommon,
    outline,
    disabledCommon,
    stateLayerCommon,

    "h-10 w-10",

    lookup[appearance],
    className,
  ))

  return (
    <button className={classNames} onClick={onClick} {...args}>
      <span className="material-symbols-outlined text-[24px]">{children}</span>
      <span className="absolute -inset-2 z-[-10]" onClick={onClick} aria-hidden></span>
    </button>
  )
}

export default IconButton