import React from "react"
import styled from "styled-components"
import copy from "copy-to-clipboard"
import { Plan, PlanState, FleetTypes, FleetType } from "@fleethub/core"
import { useAsyncCallback } from "react-async-hook"
import { createSelector } from "@reduxjs/toolkit"

import { Select, SelectComponentProps } from "../../molecules"

const getLabel = (fleetType: FleetType) =>
  ({
    Single: "通常艦隊",
    CarrierTaskForce: "空母機動",
    SurfaceTaskForce: "水上打撃",
    TransportEscort: "輸送護衛",
    Combined: "敵連合",
  }[fleetType])

type Props = {
  fleetType: FleetType
  onChange: (type: FleetType) => void
}

const FleetTypeSelect: React.FCX<Props> = ({ className, fleetType, onChange }) => {
  return (
    <Select
      className={className}
      value={fleetType}
      options={FleetTypes}
      onChange={onChange}
      getOptionLabel={getLabel}
    />
  )
}

export default styled(FleetTypeSelect)`
  width: 96px;
`
