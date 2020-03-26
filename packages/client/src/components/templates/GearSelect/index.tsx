import React from "react"

import Button from "@material-ui/core/Button"

import { gears } from "@fleethub/data"
import { useGearSelect } from "../../../hooks"
import { GearIcon } from "../../."

type ComponentProps = {
  onSelect?: (gearId: number) => void
}

const Component: React.FC<ComponentProps> = ({ onSelect }) => {
  const handleSelect: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(
    (event) => {
      onSelect && onSelect(Number(event.currentTarget.id))
    },
    [onSelect]
  )
  return (
    <>
      {gears
        .filter((gear) => gear.name.length > 25)
        .map((gear) => (
          <Button key={gear.id} id={gear.id.toString()} onClick={handleSelect}>
            <GearIcon iconId={gear.iconId} />
            {gear.name}
          </Button>
        ))}
    </>
  )
}

const Container: React.FC = () => {
  const { onSelect } = useGearSelect()
  return <Component onSelect={onSelect} />
}

export default Container
