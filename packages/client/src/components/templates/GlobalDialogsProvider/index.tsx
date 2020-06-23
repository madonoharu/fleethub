import React from "react"

import { GearSelectProvider, useGearSelectContext } from "../../../hooks"
import { GearSelect, Dialog, DialogProps } from "../../../components"

const StyledDialog: React.FC<DialogProps> = ({ children, ...rest }) => (
  <Dialog full PaperProps={{ style: { padding: 8 } }} {...rest}>
    <div>{children}</div>
  </Dialog>
)

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
  <GearSelectProvider>
    {children}
    <GearSelectDialog />
  </GearSelectProvider>
)

export default GlobalDialogsProvider
