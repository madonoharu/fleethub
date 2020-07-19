import React from "react"
import styled from "styled-components"

import { useSwap, SwapSpec } from "../../../hooks"

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
    <div className={className} style={style}>
      {children}
    </div>
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

const Styled: SwappableComponentType = styled(Swappable)(({ theme }) => theme.swappable)

export default Styled
