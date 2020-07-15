import React from "react"

import { batch } from "../../../utils"
import { useDrag, useDrop } from "../../../hooks"
import { useForkRef } from "@material-ui/core"
import styled from "styled-components"

const Container = styled.div`
  &.dragging {
    opacity: 0.2;
  }
`

type SwappableProps<T> = {
  className?: string
  style?: React.CSSProperties

  type: string
  state: T
  setState: (value: T) => void
  canDrag?: boolean
  children?: React.ReactNode
}

type Component = {
  <T>(props: SwappableProps<T>): React.ReactElement
}

const Swappable: Component = ({ className, style, type, state, setState, canDrag, children }) => {
  const item = { type, state, setState, canDrag }

  const dragRef = useDrag({
    item,
    canDrag: item.canDrag,
    dragLayer: children,
  })

  const dropRef = useDrop({
    accept: item.type,
    drop: (dragItem: typeof item) => {
      batch(() => {
        item.setState(dragItem.state)
        dragItem.setState(item.state)
      })
    },
    canDrop: (dragItem) => dragItem.state !== item.state,
  })

  const handleRef = useForkRef(dragRef, dropRef)

  return (
    <Container ref={handleRef} className={className} style={style}>
      {children}
    </Container>
  )
}

export default Swappable
