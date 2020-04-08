import React from "react"
import styled from "styled-components"
import { GearCategory, GearCategoryName } from "@fleethub/data"
import { kcsim } from "@fleethub/core"

import { AppBar, Toolbar, Checkbox } from "@material-ui/core"

import { useGearSelect } from "../../../hooks"
import { Flexbox, Text, Select, GearNameplate } from "../../../components"

import CategoryIcon from "./CategoryIcon"
import { defaultComparer, idComparer } from "./comparers"

const getCategoryName = (category: number) => {
  if (!category) return "All"
  const name = GearCategoryName[category]
  if (!name) return "不明"

  return name
}

const getCategoryLabel = (category: number) => {
  const name = getCategoryName(category)
  const iconId = kcsim.categoryIconIdMap.get(category)

  return <GearNameplate iconId={iconId ?? 0} name={name} />
}

const MenuProps = { MenuListProps: { dense: true } }

type Props = {
  value: number
  options: number[]
  onChange: (value: number) => void
}

const CategorySelect: React.FC<Props> = (props) => {
  return <Select style={{ minWidth: 160 }} MenuProps={MenuProps} getOptionLabel={getCategoryLabel} {...props} />
}

export default CategorySelect
