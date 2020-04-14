import React from "react"
import styled, { useTheme } from "styled-components"
import { ShipStat } from "@fleethub/core"

import { Button, Tooltip, Dialog, DialogProps, Typography } from "@material-ui/core"

import { NumberInput, Flexbox } from "../../../components"
import { StatKeyDictionary } from "../../../utils"
import { ShipChanges } from "../../../store"

import { StatKey } from "./ShipStats"

export type ShipStatProps = {
  statKey: StatKey
  stat: Partial<ShipStat>
  onUpdate: (changes: ShipChanges) => void
}

type Props = ShipStatProps

const ShipStatForm: React.FCX<Props> = ({ statKey, stat, onUpdate }) => {
  const { displayed = 0, modernization = 0, equipment, bonus, naked } = stat

  const raw = displayed - modernization

  const setModernization = (value: number) => {
    const next = value === 0 ? undefined : value
    onUpdate({ [statKey]: next })
  }

  const handleDisplayedChange = (value: number) => setModernization(value - raw)

  const theme = useTheme()

  return (
    <div>
      <Typography variant="subtitle1" style={{ color: theme.kc.palette[statKey] }}>
        {StatKeyDictionary[statKey]}
      </Typography>
      <Flexbox>
        <NumberInput label="表示ステータス" value={displayed} onChange={handleDisplayedChange} />
        <Button onClick={() => onUpdate({ [statKey]: undefined })}>初期化</Button>
      </Flexbox>

      <NumberInput label="上昇値" value={modernization} onChange={setModernization} />
      <Typography>装備無し {naked}</Typography>
      <Typography>装備合計 {equipment}</Typography>
      <Typography>装備ボーナス {bonus}</Typography>
    </div>
  )
}

export default ShipStatForm
