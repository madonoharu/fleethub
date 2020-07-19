import React from "react"
import styled from "styled-components"
import { colors } from "@material-ui/core"

import { useSwap, SwapSpec } from "../../../hooks"

const Container = styled.div`
  &.droppable {
    border-radius: 4px;
    box-shadow: 0px 0px 2px 2px ${colors.yellow[300]};
  }

  &.dragging {
    opacity: 0.3;
  }
`

type SwappableProps<T> = SwapSpec<T> & {
  className?: string
  style?: React.CSSProperties

  children?: React.ReactNode
}

type SwappableComponentType = {
  <T>(props: SwappableProps<T>): React.ReactElement
}

const Swappable: SwappableComponentType = ({ className, style, type, state, setState, canDrag, children }) => {
  const elem = (
    <Container className={className} style={style}>
      {children}
    </Container>
  )

  const ref = useSwap({
    type,
    state,
    setState,
    canDrag,
    dragLayer: elem,
  })

  return React.cloneElement(elem, { ref })
}

export default Swappable
