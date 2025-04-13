import clsx from "clsx"
import { ButtonHTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

import { baseCommon, outlineCommon, stateLayerCommon } from "../button/Button"
import { useNavigate } from "react-router-dom"


export type NavigationRailAlignment = "top" | "middle" | "bottom"

export interface NavigationRailProps {
  alignment?: NavigationRailAlignment
}

const NavigationRail = ({ alignment = "top" }: NavigationRailProps) => {
  const navigate = useNavigate()
  const routes = [
    { label: "Courses", icon: "import_contacts", path: "/courses" },
    { label: "Terms", icon: "calendar_today", path: "/terms" },
  ]

  return (
    <div className="min-w-20 px-0.5 bg-surface-container-low">
      <div className={twMerge(clsx(
        "py-11 flex flex-col gap-3 items-center h-full",
        alignment === "top" && "justify-start",
        alignment === "middle" && "justify-center",
        alignment === "bottom" && "justify-end",
      ))}>
        {routes.map((route) => (
          <NavigationRailButton
            key={route.label}
            icon={route.icon}
            label={route.label}
            active={location.pathname === route.path}
            onClick={() => navigate(route.path)}
          />
        ))}
      </div>
    </div>
  )
}



interface NavigationRailButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
  icon: string
  label: string
  active?: boolean
}

const NavigationRailButton = ({ icon, label, active = false, className, ...args }: NavigationRailButtonProps) => {
  return (
    <button
      className={twMerge(clsx(
        baseCommon,
        outlineCommon,
        "flex flex-col items-center justify-center gap-1 text-center w-full min-h-14 rounded-2xl py-0.5",
        "focus-visible:outline-offset-0",
        className
      ))}
      {...args}
    >
      <span className={clsx(
        baseCommon,
        stateLayerCommon,
        "material-symbols-outlined [font-variation-settings:'wght'_400, 'opsz'_24] h-8 w-14 mx-3 duration-100",
        active ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant",
        active ? "group-hover:text-on-secondary-container group-hover:after:bg-on-surface/8" : "group-hover:text-on-surface group-hover:after:bg-on-surface/8",
        active ? "group-active:text-on-secondary-container group-active:after:bg-on-surface/12" : "group-active:text-on-surface group-active:after:bg-on-surface/12",
      )}>
        {icon}
      </span>
      <span className={clsx(
        "text-xs duration-100",
        "group-hover:[font-variation-settings:'wght'_700] group-active:[font-variation-settings:'wght'_300]",
        active ? "font-bold text-on-surface" : "font-500 text-on-surface-variant",
        active ? "group-hover:text-on-surface" : "group-hover:text-on-surface",
        active ? "group-active:text-on-surface" : "group-active:text-on-surface",
      )}>
        {label}
      </span>
    </button>
  )
}

export { NavigationRail, NavigationRailButton }
export default NavigationRail
