import React from "react"
import styled from "styled-components"

import { Dialog as MuiDialog, DialogProps, useTheme } from "@material-ui/core"

import { useShipSelect, useGearSelect } from "../../../hooks"
import { ShipSelect, GearSelect } from "../../../components"

const Dialog: React.FC<DialogProps> = ({ children, ...rest }) => {
  const theme = useTheme()
  const width = theme.breakpoints.width("md")
  return (
    <MuiDialog maxWidth="md" PaperProps={{ style: { height: "80vh", width, padding: 8 } }} {...rest}>
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
        {shipSelect.open && <ShipSelect />}
      </Dialog>
      <Dialog open={gearSelect.open} onClose={gearSelect.onClose}>
        {gearSelect.open && <GearSelect />}
      </Dialog>
    </>
  )
}

export default GlobalDialogs
