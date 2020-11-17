import React from "react"
import styled from "@emotion/styled"
import { FleetTypes, FleetType } from "@fleethub/core"
import { useTranslation } from "react-i18next"

import { Select, SelectInputProps } from "../../molecules"

type Props = SelectInputProps & {
  fleetType: FleetType
  onChange: (type: FleetType) => void
}

const FleetTypeSelect: React.FC<Props> = ({ fleetType, onChange, ...rest }) => {
  const { t } = useTranslation("terms")
  return <Select value={fleetType} options={FleetTypes} onChange={onChange} getOptionLabel={t} {...rest} />
}

export default styled(FleetTypeSelect)`
  width: 120px;
`
