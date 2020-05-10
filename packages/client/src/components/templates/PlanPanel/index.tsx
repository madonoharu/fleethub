import React from "react"
import styled from "styled-components"
import { EntityId } from "@reduxjs/toolkit"
import { useSelector, useDispatch } from "react-redux"

import { Button } from "@material-ui/core"

import { RemoveButton, Flexbox, SelectButtons, FleetPanel } from "../../../components"
import { usePlan } from "../../../hooks"
import { range } from "lodash-es"

type Props = {
  plan: EntityId
}

const PlanPanel: React.FC<Props> = ({ plan }) => {
  const { entity, actions } = usePlan(plan)
  const [fleetIndex, setFleetIndex] = React.useState(0)

  if (!entity) return null

  return (
    <>
      <SelectButtons options={range(entity.fleets.length)} value={fleetIndex} onChange={setFleetIndex} />
      <FleetPanel uid={entity.fleets[fleetIndex]} />
    </>
  )
}

export default PlanPanel
