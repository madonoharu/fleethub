import React, { useCallback, useEffect, useRef } from "react";
import { DropTargetHookSpec, useDrop as useDndDrop } from "react-dnd";

type DropSpec<DragObject, DropResult> = DropTargetHookSpec<
  DragObject,
  DropResult,
  boolean
>;

export const useDrop = <DragObject, DropResult>(
  spec: DropSpec<DragObject, DropResult>
): React.RefCallback<HTMLDivElement> => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [isOver, dropRef] = useDndDrop({
    collect: (monitor) => monitor.isOver() && monitor.canDrop(),
    ...spec,
  });

  useEffect(() => {
    const node = ref.current;
    if (!node || !isOver) return;

    node.classList.add("droppable");

    return () => {
      node.classList.remove("droppable");
    };
  }, [isOver]);

  return useCallback(
    (instance: HTMLDivElement | null) => {
      dropRef(instance);
      ref.current = instance;
    },
    [dropRef]
  );
};
