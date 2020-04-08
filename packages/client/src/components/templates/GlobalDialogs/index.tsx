import React from "react"
import styled from "styled-components"

import { Dialog as MuiDialog, DialogProps } from "@material-ui/core"

import { useShipSelect, useGearSelect } from "../../../hooks"
import { ShipSelect, GearSelect } from "../../../components"

const Dialog: React.FC<DialogProps> = ({ children, ...rest }) => {
  return (
    <MuiDialog maxWidth="md" PaperProps={{ style: { height: "80vh" } }} {...rest}>
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
        {gearSelect.open && <GearSelect />}
      </Dialog>
    </>
  )
}

export default GlobalDialogs
