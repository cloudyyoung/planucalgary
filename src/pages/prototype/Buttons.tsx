
import { Button } from "src/components"

const ButtonsPrototype = () => {
  return (
    <div className="p-8 flex gap-4 bg-surface">
      <Button appearance="filled">Filled Button</Button>
      <Button appearance="outlined">Outlined Button</Button>
      <Button appearance="text">Text Button</Button>
      <Button appearance="elevated">Elevated Button</Button>
      <Button appearance="tonal">Tonal Button</Button>
    </div>
  )
}

export default ButtonsPrototype
export { ButtonsPrototype as ButtonPrototype }