import styled from "@emotion/styled";
import React from "react";

import { SwapSpec, useSwap } from "../../../hooks";

type SwappableProps<T extends Record<string, unknown>> = SwapSpec<T> & {
  className?: string;
  style?: React.CSSProperties;
  dragLayer?: React.ReactNode;
  children?: React.ReactNode;
};

type SwappableComponentType = {
  <T extends Record<string, unknown>>(
    props: SwappableProps<T>
  ): React.ReactElement;
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
    <div className={className} style={style}>
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

const Styled = styled(Swappable)(
  ({ theme }) => theme.styles.swappable
) as SwappableComponentType;

export default Styled;
