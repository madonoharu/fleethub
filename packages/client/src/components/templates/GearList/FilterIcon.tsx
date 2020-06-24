import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"
import styled from "styled-components"

import { FilterIconsQuery } from "../../../graphqlTypes"

type Props = {
  icon: string
}

const FilterIcon: React.FCX<Props> = ({ className, icon }) => {
  return null
}

export default styled(FilterIcon)`
  filter: brightness(120%);
`
