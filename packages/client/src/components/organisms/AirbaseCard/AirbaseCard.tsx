import React from "react"
import styled from "@emotion/styled"
import { Airbase, AirbaseState } from "@fleethub/core"

import { Paper, Typography } from "@material-ui/core"

import { Update } from "../../../utils"
import { Flexbox, LabeledValue } from "../../atoms"
import { Select } from "../../molecules"

import EquipmentList from "../EquipmentList"

const AirbaseModes = ["Sortie", "AirDefense", "Standby"] as const
const getAirbaseModeLabel = (mode: Airbase["mode"]) => ({ Sortie: "出撃", Standby: "待機", AirDefense: "防空" }[mode])

const ModeSelect: typeof Select = styled(Select)`
  margin-left: auto;
`

const StyledLabeledValue = styled(LabeledValue)`
  margin-right: 8px;
`

const StyledEquipmentList = styled(EquipmentList)`
  margin: 8px 0;
`

type Props = {
  className?: string
  label?: string
  airbase: Airbase
  update: Update<AirbaseState>
}

const AirbaseCard = React.forwardRef<HTMLDivElement, Props>(({ className, label, airbase, update }, ref) => {
  const handleModeChange = (mode: AirbaseState["mode"]) => {
    update((draft) => {
      draft.mode = mode
    })
  }

  return (
    <Paper ref={ref} className={className}>
      <Flexbox>
        <Typography variant="subtitle2">{label}</Typography>
        <ModeSelect
          options={AirbaseModes}
          value={airbase.mode}
          onChange={handleModeChange}
          getOptionLabel={getAirbaseModeLabel}
        />
      </Flexbox>

      <Flexbox>
        <StyledLabeledValue label="制空" value={airbase.fighterPower} />
        <StyledLabeledValue label="防空" value={airbase.interceptionPower} />
        <StyledLabeledValue label="半径" value={airbase.radius} />
      </Flexbox>

      <StyledEquipmentList type="airbase" equipment={airbase.equipment} update={update} canEquip={airbase.canEquip} />
    </Paper>
  )
})

export default styled(AirbaseCard)`
  padding: 8px;
  min-width: 160px;
`
