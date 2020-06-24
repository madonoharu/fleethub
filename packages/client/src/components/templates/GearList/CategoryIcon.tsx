import React from "react"
import { fhSystem } from "@fleethub/core"

import { GearIcon } from "../../../components"
import { GearCategory } from "@fleethub/data"

type Props = {
  category: GearCategory
}

const CategoryIcon: React.FCX<Props> = ({ className, category }) => {
  const iconId = fhSystem.categoryIconIdMap.get(category)
  if (!iconId) return null
  return <GearIcon className={className} iconId={iconId} />
}

export default CategoryIcon
