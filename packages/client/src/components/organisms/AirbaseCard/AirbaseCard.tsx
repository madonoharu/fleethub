import React from "react"
import styled from "styled-components"
import { Airbase, AirbaseState, AirbaseKey } from "@fleethub/core"

import { Paper } from "@material-ui/core"

import { EquipmentList, Select } from "../../../components"
import { Update } from "../../../utils"

type Props = {
  label?: string
  airbase: Airbase
  update: Update<AirbaseState>
}

const AirbaseCard: React.FCX<Props> = ({ className, label, airbase, update }) => {
  const handleModeChange = (mode: AirbaseState["mode"]) => {
    update((draft) => {
      draft.mode = mode
    })
  }

  return (
    <Paper className={className}>
      {label}
      <Select options={["Sortie", "Standby", "AirDefense"] as const} value={airbase.mode} onChange={handleModeChange} />
      <EquipmentList equipment={airbase.equipment} update={update} canEquip={airbase.canEquip} />
      制空: {airbase.fighterPower} 防空: {airbase.interceptionPower} 半径: {airbase.radius}
    </Paper>
  )
}

export default styled(AirbaseCard)`
  min-width: 160px;

  ${EquipmentList} {
    margin: 24px;
  }
`
