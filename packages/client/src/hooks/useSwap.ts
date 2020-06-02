import { useRef, useEffect } from "react"
import { batch } from "react-redux"
import { useDrag, useDrop, DragObjectWithType, DragSourceMonitor, DragSourceHookSpec } from "react-dnd"

type SwappableItem<T> = DragObjectWithType & {
  state: T
  setState: (value: T) => void
  canDrag?: boolean
}

export const useSwap = <T>(item: SwappableItem<T>) => {
  const [dragCollectedProps, dragRef, preview] = useDrag({
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
  })

  const { isDragging } = dragCollectedProps

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    dragRef(node)
    dropRef(node)

    const initalVisibility = node.style.visibility
    if (isDragging) {
      node.style.visibility = "hidden"
    }
    return () => {
      node.style.visibility = initalVisibility
    }
  }, [isDragging, dragRef, dropRef])

  return [dragCollectedProps, ref, preview] as const
}
