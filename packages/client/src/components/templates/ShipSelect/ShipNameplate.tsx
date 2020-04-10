import React from "react"
import styled from "styled-components"

import { ShipBanner, Text, Flexbox } from "../../../components"

type Props = {
  className?: string
  shipId: number
  name: string
}

const ShipNameplate = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { className, shipId, name } = props
  return (
    <Flexbox ref={ref} className={className}>
      <ShipBanner shipId={shipId} />
      <div>
        {shipId > 1500 && <Text>ID:{shipId}</Text>}
        <Text noWrap>{name}</Text>
      </div>
    </Flexbox>
  )
})

export default styled(ShipNameplate)`
  text-align: start;
  width: 100%;
  ${ShipBanner} {
    width: 96px;
    margin-right: 8px;
    flex-shrink: 0;
  }
`
