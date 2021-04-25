import { css } from "@emotion/react";
import styled from "@emotion/styled";
import React from "react";

import { SwapSpec, useSwap } from "../../../hooks";

type SwappableProps<T> = SwapSpec<T> & {
  className?: string;
  style?: React.CSSProperties;
  dragLayer?: React.ReactNode;
  children?: React.ReactNode;
};

type SwappableComponentType = {
  <T>(props: SwappableProps<T>): React.ReactElement;
};

const Swappable: SwappableComponentType = ({
  className,
  style,
  type,
  state,
  setState,
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
    state,
    setState,
    canDrag,
    dragLayer: dragLayer || elem,
  });

  return React.cloneElement(elem, { ref });
};

const Styled = styled(Swappable)(
  ({ theme }) => theme.styles.swappable
) as SwappableComponentType;

export default Styled;
