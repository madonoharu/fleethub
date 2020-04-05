import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"
import styled from "styled-components"

import { GearIconsQuery } from "../../../graphqlTypes"

type Props = {
  icon: string
}

const FilterIcon: React.FCX<Props> = ({ className, icon }) => {
  const { allFile } = useStaticQuery<GearIconsQuery>(graphql`
    query FilterIcons {
      allFile(filter: { relativeDirectory: { eq: "filters" } }) {
        edges {
          node {
            name
            childImageSharp {
              fluid(maxWidth: 40) {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
    }
  `)

  const childImageSharp = allFile.edges.find((n) => n.node.name === icon)?.node.childImageSharp

  if (!childImageSharp) return null

  return <Img className={className} fluid={childImageSharp.fluid} />
}

export default styled(FilterIcon)`
  width: 40px;
  filter: brightness(120%);
`
