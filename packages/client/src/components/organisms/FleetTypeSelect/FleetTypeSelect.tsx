import React from "react"
import styled from "styled-components"
import { FleetTypes, FleetType } from "@fleethub/core"

import { Select, SelectInputProps } from "../../molecules"

const getLabel = (fleetType: FleetType) =>
  ({
    Single: "通常艦隊",
    CarrierTaskForce: "空母機動",
    SurfaceTaskForce: "水上打撃",
    TransportEscort: "輸送護衛",
    Combined: "敵連合",
  }[fleetType])

type Props = SelectInputProps & {
  fleetType: FleetType
  onChange: (type: FleetType) => void
}

const FleetTypeSelect: React.FC<Props> = ({ fleetType, onChange, ...rest }) => {
  return <Select value={fleetType} options={FleetTypes} onChange={onChange} getOptionLabel={getLabel} {...rest} />
}

export default styled(FleetTypeSelect)`
  width: 96px;
`
