import { useForkRef } from "@material-ui/core";
import React from "react";

import { batch } from "../utils";
import { useDrag } from "./useDrag";
import { useDrop } from "./useDrop";

export type SwapSpec<T> = {
  type: string;
  state: T;
  setState: (value: T) => void;
  canDrag?: boolean;
  dragLayer?: React.ReactNode;
};

export const useSwap = <T>({
  type,
  state,
  setState,
  canDrag,
  dragLayer,
}: SwapSpec<T>) => {
  const item = { state, setState, canDrag };

  const dragRef = useDrag({
    type,
    item,
    canDrag: item.canDrag,
    dragLayer,
  });

  const dropRef = useDrop({
    accept: type,
    drop: (dragItem: typeof item) => {
      batch(() => {
        item.setState(dragItem.state);
        dragItem.setState(item.state);
      });
    },
    canDrop: (dragItem) => dragItem.state !== item.state,
  });

  const ref = useForkRef(dragRef, dropRef);

  return ref;
};
