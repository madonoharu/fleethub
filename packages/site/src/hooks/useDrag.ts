import { useCallback, useEffect, useRef } from "react";
import { DragSourceHookSpec, useDrag as useDndDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import { useDragLayerRef } from "./useDragLayerRef";

export type DragSpec<DragObject> = DragSourceHookSpec<
  DragObject,
  unknown,
  boolean
> & {
  dragLayer?: React.ReactNode;
};

export const useDrag = <DragObject>({
  dragLayer,
  ...dndSpec
}: DragSpec<DragObject>) => {
  const ref = useRef<HTMLDivElement>();

  const [isDragging, dragRef, preview] = useDndDrag({
    ...dndSpec,
    collect: (monitor) => monitor.isDragging(),
  });

  const dragLayerRef = useDragLayerRef();

  useEffect(() => {
    preview(getEmptyImage());
  }, [preview]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !isDragging) return;

    if (dragLayer) {
      dragLayerRef.children = dragLayer;
      dragLayerRef.width = node.clientWidth;
      dragLayerRef.height = node.clientHeight;
    }

    node.classList.add("dragging");

    return () => {
      node.classList.remove("dragging");
      dragLayerRef.children = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const handleRef = useCallback(
    (instance: HTMLDivElement) => {
      dragRef(instance);
      ref.current = instance;
    },
    [dragRef]
  );

  return handleRef;
};
