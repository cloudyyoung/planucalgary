import { Button as FlowbiteButton, ButtonProps as FlowbiteButtonProps } from "flowbite-react";

interface ButtonProps extends Omit<FlowbiteButtonProps, "color" | "pill" | "outline"> {
  variant?: "filled" | "tonal" | "outline" | "text"
  priority?: "primary" | "secondary" | "tertiary"
}

const Button = ({ variant = "text", priority = "primary", ...args }: ButtonProps) => {
  const color = variant + "-" + priority

  return (
    <FlowbiteButton color={color} pill={true} {...args} />
  )
}

export default Button
export { Button }
export type { ButtonProps }
