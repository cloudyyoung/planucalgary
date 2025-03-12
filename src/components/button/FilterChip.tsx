import { ButtonHTMLAttributes, ReactNode } from "react"
import clsx from "clsx"
import { CheckIcon } from "@heroicons/react/24/solid"


interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  selected?: boolean
}


export const FilterChip = ({ children, selected, ...props }: FilterChipProps) => {
  const hasIcon = selected

  return (
    <button className={clsx(
      "px-4 h-[2rem] text-sm rounded-lg leading-5 relative overflow-hidden transition-all flex flex-row items-center justify-center",
      "disabled:text-on-surface/38 after:content-[''] after:pointer-events-none after:absolute after:top-0 after:left-0 after:w-full after:h-full after:transition-[color,background-color,border-color,text-decoration-color,fill,stroke,box-shadow]",
      !selected && "border border-outline-variant bg-surface-container-low text-on-surface-variant disabled:border-on-surface/12 focus:text-on-surface-variant focus:after:bg-on-surface-variant/10  hover:text-on-surface-variant hover:after:bg-on-surface-variant/8",
      selected && "border border-secondary-container bg-secondary-container text-on-secondary-container disabled:border-on-surface/12 focus:text-on-secondary-container focus:after:bg-on-secondary-container/10 hover:text-on-secondary-container hover:after:bg-on-secondary-container/8",
      hasIcon && "pl-2"
    )}
      {...props}>
      {hasIcon && <CheckIcon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  )
}
