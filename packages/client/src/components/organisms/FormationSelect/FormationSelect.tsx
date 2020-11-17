import React, { useEffect } from "react"
import styled from "@emotion/styled"
import { Formation, SingleFleetFormations, CombinedFleetFormations } from "@fleethub/core"
import { useTranslation } from "react-i18next"

import { Select, SelectInputProps } from "../../molecules"

type Props = SelectInputProps & {
  formation: Formation
  onChange: (formation: Formation) => void
  combined?: boolean
}

const FormationSelect: React.FC<Props> = ({ formation, onChange, combined, ...rest }) => {
  const options: readonly Formation[] = combined ? CombinedFleetFormations : SingleFleetFormations
  const { t } = useTranslation("terms")

  useEffect(() => {
    if (options.includes(formation)) return
    onChange(combined ? "Cruising4" : "LineAhead")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options])

  return <Select options={options} value={formation} onChange={onChange} getOptionLabel={t} {...rest} />
}

export default styled(FormationSelect)`
  min-width: 120px;
`
