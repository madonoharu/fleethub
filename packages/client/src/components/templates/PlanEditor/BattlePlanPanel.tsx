import React from "react"
import { PlanState, Plan, NodePlan } from "@fleethub/core"

import { Button } from "@material-ui/core"

import { MapList, RemoveButton } from "../../../components"
import { useModal } from "../../../hooks"
import { Update } from "../../../utils"

import NodePlanCard from "./NodePlanCard"

type Props = {
  plan: Plan
  updatePlan: Update<PlanState>
}

const BattlePlanPanel: React.FC<Props> = ({ plan, updatePlan }) => {
  const Modal = useModal()

  const addNodePlan = (node: NodePlan) => {
    updatePlan((draft) => {
      if (!draft.nodes) draft.nodes = []
      draft.nodes.push(node)
    })
    Modal.hide()
  }

  const remove = (index: number) => {
    updatePlan((draft) => {
      draft.nodes?.splice(index, 1)
      if (draft.nodes?.length === 0) delete draft.nodes
    })
  }

  const removeAll = () => {
    updatePlan((draft) => {
      delete draft.nodes
    })
  }

  return (
    <div>
      <Modal full>
        <MapList onSelectNodePlan={addNodePlan} />
      </Modal>

      <Button onClick={Modal.show}>戦闘マスを追加</Button>
      <RemoveButton size="small" onClick={removeAll} />

      {plan.nodes.map((node, index) => (
        <NodePlanCard
          key={index}
          node={node}
          update={(recipe) => {
            updatePlan(({ nodes }) => nodes && recipe(nodes[index]))
          }}
          onRemove={() => remove(index)}
        />
      ))}
    </div>
  )
}

export default BattlePlanPanel
