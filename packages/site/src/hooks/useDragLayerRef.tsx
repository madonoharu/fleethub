import { theme } from "../styles/theme";
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

const getStyle = createDragLayerStyle();

const DragLayer: React.FC = () => {
  const style = useDragLayer((monitor) => {
    if (!monitor.isDragging()) return;
    return getStyle(monitor);
  });

  const { children, width, height } = useDragLayerRef();

  if (!style || !children) return null;

  return (
    <div className="fixed pointer-events-none z-[2000] left-0 top-0 w-full h-full">
      <div
        className="backdrop-blur-[4px] transition-[transform] duration-50 ease-linear rounded-sm"
        style={{
          ...style,
          width,
          height,
          boxShadow: `0px 0px 2px 2px ${theme.palette.primary.light}, ${theme.shadows[12]}`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const initialState = {};

export const DragLayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DragLayerRefContext.Provider value={initialState}>
      <DragLayer />
      {children}
    </DragLayerRefContext.Provider>
  );
};
