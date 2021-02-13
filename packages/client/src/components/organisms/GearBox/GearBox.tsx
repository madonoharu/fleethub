import React from "react"
import styled from "@emotion/styled"
import { EntityId } from "@reduxjs/toolkit"
import { useDispatch, useSelector } from "react-redux"
import { GearState } from "@fleethub/utils"

import { useFhSim } from "../../../hooks"
import { gearsSelectors, gearsSlice } from "../../../store"

import GearLabel from "../GearLabel"

import AddGearButton from "./AddGearButton"

type Props = {
  id?: EntityId
  onGearChange?: (state: GearState) => void
}

const GearBox: React.FCX<Props> = ({ className, id, onGearChange }) => {
  const { createGear } = useFhSim()

  const entity = useSelector((root) => {
    if (id !== undefined) return gearsSelectors.selectById(root, id)
    return undefined
  })

  const dispatch = useDispatch()

  const gear = entity && createGear(entity)

  const handleGearChange = () => {
    onGearChange?.({ gear_id: 1 })
  }

  const handleUpdate = (changes: Partial<GearState>) => {
    id && dispatch(gearsSlice.actions.update({ id, changes }))
  }

  const handleRemove = () => {
    entity && dispatch(gearsSlice.actions.remove(entity.id))
  }

  if (!gear) {
    return <AddGearButton className={className} onClick={handleGearChange} />
  }

  return <GearLabel className={className} gear={gear} onUpdate={handleUpdate} onRemove={handleRemove} />
}

export default styled(GearBox)`
  height: 100%;
`
