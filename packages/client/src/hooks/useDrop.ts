import { useRef, useEffect, useCallback } from "react"
import { useDrop as useDndDrop, DragObjectWithType, DropTargetHookSpec } from "react-dnd"

type DropSpec<DragObject extends DragObjectWithType, DropResult, CollectedProps> = Omit<
  DropTargetHookSpec<DragObject, DropResult, CollectedProps>,
  "collect"
>

export const useDrop = <DragObject extends DragObjectWithType, DropResult, CollectedProps>(
  spec: DropSpec<DragObject, DropResult, CollectedProps>
) => {
  const ref = useRef<HTMLDivElement>()

  const [isOver, dropRef] = useDndDrop({
    collect: (monitor) => monitor.isOver() && monitor.canDrop(),
    ...spec,
  })

  useEffect(() => {
    const node = ref.current
    if (!node || !isOver) return

    node.classList.add("droppable")

    return () => {
      node.classList.remove("droppable")
    }
  }, [isOver])

  return useCallback(
    (instance: HTMLDivElement) => {
      dropRef(instance)
      ref.current = instance
    },
    [dropRef]
  )
}
