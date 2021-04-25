import { useForkRef } from "@material-ui/core";
import React from "react";

import { useDrag } from "./useDrag";
import { useDrop } from "./useDrop";

export type SwapSpec<T extends Record<string, unknown>> = {
  type: string;
  item: T;
  onSwap: (dragItem: T, dropItem: T) => void;
  canDrag?: boolean;
  dragLayer?: React.ReactNode;
};

export const useSwap = <T extends Record<string, unknown>>({
  type,
  item,
  onSwap,
  canDrag,
  dragLayer,
}: SwapSpec<T>) => {
  const dragRef = useDrag({
    type,
    item,
    canDrag,
    dragLayer,
  });

  const dropRef = useDrop({
    accept: type,
    drop: (dragItem: typeof item) => {
      onSwap(dragItem, item);
    },
    canDrop: (dragItem) => dragItem !== item,
  });

  const ref = useForkRef(dragRef, dropRef);

  return ref;
};
