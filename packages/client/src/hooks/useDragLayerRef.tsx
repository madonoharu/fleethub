import React, { createContext, MutableRefObject, useContext } from "react"
import { useDragLayer, DragLayerMonitor } from "react-dnd"
import { throttle } from "lodash-es"
import styled from "styled-components"

type DragLayerRef = MutableRefObject<React.ReactNode> & { width?: number; height?: number }

export const DragLayerRefContext = createContext<DragLayerRef>({ current: null })

export const useDragLayerRef = () => useContext(DragLayerRefContext)

const DragLayerContainer = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`

const getStyle = throttle((monitor: DragLayerMonitor): React.CSSProperties | undefined => {
  const offset = monitor.getSourceClientOffset()

  if (!offset) return

  return {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
    transition: "50ms",
  }
}, 50)

const DragLayer: React.FC = () => {
  const style = useDragLayer(getStyle)
  const { current, width, height } = useDragLayerRef()

  if (!style) return null

  return (
    <DragLayerContainer>
      <div style={{ ...style, width, height }}>{current}</div>
    </DragLayerContainer>
  )
}

const initalState = { current: null }

export const DragLayerProvider: React.FC = ({ children }) => {
  return (
    <DragLayerRefContext.Provider value={initalState}>
      <DragLayer />
      {children}
    </DragLayerRefContext.Provider>
  )
}
