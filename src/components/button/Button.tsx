import { Button as FlowbiteButton, ButtonProps as FlowbiteButtonProps } from "flowbite-react";

interface ButtonProps extends FlowbiteButtonProps {
}

const Button = ({ ...args }: ButtonProps) => {
  return (
    <FlowbiteButton {...args} />
  )
}

export default Button
export { Button }
export type { ButtonProps }
