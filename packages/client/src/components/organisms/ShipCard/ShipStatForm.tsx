import React from "react"
import styled from "styled-components"

import { Button, Typography } from "@material-ui/core"

import { NumberInput, Flexbox } from "../../../components"
import { StatKeyDictionary } from "../../../utils"
import { ShipChanges } from "../../../store"

export type ShipStatProps = {
  stat: any
  onUpdate: (changes: ShipChanges) => void
}

type Props = ShipStatProps

const ShipStatForm: React.FCX<Props> = ({ className, stat, onUpdate }) => {
  const { displayed, increase = 0, equipment, bonus, naked } = stat

  const raw = displayed - increase

  const setIncrease = (value: number) => {
    const next = value === 0 ? undefined : value
    onUpdate({ [stat.key]: next })
  }

  const handleDisplayedChange = (value: number) => setIncrease(value - raw)

  return (
    <div className={className}>
      <Flexbox>
        <NumberInput label="表示ステータス" value={displayed} onChange={handleDisplayedChange} />
        <Button onClick={() => onUpdate({ [stat.key]: undefined })}>初期化</Button>
      </Flexbox>

      <Typography>上昇値 {increase}</Typography>
      {naked !== undefined && <Typography>装備無し {naked}</Typography>}
      {equipment !== undefined && <Typography>装備合計 {equipment}</Typography>}
      {bonus !== undefined && <Typography>装備ボーナス {bonus}</Typography>}
    </div>
  )
}

export default styled(ShipStatForm)``
