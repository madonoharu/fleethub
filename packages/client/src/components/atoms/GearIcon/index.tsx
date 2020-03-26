import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"
import styled from "styled-components"

import { GearIconsQuery } from "../../../graphqlTypes"

type Props = {
  size?: "small"
  iconId: number
}

const Component: React.FCX<Props> = ({ className, iconId }) => {
  const { allFile } = useStaticQuery<GearIconsQuery>(graphql`
    query GearIcons {
      allFile(filter: { relativeDirectory: { eq: "gears" } }) {
        edges {
          node {
            name
            childImageSharp {
              fluid(maxWidth: 32) {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
    }
  `)

  const childImageSharp = allFile.edges.find((n) => n.node.name === iconId.toString())?.node.childImageSharp

  if (!childImageSharp) return <Img className={className} fluid={allFile.edges[0].node.childImageSharp?.fluid} />

  return <Img className={className} fluid={childImageSharp.fluid} />
}

const StyledComponent = styled(Component)`
  width: ${(props) => (props.size === "small" ? 24 : 32)}px;
`

export default StyledComponent
