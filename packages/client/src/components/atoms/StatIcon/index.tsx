import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"
import styled from "styled-components"

import { GearIconsQuery } from "../../../graphqlTypes"

type Props = {
  size?: "small"
  icon: string
}

const Component: React.FCX<Props> = ({ className, icon }) => {
  const { allFile } = useStaticQuery<GearIconsQuery>(graphql`
    query StatIcons {
      allFile(filter: { relativeDirectory: { eq: "icons" } }) {
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

  const childImageSharp = allFile.edges.find((n) => n.node.name === icon)?.node.childImageSharp

  if (!childImageSharp) return null

  return <Img className={className} fluid={childImageSharp.fluid} />
}

const StyledComponent = styled(Component)`
  width: ${(props) => (props.size === "small" ? 24 : 32)}px;
`

export default StyledComponent
