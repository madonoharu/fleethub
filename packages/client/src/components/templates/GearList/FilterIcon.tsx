import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"
import styled from "styled-components"

import { FilterIconsQuery } from "../../../graphqlTypes"

type Props = {
  icon: string
}

const FilterIcon: React.FCX<Props> = ({ className, icon }) => {
  const { allFile } = useStaticQuery<FilterIconsQuery>(graphql`
    query FilterIcons {
      allFile(filter: { relativeDirectory: { eq: "filters" } }) {
        edges {
          node {
            name
            childImageSharp {
              fixed(height: 18) {
                ...GatsbyImageSharpFixed
              }
            }
          }
        }
      }
    }
  `)

  const childImageSharp = allFile.edges.find((n) => n.node.name === icon)?.node.childImageSharp

  if (!childImageSharp) return null

  return <Img className={className} fixed={childImageSharp.fixed} />
}

export default styled(FilterIcon)`
  filter: brightness(120%);
`
