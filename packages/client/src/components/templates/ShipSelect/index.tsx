import React from "react"

import Button from "@material-ui/core/Button"

import { ships } from "@fleethub/data"
import { ShipBanner } from "../../."
import { useShipSelect } from "../../../hooks"

type Props = {
  onSelect?: (shipId: number) => void
}

const Component: React.FC<Props> = ({ onSelect }) => {
  const handleSelect: React.MouseEventHandler<HTMLButtonElement> = React.useCallback(
    (event) => {
      onSelect && onSelect(Number(event.currentTarget.id))
    },
    [onSelect]
  )

  return (
    <>
      {ships
        .filter((ship) => ship.id < 10)
        .map((ship) => (
          <Button key={ship.id} id={ship.id.toString()} onClick={handleSelect}>
            {ship.name}
            <ShipBanner shipId={ship.id} />
          </Button>
        ))}
    </>
  )
}

const Container: React.FC = (props) => {
  const { onSelect } = useShipSelect()
  return <Component onSelect={onSelect} />
}

export default Container
