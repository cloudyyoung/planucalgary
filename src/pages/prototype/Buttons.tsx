
import { Button } from "src/components"

const ButtonsPrototype = () => {
  return (
    <div className="p-8 flex gap-4 bg-surface">
      <Button appearance="filled">Filled Button</Button>
      <Button appearance="outlined">Outlined Button</Button>
      <Button appearance="text">Text Button</Button>
      <Button appearance="elevated">Elevated Button</Button>
      <Button appearance="tonal">Tonal Button</Button>

      <Button appearance="filled" icon="search">Icon Filled Button</Button>
      <Button appearance="outlined" icon="search">Icon Outlined Button</Button>
      <Button appearance="text" icon="search">Icon Text Button</Button>
      <Button appearance="elevated" icon="search">Icon Elevated Button</Button>
      <Button appearance="tonal" icon="search">Icon Tonal Button</Button>
    </div>
  )
}

export default ButtonsPrototype
export { ButtonsPrototype as ButtonPrototype }