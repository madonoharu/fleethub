import React from "react"
import styled from "styled-components"

import { PlanShareContent, PlanAnalysisPanel } from "../../../components"
import { usePlan, useModal, usePublishFile } from "../../../hooks"

import BattlePlanPanel from "./BattlePlanPanel"
import PlanEditorHeader from "./PlanEditorHeader"
import PlanTabs from "./PlanTabs"

const StyledPlanAnalysisPanel = styled(PlanAnalysisPanel)`
  margin-top: 8px;
`

type Props = {
  id: string
}

const PlanEditor: React.FCX<Props> = ({ className, id }) => {
  const { plan, actions, state } = usePlan(id)

  const Modal = useModal()

  if (!plan || !state) return null

  return (
    <div className={className}>
      <PlanEditorHeader id={id} plan={plan} update={actions.update} />
      <PlanTabs plan={plan} update={actions.update} />

      <StyledPlanAnalysisPanel plan={plan} />
      <BattlePlanPanel plan={plan} updatePlan={actions.update} />
      <Modal>
        <PlanShareContent plan={plan} />
      </Modal>
    </div>
  )
}

export default styled(PlanEditor)`
  width: ${(props) => props.theme.breakpoints.width("md")}px;
  margin: 0 auto;
`
