import React from "react"
import styled from "styled-components"
import { ShipStat } from "@fleethub/core"

import { Button, Typography } from "@material-ui/core"

import { NumberInput, Flexbox } from "../../../components"
import { StatKeyDictionary } from "../../../utils"
import { ShipChanges } from "../../../store"

export type ShipStatProps = {
  stat: ShipStat
  onUpdate: (changes: ShipChanges) => void
}

type Props = ShipStatProps

const ShipStatForm: React.FCX<Props> = ({ className, stat, onUpdate }) => {
  const { displayed, modernization = 0, equipment, bonus, naked } = stat

  const raw = displayed - modernization

  const setModernization = (value: number) => {
    const next = value === 0 ? undefined : value
    onUpdate({ [stat.key]: next })
  }

  const handleDisplayedChange = (value: number) => setModernization(value - raw)

  return (
    <div className={className}>
      <Typography variant="subtitle1">{StatKeyDictionary[stat.key]}</Typography>
      <Flexbox>
        <NumberInput label="表示ステータス" value={displayed} onChange={handleDisplayedChange} />
        <Button onClick={() => onUpdate({ [stat.key]: undefined })}>初期化</Button>
      </Flexbox>

      <NumberInput label="上昇値" value={modernization} onChange={setModernization} />
      {naked !== undefined && <Typography>装備無し {naked}</Typography>}
      {equipment !== undefined && <Typography>装備合計 {equipment}</Typography>}
      {bonus !== undefined && <Typography>装備ボーナス {bonus}</Typography>}
    </div>
  )
}

export default styled(ShipStatForm)`
  h6 {
    color: ${({ theme, stat }) => theme.kc.palette[stat.key]};
  }
`
