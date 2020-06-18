import React from "react"
import styled from "styled-components"

import { GearSelectProvider, useGearSelectContext, useShipSelectContext, ShipSelectProvider } from "../../../hooks"
import { ShipSelect, GearSelect, Dialog, DialogProps } from "../../../components"

const StyledDialog: React.FC<DialogProps> = ({ children, ...rest }) => (
  <Dialog fullHeight fullWidth PaperProps={{ style: { padding: 8 } }} {...rest}>
    <div>{children}</div>
  </Dialog>
)
const ShipSelectDialog: React.FC = () => {
  const { state, actions } = useShipSelectContext()
  const open = Boolean(state.onSelect)
  return (
    <StyledDialog open={open} onClose={actions.close}>
      {open && <ShipSelect />}
    </StyledDialog>
  )
}

const GearSelectDialog: React.FC = () => {
  const { state, actions } = useGearSelectContext()
  const open = Boolean(state.onSelect)

  return (
    <StyledDialog open={open} onClose={actions.close}>
      {open && <GearSelect state={state} onUpdate={actions.update} />}
    </StyledDialog>
  )
}

const GlobalDialogsProvider: React.FC = ({ children }) => (
  <ShipSelectProvider>
    <GearSelectProvider>
      {children}
      <ShipSelectDialog />
      <GearSelectDialog />
    </GearSelectProvider>
  </ShipSelectProvider>
)

export default GlobalDialogsProvider
