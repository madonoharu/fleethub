import React from "react"

import { useForkRef } from "@material-ui/core"

import { batch } from "../utils"

import { useDrop } from "./useDrop"
import { useDrag } from "./useDrag"

export type SwapSpec<T> = {
  type: string
  state: T
  setState: (value: T) => void
  canDrag?: boolean
  dragLayer?: React.ReactNode
}

export const useSwap = <T>({ type, state, setState, canDrag, dragLayer }: SwapSpec<T>) => {
  const item = { type, state, setState, canDrag }

  const dragRef = useDrag({
    item,
    canDrag: item.canDrag,
    dragLayer,
  })

  const dropRef = useDrop({
    accept: item.type,
    drop: (dragItem: typeof item) => {
      batch(() => {
        item.setState(dragItem.state)
        dragItem.setState(item.state)
      })
    },
    canDrop: (dragItem) => dragItem.state !== item.state,
  })

  const ref = useForkRef(dragRef, dropRef)

  return ref
}
