import React, { useEffect } from "react"
import styled from "@emotion/styled"
import { Formation, SingleFleetFormations, CombinedFleetFormations } from "@fleethub/core"

import { Select, SelectInputProps } from "../../molecules"

const dict: Record<Formation, string> = {
  LineAhead: "単縦陣",
  DoubleLine: "複縦陣",
  Diamond: "輪形陣",
  Echelon: "梯形陣",
  LineAbreast: "単横陣",
  Vanguard: "警戒陣",
  Cruising1: "第一航行",
  Cruising2: "第二航行",
  Cruising3: "第三航行",
  Cruising4: "第四航行",
}

const getFormationName = (formation: Formation) => dict[formation]

type Props = SelectInputProps & {
  formation: Formation
  onChange: (formation: Formation) => void
  combined?: boolean
}

const FormationSelect: React.FC<Props> = ({ formation, onChange, combined, ...rest }) => {
  const options: readonly Formation[] = combined ? CombinedFleetFormations : SingleFleetFormations

  useEffect(() => {
    if (options.includes(formation)) return
    onChange(combined ? "Cruising4" : "LineAhead")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options])

  return <Select options={options} value={formation} onChange={onChange} getOptionLabel={getFormationName} {...rest} />
}

export default styled(FormationSelect)`
  min-width: 120px;
`
