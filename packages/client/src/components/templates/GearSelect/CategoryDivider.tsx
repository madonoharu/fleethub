import React from "react"
import styled from "styled-components"
import { GearCategory, GearCategoryName } from "@fleethub/data"

import { Typography, Divider as MuiDivider } from "@material-ui/core"

const Divider = styled(MuiDivider)`
  flex-grow: 1;
  margin-left: 8px;
`

type Props = {
  category: GearCategory
}

const CategoryDivider: React.FCX<Props> = ({ className, category }) => {
  const name = GearCategoryName[category]
  return (
    <div className={className}>
      <Typography variant="caption" color="textSecondary">
        {name}
      </Typography>
      <Divider />
    </div>
  )
}

export default styled(CategoryDivider)`
  display: flex;
  align-items: center;
  width: 100%;
`
