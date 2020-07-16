import React from "react"
import styled from "styled-components"

import { PlanShareContent, PlanAnalysisPanel } from "../../../components"
import { usePlan, useModal } from "../../../hooks"

import BattlePlanPanel from "./BattlePlanPanel"
import PlanEditorHeader from "./PlanEditorHeader"
import PlanTabs from "./PlanTabs"

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

  return (
    <Cont>
      <PlanEditorHeader plan={plan} update={actions.update} />
      <PlanTabs plan={plan} update={actions.update} />

      <StyledPlanAnalysisPanel plan={plan} />
      <BattlePlanPanel plan={plan} updatePlan={actions.update} />
      <Modal>
        <PlanShareContent plan={plan} />
      </Modal>
    </Cont>
  )
}

export default PlanEditor
