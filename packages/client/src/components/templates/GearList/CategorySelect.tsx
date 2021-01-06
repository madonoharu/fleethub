import React from "react"
import styled from "@emotion/styled"
import { GearCategoryName } from "@fleethub/data"
import { fhSystem } from "@fleethub/core"

import { Select, GearNameplate } from "../../../components"

const getCategoryLabel = (category: number) => {
  if (!category) return "カテゴリー"
  const name = GearCategoryName[category]
  if (!name) return "不明"

  const iconId = fhSystem.categoryIconIdMap.get(category)

  return <GearNameplate size="small" iconId={iconId ?? 1} name={name} />
}

type Props = {
  value: number
  options: number[]
  onChange: (value: number) => void
}

const CategorySelect: React.FCX<Props> = (props) => {
  return <Select getOptionLabel={getCategoryLabel} {...props} />
}

export default styled(CategorySelect)`
  width: 140px;
  height: 36px;
`
