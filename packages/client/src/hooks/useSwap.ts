import { useRef, useEffect } from "react"
import { useDrag, useDrop, DragObjectWithType } from "react-dnd"
import { batch } from "../utils"

type SwappableItem<T> = DragObjectWithType & {
  state: T
  setState: (value: T) => void
  canDrag?: boolean
}

export const useSwap = <T>(item: SwappableItem<T>) => {
  const [{ isDragging }, dragRef, preview] = useDrag({
    item,
    canDrag: item.canDrag,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  })

  const [, dropRef] = useDrop({
    accept: item.type,
    drop: (dragItem: SwappableItem<T>) => {
      batch(() => {
        item.setState(dragItem.state)
        dragItem.setState(item.state)
      })
    },
    canDrop: (dragItem) => dragItem.state !== item.state,
  })

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    dragRef(node)
    dropRef(node)

    const inital = node.style.opacity
    if (isDragging) {
      node.style.opacity = "0.3"
    }
    return () => {
      node.style.opacity = inital
    }
  }, [isDragging, dragRef, dropRef])

  return [ref, preview] as const
}
