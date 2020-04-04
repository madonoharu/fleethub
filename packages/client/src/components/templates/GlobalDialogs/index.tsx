import React from "react"

import { Dialog as MuiDialog, DialogProps } from "@material-ui/core"

import { useShipSelect, useGearSelect } from "../../../hooks"
import { ShipSelect, GearSelect } from "../../../components"
import styled from "styled-components"

const Dialog: React.FC<DialogProps> = ({ children, ...rest }) => {
  return (
    <MuiDialog maxWidth="md" PaperProps={{ style: { minHeight: "80vh" } }} {...rest}>
      <div>{children}</div>
    </MuiDialog>
  )
}

const GlobalDialogs: React.FC = () => {
  const shipSelect = useShipSelect()
  const gearSelect = useGearSelect()
  return (
    <>
      <Dialog open={shipSelect.open} onClose={shipSelect.onClose}>
        <ShipSelect />
      </Dialog>
      <Dialog open={gearSelect.open} onClose={gearSelect.onClose}>
        <GearSelect />
      </Dialog>
    </>
  )
}

export default GlobalDialogs
