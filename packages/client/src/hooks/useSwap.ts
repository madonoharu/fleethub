import { useRef, useEffect } from "react"
import { useDrag, useDrop, DragObjectWithType } from "react-dnd"

import { batch } from "../utils"

type SwappableItem<T> = DragObjectWithType & {
  state: T
  setState: (value: T) => void
  canDrag?: boolean
}

export const useSwap = <T>(item: SwappableItem<T>) => {
  const [isDragging, dragRef, preview] = useDrag({
    item,
    canDrag: item.canDrag,
    collect: (monitor) => monitor.isDragging(),
  })

  const [isOver, dropRef] = useDrop({
    accept: item.type,
    drop: (dragItem: SwappableItem<T>) => {
      batch(() => {
        item.setState(dragItem.state)
        dragItem.setState(item.state)
      })
    },
    canDrop: (dragItem) => dragItem.state !== item.state,
    collect: (monitor) => monitor.isOver() && monitor.canDrop(),
  })

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dropRef(dragRef(ref.current))
    console.log(2)
  }, [dragRef, dropRef])

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const inital = { ...node.style }
    if (isDragging) {
      node.style.opacity = "0.3"
    }
    if (isOver) {
      node.style.outline = "solid 1px skyblue"
    }
    return () => {
      Object.assign(node.style, inital)
    }
  }, [isDragging, isOver])

  return [ref, preview] as const
}
