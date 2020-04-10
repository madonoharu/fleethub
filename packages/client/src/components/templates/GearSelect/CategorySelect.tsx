import React from "react"
import styled from "styled-components"
import { GearCategoryName } from "@fleethub/data"
import { fhSystem } from "@fleethub/core"

import { Select, GearNameplate } from "../../../components"

const getCategoryName = (category: number) => {
  if (!category) return "カテゴリ"
  const name = GearCategoryName[category]
  if (!name) return "不明"

  return name
}

const getCategoryLabel = (category: number) => {
  const name = getCategoryName(category)
  const iconId = fhSystem.categoryIconIdMap.get(category)

  return <GearNameplate size="small" iconId={iconId ?? 0} name={name} />
}

const menuProps = { style: { maxHeight: 400 } }

type Props = {
  value: number
  options: number[]
  onChange: (value: number) => void
}

const CategorySelect: React.FCX<Props> = (props) => {
  return <Select MenuProps={menuProps} getOptionLabel={getCategoryLabel} {...props} />
}

export default styled(CategorySelect)`
  width: 140px;
  height: 36px;
`
