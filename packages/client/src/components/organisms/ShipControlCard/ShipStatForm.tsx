import React from "react"
import styled from "styled-components"
import { ShipStat } from "@fleethub/core"

import { Button, Tooltip, Dialog, DialogProps, Typography } from "@material-ui/core"

import { NumberInput } from "../../../components"
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

  const handleDisplayedChange = (value: number) => onUpdate({ [statKey]: value - raw })

  return (
    <div>
      <Typography variant="subtitle1">{StatKeyDictionary[statKey]}</Typography>
      <NumberInput value={displayed} onChange={handleDisplayedChange} />
      <Typography>装備無し {naked}</Typography>
      <Typography>装備合計 {equipment}</Typography>
      <Typography>装備ボーナス {bonus}</Typography>
    </div>
  )
}

export default ShipStatForm
