import React from "react"

import Button from "@material-ui/core/Button"

import { ShipBanner } from "../../."
import { useShipSelect, useFhSystem } from "../../../hooks"

import FilterBar from "./FilterBar"

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

  const ships = useFhSystem().factory.masterShips

  return (
    <>
      <FilterBar ships={ships} />
    </>
  )
}

const Container: React.FC = (props) => {
  const { onSelect } = useShipSelect()
  return <Component onSelect={onSelect} />
}

export default Container
