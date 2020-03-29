import React from "react"
import styled from "styled-components"
import { ShipStat } from "@fleethub/kcsim"
import { useTranslation } from "react-i18next"

import Typography from "@material-ui/core/Typography"
import Tooltip from "@material-ui/core/Tooltip"

import { StatIcon } from "../../../components"

const rangeToString = (range: number) => {
  switch (range) {
    case 0:
      return "無"
    case 1:
      return "短"
    case 2:
      return "中"
    case 3:
      return "長"
  }
  if (range >= 4) {
    return "超長"
  }
  return "不明"
}

type Props = {
  range: number
}

const Component: React.FCX<Props> = ({ className, range }) => {
  return (
    <div className={className}>
      <StatIcon icon="range" />
      <Typography>{rangeToString(range)}</Typography>
    </div>
  )
}

export default styled(Component)`
  display: flex;
  align-items: center;
  p {
    font-size: 0.75rem;
    line-height: 1.5;
  }
  ${StatIcon} {
    height: 15px;
    width: 15px;
    filter: contrast(180%) opacity(0.9);
    margin: 0 4px;
  }
`
