import React, { createContext, useContext } from "react"
import { useDragLayer, DragLayerMonitor } from "react-dnd"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import throttle from "lodash/throttle"

type DragLayerRef = { children?: React.ReactNode; width?: number; height?: number; html?: HTMLElement }

export const DragLayerRefContext = createContext<DragLayerRef>({})

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

const DragLayerBox = styled.div(
  ({ theme }) => css`
    backdrop-filter: blur(4px);
    transition: transform 50ms linear;
    width: transition;
    box-shadow: 0px 0px 2px 2px ${theme.palette.primary.light}, ${theme.shadows[12]};
    border-radius: 4px;
  `
)
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

  const { children, width, height } = useDragLayerRef()

  if (!style || !children) return null

  return (
    <DragLayerContainer>
      <DragLayerBox style={{ ...style, width, height }}>{children}</DragLayerBox>
    </DragLayerContainer>
  )
}

const initalState = {}

export const DragLayerProvider: React.FC = ({ children }) => {
  return (
    <DragLayerRefContext.Provider value={initalState}>
      <DragLayer />
      {children}
    </DragLayerRefContext.Provider>
  )
}
