import React from "react";

import { cn } from "../../../styles/cn";
import { SwapSpec, useSwap } from "../../../hooks";

type SwappableProps<T extends Record<string, unknown>> = SwapSpec<T> & {
  className?: string;
  style?: React.CSSProperties;
  dragLayer?: React.ReactNode;
  children?: React.ReactNode;
};

type SwappableComponentType = {
  <T extends Record<string, unknown>>(props: SwappableProps<T>): React.ReactElement;
};

const Swappable: SwappableComponentType = ({
  className,
  style,
  type,
  item,
  onSwap,
  canDrag,
  dragLayer,
  children,
}) => {
  const elem = (
    <div className={cn("swappable", className)} style={style}>
      {children}
    </div>
  );

  const ref = useSwap({
    type,
    item,
    onSwap,
    canDrag,
    dragLayer: dragLayer || elem,
  });

  return React.cloneElement(elem, { ref });
};

export default Swappable;
