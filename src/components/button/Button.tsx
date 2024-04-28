import { Button as FlowbiteButton, ButtonProps as FlowbiteButtonProps } from "flowbite-react";

interface ButtonProps extends Omit<FlowbiteButtonProps, "color" | "pill" | "outline"> {
  variant?: "filled" | "tonal" | "outline" | "text"
}

const Button = ({ variant = "text", ...args }: ButtonProps) => {
  if (variant === "filled") {
    return <FlowbiteButton color="filled" pill={true} {...args} />
  } else if (variant === "tonal") {
    return <FlowbiteButton color="tonal" pill={true} {...args} />
  } else if (variant === "outline") {
    return <FlowbiteButton color="outline" pill={true} outline={true} {...args} />
  }

  return (
    <FlowbiteButton color="text" pill={true} {...args} />
  )
}

export default Button
export { Button }
export type { ButtonProps }
