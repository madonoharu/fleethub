import { css } from "@emotion/react";
import styled from "@emotion/styled";
import React, { createContext, useContext } from "react";
import { useDragLayer } from "react-dnd";

import { createDragLayerStyle } from "./getDragLayerStyle";

type DragLayerRef = {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  html?: HTMLElement;
};

export const DragLayerRefContext = createContext<DragLayerRef>({});

export const useDragLayerRef = () => useContext(DragLayerRefContext);

const DragLayerContainer = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 2000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`;

const DragLayerBox = styled.div(
  ({ theme }) => css`
    backdrop-filter: blur(4px);
    transition: transform 50ms linear;
    width: transition;
    box-shadow:
      0px 0px 2px 2px ${theme.palette.primary.light},
      ${theme.shadows[12]};
    border-radius: 4px;
  `,
);
const getStyle = createDragLayerStyle();

const DragLayer: React.FC = () => {
  const style = useDragLayer((monitor) => {
    if (!monitor.isDragging()) return;
    return getStyle(monitor);
  });

  const { children, width, height } = useDragLayerRef();

  if (!style || !children) return null;

  return (
    <DragLayerContainer>
      <DragLayerBox style={{ ...style, width, height }}>
        {children}
      </DragLayerBox>
    </DragLayerContainer>
  );
};

const initialState = {};

export const DragLayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <DragLayerRefContext.Provider value={initialState}>
      <DragLayer />
      {children}
    </DragLayerRefContext.Provider>
  );
};
