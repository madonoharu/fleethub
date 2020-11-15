import React from "react"
import { Ship, ShipState } from "@fleethub/core"
import { NumberInput, ShipBanner } from "../../molecules"
import styled from "@emotion/styled"

type ShipDetailScreenProps = {
  ship: Ship
  onChange?: (state: ShipState) => void
}

const ShipDetailScreen: React.FCX<ShipDetailScreenProps> = ({ className, ship, onChange }) => {
  const statKeys = ["firepower", "torpedo", "antiAir", "armor"] as const

  const renderStat = (key: typeof statKeys[number]) => {
    const handleChange = (next: number) => {
      const delta = ship[key].diff - next
      onChange?.({ ...ship.state, [key]: delta })
    }
    return (
      <div>
        <NumberInput
          label={key}
          variant="outlined"
          value={ship[key].diff}
          onChange={(next) => {
            onChange?.({ ...ship.state, [key]: next })
          }}
        />
      </div>
    )
  }

  return (
    <div className={className}>
      <ShipBanner size="medium" publicId={ship.banner} />
      {ship.name}
      {statKeys.map(renderStat)}
    </div>
  )
}

export default styled(ShipDetailScreen)`
  width: 600px;
  min-height: 80vh;
`
