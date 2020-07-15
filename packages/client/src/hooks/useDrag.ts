import { useRef, useEffect, useCallback } from "react"
import { useDrag as useDndDrag, DragObjectWithType, DragSourceHookSpec } from "react-dnd"
import { getEmptyImage } from "react-dnd-html5-backend"

import { useDragLayerRef } from "./useDragLayerRef"

type DragSpec<DragObject extends DragObjectWithType, DropResult, CollectedProps> = Omit<
  DragSourceHookSpec<DragObject, DropResult, CollectedProps>,
  "collect"
> & {
  dragLayer?: React.ReactNode
}

export const useDrag = <DragObject extends DragObjectWithType, DropResult, CollectedProps>({
  dragLayer,
  ...dndSpec
}: DragSpec<DragObject, DropResult, CollectedProps>) => {
  const ref = useRef<HTMLDivElement>()

  const [isDragging, dragRef, preview] = useDndDrag({
    collect: (monitor) => monitor.isDragging(),
    ...dndSpec,
  })

  const dragLayerRef = useDragLayerRef()

  useEffect(() => {
    if (dragLayer) {
      preview(getEmptyImage())
    }
  }, [dragLayer, preview])

  useEffect(() => {
    const node = ref.current
    if (!node || !isDragging) return

    if (dragLayer) {
      dragLayerRef.current = dragLayer
      dragLayerRef.width = node.clientWidth
      dragLayerRef.height = node.clientHeight
    }

    node.classList.add("dragging")

    return () => {
      node.classList.remove("dragging")
      dragLayerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging])

  const handleRef = useCallback(
    (instance: HTMLDivElement) => {
      dragRef(instance)
      ref.current = instance
    },
    [dragRef]
  )

  return handleRef
}
