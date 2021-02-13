import React from "react"

import { GearIcon } from "../../molecules"

type Props = {
  category: number
}

const CategoryIcon: React.FCX<Props> = ({ className, category }) => {
  return <GearIcon className={className} iconId={1} />
}

export default CategoryIcon
