import clsx from "clsx"
import { baseCommon, stateLayerCommon } from "../button/Button"
import { ButtonHTMLAttributes } from "react"

interface NavigationRailButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
  icon: string
  label: string
  active?: boolean
}

const NavigationRailButton = ({ icon, label, active, ...args }: NavigationRailButtonProps) => {
  return (
    <button
      className={clsx(
        baseCommon,
        "flex flex-col items-center justify-center gap-1 text-center w-full min-h-14",
      )}
      {...args}
    >
      <span className={clsx(
        baseCommon,
        stateLayerCommon,
        "material-symbols-outlined text-[24px] h-8 w-14 mx-3",
        active ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant",
        active ? "group-hover:text-on-secondary-container group-hover:after:bg-on-surface/8" : "group-hover:text-on-surface group-hover:after:bg-on-surface/8",
        active ? "group-active:text-on-secondary-container group-active:after:bg-on-surface/12" : "group-active:text-on-surface group-active:after:bg-on-surface/12",
      )}>
        {icon}
      </span>
      <span className={clsx(
        "text-xs",
        active ? "font-700 text-on-surface" : "font-500 text-on-surface-variant",
        active ? "group-hover:text-on-surface" : "group-hover:text-on-surface",
        active ? "group-active:text-on-surface" : "group-active:text-on-surface",
      )}>
        {label}
      </span>
    </button>
  )
}

const NavigationRail = () => {
  return (
    <div className="w-20 bg-surface">
      <div className=" py-8 flex flex-col gap-3">
        <NavigationRailButton icon="search" label="Search" active />
        <NavigationRailButton icon="search" label="Search" />
      </div>
    </div>
  )
}

export default NavigationRail
export { NavigationRail }
