import React from "react"

import { batch } from "../../../utils"
import { useDrag, useDrop } from "../../../hooks"
import { useForkRef, colors } from "@material-ui/core"
import styled from "styled-components"

const Container = styled.div`
  &.dragging {
    opacity: 0.3;
  }

  &.droppable {
    box-shadow: 0px 0px 2px 2px ${colors.yellow[300]};
    border-radius: 4px;
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

  const elem = (
    <Container className={className} style={style}>
      {children}
    </Container>
  )

  const dragRef = useDrag({
    item,
    canDrag: item.canDrag,
    dragLayer: elem,
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

  const ref = useForkRef(dragRef, dropRef)
  return React.cloneElement(elem, { ref })
}

export default Swappable
