import React from "react"
import styled from "styled-components"
import { FleetKey } from "@fleethub/core"

import { Container } from "@material-ui/core"

import { PlanShareContent, PlanAnalysisPanel, Tabs } from "../../../components"
import { usePlan, useModal } from "../../../hooks"

import FleetTabPanel from "./FleetTabPanel"
import LandBaseTabPanel from "./LandBaseTabPanel"
import GkcoiTabPanel from "./GkcoiTabPanel"
import BattlePlanPanel from "./BattlePlanPanel"
import PlanEditorHeader from "./PlanEditorHeader"
import FleetTabLabel from "./FleetTabLabel"

const Cont = styled.div`
  margin: 0 auto;
  width: ${(props) => props.theme.breakpoints.width("md")}px;
`

const StyledPlanAnalysisPanel = styled(PlanAnalysisPanel)`
  margin-top: 8px;
`

type Props = {
  planId: string
}

const PlanEditor: React.FC<Props> = ({ planId }) => {
  const { plan, actions, state } = usePlan(planId)

  const Modal = useModal()

  if (!plan || !state) return null

  const handleSwap = (drag: FleetKey, drop: FleetKey) => {
    actions.update((draft) => {
      const a = draft[drag]
      const b = draft[drop]
      draft[drag] = b
      draft[drop] = a
    })
  }

  const getTabItem = (fleetKey: FleetKey) => ({
    label: <FleetTabLabel fleetKey={fleetKey} onSwap={handleSwap} />,
    panel: <FleetTabPanel fleet={plan[fleetKey]} fleetKey={fleetKey} updatePlan={actions.update} />,
  })

  return (
    <Cont>
      <PlanEditorHeader plan={plan} update={actions.update} />

      <Tabs
        list={[
          getTabItem("f1"),
          getTabItem("f2"),
          getTabItem("f3"),
          getTabItem("f4"),
          { label: "基地", panel: <LandBaseTabPanel plan={plan} update={actions.update} /> },
          { label: "画像出力", panel: <GkcoiTabPanel plan={plan} /> },
        ]}
      />
      <StyledPlanAnalysisPanel plan={plan} />

      <Modal>
        <PlanShareContent plan={plan} />
      </Modal>
    </Cont>
  )
}

export default PlanEditor
