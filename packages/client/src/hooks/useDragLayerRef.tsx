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
  z-index: 2000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`

const wait = 50

const DragLayerBox = styled.div`
  backdrop-filter: blur(4px);
  transition: transform 100ms ease-out;
  box-shadow: 0px 0px 2px 2px ${(props) => props.theme.palette.primary.light}, ${(props) => props.theme.shadows[12]};
  border-radius: 4px;
`

const getStyle = throttle((monitor: DragLayerMonitor): React.CSSProperties | undefined => {
  const offset = monitor.getSourceClientOffset()

  if (!offset) return

  return {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
  }
}, wait)

const DragLayer: React.FC = () => {
  const style = useDragLayer((monitor) => {
    if (!monitor.isDragging()) return
    return getStyle(monitor)
  })

  const { current, width, height } = useDragLayerRef()

  if (!style || !current) return null

  return (
    <DragLayerContainer>
      <DragLayerBox style={{ ...style, width, height }}>{current}</DragLayerBox>
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
