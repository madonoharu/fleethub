import React from "react"
import { kcsim } from "@fleethub/kcsim"

import { GearIcon } from "../../../components"
import { GearCategory } from "@fleethub/data"

type Props = {
  category: GearCategory
}

const CategoryIcon: React.FCX<Props> = ({ className, category }) => {
  const iconId = kcsim.categoryIconIdMap.get(category)
  if (!iconId) return null
  return <GearIcon className={className} iconId={iconId} />
}

export default CategoryIcon
