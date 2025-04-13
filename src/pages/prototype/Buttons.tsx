
import { Button } from "src/components"
import IconButton from "src/components/button/IconButton"

const ButtonsPrototype = () => {
  return (
    <div className="px-4 py-8 bg-surface flex flex-col gap-6">
      <div className="flex gap-4">
        <Button appearance="filled">Filled Button</Button>
        <Button appearance="outlined">Outlined Button</Button>
        <Button appearance="text">Text Button</Button>
        <Button appearance="elevated">Elevated Button</Button>
        <Button appearance="tonal">Tonal Button</Button>
      </div>

      <div className="flex gap-4">
        <Button appearance="filled" icon="search">Icon Filled Button</Button>
        <Button appearance="outlined" icon="search">Icon Outlined Button</Button>
        <Button appearance="text" icon="search">Icon Text Button</Button>
        <Button appearance="elevated" icon="search">Icon Elevated Button</Button>
        <Button appearance="tonal" icon="search">Icon Tonal Button</Button>
      </div>

      <div className="flex gap-4">
        <IconButton appearance="filled">search</IconButton>
        <IconButton appearance="outlined">search</IconButton>
        <IconButton appearance="standard">search</IconButton>
        <IconButton appearance="tonal">search</IconButton>
      </div>
    </div>
  )
}

export default ButtonsPrototype
export { ButtonsPrototype as ButtonPrototype }