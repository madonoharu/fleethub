import React from "react"
import styled from "styled-components"
import { useTranslation } from "react-i18next"

import { Button, Tooltip, DialogTitle, DialogContent } from "@material-ui/core"

import { StatIcon, DialogButton } from "../../../components"
import { StatKeyDictionary } from "../../../utils"

import ShipStatLabel from "./ShipStatLabel"
import ShipStatForm, { ShipStatProps } from "./ShipStatForm"

type Props = ShipStatProps

const ShipStatButton: React.FCX<Props> = ({ className, stat, onUpdate }) => {
  const button = (
    <Tooltip title={"火力"}>
      <Button className={className}>
        <ShipStatLabel statKey="firepower" stat={stat} />
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

export default styled(ShipStatButton)``
