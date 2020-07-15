import { DragObjectWithType } from "react-dnd"
import { useForkRef } from "@material-ui/core"

import { batch } from "../utils"

import { useDrag } from "./useDrag"
import { useDrop } from "./useDrop"

type SwappableItem<T> = DragObjectWithType & {
  state: T
  setState: (value: T) => void
  canDrag?: boolean
}

export const useSwap = <T>(item: SwappableItem<T>) => {
  const dragRef = useDrag({
    item,
    canDrag: item.canDrag,
  })

  const dropRef = useDrop({
    accept: item.type,
    drop: (dragItem: SwappableItem<T>) => {
      batch(() => {
        item.setState(dragItem.state)
        dragItem.setState(item.state)
      })
    },
    canDrop: (dragItem) => dragItem.state !== item.state,
  })

  const handleRef = useForkRef(dragRef, dropRef)

  return [handleRef]
}
