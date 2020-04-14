import React from "react"
import styled from "styled-components"
import { ShipStat } from "@fleethub/core"
import { useTranslation } from "react-i18next"

import { Button, Tooltip, DialogTitle, DialogContent } from "@material-ui/core"

import { StatIcon, DialogButton } from "../../../components"
import { StatKeyDictionary } from "../../../utils"

import ShipStatText from "./ShipStatText"
import ShipStatForm, { ShipStatProps } from "./ShipStatForm"

type Props = ShipStatProps

const ShipStatButton: React.FCX<Props> = ({ className, stat, onUpdate }) => {
  const button = (
    <Tooltip title={StatKeyDictionary[stat.key]}>
      <Button className={className}>
        <StatIcon icon={stat.key} />
        <ShipStatText stat={stat} />
      </Button>
    </Tooltip>
  )

  return (
    <DialogButton button={button}>
      <DialogContent>
        <ShipStatForm stat={stat} onUpdate={onUpdate} />
      </DialogContent>
    </DialogButton>
  )
}

export default styled(ShipStatButton)`
  display: flex;
  align-items: center;

  font-size: 0.75rem;
  line-height: 1.5;
  font-weight: 400;

  ${StatIcon} {
    margin: 0 4px;
  }
`
